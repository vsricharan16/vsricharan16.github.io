---
title: Locks and Critical Section
date: '2025-01-09'
description: 'Building a mutex, spinlock, ticket lock, and reader-writer lock from atomic compare-and-swap in C++.'
tags: [concurrency, synchronization, cpu]
---

A critical section is a stretch of code that touches shared state. If two threads run it at the same time you get a data race, and updates can be lost. A lock prevents this: only a single thread can exclusively enter and execute the critical section, while the rest wait their turn.

The interface is small: `lock()` before the shared access, `unlock()` after. The hard part is implementing those two calls without already having a lock. The rest of this walks through building that machinery in C++ — a mutex first, then a spinlock, a couple of other variants, and finally a reader-writer lock.

## Why a flag is not enough

The obvious idea is a boolean flag:

```cpp
bool locked = false;

void lock() {
  while (locked) {
    // spin
  }
  locked = true;  // race: the test and this store are separate steps
}

void unlock() {
  locked = false;
}
```

Reading `locked` and storing `true` are two separate operations. Two threads can both read `false`, both leave the loop, and both enter the critical section. The window is small, but under load it fails constantly. For a lock to work, the test and the claim have to happen as one indivisible step.

## Atomics and compare-and-swap

An atomic operation is one no other thread can observe half-done: either the old value is there or the new one is, never something in between. On x86 that is a locked read-modify-write on a cache line (`LOCK CMPXCHG`, `XCHG`, `LOCK XADD`). On ARM it is load-linked / store-conditional, where the store fails if anyone wrote the line after your load. C++ exposes all of this through `std::atomic`.

Compare-and-swap (CAS) is the primitive the rest build on. In one atomic step it reads the current value, and if it matches what you expected, writes a new value and reports success. If it does not match, it leaves the value alone, hands back what was actually there, and reports failure.

```cpp
std::atomic<bool> locked{false};

bool expected = false;
bool ok = locked.compare_exchange_strong(expected, /*desired=*/true);
```

If `locked` was `false`, it becomes `true` and `ok` is `true`: this thread claimed it. If it was already `true`, nothing is stored and `ok` is `false`.

Two details bite people here:

- `expected` is passed by reference and is overwritten with the live value on failure. In a retry loop you have to reset it, or the next compare runs against the wrong value and never succeeds.
- `compare_exchange_weak` can fail even when the value matched — an ARM reservation gets dropped for reasons unrelated to another writer. That is fine, and cheaper, inside a loop that retries anyway. `compare_exchange_strong` hides those spurious failures for the cases where you are not looping.

## A mutex

A mutex is the smallest use of CAS: flip a flag from free to held, but only if it is still free.

```cpp
class Mutex {
  std::atomic<bool> held_{false};  // true while a thread owns the lock

 public:
  void lock();    // spin on CAS false -> true until this thread wins
  void unlock();  // release: only the holder stores false
};

void Mutex::lock() {
  bool expected = false;
  while (!held_.compare_exchange_weak(expected, true,
                                      std::memory_order_acquire)) {
    expected = false;  // reset after a failed or spurious attempt
  }
}

void Mutex::unlock() {
  held_.store(false, std::memory_order_release);
}
```

`lock()` keeps trying to swap `false → true`. Success means this thread is in; failure means someone else holds it, so reset `expected` and try again. `unlock()` is a plain store of `false` — no CAS needed, because only the holder ever releases.

The memory orders are not decoration. `memory_order_acquire` on the successful CAS stops any load or store inside the critical section from moving above the lock. `memory_order_release` on unlock stops them from moving below it. Together they form a happens-before edge, so the next thread to acquire sees everything the previous holder wrote. Drop that pair and a thread can "take the lock" and still read stale data.

A `test-and-set` is a cheaper way to write the same acquire: `held_.exchange(true, std::memory_order_acquire)`, then spin while the returned old value was `true`. CAS is the version that generalizes to everything below.

## Spinlocks

The `Mutex` above is really a spinlock: a thread that cannot get in burns a core in the loop until the holder releases. That is the right trade when the critical section is a handful of instructions and contention is rare — bumping a counter, swapping a pointer, updating one cache line. It is the wrong trade when the holder might page-fault, call into the kernel, or block on I/O, because then the waiter wastes a whole core doing nothing.

Even when spinning is correct, the naive loop is harsh on the machine. Two fixes matter:

```cpp
void Mutex::lock() {
  bool expected = false;
  while (!held_.compare_exchange_weak(expected, true,
                                      std::memory_order_acquire)) {
    expected = false;
    // Spin on a plain read, not CAS, until the flag looks free again.
    while (held_.load(std::memory_order_relaxed)) {
      _mm_pause();  // spin-wait hint: PAUSE on x86, YIELD on ARM
    }
  }
}
```

A CAS is a locked read-modify-write that takes the cache line exclusive. If every waiter keeps CAS-ing, they drag that line back and forth between cores — cache-line bouncing — and the holder itself slows down trying to touch it. Spinning on a plain `load` instead lets the line stay shared until the flag actually changes, and only then does one thread attempt the CAS. That is the test-and-test-and-set pattern. The `_mm_pause()` tells the processor this is a spin-wait, so it can throttle the loop and not waste pipeline and power fighting its own store buffer.

A spinlock is also unfair. Whichever thread happens to win the CAS gets in, so a specific thread can be starved indefinitely while others keep jumping the queue. A ticket lock fixes that by handing out numbers:

```cpp
class TicketLock {
  std::atomic<uint32_t> next_{0};     // next ticket to hand out
  std::atomic<uint32_t> serving_{0};  // ticket currently allowed in

 public:
  void lock();    // take a ticket, wait until it is being served
  void unlock();  // serve the next ticket
};

void TicketLock::lock() {
  uint32_t my = next_.fetch_add(1, std::memory_order_relaxed);
  while (serving_.load(std::memory_order_acquire) != my) {
    _mm_pause();
  }
}

void TicketLock::unlock() {
  serving_.fetch_add(1, std::memory_order_release);
}
```

Each arriving thread grabs the next ticket with an atomic increment and waits until `serving_` reaches its number. Threads then enter in exactly the order they arrived — strict FIFO, no starvation. The cost is that every waiter still polls one shared counter; the fancier queue locks (MCS, CLH) give each waiter its own cache line to spin on, which scales better under heavy contention.

## Other kinds of lock

A production mutex does not spin forever. It spins for a short while — long enough to win cheaply when the holder is about to release — and then asks the kernel to put the thread to sleep until the lock frees up. A sleeping waiter costs nothing instead of a whole core. On Linux the sleep/wake primitive is the `futex` syscall, and `std::mutex` is built on top of it. The rule of thumb: spin when the expected wait is shorter than two context switches, sleep otherwise.

A few variants show up constantly and are all small changes to the same flag:

- **try-lock** attempts the CAS once and returns whether it got in, instead of waiting. It is a single `compare_exchange_strong`. Useful when a thread has other work it can do rather than block.
- **Recursive (reentrant) lock** lets the thread that already holds it acquire again without deadlocking. It stores the owning thread id and a recursion count, incrementing on re-entry and only releasing when the count returns to zero.
- **Timed lock** waits up to a deadline and then gives up, which keeps a stuck holder from blocking a thread forever.

## Reader-writer locks

Exclusive locking is wasteful when most threads only read. If the shared state rarely changes — a config map, a routing table, a cache — readers do not conflict with one another; only a writer needs to be alone. A reader-writer lock encodes exactly that: any number of readers can hold it at once (shared mode), but a writer needs it to itself (exclusive mode).

The simplest version keeps one atomic counter. A positive value counts active readers, zero means free, and a sentinel of `-1` marks a writer in possession.

```cpp
class RwLock {
  // 0 = free; n > 0 = n active readers; -1 = one writer holds it.
  std::atomic<int> state_{0};

 public:
  void lock_shared();    // reader: bump the count unless a writer holds it
  void unlock_shared();  // reader: drop the count
  void lock();           // writer: take it only from fully free (0 -> -1)
  void unlock();         // writer: release back to free
};

void RwLock::lock_shared() {
  int s = state_.load(std::memory_order_relaxed);
  for (;;) {
    if (s < 0) {  // a writer is in; wait and reload
      s = state_.load(std::memory_order_relaxed);
      continue;
    }
    if (state_.compare_exchange_weak(s, s + 1, std::memory_order_acquire)) {
      return;  // joined as a reader
    }
    // CAS failed: s now holds the live value, so loop and retry
  }
}

void RwLock::unlock_shared() {
  state_.fetch_sub(1, std::memory_order_release);
}

void RwLock::lock() {
  int expected = 0;
  while (!state_.compare_exchange_weak(expected, -1,
                                       std::memory_order_acquire)) {
    expected = 0;  // only a fully free lock can move to -1
  }
}

void RwLock::unlock() {
  state_.store(0, std::memory_order_release);
}
```

A reader joins by CAS-ing the count up, but only while `state_` is non-negative. A writer can only move `0 → -1`, so it has to wait until every reader has left and no other writer is in.

This version quietly favors readers. As long as new readers keep arriving, `state_` never falls back to `0`, and a waiting writer can be stuck forever — writer starvation. Real reader-writer locks add a "writer waiting" bit that blocks new readers once a writer has queued, trading a little reader throughput for a bound on how long a writer waits. `std::shared_mutex` is the standard implementation and picks that policy for you; reach for it unless you are counting cache lines. The hand-rolled version above is worth understanding because it shows what the standard one is paying for.

Everything here comes back to the same move: swap a word atomically, but only if it still holds the value you last saw. Once you have that, the mutex, the spinlock, the ticket lock, and the reader-writer lock are all just different bookkeeping on top of it.

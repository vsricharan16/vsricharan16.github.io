---
title: Locks and Critical Section
date: '2026-09-28'
description: 'How a mutex is built from compare-and-swap, and what atomic operations actually guarantee.'
---

A critical section is a stretch of code that touches shared state. Two threads running it at the same time is a data race: lost updates, torn reads, invariants that only hold on paper. A lock's job is to make that stretch exclusive. One thread is in; everyone else waits.

The interface is small. `lock()` before the shared access, `unlock()` after. The hard part is implementing those two calls without already having a lock.

## The check-then-set that does not work

A boolean flag looks enough:

```cpp
bool locked = false;

void lock() {
  while (locked) {
    // spin
  }
  locked = true;
}

void unlock() {
  locked = false;
}
```

The load of `locked` and the store that sets it to `true` are two separate operations. Two threads can both see `false`, both leave the loop, and both enter the critical section. The window is tiny. Under load it shows up constantly.

That is the whole problem a mutex has to close: the test and the claim have to happen as one step.

## Atomic operations

An atomic operation is one that other threads cannot observe half-done. Either the old value is still there, or the new one is. There is no torn word in between, and no pair of threads that both "won."

On x86 that is a locked read-modify-write against a cache line (`LOCK CMPXCHG`, `XCHG`, `LOCK XADD`). The core takes exclusive ownership of the line, does the update, and publishes it. On ARM the same idea is load-linked / store-conditional: you load a reservation, compute a new value, and the store fails if anyone else wrote that line in between. C++ does not expose those instructions. It exposes `std::atomic`.

Plain `bool` and `int` are not atomic in this sense. A compiler can split, hoist, or duplicate accesses. Another core can see a store late, or not at all, depending on its store buffer. `std::atomic<T>` is the contract that the object is a single location, that loads and stores of it are indivisible, and that you can attach a memory order so surrounding ordinary reads and writes become visible in a useful order.

A mutex is not magic on top of that. It is a protocol built from a handful of these operations.

## Compare-and-swap

Compare-and-swap (CAS) is the primitive most of those protocols start from. In one atomic step it does:

1. Read the current value.
2. If it equals the value you expected, write a new one and report success.
3. If it does not, leave it alone, hand you what was actually there, and report failure.

In C++:

```cpp
std::atomic<bool> locked{false};

bool expected = false;
bool ok = locked.compare_exchange_strong(
    expected,
    true);  // desired
```

If `locked` was `false`, this stores `true` and `ok` is `true` — this thread now owns the lock. If `locked` was already `true`, the store does not happen, `expected` becomes `true`, and `ok` is `false`.

`compare_exchange_weak` is the same idea with a license to fail even when the value matched. Hardware LL/SC loops can lose the reservation for reasons that have nothing to do with another writer. In a retry loop that is fine, and often cheaper. `compare_exchange_strong` retries those spurious failures for you.

The `expected` argument is both input and output. On failure it is overwritten with the live value. Forgetting to reset it is a classic bug: the next attempt compares against `true` and never succeeds.

CAS is more general than a lock. You can use it to push a node onto a lock-free stack, bump a generation count, or install a pointer only if it is still null. A mutex is the smallest interesting use: flip a flag from free to held, but only if it is still free.

## A mutex from CAS

```cpp
class Mutex {
  std::atomic<bool> held_{false};

 public:
  void lock() {
    bool expected = false;
    while (!held_.compare_exchange_weak(
        expected, true, std::memory_order_acquire)) {
      expected = false;
    }
  }

  void unlock() {
    held_.store(false, std::memory_order_release);
  }
};
```

`lock()` keeps trying to CAS `false → true`. Success means this thread entered. Failure means someone else holds it; reset `expected` and try again. `unlock()` is a single atomic store. No CAS is required: only the holder is allowed to release.

The memory orders are not decoration. `memory_order_acquire` on the successful CAS is a one-way barrier: no load or store in the critical section may be hoisted above the lock. `memory_order_release` on unlock is the other direction: no load or store in the critical section may sink past the unlock. Together they make a happens-before edge. Whatever the previous holder wrote inside the section is visible to the next one. Without that pair you can "take the lock" and still read stale data.

This is a spinlock. A waiter burns a core until the holder drops the flag. That is the right trade when the critical section is a few instructions and contention is rare — a cache-line update, a stats counter. It is the wrong trade when the holder might page fault, call into the kernel, or wait on I/O. Then you want a blocking mutex: spin a little, then sleep. On Linux that sleep is a `futex`. `std::mutex` is that kind of lock, not the loop above.

A cheaper exclusive flag uses test-and-set, `held_.exchange(true, std::memory_order_acquire)`, and spins while the old value was already `true`. CAS is the version that generalizes. Once you can swap a word only if it still has the value you last saw, you can build the lock, and then the rest of the catalog — try-lock, seqlocks, a lot of lock-free structure — from the same instruction.

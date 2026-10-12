---
title: Locks and Critical Section
date: '2025-01-09'
description: 'How a mutex is built from compare-and-swap, and what atomic operations actually guarantee.'
tags: [concurrency, synchronization, cpu]
---

A critical section is a stretch of code that touches shared state. Two threads running it at the same time is a data race: lost updates, torn reads, invariants that only hold on paper. A lock's job is to make that stretch exclusive. One thread is in; everyone else waits.

The interface is small. `lock()` before the shared access, `unlock()` after. The hard part is implementing those two calls without already having a lock.

## The check-then-set that does not work

A boolean flag looks enough:

```cpp
// Naive attempt: the test (the while) and the claim are two separate steps.
bool locked = false;

void lock() {
  while (locked) {
    // spin
  }
  locked = true;  // race: another thread may have set this between test and here
}

void unlock() {
  locked = false;
}
```

```python
locked = False

def lock():
    global locked
    while locked:
        pass
    locked = True

def unlock():
    global locked
    locked = False
```

```java
class BrokenLock {
  private boolean locked = false;

  void lock() {
    while (locked) {
      // spin
    }
    locked = true;
  }

  void unlock() {
    locked = false;
  }
}
```

The load of `locked` and the store that sets it to `true` are two separate operations. Two threads can both see `false`, both leave the loop, and both enter the critical section. The window is tiny. Under load it shows up constantly.

That is the whole problem a mutex has to close: the test and the claim have to happen as one step.

## Atomic operations

An atomic operation is one that other threads cannot observe half-done. Either the old value is still there, or the new one is. There is no torn word in between, and no pair of threads that both "won."

On x86 that is a locked read-modify-write against a cache line (`LOCK CMPXCHG`, `XCHG`, `LOCK XADD`). The core takes exclusive ownership of the line, does the update, and publishes it. On ARM the same idea is load-linked / store-conditional: you load a reservation, compute a new value, and the store fails if anyone else wrote that line in between.

C++ exposes that as `std::atomic`.

## Compare-and-swap

Compare-and-swap (CAS) is the primitive most of those protocols start from. In one atomic step it does:

1. Read the current value.
2. If it equals the value you expected, write a new one and report success.
3. If it does not, leave it alone, hand you what was actually there, and report failure.

```cpp
// One atomic step: claim the lock only if it is still free.
std::atomic<bool> locked{false};

bool expected = false;
bool ok = locked.compare_exchange_strong(
    expected,
    true);  // desired
```

```python
import threading


class AtomicBool:
    def __init__(self, value=False):
        self._value = value
        self._word = threading.Lock()

    def compare_exchange(self, expected, desired):
        with self._word:
            if self._value == expected:
                self._value = desired
                return True, expected
            return False, self._value


locked = AtomicBool(False)
ok, expected = locked.compare_exchange(False, True)
```

```java
import java.util.concurrent.atomic.AtomicBoolean;

AtomicBoolean locked = new AtomicBoolean(false);
boolean ok = locked.compareAndSet(false, true);
```

If `locked` was `false`, this stores `true` and `ok` is `true` — this thread now owns the lock. If `locked` was already `true`, the store does not happen and `ok` is `false`.

`compare_exchange_*` takes `expected` by reference. On failure it is overwritten with the live value. Forgetting to reset it is a classic bug: the next attempt compares against `true` and never succeeds.

`compare_exchange_weak` can fail even when the value matched. Hardware LL/SC loops can lose the reservation for reasons that have nothing to do with another writer. In a retry loop that is fine, and often cheaper. `compare_exchange_strong` retries those spurious failures for you.

CAS is more general than a lock. You can use it to push a node onto a lock-free stack, bump a generation count, or install a pointer only if it is still null. A mutex is the smallest interesting use: flip a flag from free to held, but only if it is still free.

## A mutex from CAS

```cpp
class Mutex {
  std::atomic<bool> held_{false};  // true while some thread owns the lock

 public:
  void lock();    // spin on CAS false->true until this thread wins
  void unlock();  // release: only the holder stores false
};

// CAS false->true in a loop; reset expected after each spurious/lost attempt.
void Mutex::lock() {
  bool expected = false;
  while (!held_.compare_exchange_weak(
      expected, true, std::memory_order_acquire)) {
    expected = false;
  }
}

// A plain release store; no CAS needed since only the holder unlocks.
void Mutex::unlock() {
  held_.store(false, std::memory_order_release);
}
```

```python
class Mutex:
    def __init__(self):
        self._held = AtomicBool(False)

    def lock(self):
        expected = False
        while True:
            ok, expected = self._held.compare_exchange(expected, True)
            if ok:
                return
            expected = False

    def unlock(self):
        self._held.compare_exchange(True, False)
```

```java
class Mutex {
  private final AtomicBoolean held = new AtomicBoolean(false);

  void lock() {
    while (!held.compareAndSet(false, true)) {
      Thread.onSpinWait();
    }
  }

  void unlock() {
    held.set(false);
  }
}
```

`lock()` keeps trying to CAS `false → true`. Success means this thread entered. Failure means someone else holds it; reset `expected` and try again. `unlock()` is a store of `false`. No CAS is required: only the holder is allowed to release.

The memory orders are not decoration. `memory_order_acquire` on the successful CAS is a one-way barrier: no load or store in the critical section may be hoisted above the lock. `memory_order_release` on unlock is the other direction: no load or store in the critical section may sink past the unlock. Together they make a happens-before edge. Without that pair you can "take the lock" and still read stale data.

This is a spinlock. A waiter burns a core until the holder drops the flag. That is the right trade when the critical section is a few instructions and contention is rare — a cache-line update, a stats counter. It is the wrong trade when the holder might page fault, call into the kernel, or wait on I/O. Then you want a blocking mutex: spin a little, then sleep. On Linux that sleep is a `futex`. `std::mutex` is that kind of lock, not the loop above.

A cheaper exclusive flag uses test-and-set, `held_.exchange(true, std::memory_order_acquire)`, and spins while the old value was already `true`. CAS is the version that generalizes. Once you can swap a word only if it still has the value you last saw, you can build the lock, and then the rest of the catalog — try-lock, seqlocks, a lot of lock-free structure — from the same instruction.

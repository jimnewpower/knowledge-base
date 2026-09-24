# Java concurrency cheat sheet

Concurrency is **more than one thread of execution touching shared state**. Correctness first, then throughput. See [java.md](java.md) for the short version and [resilience.md](resilience.md) for timeouts across the network.

## Happens-before (what you actually rely on)

The JMM is not folklore. If thread A writes `ready = true` and thread B reads it, B is *not* guaranteed to see A’s earlier writes unless there is a happens-before edge:

- `synchronized` unlock → later lock on the **same** monitor
- `volatile` write → later `volatile` read of that field
- Thread start / successful join
- Concurrent collections / atomics documenting that guarantee
- Constructor finish → first action after the reference is safely published

No edge → stale reads, torn objects, “impossible” bugs.

## Threads and executors

```java
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    exec.submit(() -> handle(req));
}

var pool = new ThreadPoolExecutor(
    4, 16, 60, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(256),
    new ThreadPoolExecutor.CallerRunsPolicy());
```

| Tool | When |
|------|------|
| Virtual threads (21+) | Lots of blocking I/O tasks |
| Bounded platform pool | CPU-bound work, or you must cap old blocking APIs |
| `CompletableFuture` | Compose async stages; **name the executor** |
| ForkJoinPool | Parallel streams; not your HTTP traffic |

Virtual threads do not make shared mutable state safe. They make blocking cheaper.

Pinning (21–24 especially): a virtual thread inside `synchronized` that blocks I/O can pin a carrier. Prefer `ReentrantLock` around blocking work, or keep `synchronized` blocks tiny and CPU-only.

## Shared state toolkit

| Tool | Use |
|------|-----|
| `synchronized` / monitor | Small critical sections |
| `ReentrantLock` | Need tryLock / interruptibly |
| `ReadWriteLock` | Rarely; measure |
| `volatile` | Flags, safe publication of a reference |
| `AtomicInteger` / `VarHandle` | Single-variable CAS |
| `ConcurrentHashMap` | Concurrent map; values may still be mutable |
| `BlockingQueue` | Hand off work between threads |
| Immutable objects | Often the best “lock” |

```java
private final Object lock = new Object();
public void add(Item i) {
  synchronized (lock) { items.add(i); }
}
```

Do not lock on a public type’s `this` or on a boxed `Integer`.

## Common patterns

**Immutable value** — no sharing problem.

**Thread confinement** — JDBC `Connection` is not thread-safe; one thread owns it.

**Worker queue** — producers put jobs; consumers take. Backpressure = bounded queue + reject policy.

**Copy-on-write** — rare; `CopyOnWriteArrayList` for few writes, many reads.

## Deadlock, livelock, starvation

- Deadlock: cycle of locks. Lock in a global order, or use `tryLock` with timeout.
- Livelock: everyone retries politely forever. Backoff with jitter.
- Starvation: a thread never gets the lock. Fair locks are slower; usually fix the critical-section length.

Dump: `jstack <pid>` or `jcmd <pid> Thread.print`. Look for `BLOCKED` and identical monitor addresses.

## Time

- `System.nanoTime()` for elapsed time on one JVM.
- `Clock` at domain edges for “now.”
- `Thread.sleep` in production code is almost always a bug (use waits, futures, or a scheduler).

## Gotchas

- `HashMap` from multiple threads: lost entries or infinite loops on old JDKs; still wrong on new ones. Use `ConcurrentHashMap` or confine.
- `double-checked locking` without `volatile` on the instance field.
- Catching `InterruptedException`, swallowing it, and leaving the interrupt flag cleared.
- Unbounded `newCachedThreadPool()` under load.
- Parallel streams on a tiny list with a side-effecting lambda.

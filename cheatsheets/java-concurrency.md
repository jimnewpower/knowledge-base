# Java concurrency cheat sheet

> Baseline: Java 21 executors and memory model; monitor-pinning changes for JDK[^jdk] 24+ are called out. Reviewed: 2026-09-24.

Concurrency is **multiple tasks making progress during overlapping periods**; shared mutable state adds coordination problems. Correctness first, then throughput. See [java.md](java.md) for the short version and [resilience.md](resilience.md) for timeouts across the network.

## Happens-before (what you actually rely on)

The JMM[^jmm] is not folklore. If thread A writes `ready = true` and thread B reads it, B is *not* guaranteed to see A’s earlier writes unless there is a happens-before edge:

- `synchronized` unlock → later lock on the **same** monitor
- `volatile` write → later `volatile` read of that field
- Thread start / successful join
- Concurrent collections / atomics documenting that guarantee
- Publication through a volatile reference, lock, or concurrent collection makes prior initialization visible to the receiving thread

Without appropriate ordering, reads can observe stale or partially initialized state. Properly constructed `final` fields have additional initialization guarantees; constructor completion alone is not general safe publication.

## Threads and executors

Executor configuration fragment; the owning component must shut the pool down:

```java
var pool = new ThreadPoolExecutor(
    4, 16, 60, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(256),
    new ThreadPoolExecutor.CallerRunsPolicy());
```

| Tool | When |
|------|------|
| Virtual threads (21+) | Lots of blocking I/O[^i-o] tasks |
| Bounded platform pool | CPU[^cpu]-bound work, or you must cap old blocking APIs[^api] |
| `CompletableFuture` | Compose async stages; **name the executor** |
| ForkJoinPool | Parallel streams; not your HTTP[^http] traffic |

Virtual threads do not make shared mutable state safe. They make blocking cheaper.

On **JDK 21–23**, blocking inside `synchronized` can pin a virtual thread to its carrier; consider `ReentrantLock` for frequent, long blocking sections. **JDK 24+** removes monitor-related pinning (JEP[^jep] 491). Native/foreign calls can still cause pinning; do not replace every monitor merely because virtual threads are in use.

Use a semaphore or another explicit limit for scarce downstream resources. Virtual threads are not an admission-control policy. With the pool above, tasks queue after four busy workers; expansion toward sixteen starts when the queue fills. `CallerRunsPolicy` may execute work on the submitting request/UI[^ui] thread.

## Results, interruption, and cancellation

Method fragment using an executor owned by the caller:

```java
static <T> T awaitTask(ExecutorService executor, Callable<T> task)
        throws InterruptedException, ExecutionException {
    var result = executor.submit(task);
    try {
        return result.get();
    } catch (InterruptedException ex) {
        result.cancel(true);
        throw ex;
    }
}
```

- `Future.get()` exposes failure as `ExecutionException`; inspect its cause. Ignoring a submitted task's `Future` can hide its failure.
- Propagate `InterruptedException` when the API permits it. If a worker boundary catches it, restore the flag with `Thread.currentThread().interrupt()` and exit or follow an explicit cancellation policy.
- `cancel(true)` requests interruption; it does not forcibly stop work. Tasks and I/O APIs must cooperate. A timed `get` bounds waiting, not execution; cancel or otherwise manage the task after timeout.
- Try-with-resources on an executor waits for termination. It is not a substitute for task deadlines; closing may still wait for uncooperative work.

## Shared state toolkit

| Tool | Use |
|------|-----|
| `synchronized` / monitor | Small critical sections |
| `ReentrantLock` | Need tryLock / interruptibly |
| `ReadWriteLock` | Rarely; measure |
| `volatile` | Flags, safe publication of a reference |
| `AtomicInteger` / `VarHandle` | Single-variable CAS[^cas] |
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

**Thread confinement** — JDBC[^jdbc] `Connection` is not thread-safe; one thread owns it.

**Worker queue** — producers put jobs; consumers take. Backpressure = bounded queue + reject policy.

**Copy-on-write** — rare; `CopyOnWriteArrayList` for few writes, many reads.

## Deadlock, livelock, starvation

- Deadlock: cycle of locks. Lock in a global order, or use `tryLock` with timeout.
- Livelock: everyone retries politely forever. Backoff with jitter.
- Starvation: a thread never gets the lock. Fair locks are slower; usually fix the critical-section length.

Dump: `jstack <pid>` or `jcmd <pid> Thread.print`. Look for `BLOCKED` and identical monitor addresses.

## Time

- `System.nanoTime()` for elapsed time on one JVM[^jvm].
- `Clock` at domain edges for “now.”
- Use waits, futures, or a scheduler to coordinate work. `Thread.sleep` can implement an intentional delay or backoff, but it does not establish ordering or prove another task has completed; handle interruption.

## Gotchas

- `HashMap` from multiple threads: lost entries or infinite loops on old JDKs; still wrong on new ones. Use `ConcurrentHashMap` or confine.
- `double-checked locking` without `volatile` on the instance field.
- Catching `InterruptedException`, swallowing it, and leaving the interrupt flag cleared.
- Unbounded `newCachedThreadPool()` under load.
- Parallel streams on a tiny list with a side-effecting lambda.

## References

- [Java 21 — concurrency package and memory consistency](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html)
- [Java 21 — Future completion and cancellation](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Future.html)
- [Oracle — JDK 24 virtual-thread pinning change](https://www.oracle.com/java/technologies/javase/24-relnote-issues.html)

[^jdk]: Java Development Kit.
[^jmm]: Java Memory Model.
[^i-o]: Input/Output.
[^cpu]: Central Processing Unit.
[^api]: Application Programming Interface — the contract through which software components interact.
[^http]: Hypertext Transfer Protocol.
[^jep]: JDK Enhancement Proposal; JDK means Java Development Kit.
[^ui]: User Interface.
[^cas]: Compare-And-Set (also called Compare-And-Swap) — an atomic conditional update.
[^jdbc]: Java Database Connectivity.
[^jvm]: Java Virtual Machine.

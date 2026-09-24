# JVM performance and GC cheat sheet

The JVM is a process: heap, stacks, metaspace, compiler, and garbage collector. Most “Java is slow” bugs are allocation rate, I/O wait, or a bad query — not the collector’s brand name.

Related: [java.md](java.md), [java-concurrency.md](java-concurrency.md), [observability.md](observability.md), [docker.md](docker.md).

## What to measure first

| Symptom | Look at |
|---------|---------|
| High latency, CPU idle | I/O, locks, DNS, downstream timeouts |
| High latency, CPU busy | Hot methods, allocation, GC pauses |
| Throughput cliff | GC thrash, thread pool saturation |
| Memory grows until kill | Leak (a cache, a listener, a thread-local) |

Tools: JFR + JDK Mission Control, `async-profiler`, `jstat -gc`, `jcmd`, actuator metrics. Measure in the environment that hurts (container limits ≠ laptop).

```bash
jcmd <pid> VM.flags
jcmd <pid> GC.heap_info
jstat -gc <pid> 1000
```

## Heap and friends

```text
heap         objects
metaspace    class metadata
thread stacks
direct / mapped buffers   ByteBuffer.allocateDirect, files
code cache   JIT
```

Container: respect cgroup.

```text
-XX:MaxRAMPercentage=75
-XX:+UseG1GC
```

Do not set `-Xmx` to the container limit. Leave room for metaspace, stacks, and direct memory or the kernel OOM-kills you “for no reason.”

## Collectors (practical)

| Collector | Shape |
|-----------|--------|
| G1 (common default) | Good general purpose |
| ZGC | Very low pause, more RAM, modern LTS |
| Parallel | Throughput-oriented batch |
| Serial | Tiny heaps / tools |

Pick one, set a pause or footprint goal, measure. Switching collectors to dodge a leak does not fix the leak.

## Allocation is the hot path

Young GC frequency ≈ allocation rate / young size.

- Unnecessary `byte[]` copies on every request.
- Boxing in tight loops (`List<Integer>`).
- String concat in a loop (use `StringBuilder` or stream collect).
- Logging that builds strings at INFO you then filter.

JFR “Allocation” events beat guessing.

## JIT

Hot methods get compiled. First minutes can be slower (warm-up). Do not benchmark a 2-second `main`.

Escape analysis can allocate on the stack. Tiny value objects are cheaper than rumor says; *lots* of huge intermediates are not.

## Leaks that look like GC problems

- Unbounded caches (`Map` with no eviction).
- Static collections.
- Listeners not removed.
- ThreadLocals on pooled threads that never clear.
- Off-heap / direct buffers forgotten.

Heap dump: `jcmd <pid> GC.heap_dump /tmp/app.hprof`. Look for a dominator that should not be that large.

## Latency vs throughput

- User-facing API: cap pause, cap pool, fail fast ([resilience.md](resilience.md)).
- Batch job: larger heap, parallel GC, fewer pauses-for-UX constraints.

p99 is where GC pauses and slow queries show. Averages lie.

## Gotchas

- `-Xmx4g` in a 512 MiB pod.
- Tuning twenty GC flags from a 2014 blog.
- Benchmarking with `System.out` and `currentTimeMillis` in a micro-loop.
- Blaming GC because CPU is at 4% and the database is at 90%.
- Finalizers / cleaners as a resource-management strategy. Use try-with-resources.

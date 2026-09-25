# JVM[^jvm] performance and GC[^gc] cheat sheet

> Baseline: HotSpot on JDK[^jdk] 21/25; collector availability and defaults depend on the JDK distribution and platform. Reviewed: 2026-09-24.

The JVM is a process: heap, stacks, metaspace, compiler, and garbage collector. Most “Java is slow” bugs are allocation rate, I/O[^i-o] wait, or a bad query — not the collector’s brand name.

Related: [java.md](java.md), [java-concurrency.md](java-concurrency.md), [observability.md](observability.md), [docker.md](docker.md).

## What to measure first

| Symptom | Look at |
|---------|---------|
| High latency, CPU[^cpu] idle | I/O, locks, DNS[^dns], downstream timeouts |
| High latency, CPU busy | Hot methods, allocation, GC pauses |
| Throughput cliff | GC thrash, thread pool saturation |
| Memory grows until kill | Leak (a cache, a listener, a thread-local) |

Tools: JFR[^jfr] + JDK Mission Control, `async-profiler`, `jstat -gc`, `jcmd`, actuator metrics. Measure in the environment that hurts (container limits ≠ laptop).

Example abbreviations: VM[^vm].

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

Do not set `-Xmx` to the container limit. Leave room for metaspace, stacks, and direct memory or the kernel OOM[^oom]-kills you “for no reason.”

## Collectors (practical)

| Collector | Shape |
|-----------|--------|
| G1[^g1] (common default) | Good general purpose |
| ZGC[^zgc] | Very low pause, more RAM[^ram], modern LTS[^lts] |
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

## JIT[^jit]

Hot methods get compiled. First minutes can be slower (warm-up). Do not benchmark a 2-second `main`.

HotSpot escape analysis can enable scalar replacement, eliminating an object allocation and treating its fields as separate values. This is not general stack allocation of objects. Measure allocation in the compiled hot path rather than counting every `new` in source.

## Leaks that look like GC problems

- Unbounded caches (`Map` with no eviction).
- Static collections.
- Listeners not removed.
- ThreadLocals on pooled threads that never clear.
- Off-heap / direct buffers forgotten.

Heap dump: `jcmd <pid> GC.heap_dump /tmp/app.hprof`. Look for a dominator that should not be that large.

## Latency vs throughput

- User-facing API[^api]: cap pause, cap pool, fail fast ([resilience.md](resilience.md)).
- Batch job: larger heap, parallel GC, fewer pauses-for-UX[^ux] constraints.

p99 is where GC pauses and slow queries show. Averages lie.

## Gotchas

- `-Xmx4g` in a 512 MiB pod.
- Tuning twenty GC flags from a 2014 blog.
- Benchmarking with `System.out` and `currentTimeMillis` in a micro-loop.
- Blaming GC because CPU is at 4% and the database is at 90%.
- Finalizers / cleaners as a resource-management strategy. Use try-with-resources.

## References

- [Oracle Java 25 — HotSpot optimizations and escape analysis](https://docs.oracle.com/en/java/javase/25/vm/java-hotspot-virtual-machine-performance-enhancements.html)
- [Oracle Java 21 — GC tuning guide](https://docs.oracle.com/en/java/javase/21/gctuning/)

[^jvm]: Java Virtual Machine.
[^gc]: Garbage Collection (or Garbage Collector, depending on context).
[^jdk]: Java Development Kit.
[^i-o]: Input/Output.
[^cpu]: Central Processing Unit.
[^dns]: Domain Name System.
[^jfr]: Java Flight Recorder.
[^oom]: Out Of Memory.
[^g1]: Garbage-First — a Java garbage collector.
[^zgc]: Z Garbage Collector — a Java garbage collector designed for low pauses.
[^ram]: Random-Access Memory.
[^lts]: Long-Term Support.
[^jit]: Just-In-Time compilation.
[^api]: Application Programming Interface — the contract through which software components interact.
[^ux]: User Experience.
[^vm]: Virtual Machine.

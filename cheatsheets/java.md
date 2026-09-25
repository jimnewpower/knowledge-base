# Java cheat sheet

> Baseline: Java 21 language/API examples; JDK 25 lifecycle notes where stated. Imports and surrounding methods are omitted. Reviewed: 2026-09-24.

Primary language of this knowledge base’s product context: enterprise services, desktops, and scientific/geospatial tools. Pin the deployed JDK. Examples use Java 21 syntax; Java 17 requires alternatives to record patterns and virtual threads.

Related: [Java library reference](java-libraries.md), [Python library reference](python-libraries.md).

## Types and declarations

```java
int count = 0;                 // primitive
Integer boxed = count;         // autobox
var items = new ArrayList<String>();  // local inference only

record Money(BigDecimal amount, Currency currency) {}
enum Status { OPEN, CLOSED }

sealed interface Shape permits Circle, Rect {}
record Circle(double r) implements Shape {}
record Rect(double w, double h) implements Shape {}
```

- Prefer `BigDecimal` for money; never `double`.
- Prefer `Optional` as a *return* type, not a field and not a method parameter.
- `null` is still real in Java. Be explicit at boundaries.

## Equality and hashing

```java
record OrderId(String value) {}
```

If you override `equals`, provide a consistent `hashCode`. Records generate both from their components. Entities usually equal by stable identity, not every field; generated database IDs and ORM proxies need a deliberate equality policy. Do not let an ID assignment change a key's hash while it is in a map or set.

## Collections (java.util)

| Need | Type |
|------|------|
| Ordered list | `ArrayList` |
| Frequent insert at head | `ArrayDeque` or `LinkedList` (rare) |
| Unique, unordered | `HashSet` |
| Unique, sorted | `TreeSet` |
| Key/value | `HashMap` |
| Key/value, insertion order | `LinkedHashMap` |
| Concurrent map | `ConcurrentHashMap` |

```java
List.copyOf(items);            // unmodifiable snapshot
Map.of("a", 1, "b", 2);        // unmodifiable map; contents may still be mutable
items.stream()
     .filter(s -> !s.isBlank())
     .map(s -> s.toLowerCase(Locale.ROOT))
     .toList();
```

See [data-structures.md](data-structures.md).

Collection copies and records are shallow: mutable elements still need an ownership policy. `BigDecimal.equals` includes scale; decide whether `1.0` and `1.00` are the same domain value.

## Exceptions

- Unchecked (`RuntimeException`) for programmer errors and most domain violations in modern APIs.
- Checked exceptions at library boundaries that the caller *must* confront (I/O). Do not wrap every method in `throws Exception`.
- Never swallow with empty `catch`. Log or translate.

```java
try (var in = Files.newInputStream(path)) {
    return in.readAllBytes();
}
```

## Concurrency

Method fragment; callers handle or propagate interruption and task failure:

```java
static <T> T runTask(Callable<T> task)
        throws InterruptedException, ExecutionException {
    try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
        var result = exec.submit(task);
        return result.get();
    }
}
```

- `submit` stores failures in its `Future`. Closing the executor waits for tasks but does not report those failures. Observe the result; see [java-concurrency.md](java-concurrency.md) for cancellation and shared executors.
- Virtual threads: good for blocking I/O-bound concurrency. Still protect shared mutable state.
- Do not synchronize on `this` of a public type if you can use a private lock object.
- `CompletableFuture` async methods normally use the common pool without an explicit executor. Non-async stages may run on the thread completing the preceding stage.

## Object model (short)

- Class = data + constructors + invariants.
- Interface = capability. Default methods are sugar, not a substitute for composition.
- Inheritance of implementation is the tightest coupling Java offers. Prefer composition. See [ood.md](ood.md) and [clean-code-and-solid.md](clean-code-and-solid.md).

## Packages and modules

```text
org.example.app
  api          # public types of this application
  domain
  app          # wiring / Spring @Configuration
  adapter.db
  adapter.http
```

JPMS (`module-info.java`) is optional. Most enterprise apps still use the classpath. Do not introduce modules unless you need strong encapsulation across artifacts.

## Tooling

| Tool | Role |
|------|------|
| javac / jdk | compile and run |
| Maven | build and dependencies — [maven.md](maven.md) |
| JUnit 5 | tests — [tdd.md](tdd.md) |
| SpotBugs / Error Prone / Checkstyle | static checks |
| jcmd, jfr, async-profiler | runtime diagnosis |

```bash
java -version
jar tf app.jar
jcmd <pid> VM.flags
```

## Modern syntax worth using

```java
// text blocks
var json = """
    {"ok": true}
    """;

// pattern matching
if (shape instanceof Circle(var r)) {
    return Math.PI * r * r;
}

var label = switch (status) {
    case OPEN -> "open";
    case CLOSED -> "closed";
};
```

## Gotchas

- `==` on boxed integers is not value equality outside the cached range.
- `Date` and `Calendar` are obsolete. Use `java.time` (`Instant`, `ZonedDateTime`, `Duration`).
- `String` is immutable; concatenating in a loop needs `StringBuilder` (or just a stream collect).
- `finalize` remains in JDK 25, deprecated for removal. Use try-with-resources for deterministic resource cleanup.
- Serializing domain objects with Java serialization is a trap. Prefer JSON/Avro/protobuf at boundaries.

## References

- [Java 21 — language changes and syntax](https://docs.oracle.com/en/java/javase/21/language/java-language-changes.html)
- [Java 25 — Object equality and deprecated finalization](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html)

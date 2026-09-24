# Java cheat sheet

Primary language of this knowledge base’s product context: enterprise services, desktops, and scientific/geospatial tools. Target a current LTS (17 or 21 in most shops; 25 is the newest LTS line as of 2025–2026 — pin what the platform actually runs).

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
@Override public boolean equals(Object o) { /* same type + same identifying fields */ }
@Override public int hashCode() { return Objects.hash(id); }
```

If you override one, override the other. For value objects, prefer `record`. Entities usually equal by identity (`id`), not by every field.

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
Map.of("a", 1, "b", 2);        // tiny immutable maps
items.stream()
     .filter(s -> !s.isBlank())
     .map(String::toLowerCase)
     .toList();
```

See [data-structures.md](data-structures.md).

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

```java
var exec = Executors.newVirtualThreadPerTaskExecutor(); // Java 21+
try (exec) {
    exec.submit(() -> handler.handle(req));
}

ReentrantLock lock = new ReentrantLock();
lock.lock();
try { /* critical */ }
finally { lock.unlock(); }
```

- Virtual threads: good for blocking I/O-bound concurrency. Still protect shared mutable state.
- Do not synchronize on `this` of a public type if you can use a private lock object.
- `CompletableFuture` composes async work; name the executor or you inherit the common pool.

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

switch (status) {
    case OPEN -> "open";
    case CLOSED -> "closed";
}
```

## Gotchas

- `==` on boxed integers is not value equality outside the cached range.
- `Date` and `Calendar` are obsolete. Use `java.time` (`Instant`, `ZonedDateTime`, `Duration`).
- `String` is immutable; concatenating in a loop needs `StringBuilder` (or just a stream collect).
- `finalize` is gone. Use try-with-resources.
- Serializing domain objects with Java serialization is a trap. Prefer JSON/Avro/protobuf at boundaries.

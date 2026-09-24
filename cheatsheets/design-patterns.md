# Design patterns cheat sheet

> Baseline: GoF and enterprise pattern vocabulary; Java examples are structural sketches. Reviewed: 2026-09-24.

Named patterns are **vocabulary for recurring structure**. Use them when the name shortens a design talk. Do not sprinkle Factory into every class.

Related: [ood.md](ood.md), [clean-code-and-solid.md](clean-code-and-solid.md), [uml.md](uml.md).

## How to read a pattern

1. Context — what keeps changing.
2. Structure — which types and who points at whom.
3. Consequence — what becomes easy, what becomes another type.

If nothing is changing, a function is enough.

## Creation

| Pattern | Idea | Use when |
|---------|------|----------|
| Factory method | Subclass or method decides the concrete type | Several products, shared construct steps |
| Abstract factory | Family of related products | Rare; often overkill |
| Builder | Stepwise construct a complex value | Many optional fields; prefer over telescoping constructors |
| Singleton | One instance | Almost never in app code; the container already owns lifecycle |
| Prototype | Clone a template | Rare in Java; copy constructors are clearer |

```java
public final class Money {
  public static Money usd(String amount) {
    return new Money(new BigDecimal(amount), Currency.getInstance("USD"));
  }
}
```

A static factory is often all you need.

## Structure

| Pattern | Idea | Use when |
|---------|------|----------|
| Adapter | Wrap a foreign type behind *your* interface | Vendor SDK, legacy API |
| Facade | One simple front for a cluster of types | Start-up of a subsystem |
| Decorator | Add behavior around the same interface | Logging, metrics, auth around a port |
| Proxy | Stand-in that controls access | Lazy load, remote stub, Spring proxy |
| Composite | Tree of same-interface nodes | UI, spec trees |
| Bridge | Split abstraction from implementation | Two independent axes of variation |
| Flyweight | Share immutable common state | Lots of similar objects |

Hexagonal / ports and adapters is Adapter applied at the application boundary:

```text
domain  <--- port interface --- adapter (HTTP, JDBC, mail)
```

The domain does not import Spring Web. The adapter does.

## Behavior

| Pattern | Idea | Use when |
|---------|------|----------|
| Strategy | Swap an algorithm behind an interface | Payment method, sort order, export format |
| Template method | Skeleton in a base class, steps in subclasses | Prefer composition + Strategy instead |
| Observer | Subscribe to events | In-process callbacks; not a message bus |
| Command | Request as an object | Queues, undo, audit |
| State | Behavior depends on explicit state object | When `switch (status)` keeps growing |
| Chain of responsibility | Handlers in a line | Filters, servlet filters, middleware |
| Iterator | Sequential access without exposing storage | You already use this (`Iterable`) |
| Mediator | Hub of collaboration | Risky god-object; use carefully |
| Visitor | Add operations without changing the element types | Compilers, rare in business apps |
| Memento | Snapshot internal state | Undo; or just store a value object |

```java
interface Pricer { Money price(Cart cart); }
class ListPricer implements Pricer { ... }
class PromoPricer implements Pricer { ... }
```

That is Strategy. A `switch` over two stable variants is also fine.

## Enterprise catalog (worth knowing by name)

| Pattern | Idea |
|---------|------|
| Repository | Collection-like port over persistence |
| Unit of work | Track changes, flush once (JPA `EntityManager`) |
| Gateway | Thin client over an external system |
| Domain event | Something that happened in the domain |
| Anti-corruption layer | Adapter that prevents a foreign model from leaking in |
| Strangler fig | New path beside old; cut over incrementally |
| CQRS | Separate write model from a read model — only when reads cannot share the write schema |

## When not to

- One implementation, no evidence of a second — no interface “for testing” unless the test actually needs it (then a package-visible constructor may suffice).
- Pattern soup: `AbstractSingletonProxyFactoryBean`.
- Inheritance-based Template Method when a function parameter would do.

## Gotchas

- Naming a class `FooManager` does not make it a pattern.
- Decorator stacks that hide the inner failure.
- Observer that must be reliable across processes — that is messaging, not Observer. See [messaging-and-events.md](messaging-and-events.md).

## References

- [Fowler — enterprise application pattern catalog](https://martinfowler.com/eaaCatalog/)
- [Gamma, Helm, Johnson, Vlissides — Design Patterns (publisher)](https://www.informit.com/store/design-patterns-elements-of-reusable-object-oriented-9780201633610)

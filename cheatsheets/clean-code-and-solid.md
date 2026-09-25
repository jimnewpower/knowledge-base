# Clean code and SOLID[^solid] cheat sheet

> Baseline: Design heuristics for Java-style object-oriented code; these are contextual recommendations. Reviewed: 2026-09-24.

Clean code is code a colleague can change without a ceremony. SOLID is five design heuristics for object-oriented systems. Neither is a scoring rubric. If a principle fights a clear module boundary, keep the boundary.

See also [ood.md](ood.md) and [tdd.md](tdd.md).

## Clean code — working rules

1. **Names are documentation.** `invoiceTotal` beats `t`. `approve()` beats `doIt()`.
2. **Keep functions cohesive and at a clear level of abstraction.** Split independently meaningful responsibilities; a short use-case orchestrator may legitimately perform several steps.
3. **Small diffs to invariants.** A method that validates, writes SQL[^sql], and sends email is three modules wearing a trench coat.
4. **Delete dead code.** Version control remembers.
5. **Comments explain why, not what.** If the comment restates the line, fix the name.
6. **Errors are part of the interface.** Do not return `null` to mean three different things.
7. **Keep formatting mechanical.** Let the tool own whitespace so review can own behavior.
8. **Boy Scout a little.** Leave the function you touched clearer — not the whole package reformatted.

### Smell → likely fix

| Smell | Try |
|-------|-----|
| Long parameter list | Parameter object or builder |
| Feature envy | Move the method to the data it envies |
| Shotgun surgery | One change fans out across many files — missing module |
| Data clump | The same three fields travel together — they are a type |
| Primitive obsession | `String` used as money, id, email, JSON[^json] |
| God class | Split along responsibilities, not along “utils” |

## SOLID

### S — Single Responsibility

A module should have one reason to change.

```java
// two reasons to change: persistence policy and notification policy
class OrderService {
  void close(Order order) {
    repo.save(order);
    mailer.send(order);
  }
}
```

Split persistence from notification. Orchestrate them in an application service if the *use case* is “close and notify.”

SRP[^srp] is not “one method per class.” It is “one axis of change per module.”

### O — Open/Closed

Open for extension, closed for modification of *stable* modules.

Useful when new variants arrive often (payment methods, export formats). An interface with interchangeable implementations can localize change. A sealed hierarchy deliberately limits extension and requires updating its permitted types; an exhaustive switch can be clearer for a closed set. Do not abstract a one-off.

### L — Liskov Substitution

A subtype must honor the contract of its type. No surprise exceptions, no weakened postconditions, no ignored parameters.

```java
// violation: Square that breaks Rectangle setters
class Rectangle { void setWidth(int w); void setHeight(int h); }
```

If callers of `Rectangle` cannot use `Square` safely, `Square` is not a `Rectangle`. Model `Shape` with area instead.

### I — Interface Segregation

Do not force clients to depend on methods they never call.

```java
interface Worker { void work(); void eat(); } // a batch job does not eat
interface Workable { void work(); }
```

Small, role-specific interfaces. In Java this is also how you keep mocks honest.

### D — Dependency Inversion

High-level policy should depend on abstractions, not on SQL or HTTP[^http] clients.

```java
interface OrderRepository { Optional<Order> find(OrderId id); void save(Order order); }

class JdbcOrderRepository implements OrderRepository { ... }
class CloseOrder { CloseOrder(OrderRepository repo) { ... } }
```

The application module defines the interface. Adapters implement it. Wiring (Spring, main) is the only place that knows both.

## How the five work together

Example abbreviations: LSP[^lsp].

```text
DIP puts policy above adapters
SRP keeps each adapter and policy thin
ISP keeps the abstractions small
LSP keeps implementations honest
OCP uses those abstractions when variation is real
```

## When to stop

- A one-class program does not need five interfaces.
- A stable report query does not need a strategy hierarchy.
- Duplicating six lines twice can be cheaper than an abstraction you will guess wrong.

Principles are for *change you have evidence will happen*, not for ceremony.

## References

- [Robert C. Martin — SOLID relevance](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html)
- [Martin Fowler — Beck design rules](https://martinfowler.com/bliki/BeckDesignRules.html)

[^solid]: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion — five object-oriented design principles.
[^sql]: Structured Query Language.
[^json]: JavaScript Object Notation.
[^srp]: Single Responsibility Principle.
[^http]: Hypertext Transfer Protocol.
[^lsp]: Liskov Substitution Principle.

# Object-oriented design cheat sheet

OOD is designing around **types that encapsulate state and protect invariants**, collaborating through messages (method calls). It is one tool. Data pipelines and functional cores are others. Use objects where there is behavior + invariant, not around every record.

See [clean-code-and-solid.md](clean-code-and-solid.md) and [uml.md](uml.md).

## Core vocabulary

| Term | Meaning |
|------|---------|
| Object | Identity + state + behavior |
| Class | Template and type for objects |
| Encapsulation | State is reachable only through a contract |
| Invariant | Fact that must remain true (`balance >= 0`) |
| Collaboration | Objects sending messages |
| Composition | Has-a; lifetime often tied |
| Aggregation | Has-a; lifetime independent (looser) |
| Inheritance | Is-a at the type level |
| Polymorphism | Same message, different implementations |
| Cohesion | How tightly a type’s methods belong together |
| Coupling | How much one type needs another’s internals |

## Responsibilities first

Ask “who knows this, who decides this, who does this?” before drawing a class box.

CRC-style card:

```text
Class: Order
Knows: id, items, status
Does:  add item, submit, cannot submit empty
Collaborators: Pricing, OrderRepository
```

God objects know everything and do everything. Split along those answers.

## Encapsulation patterns

```java
public final class Money {
  private final BigDecimal amount;
  private final Currency currency;

  public Money plus(Money other) {
    requireSameCurrency(other);
    return new Money(amount.add(other.amount), currency);
  }
}
```

- Construct in a valid state. Reject invalid input at the boundary.
- Mutating methods either maintain the invariant or return a new value object.
- Getters that leak mutable internals (`return list`) break encapsulation. Return unmodifiable views or copies.

Value object: equality by value, no lifecycle (`Money`, `Email`).  
Entity: equality by identity, lifecycle (`Order`).  
Aggregate: cluster of entities with one root that enforces the invariant (`Order` + `Line`).

## Composition over inheritance

Inheritance is the tightest reuse. It leaks parent internals and freezes hierarchy early.

```text
Prefer:  OrderService has an OrderRepository
Over:    OrderService extends JdbcSupport
```

Use inheritance when you truly have a subtype that *is* the parent for all callers (LSP). Use interfaces for roles.

## Coupling knobs

| Knob | Effect |
|------|--------|
| Depend on interfaces | Lower coupling |
| Depend on concrete JDBC types | Higher coupling |
| Public fields | Highest coupling |
| Events / callbacks | Temporal decoupling, harder traces |
| Shared mutable statics | Hidden coupling; avoid |

Draw the dependency arrow toward stability: domain does not import adapters.

## GRASP (useful subset)

- **Information expert** — the object with the data does the work.
- **Creator** — the object that uses / contains / has the data to build X creates X.
- **Controller** — a use-case application type receives the UI/API request; domain types stay UI-free.
- **Low coupling / high cohesion** — score every extra dependency.
- **Polymorphism** — replace type switches that grow with every variant.
- **Pure fabrication** — a class invented for cohesion (a `MailGateway`) is allowed.
- **Protected variations** — put a stable interface in front of things that change (payment provider, file format).

## Modeling sequence

1. Name the use case and the invariant.
2. List types and their responsibilities (CRC or a sketch).
3. Decide entity vs value vs service vs repository.
4. Draw collaborations ([uml.md](uml.md) sequence or communication diagram if the interaction is the point).
5. Encode invariants in constructors and tests.

## Gotchas

- Anemic domain model: objects are structs, all logic lives in `*Service`. Sometimes fine (simple CRUD). Often a missed invariant.
- Inheritance for code reuse of utilities. That is a `final` helper or composition.
- Bidirectional object graphs that nobody can persist or test.
- “Manager” / “Util” as a substitute for a name.

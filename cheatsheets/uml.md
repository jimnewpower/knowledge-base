# UML cheat sheet

> Baseline: UML 2.5.1 notation; C4 is a separate architecture vocabulary. Reviewed: 2026-09-24.

UML is a **shared drawing vocabulary**, not a required ceremony. Draw the view that answers a question. Delete the diagram when the code is clearer.

Related: [C4 architecture diagrams](c4-diagrams.md), [Structurizr DSL](structurizr-dsl.md), [architecture documentation](architecture-documentation.md).

## Which diagram

| Question | Diagram |
|----------|---------|
| What types exist and how they relate | Class |
| What happens in this use case over time | Sequence |
| What states are legal | State machine |
| What the logical software parts are | UML component or C4 container/component |
| Where software instances run | Deployment |
| What a user can do | Use case (sparingly) |
| How data flows through activities | Activity |

If the question is “where does this run?” use a deployment diagram and the actual deployment configuration. A C4 container view describes applications and stores; it does not establish infrastructure topology.

## Class diagrams

```text
+----------------+          1     *  +-------------+
|    Order       |-------------------|  LineItem   |
+----------------+                   +-------------+
| - id: OrderId  |                   | - qty: int  |
| - status       |                   | - sku       |
+----------------+                   +-------------+
| + submit()     |
+----------------+
        △
        |
+----------------+
| RushOrder      |
+----------------+
```

| Symbol | Meaning |
|--------|---------|
| `+` `-` `#` | public, private, protected |
| solid line + triangle | inheritance / generalization |
| dashed line + triangle | implements interface |
| diamond filled | composition (part dies with whole) |
| diamond empty | aggregation |
| `1` `*` `0..1` | multiplicity |
| italic / `«interface»` | abstract type |

Show only fields and methods that earn their ink. A class box with 40 members is a list, not a design.

## Sequence diagrams

Time flows down. Objects across the top. Arrows are messages.

```text
Client        OrderApi        CloseOrder        Repo
  |-- POST /orders/1/close --> |
  |                            |-- close(id) --> |
  |                            |                  |-- find --> |
  |                            |                  |<-- order --|
  |                            |                  |-- save --> |
  |<-- 200 Order --------------|<-- Order --------|
```

- Synchronous call: solid arrow with filled head.
- Reply: dashed arrow.
- Lifeline `X` marks destruction. Creation is shown by a create message arriving at the new object's head, where its lifeline begins.

Use a sequence diagram when the *order of collaboration* is the risk (auth then persist then event). Skip it for a single getter.

## State machines

Boxes are states; arrows are events / guards / actions.

```text
  draft --submit--> open --approve--> approved
                      |
                      +--cancel--> cancelled
```

Legal transitions belong in the domain object, not only in the picture.

## Component and container views

UML component diagrams (`«component» OrderService` with provided/required interfaces) are fine. For systems, C4 (context → container → component) is often easier for mixed audiences.

```text
[Browser] -> [order-api] -> [postgres]
                 |
                 +-> [mail]
```

Name the process and the data store. That is usually the architecture conversation.

## Package and deployment

Package diagrams show layering (`adapter.http` depends on `app`, not the reverse). Deployment diagrams show nodes and artifacts. Keep them in sync with how you actually ship ([docker.md](docker.md), [devops.md](devops.md)) or do not bother.

## Rules that keep diagrams honest

1. One question per diagram.
2. Names match the code.
3. Date the diagram and cite the commit or ADR.
4. Prefer a small committed `.md` / `.svg` next to the note over a stale slide.
5. Do not generate 200-class dumps from the IDE and call it architecture.

## Gotchas

- UML is not a proof. Invariants still need tests.
- Sequence diagrams rot fastest. Draw them for live design discussions, then capture the decision in an ADR.
- Aggregation vs composition arguments rarely pay. If you are stuck, write the lifetime rule in a sentence instead.

## References

- [OMG — UML 2.5.1 specification](https://www.omg.org/spec/UML/2.5.1)
- [C4 model — diagram types](https://c4model.com/diagrams)

# Integration routing and coordination cheat sheet

> Baseline: Hohpe/Woolf EIP routing patterns; conceptual flows with implementation policies called out separately. Reviewed: 2026-09-24.

Choose routing by **destination, cardinality, and retained state**. Every stateful pattern needs an owner, a completion rule, and a recovery policy.

Related: [EIP overview](enterprise-integration-patterns.md), [transformation](integration-transformation.md), [messaging and events](messaging-and-events.md), [transactions and isolation](transactions-and-isolation.md).

## Route or fan out

| Pattern | Shape | Example / decision |
|---------|-------|--------------------|
| Content-Based Router | One message to a selected destination | Route orders by delivery region; define a no-match path |
| Message Filter | One message to zero or one | Keep relevant events; intentional rejection must be distinguishable from failure |
| Recipient List | One message to selected recipients | Send a compliance notice to applicable jurisdictions |
| Dynamic Router | Routing rules can change during operation | Govern rule updates and record the applied rule version |
| Splitter | One composite message to item messages | Process each line of an order independently |

A **Message Filter** accepts or drops a whole message. A **Content Filter** changes the fields within it. A Recipient List chooses recipients; Publish-Subscribe lets independent subscriptions express interest. See the [routing catalog](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MessageRoutingIntro.html).

## Combine or order

| Pattern | Retained state | Required decision |
|---------|----------------|-------------------|
| Aggregator | Related contributions and completion status | Correlation key, completion condition, combining algorithm |
| Resequencer | Buffered messages and next expected position | Sequence scope, gap timeout, duplicate policy |
| Scatter-Gather | Outstanding request and participant replies | Recipient selection, response deadline, result selection |
| Composed Message Processor | Split, route/process, then aggregate | Which original parts must be represented in the final result |

An Aggregator produces a combined result; a Resequencer releases individual messages in sequence. Neither can reconstruct a missing input. Scatter-Gather can use an explicit Recipient List or a Publish-Subscribe request channel. See [Aggregator](https://www.enterpriseintegrationpatterns.com/patterns/messaging/Aggregator.html), [Resequencer](https://www.enterpriseintegrationpatterns.com/patterns/messaging/Resequencer.html), and [Scatter-Gather](https://www.enterpriseintegrationpatterns.com/patterns/messaging/BroadcastAggregate.html).

## Example: line-level fulfillment

Conceptual flow; persistence and message transport are implementation choices.

```text
order --> Splitter --> route each line --> warehouse workers
                                              |
                                              v
order result <-- Aggregator <-- line outcomes (success or failure)
```

Suggested contract and recovery rules for this flow:

1. Group by `(orderId, fulfillmentAttempt)`; use `lineId` as the contribution key. Persist the expected set of line IDs before dispatch.
2. Give split outputs stable identities across redelivery. Two copies of one line must not count as two completed lines.
3. Record each unique outcome and evaluate completion atomically. Concurrent arrivals must not publish two final results.
4. Commit completed state and an outgoing result in one database transaction using an outbox; the result consumer still handles duplicates.
5. At the deadline, report missing lines explicitly. Persist a terminal state; route late replies to reconciliation instead of silently reopening the group.
6. Retain completed-group markers for the supported redelivery/replay horizon. Bound open groups and their total stored bytes.

Business success may require **all lines successful**, while aggregation completion may mean **all lines have an outcome**. Encode both rules.

## Coordinate multiple steps

| Approach | Where the next step is decided | Tradeoff |
|----------|--------------------------------|----------|
| Routing Slip | Itinerary carried with the message | Good for a known sequence; validate allowed destinations and preserve progress |
| Process Manager / orchestration | Coordinator using process state and replies | Explicit branching, timers, recovery; coordinator state and availability become dependencies |
| Choreography | Participants react to events | Independent reactions; end-to-end progress and failure ownership need deliberate design |

A [Routing Slip](https://www.enterpriseintegrationpatterns.com/patterns/messaging/RoutingTable.html) carries the route. A [Process Manager](https://www.enterpriseintegrationpatterns.com/patterns/messaging/ProcessManager.html) chooses subsequent work from intermediate results. Choreography is an architectural coordination style; neither style automatically supplies resilience or a distributed transaction.

For long-running business work, persist transitions and define retries, deadlines, compensation, and manual repair. Compensation is another business operation that can fail; it does not erase externally observed effects. See [sagas](distributed-systems.md#sagas-instead-of-distributed-transactions) and [transaction boundaries](transactions-and-isolation.md).

## Failure checks before release

| Inject | Verify |
|--------|--------|
| Duplicate item or reply | No double count or repeated business effect |
| Missing item | Bounded wait; explicit incomplete result or failure |
| Reply after deadline | Terminal state stays consistent; reconciliation policy applies |
| Restart during aggregation | Accepted contributions survive, or documented replay rebuilds them |
| Crash after committing a result | Result eventually publishes; duplicate publication is safe |
| Parallel arrivals / replayed group | One logical completion and stable result identity |
| Fan-out surge | Bounded concurrency, storage, and downstream load |

These are suggested acceptance checks, not guarantees supplied by a pattern name.

## References

- [Hohpe and Woolf — routing overview](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MessageRoutingIntro.html)
- [Hohpe and Woolf — Aggregator](https://www.enterpriseintegrationpatterns.com/patterns/messaging/Aggregator.html)
- [Hohpe and Woolf — Composed Message Processor](https://www.enterpriseintegrationpatterns.com/patterns/messaging/DistributionAggregate.html)
- [Hohpe and Woolf — Process Manager](https://www.enterpriseintegrationpatterns.com/patterns/messaging/ProcessManager.html)

# Messaging and events cheat sheet

> Baseline: AMQP-style queues and Kafka-style logs; delivery and ordering depend on producer/consumer settings. Reviewed: 2026-09-24.

Messaging moves **facts that already happened** (events) or **work to be done** (commands) between processes through a broker or bus. It is not an in-process Observer.

Related: [distributed-systems.md](distributed-systems.md), [resilience.md](resilience.md), [transactions-and-isolation.md](transactions-and-isolation.md), [design-patterns.md](design-patterns.md), [Enterprise Integration Patterns](enterprise-integration-patterns.md).

## Event vs command vs document

| Kind | Tense | Owner of meaning |
|------|-------|------------------|
| Event | Past: `OrderSubmitted` | The producer’s domain |
| Command | Imperative: `SubmitOrder` | The consumer is asked to do it |
| Document / record | Current state snapshot | Whoever owns that view |

Prefer events for integration when consumers should decide their own reaction. Prefer commands when there is one logical worker (a queue of jobs).

## Delivery guarantees

| Guarantee | Meaning |
|-----------|---------|
| At most once | May lose; the delivery mechanism does not redeliver |
| At least once | May duplicate; will retry |
| Effectively exactly once | At-least-once + idempotent handler (and sometimes broker transactions) |

Delivery guarantees depend on publisher confirms, persistence, acknowledgment/offset settings, and failures. Design for duplicates when using at-least-once delivery; a broker guarantee alone does not cover database or HTTP effects.

## Topology

```text
producer → exchange/topic → queue/partition → consumer
```

| Style | Shape |
|-------|--------|
| Queue (competing consumers) | Each message to one worker |
| Pub/sub | Each subscriber gets a copy |
| Partitioned log (Kafka) | Ordered per key; replay by offset |

Kafka-style logs keep history; queues consume and drop. Do not treat them as interchangeable.

## Producer rules

1. Name events in the past tense with a version (`OrderSubmitted.v1`).
2. Include a stable `eventId` and the aggregate id.
3. Publish after the source of truth commits — **outbox**, not dual write.
4. Keys: same aggregate → same partition if you need per-id order.

```json validate
{
  "eventId": "7f1d3a0e-2c4a-4b0e-9f1d-3a0e2c4a4b0e",
  "type": "OrderSubmitted",
  "version": 1,
  "occurredAt": "2026-09-24T19:01:02Z",
  "orderId": "4821"
}
```

## Consumer rules

1. Inbox table: insert `(consumer, eventId)` uniquely and apply database effects **in the same transaction**, then commit. Skip only events already committed for that logical consumer.
2. Acknowledge the message or commit its offset after the database commit. A crash between these steps causes redelivery; the inbox makes that safe.
3. External side effects need downstream idempotency or an outbox. A database rollback cannot undo an HTTP call.
4. Bound retries; poison messages go to a dead-letter queue with an alarm and a replay procedure. Keep deduplication records for the supported replay horizon.
5. Do not start a distributed transaction with the broker and the DB unless the product supports it and operations can run it.

## Ordering and time

- Independent partitions do not provide a global order; total ordering requires coordination and limits throughput.
- Per-key order requires stable partition routing and processing in partition order. Parallel handlers, retry queues, and partition-count changes can disrupt it.
- `occurredAt` is useful metadata, not a lock. See clocks in [distributed-systems.md](distributed-systems.md).

## When *not* to add a broker

- Two modules in one process — call a function.
- Need an immediate user-facing answer from the other system — HTTP with [resilience.md](resilience.md).
- The only consumer is the same app that produced the row and you have no integration story yet.

A broker is another production dependency: capacity, lag, ACLs, replay, poison pills.

## Spring / Java notes

- `spring-kafka` / JMS listeners should be stateless and short.
- Ack before DB commit risks lost work; DB commit before ack risks replay. Use the latter with atomic inbox processing and verify listener acknowledgment settings.
- Thread pool of the listener is a bulkhead. Do not share it with HTTP.

## Gotchas

- Event payload that is a full mutable snapshot with no version.
- “Exactly once” on a slide and an at-least-once queue in prod.
- Chatty events per field change flooding consumers.
- Consuming and calling HTTP to three systems inside one listener without timeouts.
- Using Kafka as a database nobody can query.

## References

- [RabbitMQ — reliability and acknowledgments](https://www.rabbitmq.com/docs/reliability)
- [RabbitMQ — consumer acknowledgments and publisher confirms](https://www.rabbitmq.com/docs/confirms)

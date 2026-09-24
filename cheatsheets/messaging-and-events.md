# Messaging and events cheat sheet

Messaging moves **facts that already happened** (events) or **work to be done** (commands) between processes through a broker or bus. It is not an in-process Observer.

Related: [distributed-systems.md](distributed-systems.md), [resilience.md](resilience.md), [transactions-and-isolation.md](transactions-and-isolation.md), [design-patterns.md](design-patterns.md).

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
| At most once | May lose; never double-apply |
| At least once | May duplicate; will retry |
| Effectively exactly once | At-least-once + idempotent handler (and sometimes broker transactions) |

Real brokers are at-least-once unless you opt into something narrower. Write handlers that survive a duplicate.

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

```json
{
  "eventId": "7f1d3a0e-2c4a-4b0e-9f1d-3a0e2c4a4b0e",
  "type": "OrderSubmitted",
  "version": 1,
  "occurredAt": "2026-09-24T19:01:02Z",
  "orderId": "4821"
}
```

## Consumer rules

1. Inbox table: insert `eventId` uniquely, then apply side effects, then commit.
2. Or make the side effect idempotent (`UPDATE … WHERE version =`).
3. Bound retries; poison messages go to a dead-letter queue with an alarm.
4. Do not start a distributed transaction with the broker and the DB unless you know the product supports it and operations can run it.

## Ordering and time

- Global order across partitions/queues is a fantasy.
- Per-key order is available on a partitioned log if one consumer owns the partition.
- `occurredAt` is useful metadata, not a lock. See clocks in [distributed-systems.md](distributed-systems.md).

## When *not* to add a broker

- Two modules in one process — call a function.
- Need an immediate user-facing answer from the other system — HTTP with [resilience.md](resilience.md).
- The only consumer is the same app that produced the row and you have no integration story yet.

A broker is another production dependency: capacity, lag, ACLs, replay, poison pills.

## Spring / Java notes

- `spring-kafka` / JMS listeners should be stateless and short.
- Ack after the DB commit of the inbox, or you will replay and must be idempotent anyway.
- Thread pool of the listener is a bulkhead. Do not share it with HTTP.

## Gotchas

- Event payload that is a full mutable snapshot with no version.
- “Exactly once” on a slide and an at-least-once queue in prod.
- Chatty events per field change flooding consumers.
- Consuming and calling HTTP to three systems inside one listener without timeouts.
- Using Kafka as a database nobody can query.

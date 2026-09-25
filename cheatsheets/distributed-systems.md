# Distributed systems cheat sheet

> Baseline: Failure and consistency models for services, databases, and brokers; product guarantees require configuration. Reviewed: 2026-09-24.

A system is distributed once **more than one process can fail or pause independently** and still has to look coherent to a client. The network is not a method call.

Related: [rest-apis.md](rest-apis.md), [devops.md](devops.md).

## First principles

1. Processes crash, pause (GC[^gc], VM[^vm] migration), and lie about time.
2. Networks drop, delay, duplicate, and reorder messages.
3. You can have a partition. During one, you choose availability vs consistency for each decision.
4. Timeouts are guesses. A timeout means *unknown*, not *failed*.
5. Retries without idempotency create extra orders.

## Consistency vocabulary

| Term | Meaning |
|------|---------|
| Linearizable | There appears to be a single real-time order of operations |
| Sequential consistency | Operations from each process appear in order, not necessarily real-time |
| Causal | Cause-before-effect is preserved |
| Eventual | If updates stop, replicas converge |
| Read-your-writes | A client sees its own writes |
| Sticky session / monotonic reads | Weaker session guarantees that still feel sane |

CAP[^cap] (informal): during a partition, a *register* cannot be both available and consistent. Most APIs[^api] pick per-operation: inventory decrement vs “show profile.”

PACELC[^pacelc]: even without a partition you still trade latency vs consistency.

## Failure handling

| Pattern | Use |
|---------|-----|
| Timeout + bounded retry | Bound every remote call; retry only transient failures of safe operations |
| Exponential backoff + jitter | Avoid synchronized retry storms |
| Idempotency key | POST that must not double-apply |
| Dedup store | At-least-once consumers |
| Outbox | Write the DB[^db] row and the “event to send” in one transaction |
| Inbox | Commit a unique consumer/event ID[^id] with database effects in one transaction, then acknowledge |
| Circuit breaker | Stop calling a sick dependency; fail fast |
| Bulkhead | Isolate thread/connection pools per dependency |
| Hedged request | Duplicate a slow call; cancel the loser — watch load |

Delivery guarantees depend on broker and client configuration. For at-least-once delivery, make handlers safe for duplicates. An inbox does not make external HTTP[^http] effects atomic; use downstream idempotency or an outbox.

## Coordination

| Tool | Provides | Cost |
|------|----------|------|
| Single leader (DB primary, Kafka partition leader) | Easy reads/writes on one truth | Failover, hotspot |
| Quorum (Raft, Paxos, ZK[^zk]/etcd) | Strong agreement | Latency, operational complexity |
| Gossip | Membership, weakly consistent state | Eventual, harder reasoning |
| 2PC | Atomic commit across resources | Fragile under partitions; often replaced by sagas |

Do not run your own Raft. Use the database or etcd/Consul/ZooKeeper you already operate.

## Sagas instead of distributed transactions

A saga is a sequence of local transactions with compensations.

```text
reserve inventory → charge card → ship
compensate: release inventory / refund
```

Compensations must themselves be idempotent. Sagas are not ACID[^acid] isolation across the whole flow. Users can observe in-between states; design the API for that.

## Time and identity

- `System.currentTimeMillis()` is not monotonic. Use `nanoTime` for intervals on one JVM[^jvm]; use Hybrid/TrueTime only if you have it.
- IDs: prefer ULIDs[^ulid] / UUIDv7 / DB sequences over “max+1.”
- Last-write-wins on wall clocks loses data. Version vectors or `If-Match` ETags are honest.

## Data placement

Example abbreviations: CQRS[^cqrs].

```text
single DB                 start here
primary + read replicas   scale reads; accept replica lag
shard by key              scale writes; lose cheap cross-shard joins
CQRS / separate read model  when write model cannot serve the query
```

Shard key is an architecture decision. Changing it is a migration project.

## Gotchas

- Shared-database “microservices” are a distributed system with extra failure modes and no independence.
- Chatty chat between services in one user request: latency multiplies, failure multiplies. Aggregate on the server.
- `try { call(); } catch { retry(); }` without a cap or idempotency.
- Assuming `read after write` on a replica is current.
- Two generals: you cannot have guaranteed exactly-once *and* guaranteed progress on an unreliable network. You pick a compromise and record it.

## References

- [RabbitMQ — reliability and acknowledgments](https://www.rabbitmq.com/docs/reliability)
- [Raft authors — consensus paper](https://raft.github.io/raft.pdf)

[^gc]: Garbage Collection (or Garbage Collector, depending on context).
[^vm]: Virtual Machine.
[^cap]: Consistency, Availability, and Partition tolerance — the distributed-systems tradeoff during a network partition.
[^api]: Application Programming Interface — the contract through which software components interact.
[^pacelc]: If a Partition occurs, choose Availability or Consistency; Else, choose Latency or Consistency — a distributed-systems tradeoff model.
[^db]: Database.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).
[^http]: Hypertext Transfer Protocol.
[^zk]: ZooKeeper — the coordination service abbreviated here.
[^acid]: Atomicity, Consistency, Isolation, and Durability — transaction properties.
[^jvm]: Java Virtual Machine.
[^ulid]: Universally Unique Lexicographically Sortable Identifier.
[^cqrs]: Command Query Responsibility Segregation.

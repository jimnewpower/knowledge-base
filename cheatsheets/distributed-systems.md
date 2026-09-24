# Distributed systems cheat sheet

A system is distributed once **more than one process can fail or pause independently** and still has to look coherent to a client. The network is not a method call.

Related: [rest-apis.md](rest-apis.md), [devops.md](devops.md).

## First principles

1. Processes crash, pause (GC, VM migration), and lie about time.
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

CAP (informal): during a partition, a *register* cannot be both available and consistent. Most APIs pick per-operation: inventory decrement vs “show profile.”

PACELC: even without a partition you still trade latency vs consistency.

## Failure handling

| Pattern | Use |
|---------|-----|
| Timeout + bounded retry | Every remote call |
| Exponential backoff + jitter | Avoid synchronized retry storms |
| Idempotency key | POST that must not double-apply |
| Dedup store | At-least-once consumers |
| Outbox | Write the DB row and the “event to send” in one transaction |
| Inbox | Receiver records event id before applying |
| Circuit breaker | Stop calling a sick dependency; fail fast |
| Bulkhead | Isolate thread/connection pools per dependency |
| Hedged request | Duplicate a slow call; cancel the loser — watch load |

At-least-once delivery is the default in real queues. Design handlers to be safe if the message arrives twice.

## Coordination

| Tool | Provides | Cost |
|------|----------|------|
| Single leader (DB primary, Kafka partition leader) | Easy reads/writes on one truth | Failover, hotspot |
| Quorum (Raft, Paxos, ZK/etcd) | Strong agreement | Latency, operational complexity |
| Gossip | Membership, weakly consistent state | Eventual, harder reasoning |
| 2PC | Atomic commit across resources | Fragile under partitions; often replaced by sagas |

Do not run your own Raft. Use the database or etcd/Consul/ZooKeeper you already operate.

## Sagas instead of distributed transactions

A saga is a sequence of local transactions with compensations.

```text
reserve inventory → charge card → ship
compensate: release inventory / refund
```

Compensations must themselves be idempotent. Sagas are not ACID isolation across the whole flow. Users can observe in-between states; design the API for that.

## Time and identity

- `System.currentTimeMillis()` is not monotonic. Use `nanoTime` for intervals on one JVM; use Hybrid/TrueTime only if you have it.
- IDs: prefer ULIDs / UUIDv7 / DB sequences over “max+1.”
- Last-write-wins on wall clocks loses data. Version vectors or `If-Match` ETags are honest.

## Data placement

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

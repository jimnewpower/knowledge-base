# Transactions and isolation cheat sheet

> Baseline: SQL[^sql]-standard isolation vocabulary; PostgreSQL examples and Spring Framework 6.2 proxy transactions. Reviewed: 2026-09-24.

A transaction is a **bounded unit of work** against a database: all of it becomes visible, or none of it does. Isolation is how much other transactions can interfere while it is open.

Related: [sql.md](sql.md), [resilience.md](resilience.md), [messaging-and-events.md](messaging-and-events.md).

## ACID[^acid], operationally

| Letter | Promise you actually get |
|--------|--------------------------|
| Atomicity | Commit or rollback together (on one database) |
| Consistency | Constraints you declared are kept (FK[^fk], unique, checks) |
| Isolation | Concurrent transactions do not surprise you *beyond the level you chose* |
| Durability | After commit, a crash does not lose the row (modulo disk/replication config) |

2PC can coordinate atomic commit across participating databases; it does not by itself provide every ACID guarantee. A local transaction plus an outbox often fits asynchronous integration, but does not make multiple databases atomically visible. See [distributed-systems.md](distributed-systems.md).

## Lifecycle

```text
BEGIN → reads/writes → COMMIT
                    → ROLLBACK
```

In Spring proxy mode, default `@Transactional` propagation joins an existing transaction or starts one. The owner commits on success; an escaping runtime exception or `Error` triggers rollback by default. Checked exceptions need configured rollback rules. An inner call can mark a shared transaction rollback-only even if an outer caller catches the exception.

```java
@Transactional
public void transfer(AccountId from, AccountId to, Money amount) { ... }
```

Keep transactions short. Do not hold a transaction open across HTTP[^http] calls to someone else.

## Isolation levels (SQL standard)

| Level | Dirty read | Non-repeatable | Phantom | Typical engine default |
|-------|------------|----------------|---------|------------------------|
| Read uncommitted | possible | possible | possible | almost never want |
| Read committed | no | possible | possible | **PostgreSQL, Oracle, SQL Server default-ish** |
| Repeatable read | no | no | possible (PG[^pg]: no, MVCC[^mvcc]) | MySQL InnoDB default |
| Serializable | no | no | no | safest, most retries |

Exact behavior is engine-specific. PostgreSQL `REPEATABLE READ` already prevents phantoms via snapshots. Oracle has no dirty read; its “read committed” is snapshot-per-statement.

## Anomalies

| Name | What you see |
|------|----------------|
| Dirty read | Read a value that later rolls back |
| Non-repeatable read | Same row, two values in one transaction |
| Phantom | A new row appears in a re-executed range query |
| Lost update | Two writers; the last commit silently overwrites the first |
| Write skew | Each transaction’s predicate was true at start; together they violate the invariant |

Lost update under read committed is the one that shows up in “edit the same order” UIs[^ui]. Fix with optimistic `version` columns or `SELECT … FOR UPDATE`.

## Pessimistic vs optimistic

```sql
SELECT * FROM orders WHERE id = '4821' FOR UPDATE;
```

Locks the row until commit. Serialize writers. Risk: lock wait, deadlock.

```sql
UPDATE orders SET status = 'OPEN', version = version + 1
WHERE id = '4821' AND version = 3;
```

Zero rows means the expected row/version was not found. Return a conflict or reread and re-evaluate the command; blindly retrying a stale user edit can overwrite another user's change. The UPDATE still takes database locks, but no lock is held during the user's editing interval.

Prefer optimistic at HTTP edges. Use `FOR UPDATE` inside a short transaction when the invariant is a scarce resource (inventory).

## Deadlocks

Two transactions grab locks in opposite order. The engine aborts one. If the use case is safe to replay, retry the **whole transaction** with bounded attempts and jitter, outside the failed transaction. Re-read state and re-evaluate invariants. Consistent lock order across use cases prevents many deadlocks.

## Connection pools

A transaction occupies a connection. Pool exhaustion + long transactions = the site hangs.

| Symptom | Likely cause |
|---------|--------------|
| Threads blocked on `getConnection` | Pool too small or transactions too long |
| `Lock wait timeout` | Someone held a row and went to lunch (or an HTTP call) |
| Idle-in-transaction | Autocommit off, forgotten commit |

Close sessions. In Spring, do not inject `EntityManager` into a long-lived worker and leave a transaction open.

## Outbox (one DB[^db], reliable event)

```text
BEGIN
  update orders
  insert into outbox(event_id, payload)
COMMIT
-- separate publisher reads outbox and emits to the broker
```

The event is committed with the row. Dual-write to DB and Kafka in one request is how events vanish.

## Gotchas

- In proxy mode, private methods and self-calls receive no new transaction advice; they may still run inside an existing caller transaction. See [spring-boot.md](spring-boot.md) for method visibility.
- Read-only queries still start transactions in some setups; mark `@Transactional(readOnly = true)` when it is true.
- Autocommit plus a multi-statement use case is not atomic.
- Serializable transactions can abort on serialization conflicts. Define bounded whole-transaction retries or a deliberate conflict response.

## References

- [PostgreSQL 16 — transaction isolation and retries](https://www.postgresql.org/docs/16/transaction-iso.html)
- [Spring Framework 6.2 — declarative transactions](https://docs.spring.io/spring-framework/reference/6.2/data-access/transaction/declarative/annotations.html)

[^sql]: Structured Query Language.
[^acid]: Atomicity, Consistency, Isolation, and Durability — transaction properties.
[^fk]: Foreign Key.
[^http]: Hypertext Transfer Protocol.
[^pg]: PostgreSQL — the database abbreviated here.
[^mvcc]: Multi-Version Concurrency Control.
[^ui]: User Interface.
[^db]: Database.

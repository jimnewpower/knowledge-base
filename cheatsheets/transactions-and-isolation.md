# Transactions and isolation cheat sheet

A transaction is a **bounded unit of work** against a database: all of it becomes visible, or none of it does. Isolation is how much other transactions can interfere while it is open.

Related: [sql.md](sql.md), [resilience.md](resilience.md), [messaging-and-events.md](messaging-and-events.md).

## ACID, operationally

| Letter | Promise you actually get |
|--------|--------------------------|
| Atomicity | Commit or rollback together (on one database) |
| Consistency | Constraints you declared are kept (FK, unique, checks) |
| Isolation | Concurrent transactions do not surprise you *beyond the level you chose* |
| Durability | After commit, a crash does not lose the row (modulo disk/replication config) |

Distributed ACID across two databases is 2PC. Prefer a local transaction plus an outbox. See [distributed-systems.md](distributed-systems.md).

## Lifecycle

```text
BEGIN → reads/writes → COMMIT
                    → ROLLBACK
```

In Spring: `@Transactional` starts on the way in and commits on success, rolls back on a runtime exception (by default). Checked exceptions do not roll back unless configured.

```java
@Transactional
public void transfer(AccountId from, AccountId to, Money amount) { ... }
```

Keep transactions short. Do not hold a transaction open across HTTP calls to someone else.

## Isolation levels (SQL standard)

| Level | Dirty read | Non-repeatable | Phantom | Typical engine default |
|-------|------------|----------------|---------|------------------------|
| Read uncommitted | possible | possible | possible | almost never want |
| Read committed | no | possible | possible | **PostgreSQL, Oracle, SQL Server default-ish** |
| Repeatable read | no | no | possible (PG: no, MVCC) | MySQL InnoDB default |
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

Lost update under read committed is the one that shows up in “edit the same order” UIs. Fix with optimistic `version` columns or `SELECT … FOR UPDATE`.

## Pessimistic vs optimistic

```sql
SELECT * FROM orders WHERE id = '4821' FOR UPDATE;
```

Locks the row until commit. Serialize writers. Risk: lock wait, deadlock.

```sql
UPDATE orders SET status = 'OPEN', version = version + 1
WHERE id = '4821' AND version = 3;
```

Zero rows = conflict. Retry or return `409`. No long-held locks.

Prefer optimistic at HTTP edges. Use `FOR UPDATE` inside a short transaction when the invariant is a scarce resource (inventory).

## Deadlocks

Two transactions grab locks in opposite order. The engine aborts one. Treat deadlock as a retryable error with jitter. Consistent lock order across use cases prevents most of them.

## Connection pools

A transaction occupies a connection. Pool exhaustion + long transactions = the site hangs.

| Symptom | Likely cause |
|---------|--------------|
| Threads blocked on `getConnection` | Pool too small or transactions too long |
| `Lock wait timeout` | Someone held a row and went to lunch (or an HTTP call) |
| Idle-in-transaction | Autocommit off, forgotten commit |

Close sessions. In Spring, do not inject `EntityManager` into a long-lived worker and leave a transaction open.

## Outbox (one DB, reliable event)

```text
BEGIN
  update orders
  insert into outbox(event_id, payload)
COMMIT
-- separate publisher reads outbox and emits to the broker
```

The event is committed with the row. Dual-write to DB and Kafka in one request is how events vanish.

## Gotchas

- `@Transactional` on a private method or self-call: no proxy, no transaction.
- Read-only queries still start transactions in some setups; mark `@Transactional(readOnly = true)` when it is true.
- Autocommit plus a multi-statement use case is not atomic.
- Isolation `SERIALIZABLE` without a retry loop is an incident report.

# Database migrations and backfills cheat sheet

> Baseline: relational migration workflow; SQL[^sql] examples target PostgreSQL 16 and require the stated existing schema. SQLite upgrades have a separate sheet. Reviewed: 2026-09-24.

A migration changes both **stored data and the contract used by running binaries**. Design the coexistence period and recovery path before changing production tables.

Related: [SQL](sql.md), [transactions](transactions-and-isolation.md), [SQLite](sqlite.md), [DevOps](devops.md), [batch processing](batch-processing.md).

## Separate three operations

| Operation | Purpose | Typical concern |
|-----------|---------|-----------------|
| Schema expansion | Add a compatible representation | DDL[^ddl] lock duration, defaults, old clients |
| Data backfill | Populate historical rows | Concurrent writes, restartability, load |
| Schema contraction | Remove the obsolete representation | Old binaries, jobs, reports, and rollback needs |

Keep applied migration files immutable in shared environments. Add a corrective migration rather than rewriting history. A tool's migration history is evidence of execution, not proof of business correctness. See [evolutionary database design](https://martinfowler.com/articles/evodb.html).

## Example: replace a representation safely

Suppose a populated `customer(id, email)` table needs a separately maintained `normalized_email` value. The normalization policy must be agreed with the domain; lowercasing every address is not assumed here.

```sql
ALTER TABLE customer ADD COLUMN normalized_email text;
```

Suggested deployment sequence:

1. Add the nullable column without changing readers.
2. Deploy writers that maintain both representations atomically. Account for old instances, imports, and administrative writers; use a compatible trigger or a controlled write pause if needed.
3. Backfill bounded primary-key ranges. Recompute from current source data under suitable locking/version checks so an old batch cannot overwrite a newer value.
4. Reconcile the expected transformation against stored results; investigate mismatches and missing rows.
5. Switch readers, retain synchronized writes through the rollback window, then remove old readers/writers.
6. Drop obsolete columns only in a later release after confirming all consumers have moved.

## Checkpoint the work

```text
begin transaction
  load checkpoint and bounded key range
  apply transformation with concurrency protection
  persist checkpoint for the processed range
commit
```

This is a transactional sketch, not executable SQL. If effects and checkpoint cannot commit together, make replay safe through idempotency or a durable work ledger. Record mapping version and input scope. A high-water ID[^id] alone does not capture later updates or inserts below that watermark; retain change capture/synchronized writes and reconcile separately.

Throttle using observed lock waits, replica lag, log volume, and application latency. Measure rows examined, changed, rejected, and remaining. A fast benchmark on an empty database is not a rollout plan.

## PostgreSQL operations to distinguish

| Operation | Behavior to plan for |
|-----------|----------------------|
| `ALTER TABLE` | Many forms require a strong table lock; even quick metadata work can wait behind an old transaction |
| `CHECK ... NOT VALID` | Skips initial verification of old rows; still checks new/updated rows |
| `VALIDATE CONSTRAINT` | Verifies existing rows later with a different locking profile |
| `CREATE INDEX CONCURRENTLY` | Avoids blocking ordinary writes, but takes additional work and can leave an invalid index after failure |

Example after the column exists, executed as its own migration outside a transaction block:

```sql
CREATE INDEX CONCURRENTLY idx_customer_normalized_email
    ON customer (normalized_email);
```

Configure the migration tool for this nontransactional operation. Check index validity after failure before retrying; an existing name does not prove a usable index. Sources: [ALTER TABLE](https://www.postgresql.org/docs/16/sql-altertable.html), [CREATE INDEX](https://www.postgresql.org/docs/16/sql-createindex.html).

## Recovery and release checks

- Rehearse on representative size and data distributions, including long-lived transactions.
- Test old and new binaries against the expanded schema.
- Stop/restart the backfill and verify the final data, not just row counts.
- Verify backup restoration separately from migration rollback. Reversing DDL cannot reconstruct discarded information.
- Name the point after which binary rollback requires data repair or a forward fix.

## References

- [Fowler and Sadalage — evolutionary database design](https://martinfowler.com/articles/evodb.html)
- [PostgreSQL 16 — ALTER TABLE](https://www.postgresql.org/docs/16/sql-altertable.html)
- [PostgreSQL 16 — CREATE INDEX](https://www.postgresql.org/docs/16/sql-createindex.html)

[^sql]: Structured Query Language.
[^ddl]: Data Definition Language — statements that change database structures.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).

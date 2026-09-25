# SQL[^sql] query tuning and PostgreSQL diagnostics cheat sheet

> Baseline: PostgreSQL 16 SQL and diagnostics. Recheck plans on the actual database version, statistics, and workload. Reviewed: 2026-09-24.

Tune a measured query with representative parameters and data. A plan that looks elegant is useful only if it reduces the workload's cost without changing results.

Related: [SQL](sql.md), [JDBC and HikariCP](jdbc-hikaricp.md)[^jdbc][^hikaricp], [transactions](transactions-and-isolation.md), [database migrations](database-migrations.md).

## Read the plan

Assumes `orders(id, customer_id, created_at)` and representative customer ID[^id] 42. `EXPLAIN ANALYZE` executes the statement; use an appropriate environment and time budget. Running writes inside a rollback is not a guarantee against all side effects.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, created_at
FROM orders
WHERE customer_id = 42
ORDER BY created_at DESC, id DESC
LIMIT 50;
```

| Signal | Investigate |
|--------|-------------|
| Estimated rows differ greatly from actual | Stale statistics, skew, correlated columns, parameter-specific plans |
| Many rows removed by filter | Access path retrieves much more than the query needs |
| Expensive node repeated many times | Nested-loop inner work; consider actual rows and loops together |
| Sort spills or temporary reads/writes | Result width, ordering/index options, concurrency-safe memory budget |
| Many buffer reads | Working-set size, selectivity, cache state and storage |
| Fast query but slow request | Pool waits, result transfer, application processing, extra queries |

Plan costs are estimates, not milliseconds. Node timing includes child work; do not sum the tree. Repeated-node actual values are per-loop averages. A sequential scan can be correct for a small table or a large fraction of its rows. See [EXPLAIN](https://www.postgresql.org/docs/16/using-explain.html).

## Index for a demonstrated access pattern

A candidate for that query is `(customer_id, created_at DESC, id DESC)`. Compare plans and timings before retaining it; each index consumes storage and adds write/maintenance work. `INCLUDE` can cover projected columns, but an index-only scan still depends on visibility information. Column order, expression matching, collation, and partial-index predicates affect usability.

For deep pagination, seek after the last `(created_at, id)` pair instead of repeatedly discarding a large `OFFSET`. Require non-null ordering keys and a unique tie-breaker. Concurrent inserts/updates can still change pages; define snapshot or cursor semantics for the API[^api].

## Find blocked work

Read-only diagnostic query; visibility of other sessions depends on privileges. Query text can contain sensitive values.

```sql
SELECT pid, application_name, state,
       clock_timestamp() - xact_start AS transaction_age,
       wait_event_type, wait_event,
       pg_blocking_pids(pid) AS blocking_pids
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0
ORDER BY xact_start;
```

Inspect the blocker and transaction owner before canceling work. Idle-in-transaction sessions may retain locks and old snapshots. `pg_stat_statements`, when installed/configured, helps rank aggregate workload cost; high total time and high per-call latency answer different questions.

## Verify the change

Check result equivalence, common and skewed parameters, warm/cold behavior, concurrent writers, and p95 latency. Use `ANALYZE` after substantial data changes when appropriate; consider extended statistics for correlated predicates. Save the before/after plan with row counts and environment details.

## References

- [Multicolumn indexes](https://www.postgresql.org/docs/16/indexes-multicolumn.html)
- [Statistics and activity views](https://www.postgresql.org/docs/16/monitoring-stats.html)
- [Statistics used by the planner](https://www.postgresql.org/docs/16/planner-stats.html)
- [pg_stat_statements](https://www.postgresql.org/docs/16/pgstatstatements.html)

[^sql]: Structured Query Language.
[^jdbc]: Java Database Connectivity.
[^hikaricp]: Hikari Connection Pool — a Java database connection pool.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).
[^api]: Application Programming Interface — the contract through which software components interact.

# SQLite in desktop applications cheat sheet

> Baseline: SQLite 3.x on a local filesystem; production WAL[^wal] deployments must include the WAL-reset fix (3.51.3+, or a documented fixed backport). JDBC[^jdbc] settings depend on the driver. Reviewed: 2026-09-24.

SQLite is an embedded database engine, not a miniature database server. Treat **connection policy, write serialization, and the database file lifecycle** as application responsibilities.

Related: [SQL](sql.md)[^sql], [transactions](transactions-and-isolation.md), [database migrations](database-migrations.md), [JavaFX](javafx.md).

## Startup and connection settings

Run outside an active transaction against a writable local database. Establish journal mode during controlled initialization; configure and verify connection-scoped settings on every new physical connection.

```sql
SELECT sqlite_version();
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;
PRAGMA synchronous = FULL;
PRAGMA foreign_keys;
```

| Setting | Meaning |
|---------|---------|
| `journal_mode=WAL` | Persistent database mode; verify the returned mode is `wal` |
| `foreign_keys=ON` | Enable foreign-key enforcement per connection; changing it inside a transaction has no effect |
| `busy_timeout=5000` | Wait policy in milliseconds for certain lock conflicts; not a query deadline or guarantee of success |
| `synchronous=FULL` | Stronger commit durability policy; depends on the storage honoring synchronization |

HikariCP[^hikaricp] pools physical connections; pool size does not create additional SQLite writers. Set initialization through the JDBC driver/pool and check actual connections, rather than assuming one startup SQL call covers the pool. Sources: [PRAGMAs](https://www.sqlite.org/pragma.html), [foreign keys](https://www.sqlite.org/foreignkeys.html).

## WAL and concurrency

- WAL allows readers and a writer to overlap, but only one writer can hold the write transaction at a time.
- Keep transactions short. Long-lived reads can prevent checkpoint progress and grow the WAL.
- Standard WAL requires same-host shared-memory coordination; do not place a live WAL database on a network share.
- WAL with `synchronous=NORMAL` can lose recent commits after power loss; choose that tradeoff explicitly.
- Check the engine bundled by the JDBC driver using `sqlite_version()`. SQLite documents a rare concurrent WAL-reset corruption bug fixed in 3.51.3 and backported to 3.44.6 / 3.50.7.

See [SQLite WAL documentation](https://www.sqlite.org/wal.html). Application version numbers alone do not establish the embedded engine's patch level.

## Transactions and contention

| Choice / result | Interpretation |
|-----------------|----------------|
| `BEGIN` / deferred transaction | Write lock acquisition can be delayed until a write is attempted |
| `BEGIN IMMEDIATE` | Attempt to reserve the write transaction at the start; can fail busy |
| Busy on read-to-write upgrade | The transaction may need to roll back and restart from fresh reads |
| Busy timeout expires | Surface/retry under a bounded operation policy; never spin indefinitely |

`BEGIN IMMEDIATE` is useful when writing is certain; reserving the writer during user interaction wastes concurrency. Do not issue manual `BEGIN` inside a framework-managed transaction. On failure, inspect the error and transaction state; retrying an isolated statement is not always safe. See [transaction behavior](https://www.sqlite.org/lang_transaction.html).

## Backups and schema upgrades

Use SQLite's online backup API[^api] or another documented consistent snapshot method. Copying only the main file while WAL is active can omit committed data. Do not manually delete the `-wal` or `-shm` files of an open database. Verify restoration by opening the backup and checking schema and representative records. See the [backup API](https://www.sqlite.org/backup.html).

Suggested desktop upgrade sequence: acquire exclusive application-level migration ownership, take a consistent backup, apply a tested migration, validate it, then open normal UI[^ui] access. Record schema version and reject unsupported newer schemas. A database migration may prevent reopening the file with an older application.

## Diagnostics and tests

These inspect the opened database; integrity checks can be expensive on large files.

```sql
PRAGMA integrity_check;
PRAGMA foreign_key_check;
PRAGMA wal_checkpoint(PASSIVE);
```

Inspect returned rows: integrity and foreign-key checks are separate; a passive checkpoint may leave pages pending. Test two-connection contention, interrupted transactions, foreign-key rejection, backup restoration, and migration from real older files. Run database work off the JavaFX application thread.

## References

- [SQLite — WAL and the WAL-reset fix](https://www.sqlite.org/wal.html)
- [SQLite — PRAGMAs](https://www.sqlite.org/pragma.html)
- [SQLite — foreign keys](https://www.sqlite.org/foreignkeys.html)
- [SQLite — transactions](https://www.sqlite.org/lang_transaction.html)
- [SQLite — backup API](https://www.sqlite.org/backup.html)

[^wal]: Write-Ahead Logging.
[^jdbc]: Java Database Connectivity.
[^sql]: Structured Query Language.
[^hikaricp]: Hikari Connection Pool — a Java database connection pool.
[^api]: Application Programming Interface — the contract through which software components interact.
[^ui]: User Interface.

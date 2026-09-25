# Oracle Database cheat sheet

> Baseline: Oracle Database 19c SQL[^sql]/JDBC[^jdbc] behavior; DBA[^dba] privileges and licensed diagnostics vary by installation. Reviewed: 2026-09-25.

Check Oracle behavior directly when porting SQL or testing a Java persistence layer. Compatibility modes in another database do not reproduce transaction, optimizer, or type semantics.

Related: [SQL](sql.md), [MyBatis](mybatis.md), [transactions](transactions-and-isolation.md), [H2](h2.md).

## Dialect and type reminders

| Feature | Practical consequence |
|---------|-----------------------|
| Empty character string | Currently treated as null; model empty-versus-missing deliberately |
| `DATE` | Includes time to seconds; no time zone |
| `TIMESTAMP` variants | Fractional seconds; zone behavior depends on exact type |
| `NUMBER(p,s)` | Match precision/scale to domain; use Java `BigDecimal` for exact decimal values |
| Unquoted identifier | Folded to uppercase; quoted mixed-case names require matching quotes |
| Sequence / identity | Generates identifiers; gaps are normal and values are not commit order |
| `FETCH FIRST ... ROWS ONLY` | Bounded result; use deterministic `ORDER BY` |

Avoid implicit string-to-date conversion driven by session NLS[^nls] settings. Bind JDBC values with intended types or use explicit SQL literals for fixed examples.

## Useful SQL

Run as the application/schema account in a SQL client. The final query assumes an `observation(id, observed_at)` table and returns the latest 20 rows with a deterministic tie-breaker.

```sql
SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AS current_schema
FROM dual;

SELECT table_name FROM user_tables ORDER BY table_name;

SELECT id, observed_at
FROM observation
WHERE observed_at >= TIMESTAMP '2026-01-01 00:00:00'
ORDER BY observed_at DESC, id DESC
FETCH FIRST 20 ROWS ONLY;
```

## Transactions and migration

Oracle's default isolation is read committed with statement-level read consistency. Read-modify-write rules still need constraints, conditional updates, or deliberate locks. Keep user think time outside transactions.

DDL[^ddl] can commit pending work: Oracle commits before syntactically valid DDL, even if execution fails, and after successful DDL. Do not mix schema changes with application DML[^dml] expecting a rollback to undo everything. For migrations, test the failure point and recovery procedure on the actual engine.

## Tuning and operations

Start with SQL text, bind values/types, row counts, waits, and the executed cursor's plan. An `EXPLAIN PLAN` is an estimate and may differ from the actual executed plan. Ask the DBA which dynamic views and diagnostic features are available and approved; some performance tooling has separate licensing requirements.

Index for the measured access pattern, preserve sargable predicates, and investigate implicit conversions. Treat driver/pool upgrades as behavioral changes: test LOB[^lob] streaming, timestamps, fetch sizes, batch failures, and connection recovery.

## References

- [Oracle COMMIT and implicit DDL commits](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/COMMIT.html)
- [Oracle data types](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Data-Types.html)
- [Oracle SELECT](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/SELECT.html)

[^sql]: Structured Query Language.
[^jdbc]: Java Database Connectivity.
[^dba]: Database Administrator.
[^nls]: National Language Support — Oracle's locale-related settings and behavior.
[^ddl]: Data Definition Language — statements that change database structures.
[^dml]: Data Manipulation Language — statements that read or change table data.
[^lob]: Large Object — database storage for large character or binary values.

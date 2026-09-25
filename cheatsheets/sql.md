# SQL[^sql] and relational modeling cheat sheet

> Baseline: PostgreSQL 16-compatible examples; PostgreSQL 18 skip scans and Oracle differences are labelled. Reviewed: 2026-09-24.

SQL is the language of the system of record for most applications in this collection. Model data first; tune queries second.

Related: [transactions-and-isolation.md](transactions-and-isolation.md), [data-structures.md](data-structures.md), [database migrations](database-migrations.md), [SQLite](sqlite.md), [JPA and Hibernate](jpa-and-hibernate.md)[^jpa].

## Relational basics

| Idea | Meaning |
|------|---------|
| Relation / table | Set of rows with named columns |
| Primary key | Stable identifier for a row |
| Foreign key | Reference to another table’s key |
| Candidate key | Any column set that could be the PK[^pk] |
| NULL | Unknown / missing — not a value. `NULL = NULL` is unknown |
| Index | Extra structure that speeds lookup and can enforce uniqueness |

Normalize until update anomalies go away; denormalize only with a measured read path and an owner for the copy.

## DDL[^ddl] worth knowing

PostgreSQL example; assumes `customers(id)` already exists with a compatible key. Later query fragments also assume `customers.name` and `line_items.order_id`:

```sql
CREATE TABLE orders (
  id           VARCHAR(32) PRIMARY KEY,
  customer_id  VARCHAR(32) NOT NULL REFERENCES customers(id),
  status       VARCHAR(16) NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL,
  version      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX orders_customer_idx ON orders (customer_id, created_at DESC);

ALTER TABLE orders ADD COLUMN notes TEXT;
```

Types to prefer: `VARCHAR`/`TEXT` for strings, `NUMERIC`/`DECIMAL` for money, `TIMESTAMPTZ` for instants. Avoid `FLOAT` for money. Oracle: `NUMBER`, `VARCHAR2`, `TIMESTAMP WITH TIME ZONE`.

## Query shapes

```sql
SELECT o.id, o.status, c.name
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'OPEN'
ORDER BY o.created_at DESC
FETCH FIRST 50 ROWS ONLY;

SELECT customer_id, COUNT(*) AS n
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 10;
```

| Join | Keeps |
|------|--------|
| `INNER JOIN` | Rows with a match on both sides |
| `LEFT JOIN` | All left rows; right side nullable |
| `RIGHT JOIN` | Rare; rewrite as left |
| `FULL JOIN` | Both sides, unmatched padded |

Filter on `WHERE` before grouping; filter groups with `HAVING`.

## Predicates and NULL

```sql
WHERE notes IS NULL
WHERE notes IS NOT NULL
WHERE status IN ('OPEN', 'SUBMITTED')
WHERE created_at >= TIMESTAMP WITH TIME ZONE '2026-01-01 00:00:00+00'
WHERE name LIKE 'Newp%'          -- prefix can use an index
WHERE name LIKE '%power'         -- leading wildcard usually cannot
```

`NOT IN (SELECT …)` with NULLs in the subquery is a classic empty-result bug. Prefer `NOT EXISTS`.

These are independent predicate fragments. In PostgreSQL, plain `TIMESTAMP` means without time zone and ignores an offset in its literal. `TIMESTAMPTZ` represents an instant; it does not preserve the original named timezone.

## Subqueries and CTEs[^cte]

```sql
WITH open_orders AS (
  SELECT * FROM orders WHERE status = 'OPEN'
)
SELECT customer_id, COUNT(*) FROM open_orders GROUP BY customer_id;

SELECT *
FROM orders o
WHERE EXISTS (
  SELECT 1 FROM line_items li WHERE li.order_id = o.id
);
```

`EXISTS` asks whether any row matches; do not rely on evaluating every subquery row. A positive `IN` predicate can be appropriate even with NULLs: a match yields true, while no match plus a NULL yields unknown. Negating that unknown is the common `NOT IN` trap.

## Indexes

| Index | Use |
|-------|-----|
| B-tree (default) | Equality, range, `ORDER BY` that matches |
| Unique | Constraint + lookup |
| Composite `(a, b)` | Usually most efficient with leading-column predicates; `b` alone may still use the index |
| Covering / include | Index-only scan when the engine supports it |

An index is a write cost. Add it for a query you can show in `EXPLAIN`.

PostgreSQL 18 can use B-tree skip scans for some predicates that omit leading columns, especially when those columns have few distinct values. Check the plan for the deployed engine/version.

```sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 'C1';
```

Oracle: `EXPLAIN PLAN FOR …` then `DBMS_XPLAN.DISPLAY`. Look for full table scans on large tables that should be seeks.

## Mutations

```sql
INSERT INTO orders (id, customer_id, status, created_at)
VALUES ('4821', 'C1', 'DRAFT', CURRENT_TIMESTAMP);

UPDATE orders SET status = 'OPEN', version = version + 1
WHERE id = '4821' AND version = 3;

DELETE FROM orders WHERE id = '4821';
```

The `version` predicate is optimistic concurrency. Zero rows updated means a conflict, not success.

## Migrations

- Forward-only scripts, versioned (`V0014__orders_notes.sql`).
- Expand/contract for replacing a column: add the new column → deploy compatible synchronized writes → backfill in bounded batches → reconcile and validate → switch reads → retire old readers/writers → drop the old column in a later release.
- Keep old and new representations synchronized while backfilling (application writes, a trigger, or a controlled write pause). Ensure old application instances cannot bypass synchronization, and prevent backfill from overwriting newer values. A backfill followed by an unsynchronized write switch can lose concurrent changes.
- Never edit a migration that already ran in a shared environment.

## Gotchas

- `SELECT *` in application code couples you to every future column.
- `DISTINCT` is not a join-fixer; it hides a bad join.
- Pagination with `OFFSET 100000` gets slower as you go. Consider keyset `WHERE (created_at, id) < (?, ?)` with matching `ORDER BY created_at DESC, id DESC`, a unique tie-breaker, and an index supporting that order.
- Connection pools plus forgotten transactions lock rows. See [transactions-and-isolation.md](transactions-and-isolation.md).

## References

- [PostgreSQL 16 — date/time literals](https://www.postgresql.org/docs/16/datatype-datetime.html)
- [PostgreSQL 18 — multicolumn indexes and skip scans](https://www.postgresql.org/docs/18/indexes-multicolumn.html)
- [PostgreSQL 16 — subquery and NULL semantics](https://www.postgresql.org/docs/16/functions-subquery.html)

[^sql]: Structured Query Language.
[^jpa]: Java Persistence API (Application Programming Interface), now standardized as Jakarta Persistence.
[^pk]: Primary Key.
[^ddl]: Data Definition Language — statements that change database structures.
[^cte]: Common Table Expression.

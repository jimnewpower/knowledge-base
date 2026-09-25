# MyBatis cheat sheet

> Baseline: MyBatis 3; MyBatis-Spring integration must match the deployed Spring/Java versions. Reviewed: 2026-09-25.

MyBatis maps SQL results and parameters. You still own query design, transaction boundaries, schema changes, and database-specific behavior.

Related: [SQL](sql.md), [JDBC and HikariCP](jdbc-hikaricp.md), [transactions](transactions-and-isolation.md), [Oracle](oracle.md).

## Parameters and result mapping

| Mechanism | Meaning | Rule |
|-----------|---------|------|
| `#{value}` | Bound prepared-statement value | Default for external values |
| `${identifier}` | Literal SQL text substitution | Never feed arbitrary input; select identifiers from a code-owned allow-list |
| `resultType` | Straightforward row mapping | Confirm aliases, nullability, and Java types |
| `resultMap` | Explicit column, constructor, and relationship mapping | Use for joins or nontrivial models |
| `@Param` | Stable name for a mapper argument | Use when SQL refers to multiple named parameters |
| `<where>`, `<set>`, `<foreach>` | Dynamic SQL assembly | Test empty collections, optional filters, and tenant predicates |

XML mapper fragment. It assumes mapper namespace `example.SampleMapper`, a `countByProject` method with `@Param("projectId") long projectId`, and a `sample` table.

```xml
<mapper namespace="example.SampleMapper">
  <select id="countByProject" resultType="long">
    SELECT COUNT(*)
    FROM sample
    WHERE project_id = #{projectId}
  </select>
</mapper>
```

Use MyBatis's standard mapper DTD/header when installing this fragment as a full mapper file. Binding a value cannot bind a table name or sort direction. For dynamic ordering, map an application enum to fixed SQL alternatives.

## Transactions and sessions

With MyBatis-Spring, inject mapper proxies and use service-layer Spring transactions. The transaction manager and `SqlSessionFactory` must use the same datasource. Do not call `commit`, `rollback`, or `close` on a Spring-managed session. Operations outside a Spring transaction can commit independently; several mapper calls do not automatically form one unit of work.

Without Spring, a caller owns its `SqlSession`: scope it to a unit of work, explicitly commit writes, and close it on every path. Do not share a raw session across threads.

## Performance and correctness

- Inspect SQL and plans on the target engine; an H2 test cannot establish Oracle behavior.
- Nested selects can cause N+1 queries. Prefer a deliberate join or bulk query when reading a collection.
- Fetch size is a driver hint, not an application memory limit. Close cursors while their session is still valid.
- For optimistic updates, include the expected version in the `WHERE` clause and check affected-row count.
- Batch execution delays some failures until flush/commit. Test rollback and generated-key behavior with the actual driver.
- Understand local and optional second-level cache invalidation before mixing mapper reads with writes through other paths.

## References

- [MyBatis mapper XML](https://mybatis.org/mybatis-3/sqlmap-xml.html)
- [MyBatis dynamic SQL](https://mybatis.org/mybatis-3/dynamic-sql.html)
- [MyBatis-Spring transaction ownership](https://mybatis.org/spring/transactions.html)

# JDBC[^jdbc] and HikariCP[^hikaricp] cheat sheet

> Baseline: Java 21 JDBC and HikariCP 6.x; driver behavior and database limits remain deployment-specific. Reviewed: 2026-09-24.

A connection pool limits concurrent database work. Treat acquisition delay, SQL[^sql] execution time, and transaction duration as separate measurements.

Related: [transactions](transactions-and-isolation.md), [JPA and Hibernate](jpa-and-hibernate.md)[^jpa], [SQL tuning](sql-query-tuning.md), [SQLite](sqlite.md).

## Timeouts and capacity

| Setting | Controls | Does not establish |
|---------|----------|--------------------|
| Hikari `connectionTimeout` (ms) | Waiting to acquire a pooled connection | SQL execution deadline |
| JDBC `setQueryTimeout` (seconds) | Driver-supported statement timeout | Universal end-to-end cancellation |
| JDBC `setNetworkTimeout` (ms) | Driver network-response limit | Business transaction deadline |
| Hikari `maxLifetime` (ms) | Retirement age; borrowed connections retire after return | Interruption of an active query |
| Hikari `keepaliveTime` (ms) | Periodic checks on idle connections | Keeping an active transaction alive |
| Hikari `leakDetectionThreshold` (ms) | Diagnostic report for long checkouts | Automatic reclamation of leaked connections |

Budget connections across every replica, worker, migration job, and administrative client. Start with measured database concurrency, then load-test; a larger pool can worsen lock contention and tail latency. Virtual threads do not increase database capacity. See [Hikari configuration](https://github.com/brettwooldridge/HikariCP).

## Own resources explicitly

Method fragment; imports `java.sql.SQLException`, `java.util.Optional`, and `javax.sql.DataSource`. Assumes `customer(id, name)` with a unique, non-null ID[^id] and non-null name. The caller owns the data source; this method owns its checkout.

```java
static Optional<String> findName(DataSource source, long id) throws SQLException {
    try (var connection = source.getConnection();
         var statement = connection.prepareStatement(
             "SELECT name FROM customer WHERE id = ?")) {
        statement.setLong(1, id);
        statement.setQueryTimeout(5);
        try (var rows = statement.executeQuery()) {
            return rows.next() ? Optional.of(rows.getString(1)) : Optional.empty();
        }
    }
}
```

Closing a pooled connection returns the checkout; closing the application-owned pool shuts it down. Bind values with parameters. Table names and sort directions need a controlled mapping, not value placeholders or raw user input.

## Transaction discipline

For manual JDBC transactions: acquire, disable auto-commit, execute, commit; on failure, roll back and preserve the original exception if rollback also fails. Close in every path. Do not hold a checkout while waiting for an HTTP[^http] call, user interaction, or lengthy computation.

Inside a Spring-managed transaction, obtain connections through the framework's transaction-aware facilities, such as `JdbcTemplate`. Do not manually commit, change auto-commit, or independently acquire another connection and assume it joins the transaction. Use JDBC setters for connection state; arbitrary session SQL can leave state the pool cannot reliably track.

## Diagnose saturation

1. Compare active, idle, pending, acquisition latency, and timeout counts.
2. Correlate long checkouts with slow statements, locks, and transaction age.
3. Find work holding a connection while doing something else.
4. Check database CPU[^cpu], I/O[^i-o], and connection budget before increasing pool size.
5. Test outage recovery and driver cancellation; a timeout exception does not by itself prove the server stopped working.

## References

- [JDBC Connection contract](https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/java/sql/Connection.html)
- [JDBC Statement timeouts](https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/java/sql/Statement.html)
- [Spring JDBC connection management](https://docs.spring.io/spring-framework/reference/6.2/data-access/jdbc/connections.html)

[^jdbc]: Java Database Connectivity.
[^hikaricp]: Hikari Connection Pool — a Java database connection pool.
[^sql]: Structured Query Language.
[^jpa]: Java Persistence API (Application Programming Interface), now standardized as Jakarta Persistence.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).
[^http]: Hypertext Transfer Protocol.
[^cpu]: Central Processing Unit.
[^i-o]: Input/Output.

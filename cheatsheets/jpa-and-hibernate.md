# JPA[^jpa] and Hibernate cheat sheet

> Baseline: Jakarta Persistence 3.1, Hibernate ORM[^orm] 6.6, Java 21; Hibernate 7 / Boot 4 require their own compatibility review. Reviewed: 2026-09-24.

The persistence context tracks entity identity and changes. Design the **transaction and fetch plan for the use case**, then inspect the SQL[^sql] it produces.

Related: [SQL](sql.md), [transactions](transactions-and-isolation.md), [Spring Boot](spring-boot.md), [database migrations](database-migrations.md).

## Entity lifecycle

| State / operation | Meaning | Trap |
|-------------------|---------|------|
| New + `persist` | Make a new entity managed | SQL may execute later; constraint failures can surface at flush/commit |
| Managed | Changes are tracked within the persistence context | No explicit update call is required for ordinary dirty checking |
| Detached + `merge` | Copy state into a managed instance; use the returned reference | The supplied detached instance does not become managed |
| `flush` | Synchronize pending changes to the database | Flush is not commit |
| `clear` / `detach` | Stop tracking entities | Flush intended changes first; lazy state may become unavailable |
| `remove` | Schedule deletion of a managed entity | Cascades can enlarge the deletion scope |

Do not share a real `EntityManager` across worker threads. A Spring-injected transactional proxy delegates to a context; it does not make its entities safe to share. See the [EntityManager API](https://jakarta.ee/specifications/persistence/3.1/apidocs/jakarta.persistence/jakarta/persistence/entitymanager)[^api] and [Hibernate introduction](https://docs.hibernate.org/orm/6.6/introduction/html_single/).

## Minimal versioned entity

Complete entity class, requiring the Jakarta Persistence API. Assigned IDs[^id] are intentional; callers supply a stable unique ID. Persistence bootstrap and transactions are separate.

```java
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "customer")
public class Customer {
    @Id
    private Long id;

    @Version
    private long version;

    private String name;

    protected Customer() {}

    public Customer(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public void rename(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

On an optimistic conflict, roll back and re-read in a new transaction before deciding whether to retry. Do not overwrite a fresh entity with stale detached state. Domain validation is omitted from this persistence example.

## Relationships and fetching

| Concern | Rule of thumb |
|---------|---------------|
| Association ownership | The owning side controls the relationship write; `mappedBy` identifies the inverse side |
| Bidirectional links | Maintain both Java sides; changing only the inverse side is insufficient |
| Cascades | Propagate lifecycle operations only where ownership warrants it |
| `orphanRemoval` | Use for privately owned children; removing a child can delete its row |
| Fetch defaults | To-one associations default eager; to-many default lazy; lazy is a JPA hint |
| N+1 | Check query count; use a suitable fetch join, entity graph, projection, or batch fetching |
| Pagination | Avoid paginating a collection fetch join; page IDs first or use a projection |
| Several collections | Joining them together can multiply rows dramatically |

Use DTOs[^dto] at API/UI[^ui] boundaries. Open-session-in-view can conceal unexpected database access during rendering. See the [Hibernate user guide](https://docs.hibernate.org/orm/6.6/userguide/html_single/).

## Writes and resource use

- Batch large imports with measured JDBC[^jdbc] batch sizes. Flush and clear periodically to bound managed state; transaction chunking is a separate decision.
- Identity-generated inserts restrict Hibernate insert batching; verify the actual identifier strategy and SQL.
- Bulk JPQL[^jpql]/native updates can leave managed entities stale. Reconcile or clear the context deliberately; do not assume entity callbacks or version checks run.
- Keep equality stable while an entity is in a set/map; avoid basing its hash on an ID assigned after insertion.

## Suggested verification

Test merge return semantics, conflicting versioned writes, relationship removal, and query counts on representative data. Run locking and SQL checks against the production database engine; an H2 test is not evidence of PostgreSQL or SQLite behavior. Keep transactions on the service/use-case boundary and check failures at commit, not just at repository return.

## References

- [Jakarta Persistence 3.1 — EntityManager](https://jakarta.ee/specifications/persistence/3.1/apidocs/jakarta.persistence/jakarta/persistence/entitymanager)
- [Hibernate 6.6 — introduction](https://docs.hibernate.org/orm/6.6/introduction/html_single/)
- [Hibernate 6.6 — user guide](https://docs.hibernate.org/orm/6.6/userguide/html_single/)

[^jpa]: Java Persistence API (Application Programming Interface), now standardized as Jakarta Persistence.
[^orm]: Object-Relational Mapping (or Mapper, depending on context).
[^sql]: Structured Query Language.
[^api]: Application Programming Interface — the contract through which software components interact.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).
[^dto]: Data Transfer Object.
[^ui]: User Interface.
[^jdbc]: Java Database Connectivity.
[^jpql]: Java Persistence Query Language.

# Testing beyond the unit cheat sheet

> Baseline: Spring Boot 3.5 / Framework 6.2, JUnit 5, Testcontainers 1.x, and PostgreSQL 16 examples. Reviewed: 2026-09-24.

[TDD](tdd.md)[^tdd] is the design loop for a single unit. This sheet is the rest of the pyramid: what else to run, where, and how expensive it may be.

Related: [spring-boot.md](spring-boot.md), [maven.md](maven.md), [rest-apis.md](rest-apis.md), [JUnit, Mockito, and AssertJ](junit-mockito-assertj.md), [accessibility checks](accessibility.md).

## Pyramid

```text
        E2E / UI          few, slow, brittle
      Contract            per published API
    Integration           app + real-enough collaborators
  Unit                    many, fast, deterministic
```

A suite of only `@SpringBootTest`s is an integration suite in unit-test clothing. A suite of only mocks is a design sketch that never saw SQL[^sql].

## What each layer proves

| Layer | Proves | Does not prove |
|-------|--------|----------------|
| Unit | Domain rules, parsers, pure mapping | Wiring, SQL, HTTP[^http] stack |
| Slice (`@WebMvcTest`) | Controller mapping and error JSON[^json] | Security config you did not import |
| Integration | Schema, transactions, real driver, Boot wiring | Full user journey through a browser |
| Contract | This service still matches the published OpenAPI / pact | The other team deployed |
| E2E[^e2e] | A thin critical path works in a real env | Anything about edge cases at volume |

## JUnit + Maven split

| Plugin | Pattern | When |
|--------|---------|------|
| Surefire | `*Test` | Unit + slices; `mvn test` |
| Failsafe | `*IT`[^it] | Integration; `mvn verify` |

```bash
./mvnw -q test
./mvnw -q verify
```

Keep unit tests off the network. Integration tests may boot Testcontainers.

## Testcontainers

Spring Boot 3.5 / Testcontainers 1.x wiring sketch. Requires the PostgreSQL and JUnit Jupiter Testcontainers modules, `spring-boot-testcontainers`, a container runtime, and the application's Boot configuration. Add repository tests for the actual schema:

```java
@Testcontainers
@SpringBootTest
class OrderRepositoryIT {
  @Container
  @ServiceConnection
  static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16");
}
```

Reuse containers across tests in a class. Pin the image tag. Do not depend on a shared “dev” database for CI[^ci].

## Spring test annotations

| Annotation | Cost | Use |
|------------|------|-----|
| plain JUnit | lowest | domain |
| `@JsonTest` | low | Jackson shapes |
| `@WebMvcTest` | medium | HTTP adapter |
| `@DataJdbcTest` / `@DataJpaTest` | medium | persistence |
| `@SpringBootTest` | high | wiring, one happy path per module |
| `@SpringBootTest` + `RANDOM_PORT` | highest | real HTTP to yourself |

Replace neighbors with `@MockitoBean` (Spring Framework 6.2+) at the slice boundary. `@MockBean` is a legacy Boot API[^api] deprecated since Boot 3.4; check migration guidance for the target Boot line. Prefer a fake repository when it faithfully represents the application-service contract.

## Contract tests

- **Consumer-driven (Pact, similar):** consumer publishes expectations; provider verifies against them in CI.
- **Spec-driven:** published OpenAPI is the contract; tool checks the live server or the controller against the spec. See [openapi-and-json-schema.md](openapi-and-json-schema.md).

A contract test fails when a field is removed or a status code changes — before the other team’s UI[^ui] does.

## Fixtures and data

- Build objects with helpers or builders, not 40-line constructors copied everywhere.
- Test-managed `@Transactional` rollback covers participating work on the test thread. HTTP tests using `RANDOM_PORT`/`DEFINED_PORT` run server transactions on other threads; the test's rollback does not undo those writes. Async work and `REQUIRES_NEW` can also escape it.
- For those tests, use an isolated database/schema or explicit cleanup after work completes. Unique IDs[^id] prevent key collisions but do not isolate counts, list queries, or shared constraints.
- Time: inject a `Clock`. Do not sleep for 2 seconds to “wait for async.”

## What to automate vs poke

Automate: invariants, parsers, authz denials, migrations, contract, one smoke path after deploy.  
Poke by hand: visual layout, exploratory weirdness, one-off prod data.

## Gotchas

- Flaky tests are unread tests. Quarantine or fix; do not ignore.
- `Thread.sleep` in tests.
- Order-dependent tests that pass only with a given class order.
- Snapshotting full JSON when you care about one field.
- Running Selenium against localhost as the only CI signal.

## References

- [Spring Boot 3.5 — testing applications and transaction boundaries](https://docs.spring.io/spring-boot/3.5/reference/testing/spring-boot-applications.html)
- [Spring Boot 3.5 — Testcontainers service connections](https://docs.spring.io/spring-boot/3.5/reference/testing/testcontainers.html)

[^tdd]: Test-Driven Development.
[^sql]: Structured Query Language.
[^http]: Hypertext Transfer Protocol.
[^json]: JavaScript Object Notation.
[^e2e]: End-to-End — testing a complete user or system workflow.
[^it]: Integration Test — the Maven test-name suffix used here.
[^ci]: Continuous Integration.
[^api]: Application Programming Interface — the contract through which software components interact.
[^ui]: User Interface.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).

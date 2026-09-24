# Testing beyond the unit cheat sheet

[TDD](tdd.md) is the design loop for a single unit. This sheet is the rest of the pyramid: what else to run, where, and how expensive it may be.

Related: [spring-boot.md](spring-boot.md), [maven.md](maven.md), [rest-apis.md](rest-apis.md).

## Pyramid

```text
        E2E / UI          few, slow, brittle
      Contract            per published API
    Integration           app + real-enough collaborators
  Unit                    many, fast, deterministic
```

A suite of only `@SpringBootTest`s is an integration suite in unit-test clothing. A suite of only mocks is a design sketch that never saw SQL.

## What each layer proves

| Layer | Proves | Does not prove |
|-------|--------|----------------|
| Unit | Domain rules, parsers, pure mapping | Wiring, SQL, HTTP stack |
| Slice (`@WebMvcTest`) | Controller mapping and error JSON | Security config you did not import |
| Integration | Schema, transactions, real driver, Boot wiring | Full user journey through a browser |
| Contract | This service still matches the published OpenAPI / pact | The other team deployed |
| E2E | A thin critical path works in a real env | Anything about edge cases at volume |

## JUnit + Maven split

| Plugin | Pattern | When |
|--------|---------|------|
| Surefire | `*Test` | Unit + slices; `mvn test` |
| Failsafe | `*IT` | Integration; `mvn verify` |

```bash
./mvnw -q test
./mvnw -q verify
```

Keep unit tests off the network. Integration tests may boot Testcontainers.

## Testcontainers

```java
@Testcontainers
class OrderRepositoryIT {
  @Container
  static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16");

  // point Spring datasource at db.getJdbcUrl()
}
```

Reuse containers across tests in a class. Pin the image tag. Do not depend on a shared “dev” database for CI.

## Spring test annotations

| Annotation | Cost | Use |
|------------|------|-----|
| plain JUnit | lowest | domain |
| `@JsonTest` | low | Jackson shapes |
| `@WebMvcTest` | medium | HTTP adapter |
| `@DataJdbcTest` / `@DataJpaTest` | medium | persistence |
| `@SpringBootTest` | high | wiring, one happy path per module |
| `@SpringBootTest` + `RANDOM_PORT` | highest | real HTTP to yourself |

Replace neighbors with `@MockitoBean` / `@MockBean` only at the slice boundary. Prefer a fake repository for application-service tests.

## Contract tests

- **Consumer-driven (Pact, similar):** consumer publishes expectations; provider verifies against them in CI.
- **Spec-driven:** published OpenAPI is the contract; tool checks the live server or the controller against the spec. See [openapi-and-json-schema.md](openapi-and-json-schema.md).

A contract test fails when a field is removed or a status code changes — before the other team’s UI does.

## Fixtures and data

- Build objects with helpers or builders, not 40-line constructors copied everywhere.
- Integration tests: isolate schema (`@Transactional` rollback *or* unique keys per test). Do not assume an empty shared DB.
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

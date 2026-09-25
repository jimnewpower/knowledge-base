# Find your starting point

Use this guide when several sheets seem to answer the same question. Start with the conceptual reference to understand the terms and tradeoffs, then use the implementation reference for a concrete stack or task. These are reading paths, not prerequisites for every reader.

## Choose a path

| Your question | Concepts first | Implementation next |
|---------------|----------------|---------------------|
| How should I structure an application? | [Architecture styles](../cheatsheets/architecture-styles.md) | [Modular monoliths](../cheatsheets/modular-monoliths.md) |
| How do I explain a design? | [C4 views](../cheatsheets/c4-diagrams.md) | [Structurizr DSL](../cheatsheets/structurizr-dsl.md) |
| Which collection or library fits? | [Data structures](../cheatsheets/data-structures.md) | [Java libraries](../cheatsheets/java-libraries.md), [Python libraries](../cheatsheets/python-libraries.md) |
| How does a web interface work? | [HTML, CSS, and browsers](../cheatsheets/html-css-browser.md) | [React](../cheatsheets/react.md), [Angular](../cheatsheets/angular.md), [Faces](../cheatsheets/jakarta-faces-primefaces.md) |
| Can people use the interface? | [Accessibility](../cheatsheets/accessibility.md) | [Localization](../cheatsheets/localization.md), [testing](../cheatsheets/testing.md) |
| How do systems exchange work? | [Integration patterns](../cheatsheets/enterprise-integration-patterns.md) | [Routing and coordination](../cheatsheets/integration-routing-and-coordination.md), [Spring Integration](../cheatsheets/spring-integration.md) |
| How do I design and call an API? | [REST APIs](../cheatsheets/rest-apis.md) | [OpenAPI/JSON Schema](../cheatsheets/openapi-and-json-schema.md), [HTTP clients/webhooks](../cheatsheets/http-clients-webhooks.md) |
| What happens during concurrent writes? | [Transactions and isolation](../cheatsheets/transactions-and-isolation.md) | [JPA/Hibernate](../cheatsheets/jpa-and-hibernate.md), [SQLite](../cheatsheets/sqlite.md) |
| Who can do what? | [Authentication](../cheatsheets/authentication.md), [authorization](../cheatsheets/authorization.md) | [Spring Security](../cheatsheets/spring-security.md), [Entra ID](../cheatsheets/entra-id.md) |
| What should my tests prove? | [Testing strategy](../cheatsheets/testing.md) | [JUnit/Mockito/AssertJ](../cheatsheets/junit-mockito-assertj.md), [quality gates](../cheatsheets/static-analysis-coverage.md) |
| How do I diagnose production behavior? | [Observability](../cheatsheets/observability.md) | [OpenTelemetry/Micrometer](../cheatsheets/opentelemetry-micrometer.md), [Log4j 2](../cheatsheets/log4j2.md) |
| How do I ship repeatably? | [DevOps](../cheatsheets/devops.md) | [Reproducible builds](../cheatsheets/reproducible-builds.md), [GitHub Actions](../cheatsheets/github-actions-maven.md) |
| How do I handle spatial data? | [Geospatial correctness](../cheatsheets/geospatial-correctness.md) | [Raster processing](../cheatsheets/raster-gis.md) |

## Related does not mean interchangeable

- Authentication proves identity; authorization decides permitted actions. Spring Security implements policies in a particular application stack.
- Integration patterns describe reusable shapes. An ESB is a shared integration runtime; an API gateway is an API boundary. Neither replaces the pattern's delivery or recovery contract.
- Observability explains which signals are useful. Log4j configures Java logging; OpenTelemetry and Micrometer cover instrumentation and export.
- Architecture styles compare structures. ADR guidance explains how to document a decision, not which structure every system should adopt.

## Search effectively

Search all categories first, then narrow by category if results span unrelated topics. Words combine with AND, so remove a word when a long query finds nothing. Aliases such as `a11y`, `i18n`, `ORM`, and `auth` help discover related terminology; they do not assert equivalence between technologies. Longer words tolerate small spelling errors; short API names stay more exact.

Use [the full index](../cheatsheets/README.md) to scan summaries or [report missing coverage](../CONTRIBUTING.md) with the question you could not answer.

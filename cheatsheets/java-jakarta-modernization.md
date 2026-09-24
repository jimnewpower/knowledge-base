# Java and Jakarta modernization cheat sheet

> Baseline: migration planning for legacy Spring/JSF applications toward Java 21+, Spring Boot 4.0 / Framework 7, and Jakarta APIs. This is a compatibility checklist, not a certified stack. Reviewed: 2026-09-24.

Upgrade a **verified combination of runtime, libraries, and deployment container**. Compilation alone does not prove that authentication, persistence, or rendered UI behavior survived.

Related: [Maven](maven.md), [Spring Boot](spring-boot.md), [Jackson](jackson-json.md), [database migrations](database-migrations.md), [testing](testing.md).

## Build the compatibility matrix first

| Layer | Record and verify |
|-------|-------------------|
| JDK | Build/runtime versions, compiler release, agents, native libraries |
| Spring | Framework, Boot if used, Security, Data, unmanaged extensions |
| Web container | Servlet, EL, WebSocket APIs; WAR versus embedded deployment |
| Faces UI | Faces implementation, CDI integration, PrimeFaces artifact/namespace, themes |
| Persistence | Jakarta Persistence level, Hibernate, dialect, JDBC driver, pool |
| Serialization | Jackson major version, modules, framework mapper customizations |

Boot 4.0 requires Java 17+, Framework 7, and Servlet 6.1; it moves to a Jakarta EE 11 baseline. Tomcat 11 implements Servlet 6.1 and requires Java 17+. Tomcat 9 is not a compatible Boot 4 servlet target. Sources: [Boot migration guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide), [Tomcat 11 migration guide](https://tomcat.apache.org/migration-11.0.html).

Faces is a separate integration concern: do not assume a servlet container supplies a Faces/CDI implementation or that a Boot BOM manages every UI dependency.

## Namespace migration is selective

| Old application API | Jakarta counterpart |
|---------------------|---------------------|
| `javax.servlet.*` | `jakarta.servlet.*` |
| `javax.persistence.*` | `jakarta.persistence.*` |
| `javax.validation.*` | `jakarta.validation.*` |
| `javax.faces.*` | `jakarta.faces.*` |

Do not replace every `javax` string: Java SE packages such as `javax.sql`, `javax.crypto`, and `javax.net` retain their names. Inspect deployment descriptors, service-provider files, generated code, reflection strings, and transitive dependencies too. A transformed JAR still needs behavioral testing. See [Tomcat's Jakarta migration guidance](https://tomcat.apache.org/migration-10.html).

## Suggested sequence

1. Capture a reproducible baseline: build, dependency tree, production configuration, and representative UI/API tests.
2. Establish a supported JDK/library combination and remove obsolete dependencies. Do not assume a legacy Spring release supports a newer JDK merely because it starts.
3. Modernize the framework/container/namespace combination in compatible stages. Introducing Boot to a non-Boot application is a separate configuration and packaging change.
4. For an existing Boot application moving to 4.0, follow the official guidance to reach the current 3.5.x patch first; address deprecations before crossing the major boundary.
5. Upgrade serialization and persistence behavior with recorded fixtures. Keep schema changes backward compatible while old and new binaries coexist.
6. Deploy to a representative environment, compare behavior, and exercise rollback before retiring the old deployment.

Useful commands, run in the target Maven application with its required repositories available:

```bash
mvn dependency:tree
mvn help:effective-pom -Doutput=effective-pom.xml
mvn verify
```

Review the effective POM for inherited plugin versions and dependency overrides; keep generated diagnostic output out of committed source unless intentionally maintained.

## UI and compatibility traps

- PrimeFaces 15 removes legacy Chart.js components and changes paginator actions from links to buttons. Custom CSS/JS and theme dependencies need inspection, not only Java compilation. See the [14-to-15 migration guide](https://github.com/primefaces/primefaces/blob/master/docs/migrationguide/15_0_0.md).
- For a Faces/PrimeFaces upgrade, test AJAX partial updates, validation messages, converters, file uploads, lazy tables, navigation, and view/session state.
- Boot 4 defaults to Jackson 3; the Jackson 2 compatibility path is temporary migration assistance, not evidence that old customizations apply unchanged.
- Do not share serialized sessions between incompatible application versions without proving compatibility.

## Release evidence

Record exact resolved versions, passing contract/UI fixtures, query and serialization differences, and startup/shutdown behavior. Define rollback limits for database writes, emitted events, and session state: rolling back a binary cannot retract externally observed changes.

## References

- [Spring Boot 4.0 migration guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide)
- [Tomcat 10 namespace migration](https://tomcat.apache.org/migration-10.html)
- [Tomcat 11 migration](https://tomcat.apache.org/migration-11.0.html)
- [PrimeFaces 15 migration](https://github.com/primefaces/primefaces/blob/master/docs/migrationguide/15_0_0.md)

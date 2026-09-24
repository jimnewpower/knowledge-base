# Maven cheat sheet

> Baseline: Maven 3.9.x and Java 21; plugin versions and lifecycle bindings belong in the project/parent POM. Reviewed: 2026-09-24.

Maven is the default Java build and dependency tool in this collection’s product context. A build is a `pom.xml`, a lifecycle, and a local cache (`~/.m2/repository`).

## Coordinates

GAV is `groupId:artifactId:version`. Extended string formats are tool-specific; `dependency:get -Dartifact=...` uses:

```text
groupId:artifactId:version[:packaging][:classifier]
com.example:order-service:1.4.0:jar
```

- `SNAPSHOT` versions are mutable. Release versions are not.
- `packaging`: `jar`, `war`, `pom` (aggregator / parent), `maven-plugin`.

## Minimal POM

```xml
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>order-service</artifactId>
  <version>1.4.0-SNAPSHOT</version>
  <properties>
    <maven.compiler.release>21</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
</project>
```

Prefer `maven.compiler.release` over paired `source`/`target`.

## Lifecycles and everyday commands

Default lifecycle (selected phases):

```text
validate → compile → test → package → verify → install → deploy
```

```bash
mvn -q test
mvn -q package
mvn -q verify                 # includes integration-test plugins bound to verify
mvn -q install                # into local ~/.m2
mvn -pl :order-service -am test
mvn -pl :order-service -amd package
mvn dependency:tree
mvn versions:display-dependency-updates
mvn -DskipTests package       # last resort; say why
```

`-pl` project list, `-am` also make dependencies, `-amd` also make dependents, `-T 1C` parallel by core.

There is no separate “compile only my module” that still works if you skipped installing its siblings — use `-am`.

## Multi-module

```text
order-parent          packaging pom
  order-api           jar (DTOs / interfaces)
  order-service       jar/war
  order-it            jar (integration tests)
```

Parent defines plugin versions and dependency versions. Children inherit.

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-dependencies</artifactId>
      <version>${spring-boot.version}</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

BOM import in `dependencyManagement` pins versions without adding the artifacts themselves. This POM fragment assumes `spring-boot.version` is set to an approved exact version in the project or parent. Importing the BOM does not supply plugin management; pin build plugins separately or use the appropriate parent.

## Dependency scopes

| Scope | Main compile classpath | Test classpath | Main runtime classpath |
|-------|------------------------|----------------|------------------------|
| `compile` (default) | yes | yes | yes |
| `provided` | yes | yes | no; deployment environment supplies it |
| `runtime` | no | yes | yes |
| `test` | no | yes | no |
| `import` | BOM only, in `dependencyManagement` | not a classpath dependency | not a classpath dependency |

Scope does not determine physical packaging by itself. An ordinary JAR contains the project's classes/resources, not dependency JARs. WAR, Spring Boot repackage, Shade, and Assembly apply their own packaging rules; check the resulting artifact.

Exclusions cut a transitive you cannot use. Prefer fixing the version in `dependencyManagement` over a pile of exclusions.

## Plugins that matter

| Plugin | Job |
|--------|-----|
| `maven-compiler-plugin` | javac |
| `maven-surefire-plugin` | unit tests |
| `maven-failsafe-plugin` | integration tests (`*IT`) |
| `maven-jar-plugin` | Project classes/resources; main-class manifest requires configuration |
| `spring-boot-maven-plugin` | `repackage` builds an executable Boot archive with dependencies |
| `maven-enforcer-plugin` | Require Java/Maven versions; duplicate-class checks need Extra Enforcer Rules |
| `jacoco-maven-plugin` | coverage |

Bind failsafe to `integration-test` + `verify`, not to `test`.

## Repositories and settings

- Project repos belong in `pom.xml` only when they are part of the build contract.
- Credentials belong in `~/.m2/settings.xml` or the CI secret store — never in the POM.
- `mvn -o` offline, after the cache is warm.
- Checksums and HTTPS for every repository.

## Versioning and releases

- `1.4.0-SNAPSHOT` during development.
- Release is an immutable version plus a Git tag. The git tag, not the floating SNAPSHOT, is what deployment notes should cite.
- Do not deploy SNAPSHOT artifacts to a production environment.

## Gotchas

- Two versions of the same library on the classpath: run `mvn dependency:tree` and pin in `dependencyManagement`.
- `compile` scope JUnit leaks onto the runtime classpath and may enter packaged distributions. Use `test`.
- Plugin versions not pinned in a parent will move under you.
- `mvn clean` is not a personality trait. Use it when outputs are stale, not as a ritual that hides incremental-compile bugs.
- The Maven Wrapper (`./mvnw`) pins the Maven version for CI and laptops. Prefer it in repos.

## References

- [Maven — dependency scopes and management](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html)
- [Maven — JAR plugin contents](https://maven.apache.org/plugins/maven-jar-plugin/)
- [MojoHaus — duplicate-class Enforcer rule](https://www.mojohaus.org/extra-enforcer-rules/banDuplicateClasses.html)

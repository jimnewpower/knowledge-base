# Maven cheat sheet

Maven is the default Java build and dependency tool in this collection’s product context. A build is a `pom.xml`, a lifecycle, and a local cache (`~/.m2/repository`).

## Coordinates

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
      <version>3.5.5</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

BOM import in `dependencyManagement` pins versions without adding the artifacts themselves.

## Dependency scopes

| Scope | Compile | Test | Runtime | Packaged |
|-------|---------|------|---------|----------|
| `compile` (default) | yes | yes | yes | yes |
| `provided` | yes | yes | container | no |
| `runtime` | no | yes | yes | yes |
| `test` | no | yes | no | no |
| `import` | BOM only, in `dependencyManagement` | | | |

Exclusions cut a transitive you cannot use. Prefer fixing the version in `dependencyManagement` over a pile of exclusions.

## Plugins that matter

| Plugin | Job |
|--------|-----|
| `maven-compiler-plugin` | javac |
| `maven-surefire-plugin` | unit tests |
| `maven-failsafe-plugin` | integration tests (`*IT`) |
| `maven-jar-plugin` / Spring Boot plugin | executable artifact |
| `maven-enforcer-plugin` | ban duplicate classes, require Java version |
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
- `compile` scope JUnit leaks into the runtime artifact. Use `test`.
- Plugin versions not pinned in a parent will move under you.
- `mvn clean` is not a personality trait. Use it when outputs are stale, not as a ritual that hides incremental-compile bugs.
- The Maven Wrapper (`./mvnw`) pins the Maven version for CI and laptops. Prefer it in repos.

# Java library reference

> Baseline: Java 21 project context; Maven coordinates omit versions intentionally. Select releases compatible with the deployed JDK[^jdk] and framework. Reviewed: 2026-09-25.

A starting catalog for enterprise services, desktop applications, and geospatial tools. Library names link to primary documentation; selection guidance reflects this knowledge base's working preferences. Use the linked implementation notes for configuration and failure handling.

Related: [Java](java.md), [Python libraries](python-libraries.md), [Maven](maven.md), [dependency security](software-supply-chain.md).

## Start with the JDK

These APIs[^api] ship with Java 21 and need no third-party Maven dependency. See the [Java 21 API reference](https://docs.oracle.com/en/java/javase/21/docs/api/index.html).

| Need | Built-in API | Selection guidance |
|------|--------------|--------------------|
| Collections and transformations | `java.util`, `java.util.stream` | Start here before adding a collection utility library |
| Files and paths | `java.nio.file` | Use `Path` and `Files`; close streams and bound memory for large files |
| HTTP[^http] calls | `java.net.http.HttpClient` | A starting point for HTTP integrations; define timeouts and response limits; see [HTTP clients](http-clients-webhooks.md) |
| Dates and time | `java.time` | Use explicit zones and an injectable clock; see [date and time](java-time.md) |
| Concurrency | `java.util.concurrent` | Choose execution and cancellation policies explicitly; see [concurrency](java-concurrency.md) |
| Relational database access | `java.sql`, `javax.sql` | JDBC[^jdbc] interfaces ship with the JDK; database drivers and pools are separate dependencies |

## Data, formats, and utilities

Coordinates are `groupId:artifactId`. Some entries need additional modules for a particular format, database, or framework integration.

[Apache Commons](https://commons.apache.org/) is a collection of independently released components. Add only the components needed; their Maven group IDs[^id] are not all the same.

| Library / official reference | Maven dependency | Use when / decision boundary |
|------------------------------|------------------|------------------------------|
| [Jackson](https://github.com/FasterXML/jackson) | 2.x: `com.fasterxml.jackson.core:jackson-databind`; 3.x: `tools.jackson.core:jackson-databind` | JSON[^json] binding, trees, and streaming. Follow the application's Jackson major version and module set; see [Jackson](jackson-json.md) |
| [Apache Commons CSV](https://commons.apache.org/proper/commons-csv/)[^csv] | `org.apache.commons:commons-csv` | Read and write delimited records with quoting and dialect rules; see [CSV and Excel](csv-excel-poi.md) |
| [Apache POI](https://poi.apache.org/components/)[^poi] | `org.apache.poi:poi-ooxml` for OOXML[^ooxml], including `.xlsx`; `org.apache.poi:poi` for core/legacy `.xls` | Work with Office file structures. Choose a streaming approach for large workbooks; see [CSV and Excel](csv-excel-poi.md) |
| [Apache Commons Lang](https://commons.apache.org/proper/commons-lang/) | `org.apache.commons:commons-lang3` | String and object utilities missing from the JDK. Check whether modern Java already handles the specific operation |
| [Apache Commons IO](https://commons.apache.org/proper/commons-io/)[^io] | `commons-io:commons-io` | Stream, file, and directory utilities beyond `java.nio.file`. Keep resource ownership and memory limits explicit |
| [Apache Commons Collections](https://commons.apache.org/proper/commons-collections/) | `org.apache.commons:commons-collections4` | Additional collection types such as bags, bidirectional maps, and multimaps. Compare with JDK and Guava types before introducing overlapping abstractions |
| [Apache Commons Codec](https://commons.apache.org/proper/commons-codec/) | `commons-codec:commons-codec` | Encoding, decoding, and digest utilities. Use JDK `Base64` or `HexFormat` when sufficient; encoding does not encrypt data |
| [Guava](https://github.com/google/guava) | `com.google.guava:guava` | Multimaps, multisets, immutable collections, graphs, and utilities for hashing, strings, and concurrency. Select the `-jre` version flavor for desktop/server Java; compare ordinary collection needs with the JDK first |
| [Caffeine](https://github.com/ben-manes/caffeine) | `com.github.ben-manes.caffeine:caffeine` | In-process caching with size and expiry policies. It does not coordinate state across instances; see [caching](caching.md) |

For Guava usage patterns, see the official [Guava Explained guide](https://github.com/google/guava/wiki). Keep APIs marked `@Beta` out of durable public contracts because their compatibility is not guaranteed.

## Persistence and diagnostics

| Library / official reference | Maven dependency | Use when / decision boundary |
|------------------------------|------------------|------------------------------|
| [Hibernate ORM](https://hibernate.org/orm/documentation/)[^orm] | Modern lines: `org.hibernate.orm:hibernate-core` | JPA[^jpa] entity persistence and a unit of work. Match the ORM, Jakarta Persistence, and framework versions; legacy coordinates/namespaces differ; see [JPA and Hibernate](jpa-and-hibernate.md) |
| [HikariCP](https://github.com/brettwooldridge/HikariCP)[^hikaricp] | `com.zaxxer:HikariCP` | Pool JDBC connections. A pool does not provide the driver or define transaction boundaries; see [JDBC and HikariCP](jdbc-hikaricp.md) |
| [Xerial SQLite JDBC](https://github.com/xerial/sqlite-jdbc) | `org.xerial:sqlite-jdbc` | Access SQLite through JDBC. Verify native library loading in the packaged application and define writer coordination; see [SQLite](sqlite.md) |
| [Apache Log4j 2](https://logging.apache.org/log4j/2.x/manual/getting-started.html) | `org.apache.logging.log4j:log4j-api` and `org.apache.logging.log4j:log4j-core` | API plus logging implementation for applications. Align versions, configure bridges deliberately, and avoid competing providers; see [observability](observability.md) |

For Spring applications, inspect framework-managed dependencies before adding a second pool, JSON stack, or logging provider. Keep transactions on the service boundary. [Spring Boot](spring-boot.md) and [Java/Jakarta modernization](java-jakarta-modernization.md) cover the surrounding framework choices.

## Desktop and geospatial

| Library / official reference | Maven dependency | Use when / decision boundary |
|------------------------------|------------------|------------------------------|
| [OpenJFX](https://openjfx.io/openjfx-docs/) | `org.openjfx:javafx-controls`; `org.openjfx:javafx-fxml` when using FXML[^fxml] | Desktop UI[^ui]. JavaFX is separate from the JDK; match JavaFX/JDK versions and package platform dependencies; see [JavaFX](javafx.md) |
| [GeoTools](https://docs.geotools.org/latest/userguide/) | `org.geotools:gt-main`, plus required format/referencing modules | GIS[^gis] data access, CRS[^crs] handling, and spatial processing. Keep modules on one release and follow its repository instructions; see [geospatial correctness](geospatial-correctness.md) and [rasters](raster-gis.md) |
| [JTS](https://locationtech.github.io/jts/)[^jts] | `org.locationtech.jts:jts-core` | Geometry predicates, topology, buffers, and overlays. Coordinate units and projection remain the caller's responsibility; see [geospatial correctness](geospatial-correctness.md) |

## Testing

These dependencies normally belong in Maven's `test` scope. Match the selected library line to the JDK and test runner; a documentation site's `current` link may point to a newer major version.

| Library / official reference | Maven dependency | Use when / decision boundary |
|------------------------------|------------------|------------------------------|
| [JUnit Jupiter](https://docs.junit.org/5.11.4/user-guide/index.html) | `org.junit.jupiter:junit-jupiter` | JUnit 5 tests, lifecycle, and parameterized cases. The link is a fixed JUnit 5 reference, not a recommendation to pin that patch |
| [Mockito](https://github.com/mockito/mockito) | `org.mockito:mockito-core`; `org.mockito:mockito-junit-jupiter` for Jupiter integration | Replace external collaborators where isolation matters; prefer real value objects and collections |
| [AssertJ](https://assertj.github.io/doc/) | `org.assertj:assertj-core` | Fluent assertions for collections, exceptions, and domain results |
| [Testcontainers](https://java.testcontainers.org/) | `org.testcontainers:testcontainers`, plus modules for the selected release | Exercise actual database/service behavior in containers. Requires a compatible container runtime; module names can vary by major version |

See [JUnit, Mockito, and AssertJ](junit-mockito-assertj.md) and [testing beyond the unit](testing.md) for test boundaries.

## Dependency selection and maintenance

1. Name the capability the JDK or existing framework does not supply. Avoid introducing overlapping libraries without a specific need.
2. Select a compatible release line, then manage explicit versions centrally or through the framework BOM[^bom]. A BOM manages versions; it does not add dependencies.
3. Inspect the resolved Maven dependency tree, including transitive drivers, native components, logging bridges, and test engines.
4. Validate the packaged runtime as well as the IDE[^ide]: JavaFX modules, JDBC native libraries, GIS data access, and service discovery can behave differently after packaging.
5. Record the chosen version and rationale in the product repository. Revisit it during dependency upgrades; these documentation links are reference entry points, not a lockfile.

See [reproducible Maven builds](reproducible-builds.md), [desktop packaging](java-desktop-packaging.md), and [software supply-chain security](software-supply-chain.md).

[^jdk]: Java Development Kit.
[^api]: Application Programming Interface — the contract through which software components interact.
[^http]: Hypertext Transfer Protocol.
[^jdbc]: Java Database Connectivity.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).
[^json]: JavaScript Object Notation.
[^csv]: Comma-Separated Values.
[^poi]: Poor Obfuscation Implementation — the historical expansion of the Apache POI document-processing library's name.
[^ooxml]: Office Open XML; XML means Extensible Markup Language.
[^io]: Input/Output.
[^orm]: Object-Relational Mapping (or Mapper, depending on context).
[^jpa]: Java Persistence API (Application Programming Interface), now standardized as Jakarta Persistence.
[^hikaricp]: Hikari Connection Pool — a Java database connection pool.
[^fxml]: The JavaFX interface markup format, based on Extensible Markup Language.
[^ui]: User Interface.
[^gis]: Geographic Information System.
[^crs]: Coordinate Reference System.
[^jts]: JTS Topology Suite, originally Java Topology Suite.
[^bom]: Bill of Materials — a dependency-version catalog in Maven.
[^ide]: Integrated Development Environment.

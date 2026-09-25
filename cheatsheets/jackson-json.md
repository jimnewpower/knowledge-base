# Jackson and JSON[^json] serialization cheat sheet

> Baseline: Java 21 and Jackson 2.19.x examples; Jackson 3 differences are explicit. Align patch versions through the application BOM[^bom]. Reviewed: 2026-09-24.

Treat JSON as a **versioned boundary contract**. Keep persistence entities out of public payloads and test the actual mapper configuration used by the application.

Related: [OpenAPI and JSON Schema](openapi-and-json-schema.md), [REST APIs](rest-apis.md)[^rest][^api], [integration transformation](integration-transformation.md), [modernization](java-jakarta-modernization.md).

## Choose the API

| API | Use when | Cost |
|-----|----------|------|
| Databinding to records/DTOs[^dto] | Shape is known | Constructor and field policy affect compatibility |
| Tree (`JsonNode`) | Inspect selected fields or transform variable shapes | Usually retains the full document in memory |
| Streaming parser/generator | Large inputs or incremental work | Application must manage tokens and validation |

Configure a Jackson 2 mapper before concurrent use; reuse it rather than constructing one per request. Immutable readers/writers provide per-operation settings. See [Jackson databind](https://github.com/FasterXML/jackson-databind).

## Explicit mapper and DTO

Java method-body fragment; requires `jackson-databind` and `jackson-datatype-jsr310` 2.19.x. Imports shown for copying into a Java class; the enclosing method may declare `throws Exception`.

```java
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.math.BigDecimal;
import java.time.Instant;

// Declarations and statements below belong inside the example method.
record Quote(String id, BigDecimal amount, Instant observedAt) {}

var mapper = JsonMapper.builder()
    .addModule(new JavaTimeModule())
    .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
    .enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
    .build();

var input = """
    {"id":"q-1","amount":12.30,"observedAt":"2026-09-24T12:00:00Z"}
    """;
var quote = mapper.readValue(input, Quote.class);
var output = mapper.writeValueAsString(quote);
```

The strict unknown-field choice is intentional for this example. An integration consumer may choose tolerant reading instead; document that policy per boundary. Databinding alone does not enforce domain invariants or make every record component required. Java-time support for Jackson 2 comes from the [Java 8 modules](https://github.com/FasterXML/jackson-modules-java8).

## Contract decisions

| Concern | Decide explicitly |
|---------|-------------------|
| Missing versus null | Required presence, allowed null, and default behavior; patch APIs may need all three states |
| Money | Decimal amount plus currency; avoid converting through binary floating point |
| Time | Instant/offset versus local date-time; choose precision and timezone policy |
| Unknown fields/enums | Reject, ignore, or preserve; do not silently map unknown business states to a valid default |
| Property names | Renames and aliases must preserve the intended read/write contract |
| Polymorphism | Use constrained logical type names/subtypes; avoid unrestricted class-name deserialization of untrusted input |

Prefer typed numeric DTO fields over an untyped `Map<String, Object>` when precision matters. Apply Bean Validation or domain validation explicitly; deserialization is not an automatic validation pipeline.

## Large or untrusted inputs

Bound request size and parser nesting/string/number limits. Streaming avoids retaining the whole input only if the consumer also processes incrementally; collecting every parsed row into a list defeats it. Close parsers/generators and make stream ownership explicit. Report useful locations without logging secrets or the full rejected payload.

## Jackson 3 boundary

Core/databind move to `tools.jackson` packages and Maven groups; Jackson annotations retain `com.fasterxml.jackson.annotation`. Java-time support moves into databind. Jackson 3 is not a source-compatible dependency swap: review mapper builders, module registration, defaults, and custom serializers. See the [Jackson 3 migration guide](https://github.com/FasterXML/jackson/blob/main/jackson3/MIGRATING_TO_JACKSON_3.md).

## Suggested verification

Use contract fixtures for missing/null fields, unknown properties, decimals, timestamps, and enum additions. Compare parsed JSON values rather than incidental property order. Test through the framework's configured mapper as well as isolated serializers; a standalone mapper can differ from Spring's.

## References

- [FasterXML — Jackson databind](https://github.com/FasterXML/jackson-databind)
- [FasterXML — Java 8 datatype modules](https://github.com/FasterXML/jackson-modules-java8)
- [FasterXML — migration to Jackson 3](https://github.com/FasterXML/jackson/blob/main/jackson3/MIGRATING_TO_JACKSON_3.md)

[^json]: JavaScript Object Notation.
[^bom]: Bill of Materials — a dependency-version catalog in Maven.
[^rest]: Representational State Transfer.
[^api]: Application Programming Interface — the contract through which software components interact.
[^dto]: Data Transfer Object.

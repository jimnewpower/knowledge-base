# OpenAPI and JSON Schema cheat sheet

> Baseline: OpenAPI 3.0.3 skeleton and standalone JSON Schema 2020-12; OpenAPI 3.1 differences are explicit. Reviewed: 2026-09-24.

OpenAPI describes **HTTP APIs**. JSON Schema describes **JSON document shapes**. OpenAPI 3.0 uses a restricted, modified Schema Object; OpenAPI 3.1 aligns with JSON Schema 2020-12. Pin the specification and validator versions.

Related: [rest-apis.md](rest-apis.md), [testing.md](testing.md), [Jackson and JSON](jackson-json.md).

## Why they are architecture

A published spec is a contract. Removing a promised response field can break callers even when the Java still compiles. Evaluate compatibility in the direction data travels; treat the spec like an ADR plus tests.

## OpenAPI skeleton

Complete OpenAPI 3.0.3 document for one operation; authentication and other production operations are outside this example:

```yaml
openapi: 3.0.3
info:
  title: Order API
  version: 1.4.0
paths:
  /api/v1/orders/{id}:
    get:
      parameters:
        - $ref: '#/components/parameters/OrderId'
      responses:
        '200':
          description: Order
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
        '404':
          description: Missing
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorBody'
components:
  parameters:
    OrderId:
      name: id
      in: path
      required: true
      schema: { type: string }
  schemas:
    Order:
      type: object
      required: [id, status]
      properties:
        id: { type: string }
        status: { type: string, enum: [DRAFT, OPEN, CLOSED] }
    ErrorBody:
      type: object
      required: [error, message]
      properties:
        error: { type: string }
        message: { type: string }
```

## JSON Schema essentials

Standalone JSON Schema 2020-12 document, not an OpenAPI 3.0 Schema Object. This example intentionally restricts the top-level fields and models nonnegative amounts with two decimal places:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string", "minLength": 1 },
    "total": {
      "type": "object",
      "required": ["amount", "currency"],
      "properties": {
        "amount": { "type": "string", "pattern": "^[0-9]+\\.[0-9]{2}$" },
        "currency": { "type": "string", "minLength": 3, "maxLength": 3 }
      }
    }
  }
}
```

| Keyword | Meaning |
|---------|---------|
| `type` | `string` `number` `integer` `object` `array` `boolean` `null` |
| `required` | Properties that must be present |
| `additionalProperties` | Whether unknown fields are allowed |
| `enum` | Closed set |
| `oneOf` / `anyOf` / `allOf` | Composition — keep shallow |
| `$ref` | Reuse a definition |

For money, define decimal precision, rounding, and currency scale. A decimal string or integer minor units can avoid binary-float conversion in clients; JSON itself does not mandate IEEE floating-point storage. The two-decimal example is not a universal currency rule.

Missing and `null` differ: `required` controls presence. OpenAPI 3.0 uses `nullable: true` with a declared type; JSON Schema 2020-12 / OpenAPI 3.1 can use `type: [string, "null"]`. Do not copy keywords between versions without checking support.

## Compatibility

Assume a new server must keep working with existing clients:

| Change | Request accepted by server | Response consumed by client |
|--------|----------------------------|-----------------------------|
| Add optional field | Usually compatible if old requests keep their meaning | Compatible only if clients tolerate unknown fields |
| Make existing optional field required | Breaks clients that omit it | Usually compatible if type and meaning stay the same |
| Make existing required field optional | Usually broadens accepted input | Breaks clients if the server starts omitting it |
| Add enum value | Broadens accepted input | Can break exhaustive switches or enum parsers |
| Remove / rename field | Can break clients still sending or relying on it | Can break clients reading it |
| Change type or meaning | Potentially breaking; check accepted values | Potentially breaking; check emitted values |

Adding a distinct endpoint is generally compatible. Changing status-code semantics may break clients independently of the body schema. Generated SDK/source compatibility also needs its own checks.

In the versions shown, omitted `additionalProperties` allows unknown properties; `false` rejects them at that object level. A client validating responses against the closed example above will reject new top-level fields. Decide separately whether to reject unknown request fields and tolerate unknown response fields; never bind unknown request properties blindly to persistence entities.

## Codegen vs spec-first vs code-first

| Approach | Risk |
|----------|------|
| Spec first, generate server stubs | Spec stays source; generated code must not be hand-edited |
| Code first (springdoc, etc.) | Easy drift if annotations lie |
| Hand-written spec + contract tests | Most honest if CI fails on mismatch |

Pick one source of truth. Generate *or* annotate, then verify in CI. See [testing.md](testing.md).

## JSON pitfalls

- No trailing comments in strict JSON.
- Duplicate keys: parsers disagree; forbid them.
- Dates: prefer ISO-8601 strings (`2026-09-24T19:01:02Z`), document the timezone rule.
- Empty body vs `null` vs omitted field are three different contracts.

## Gotchas

- `type: object` with no `properties` is an untyped bag.
- `oneOf` requires exactly one matching branch. Overlapping branches reject instances matching more than one; use disjoint tags or `anyOf` when multiple matches are intentional.
- Publishing `/v1` forever while breaking the body “because we needed to.”
- Generating clients into the same repo as the server without pinning the spec version.

## References

- [OpenAPI 3.0.3 specification](https://spec.openapis.org/oas/v3.0.3)
- [OpenAPI 3.1.0 — Schema Object dialect](https://spec.openapis.org/oas/v3.1.0)
- [JSON Schema 2020-12 validation vocabulary](https://json-schema.org/draft/2020-12/json-schema-validation)

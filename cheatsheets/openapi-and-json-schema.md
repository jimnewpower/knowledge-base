# OpenAPI and JSON Schema cheat sheet

OpenAPI describes **HTTP APIs**. JSON Schema describes **JSON document shapes**. OpenAPI 3.x uses a dialect of JSON Schema for request and response bodies.

Related: [rest-apis.md](rest-apis.md), [testing.md](testing.md).

## Why they are architecture

A published spec is a contract. Removing a required field is a breaking change whether or not the Java still compiles. Treat the spec like an ADR plus tests.

## OpenAPI skeleton

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

Money as a string or as integer cents beats `number` (IEEE floats).

## Compatibility

| Change | Compatibility |
|--------|----------------|
| Add optional field | Usually safe |
| Add endpoint | Safe |
| Add enum value | Consumers that `switch` exhaustively may break |
| Make field required | Breaking |
| Remove / rename field | Breaking |
| Change type | Breaking |
| Change status code meaning | Breaking |

`additionalProperties: true` (or omitted, depending on draft) lets producers add fields. Consumers should ignore unknown fields unless they persist the document blindly.

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
- `oneOf` with overlapping schemas matches nothing useful.
- Publishing `/v1` forever while breaking the body “because we needed to.”
- Generating clients into the same repo as the server without pinning the spec version.

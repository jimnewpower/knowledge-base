# JSON[^json] cheat sheet

> Baseline: JSON syntax and interoperability rules in RFC[^rfc] 8259. Reviewed: 2026-09-25.

Use this when writing or debugging JSON documents: objects, arrays, value types, escaping, and common syntax errors.

Related: [Jackson and JSON serialization](jackson-json.md), [OpenAPI and JSON Schema](openapi-and-json-schema.md), [JavaScript](javascript.md).

## Complete example

This is a complete JSON document; no runtime or library is required to read it.

```json validate
{
  "name": "Alex",
  "age": 42,
  "active": true,
  "nickname": null,
  "tags": ["Java", "mapping"],
  "address": {
    "city": "Denver",
    "state": "CO"
  }
}
```

## Value types

| Type | Examples |
|------|----------|
| String | `"hello"`, `""`, `"2026-09-25"` |
| Number | `42`, `-7`, `3.14`, `1.5e3` |
| Boolean | `true`, `false` |
| Null | `null` |
| Object | `{"key": "value"}`, `{}` |
| Array | `["text", 42, true, null]`, `[]` |

A complete document can be any JSON value, including a single string, number, boolean, or null. Arrays may contain mixed types.

## Syntax rules

- Objects use `{}` and contain `"key": value` pairs.
- Arrays use `[]` and contain ordered values.
- Separate pairs and array elements with commas.
- Keys and strings require **double quotes**.
- No trailing commas, comments, or single-quoted strings.
- Boolean and null literals are lowercase.
- Numbers cannot have leading zeros (`007`), a leading `+`, or values such as `NaN` or `Infinity`.
- Use unique keys within each object; duplicate handling varies by parser.
- Whitespace and indentation outside strings do not affect meaning.

## Escaping inside strings

| Desired character | JSON escape |
|-------------------|-------------|
| Double quote | `\"` |
| Backslash | `\\` |
| Newline | `\n` |
| Tab | `\t` |
| Carriage return | `\r` |
| Unicode character | `\u0041` represents `A` |

Complete JSON document with escaped strings:

```json validate
{
  "quote": "He said \"hello\".",
  "path": "C:\\Users\\Alex\\data.json",
  "message": "First line\nSecond line"
}
```

Literal line breaks inside strings are invalid; encode them as `\n`. A Windows path needs escaped backslashes in the JSON text.

## Common mistakes and distinctions

| Input or assumption | Correction |
|---------------------|------------|
| `{name: 'Alex'}` | `{"name": "Alex"}` |
| `{"active": True}` | `{"active": true}` |
| `[1, 2,]` | `[1, 2]` |
| `{"count": undefined}` | Omit the field or use `null`, according to the contract |
| `"42"` means a number | It is a string; `42` is a number |
| `"false"` means a boolean | It is a string; `false` is a boolean |

- `null` is an explicit value; an omitted key means the field is absent. The consuming application decides what each means.
- Dates have no native JSON type. Agree on a string format with the consumer.
- Arrays preserve order; do not rely on object key order.
- Successful parsing checks syntax. Use [JSON Schema](openapi-and-json-schema.md) or application validation to check required fields, types, and allowed values.

## Primary references

- [RFC 8259: JSON data interchange format](https://www.rfc-editor.org/rfc/rfc8259) — grammar, strings, numbers, and interoperability.

[^json]: JavaScript Object Notation — a text format for exchanging structured data.
[^rfc]: Request for Comments — a publication in the Internet technical specification series; RFC 8259 defines JSON.

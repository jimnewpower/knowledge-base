# Integration transformation cheat sheet

> Baseline: Hohpe/Woolf EIP transformation patterns; broker-neutral contracts and conceptual examples. Reviewed: 2026-09-24.

Transformation reconciles **meaning as well as representation**. Renaming a field does not resolve different units, identity systems, lifecycle states, or definitions of missing data.

Related: [EIP overview](enterprise-integration-patterns.md), [routing and coordination](integration-routing-and-coordination.md), [OpenAPI and JSON Schema](openapi-and-json-schema.md), [application security](application-security.md).

## Choose a transformation

| Pattern | Changes | Useful for / cost |
|---------|---------|-------------------|
| Message Translator | Representation or data model | Partner-to-domain mapping; semantic mismatches need explicit rules |
| Envelope Wrapper | Adds/removes messaging metadata around a payload | Preserve a legacy body while carrying routing/correlation metadata |
| Content Enricher | Adds missing information from another source or computation | Customer ID to shipping details; lookups add latency and availability dependencies |
| Content Filter | Projects or simplifies payload fields | Send only fulfillment fields to a warehouse; removed information is unavailable downstream |
| Claim Check | Replaces stored content with a retrieval reference | Large documents or rasters; adds storage, authorization, and retention dependencies |
| Normalizer | Selects a translator for each input format | Several partners produce one agreed input model |
| Canonical Data Model | Establishes a shared exchange model | Reduces pairwise model coupling; adds shared governance and versioning |

The [transformation catalog](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MessageTransformationIntro.html) groups these patterns. Individual references below cover their distinct responsibilities.

## Normalize at the boundary

```text
partner A CSV -- translator A --+
                               +--> validated Order.v1 --> domain service
partner B XML -- translator B --+
```

This is a conceptual [Normalizer](https://www.enterpriseintegrationpatterns.com/patterns/messaging/Normalizer.html). Select the translator from a validated format/version, then validate the result before accepting domain work. Unknown versions take an explicit rejection/quarantine path.

Example mapping decisions to document:

| Source | Target | Required rule |
|--------|--------|---------------|
| `total_cents = 12345`, currency `USD` | Decimal amount `123.45`, currency `USD` | This contract uses two minor-unit digits; do not apply that assumption to all currencies |
| Local timestamp without offset | UTC instant | Require source zone and a daylight-saving ambiguity policy |
| Partner customer number | Internal customer identity | Lookup scope includes partner/tenant; identifiers are not globally interchangeable |
| Empty string | Absent, null, or empty value | Decide per field; do not globally collapse distinct meanings |
| Coordinates | Domain geometry | Specify CRS, axis order, and units before conversion |

## Enrichment and replay

A [Content Enricher](https://www.enterpriseintegrationpatterns.com/patterns/messaging/DataEnricher.html) introduces dependencies on the data it retrieves. For reproducible replay, retain the enriched snapshot or the exact lookup version where feasible. Querying today's customer address can change yesterday's shipping result.

Set lookup deadlines, cache freshness, and behavior for missing data. Reject or defer when required facts are unavailable; do not silently manufacture defaults. Record mapping and enrichment versions with provenance metadata. These are implementation recommendations, not automatic behavior of an enricher.

## Claim Check lifecycle

For large content, a [Claim Check](https://www.enterpriseintegrationpatterns.com/patterns/messaging/StoreInLibrary.html) carries a reference to persisted data. Suggested implementation policy:

1. Store an immutable object/version before publishing its reference.
2. Carry object identity, content type, length, and a digest when integrity checking is required.
3. Authorize retrieval separately; an opaque identifier alone is not access control.
4. Keep the object available through the supported retry and replay window.
5. Clean up orphaned uploads and expired objects without racing active consumers. The last observed read is not proof that all consumers are finished.

An object write and a message publish are separate failure points unless the platform provides an atomic boundary. Use durable publication state/reconciliation; handle duplicate references and missing objects explicitly.

## Canonical model tradeoff

In an ideal fully connected set of `n` application formats, direct directional mappings number `n * (n - 1)`; mapping to/from a canonical format needs at most `2 * n`. This is a model of mapping count, not a prediction of engineering cost. See [Canonical Data Model](https://www.enterpriseintegrationpatterns.com/patterns/messaging/CanonicalDataModel.html).

Practical recommendation: keep the shared model scoped to an integration domain, with a named owner and compatibility policy. A universal enterprise schema can force unrelated teams into synchronized releases. For two stable participants, direct translation may be simpler.

## Contract checks

- Keep representative partner fixtures, including unknown versions, missing required fields, and invalid values.
- Assert exact money, time, identity, and coordinate conversions; include boundary cases.
- Verify that a Content Filter removes sensitive fields from outputs, diagnostics, and error records.
- Replay with changed reference data to verify the chosen enrichment policy.
- Test expired/missing Claim Check objects and denied retrieval.
- Check round trips only for mappings promised to be lossless; document intentional projections.

## References

- [Hohpe and Woolf — Message Translator](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MessageTranslator.html)
- [Hohpe and Woolf — Envelope Wrapper](https://www.enterpriseintegrationpatterns.com/patterns/messaging/EnvelopeWrapper.html)
- [Hohpe and Woolf — Content Enricher](https://www.enterpriseintegrationpatterns.com/patterns/messaging/DataEnricher.html)
- [Hohpe and Woolf — Content Filter](https://www.enterpriseintegrationpatterns.com/patterns/messaging/ContentFilter.html)
- [Hohpe and Woolf — Claim Check](https://www.enterpriseintegrationpatterns.com/patterns/messaging/StoreInLibrary.html)
- [Hohpe and Woolf — Canonical Data Model](https://www.enterpriseintegrationpatterns.com/patterns/messaging/CanonicalDataModel.html)

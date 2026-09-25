# Application licensing and telemetry cheat sheet

> Baseline: commercial application entitlement and usage-event design; protocol and policy choices below are engineering recommendations. Reviewed: 2026-09-25.

Keep entitlement decisions, usage measurement, and operational diagnostics distinct. Each has different integrity, availability, and retention requirements.

Related: [authorization](authorization.md), [secrets management](secrets-management.md), [HTTP clients and webhooks](http-clients-webhooks.md)[^http], [licensing and IP compliance](licensing-ip-compliance.md)[^ip].

## Define the product contract

| Decision | Specify before implementation |
|----------|-------------------------------|
| Licensed subject | User, organization, device, installation, concurrent seat or usage unit |
| Entitlement | Product/features, version eligibility, expiry and issuer |
| Connectivity | Always online, periodic renewal, or explicitly supported offline operation |
| Failure policy | Grace period, restricted mode, renewal prompt, emergency recovery |
| Measurement | Exactly what constitutes a billable/analytical event and who reconciles it |
| Collection | Required fields, purpose, user/admin visibility, retention and access |

Do not make a transient telemetry upload failure silently change entitlement. If licensing requires an online lease, make its expiry/grace behavior explicit and test the outage path.

## Entitlement verification

For offline entitlement files, use a standard signature format and library. Sign at the issuer with a protected private key; the application verifies with trusted public keys. Bind the claims to the intended product and subject, validate validity bounds, and plan key rotation/revocation. A checksum or embedded symmetric signing key does not provide the same issuer authenticity.

Local enforcement runs on a user-controlled machine. Treat clock rollback, copied entitlement files, and modified clients as threat-model inputs; do not claim perfect offline enforcement. Avoid invasive hardware fingerprinting unless the product's explicit requirements justify the operational and privacy costs.

## Usage event contract

Suggested fields: event ID[^id], schema version, event type, occurrence time, pseudonymous installation/tenant identifier where required, product version, and the minimal usage quantity. Exclude access tokens, license secrets, document contents, precise locations, and personal identifiers unless specifically needed and approved for the stated purpose.

| Failure | Design response |
|---------|-----------------|
| Process exits before upload | Durable bounded outbox if event loss is unacceptable |
| Response lost after acceptance | Retry stable event IDs; server deduplicates |
| Long offline period | Storage/age limit, visible dropped-event accounting where relevant |
| Incorrect local clock | Retain server receipt time; flag suspect occurrence times |
| Schema changes | Versioned contract and compatible ingestion |

Telemetry produced by an untrusted client is a claim. For billing or security decisions, validate it against authoritative server-side activity where available and maintain reconciliation/dispute evidence.

## References

- [RFC 7515: JSON Web Signature](https://www.rfc-editor.org/rfc/rfc7515.html)[^rfc][^json]
- [OWASP logging data exclusions](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)[^owasp]
- [OpenTelemetry handling sensitive data](https://opentelemetry.io/docs/security/handling-sensitive-data/)

[^http]: Hypertext Transfer Protocol.
[^ip]: Intellectual Property — rights associated with software, documentation, and other creative work.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).
[^rfc]: Request for Comments — a document in the Internet technical specification series.
[^json]: JavaScript Object Notation.
[^owasp]: Open Worldwide Application Security Project.

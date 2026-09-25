# JWT[^jwt] cheat sheet

> Baseline: RFC[^rfc] 7519 token format, RFC 8725 security guidance, and RFC 9068 access-token profile; framework-independent. Reviewed: 2026-09-25.

Use this when inspecting a token, configuring a verifier, or diagnosing rejected requests. **Decoding exposes claims; validation establishes whether to trust them.**

Related: [authentication](authentication.md) for login flows, [authorization](authorization.md) for permissions, [Spring Security](spring-security.md) for Java configuration, and [Microsoft Entra](entra-id.md) for provider-specific rules.

## Format and purpose

JWT is a claims format. OAuth[^oauth] defines delegated access; OpenID Connect adds authentication. An access token can be opaque or a JWT. An ID[^id] token establishes identity for its client; do not substitute it for an access token at an API[^api].

| Representation | Compact shape | Protection |
|----------------|---------------|------------|
| JWS[^jws] | `header.payload.signature` | Integrity and issuer authentication after verification; payload is readable |
| JWE[^jwe] | Five dot-separated parts | Encryption; validate according to the agreed profile, including an inner signature when nested |

For ordinary signed JWTs, the header and payload are base64url-encoded JSON[^json]. Encoding is reversible and provides no secrecy. Verification covers the original encoded header and payload, separated by a dot; reformatting decoded JSON changes the signed bytes. See [JWS compact serialization](https://www.rfc-editor.org/rfc/rfc7515.html#section-3.1).

## Read the claims

Registered claims are optional in the base JWT specification; the token profile and application decide which are required. NumericDate values use Unix **seconds**, not milliseconds. See [registered claims](https://www.rfc-editor.org/rfc/rfc7519.html#section-4.1).

| Claim | Meaning | Check |
|-------|---------|-------|
| `iss` | Issuer | Exact expected issuer |
| `sub` | Subject | Interpret within issuer and token context; may identify a service |
| `aud` | Intended recipients | Expected audience appears as a string or in an array |
| `exp` | Expiration | Reject at or after expiry, allowing only configured clock leeway |
| `nbf` | Not before | Reject before this time, allowing configured leeway |
| `iat` | Issued at | Apply profile-specific age/future-time rules; does not replace `exp` |
| `jti` | Token identifier | Can support replay/revocation tracking; does not prevent replay by itself |

Do not use email as a permanent identity key. Scope, role, and tenant claims depend on the issuer contract; `scope`, `scp`, and `roles` are not interchangeable.

### Illustrative decoded access token

These are complete JSON objects for syntax checking, **not a signed token**. The example follows the RFC 9068 claim shape; it is not a universal provider template. RS256[^rs256] names the signing algorithm; `kid` selects a candidate key; `typ: at+jwt` identifies this access-token profile.

Header:

```json validate
{
  "alg": "RS256",
  "kid": "signing-key-2026-09",
  "typ": "at+jwt"
}
```

Payload (fixed historical timestamps, with a five-minute lifetime):

```json validate
{
  "iss": "https://identity.example.com",
  "sub": "user-42",
  "aud": "https://orders.example.com",
  "client_id": "orders-web",
  "iat": 1700000000,
  "exp": 1700000300,
  "jti": "token-example-42",
  "scope": "orders:read"
}
```

[RFC 9068](https://www.rfc-editor.org/rfc/rfc9068.html#section-2) requires a signed token, the access-token type, and claims including `iss`, `sub`, `aud`, `exp`, `iat`, `jti`, and `client_id`. Other profiles differ. A generic `typ: JWT` alone does not distinguish access tokens from ID tokens.

## Validate before authorizing

Use a maintained verifier or resource-server framework. Configure policy independently of incoming tokens:

1. Accept only the intended token format and profile. Reject malformed input and unsupported critical header parameters.
2. Allow only configured algorithms and compatible keys. Reject `alg: none` for signed bearer access tokens; never let the header choose verification policy.
3. Verify with keys belonging to the trusted issuer. Treat `kid` as an untrusted selector, never as a file path or query fragment.
4. Require and validate issuer, audience, expiry, and the profile's other mandatory claims. Check `nbf` when present. Bound clock leeway.
5. Enforce the expected token kind with distinct validation rules. Only then use claims to check scopes, roles, tenant boundaries, and object ownership.

This separates cryptographic verification, claim validation, and application authorization. See [JWT security guidance](https://www.rfc-editor.org/rfc/rfc8725.html#section-3).

## Keys and rotation

A JWK[^jwk] represents a key; a JWKS[^jwks] contains a `keys` array. A public signing-key set must not expose private keys or shared secrets. The `kid` header helps select a matching key but is not proof of trust. See [key-set format](https://www.rfc-editor.org/rfc/rfc7517.html#section-5).

Asymmetric signing lets an issuer retain its private key while verifiers receive public keys. With a shared-secret algorithm, every verifier holding the secret can also mint tokens. Use high-entropy generated secrets, not passwords, and prevent asymmetric/shared-secret algorithm confusion. See [algorithm and key guidance](https://www.rfc-editor.org/rfc/rfc8725.html#section-3.1).

Operational checklist:

- Configure a trusted issuer/key endpoint. Do not fetch arbitrary token-supplied `jku` or `x5u` URLs[^url].
- Cache keys and bound refresh attempts; repeated unknown `kid` values must not cause unlimited outbound requests.
- For planned rotation, publish the new key before signing with it. Keep the old verification key through the last old token's expiry plus leeway.
- For compromise, use an emergency rejection plan. Removing a published key does not instantly remove cached copies from verifiers.

## Transport, storage, and logout

Send bearer access tokens in the HTTP[^http] `Authorization` header over TLS[^tls]. Keep tokens out of query strings, logs, and shared online decoders. A stolen bearer token can be replayed until rejected; a valid signature does not identify the current holder. See [bearer-token usage](https://www.rfc-editor.org/rfc/rfc6750.html#section-2.1).

Browser storage is a design decision: `localStorage` exposes tokens to XSS[^xss]; an `HttpOnly` cookie prevents script reads but still needs CSRF[^csrf] protection when used for authentication. `Secure` and appropriate `SameSite` settings matter. A server session can keep upstream tokens out of browser storage. See [browser session guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

Deleting a client token logs that client out locally; it does not invalidate copies. Short access-token lifetimes limit exposure. Earlier rejection requires a server-side mechanism such as a denylist or active-token check, with deliberate cache behavior. Refresh-token revocation prevents renewal but does not inherently cancel existing access tokens. Public clients need refresh-token rotation or sender-constrained refresh tokens. See [refresh-token protection](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14).

## Troubleshooting and verification

| Symptom | Inspect |
|---------|---------|
| Decodes successfully but is rejected | Signature, allowed algorithm, token kind, issuer, audience |
| Newly issued token fails | Seconds versus milliseconds, clock drift, `nbf`, stale key cache |
| Failure after key rotation | New key publication, `kid`, refresh errors, old-key retention |
| Login succeeds but resource access fails | Access versus ID token, target audience, permissions and ownership |
| Logout leaves requests working | Token copies, expiry, revocation mechanism and cache delay |

For your implementation, exercise valid access, a changed payload, wrong key/issuer/audience, missing required claims, expired and future-dated tokens, unexpected token type, key rotation, and insufficient permissions. A mocked authenticated principal cannot prove token validation.

## References

- [RFC 7519 — JWT format and claims](https://www.rfc-editor.org/rfc/rfc7519.html)
- [RFC 7515 — JWS](https://www.rfc-editor.org/rfc/rfc7515.html)
- [RFC 7517 — JWK and key sets](https://www.rfc-editor.org/rfc/rfc7517.html)
- [RFC 8725 — JWT security guidance](https://www.rfc-editor.org/rfc/rfc8725.html)
- [RFC 9068 — JWT access-token profile](https://www.rfc-editor.org/rfc/rfc9068.html)
- [RFC 6750 — bearer-token usage](https://www.rfc-editor.org/rfc/rfc6750.html)
- [RFC 9700 — OAuth security guidance](https://www.rfc-editor.org/rfc/rfc9700.html)
- [OWASP[^owasp] — session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

[^jwt]: JSON Web Token; JSON means JavaScript Object Notation — a format for carrying claims between parties.
[^rfc]: Request for Comments — a document in the Internet technical specification series.
[^oauth]: Open Authorization — a framework for delegated access.
[^id]: Identifier; an ID token carries identity claims for the client application.
[^api]: Application Programming Interface — the contract through which software components interact.
[^jws]: JSON Web Signature — a structure protecting content with a digital signature or message authentication code.
[^jwe]: JSON Web Encryption — a structure for encrypted content.
[^json]: JavaScript Object Notation — a structured data format.
[^rs256]: An algorithm identifier for Rivest–Shamir–Adleman signatures using Public-Key Cryptography Standards #1 version 1.5 padding and Secure Hash Algorithm 256-bit hashing.
[^jwk]: JSON Web Key — a JSON representation of a cryptographic key.
[^jwks]: JSON Web Key Set — a collection of JSON Web Keys.
[^url]: Uniform Resource Locator — a resource address.
[^http]: Hypertext Transfer Protocol.
[^tls]: Transport Layer Security — protects traffic in transit and authenticates the connection's peer.
[^xss]: Cross-Site Scripting — attacker-controlled script execution in a site's browser context.
[^csrf]: Cross-Site Request Forgery — unwanted requests made using credentials a browser attaches automatically.
[^owasp]: Open Worldwide Application Security Project.

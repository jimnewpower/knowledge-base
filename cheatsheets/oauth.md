# OAuth[^oauth] and OAuth 2.0 cheat sheet

> Baseline: OAuth 2.0 (RFC[^rfc] 6749) with RFC 9700 security guidance, PKCE[^pkce] (RFC 7636), and OpenID Connect 1.0; OAuth 1.0a comparison only. Reviewed: 2026-09-25.

Use this when choosing an authorization flow, registering a client, or diagnosing redirects and token exchanges. OAuth lets an application obtain limited access to a resource on behalf of a user or itself.

Related: [authentication](authentication.md), [authorization](authorization.md), [JWT[^jwt] validation](jwt.md), [Microsoft Entra](entra-id.md), and [Spring Security](spring-security.md).

## Names that are easy to confuse

| Term | What it provides |
|------|------------------|
| OAuth 1.0a | Earlier protocol with per-request signature machinery, token secrets, nonces, and timestamps; use for integrations that require it |
| OAuth 2.0 / OAuth2 | Authorization framework with multiple grants; not wire-compatible with OAuth 1.0a |
| OpenID Connect (OIDC)[^oidc] | Authentication layer over OAuth 2.0; adds an ID[^id] token and identity claims |
| JWT | Token format; OAuth access tokens can also be opaque |
| OAuth 2.1 | Consolidates modern OAuth practices; draft revision 16 is an Internet-Draft at this review date, not a published RFC |

OAuth 2.0 alone does not define a user-login result. Use OIDC for sign-in, and send the API[^api] an access token intended for it, not the ID token. See [OIDC Core](https://openid.net/specs/openid-connect-core-1_0.html#Overview), [OAuth 1.0](https://www.rfc-editor.org/rfc/rfc5849.html), and [OAuth 2.1 status](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/).

## Roles, endpoints, and credentials

| Role | Responsibility | Example |
|------|----------------|---------|
| Resource owner | Can authorize access | Person granting access to orders |
| Client | Requests and uses access | Web application or desktop application |
| Authorization server | Handles authorization and issues tokens | Identity/authorization service |
| Resource server | Validates tokens and enforces permissions | Orders API |

The **authorization endpoint** handles browser interaction. The **token endpoint** exchanges grants for tokens. The **redirect URI[^uri]** is the client's registered callback. Endpoint paths are provider-specific. See [OAuth roles and endpoints](https://www.rfc-editor.org/rfc/rfc6749.html#section-1.1).

A **public client**, such as a browser-only or installed application, cannot keep a distributed client secret confidential. A **confidential client** runs where it can protect credentials. `client_id` identifies a registration; it is not a secret. PKCE binds a code exchange to the initiating client instance; it does not replace confidential-client authentication.

## Choose a flow

| Situation | Flow | Key constraint |
|-----------|------|----------------|
| Interactive web application | Authorization code + PKCE | Confidential servers also authenticate at the token endpoint |
| Browser-only application | Authorization code + PKCE | Public client; no embedded secret |
| Desktop/mobile application | Authorization code + PKCE | Use the system browser and platform-appropriate redirect handling |
| Background service acting as itself | Client credentials | Confidential client; no user identity or user consent flow |
| Device with limited input | Device authorization grant | User authorizes in another browser; device polls within server limits |
| Renew an existing grant | Refresh token | Only when issued and allowed by server policy |
| Implicit or password grant | Avoid implicit; do not use password grant | Current guidance replaces these older patterns |

Use [native-app guidance](https://www.rfc-editor.org/rfc/rfc8252.html) for desktop/mobile redirects; avoid embedded login webviews. A shipped secret does not turn an installed app into a confidential client. For device flows, handle `authorization_pending` and `slow_down`, and stop on denial or expiry as specified by [device authorization](https://www.rfc-editor.org/rfc/rfc8628.html). Grant choices and restrictions follow [current OAuth security guidance](https://www.rfc-editor.org/rfc/rfc9700.html#section-2).

## Authorization code with PKCE

1. Client creates fresh transaction values: a random `state` and `code_verifier`; add a `nonce` for the OIDC flow described here. Store them against the initiating browser session/transaction.
2. Send the browser to the trusted authorization endpoint with the client identifier, registered redirect, requested scopes, and derived `code_challenge` using `S256`.
3. Authorization server authenticates the user and obtains authorization according to its policy, then redirects back with a short-lived code and the original `state`.
4. Client checks the transaction and expected issuer before exchanging the code. Send the code, original redirect, and `code_verifier` to the trusted token endpoint; confidential clients also authenticate using their registered method.
5. Server verifies the code and challenge binding, then issues tokens. With OIDC, the client validates the ID token before creating a login session. The resource server independently validates access and permissions on every call.

PKCE uses `code_challenge = base64url(SHA256(code_verifier))`, without padding. SHA[^sha]-256 is the hash used by `S256`. The verifier is a fresh, cryptographically random string of 43–128 allowed characters; let the client library generate and retain it. See [PKCE protocol](https://www.rfc-editor.org/rfc/rfc7636.html#section-4).

| Value | Purpose | Check |
|-------|---------|-------|
| `state` | Correlates the callback with the initiating transaction; helps prevent CSRF[^csrf] | Match the stored unpredictable value and consume the transaction once |
| PKCE verifier | Binds code redemption to the client that initiated it | Authorization server checks against the stored challenge |
| OIDC `nonce` | Binds the ID token to the authentication request | Client checks the claim in the validated ID token against its stored value |

These values have different jobs. A valid `state` does not validate an ID token; PKCE does not prevent replay of an already stolen bearer access token. See [OIDC code-flow validation](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth).

### Request anatomy

Illustrative public-client OIDC request fragments, not executable commands. The provider must support the registered callback and `orders:read` scope. Replace angle-bracket placeholders with fresh values; form/query encoding is required. Line breaks in parameter lists are for readability.

Authorization request via the browser:

```text
GET https://identity.example.com/authorize
  ?response_type=code
  &client_id=orders-client
  &redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback
  &scope=openid%20profile%20orders%3Aread
  &state=<random-transaction-value>
  &nonce=<random-identity-value>
  &code_challenge=<derived-challenge>
  &code_challenge_method=S256
```

Token exchange over HTTP[^http] protected by TLS[^tls]:

```text
POST https://identity.example.com/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id=orders-client
&code=<returned-code>
&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback
&code_verifier=<original-verifier>
```

`openid` requests OIDC; remove it, `profile`, and `nonce` for a pure OAuth authorization example. A confidential client's exchange additionally needs its registered authentication method. Never put a client secret in the browser authorization request. See [authorization-code exchange](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1).

## Tokens, scopes, and lifecycle

| Item | Recipient | Meaning |
|------|-----------|---------|
| Authorization code | Token endpoint | Short-lived, single-use exchange credential |
| Access token | Resource server | Permission to call the intended resource within granted scope |
| Refresh token | Authorization server | Credential for obtaining replacement access tokens |
| ID token | OIDC client | Authentication result for that client |

Scopes describe granted access; audience identifies the intended recipient. Scope names and resource-selection parameters depend on the provider. An `orders:read` scope does not grant access to every customer's orders: enforce tenant and object ownership separately.

For an opaque access token, a resource server can use an authenticated [introspection endpoint](https://www.rfc-editor.org/rfc/rfc7662.html#section-2) to check `active` and authorization metadata. Cache duration affects how soon policy changes take effect. For JWT access tokens, follow the [JWT validation checklist](jwt.md#validate-before-authorizing). Clients should treat access tokens as opaque rather than depend on their internal claims.

Protect refresh tokens as credentials. Public clients must use rotation or sender-constrained refresh tokens under [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14). Serialize refresh attempts and replace stored tokens atomically; competing refreshes can reuse an old token and trigger replay detection.

Local logout, token revocation, and identity-provider logout have separate effects. [Token revocation](https://www.rfc-editor.org/rfc/rfc7009.html) can invalidate a refresh grant, but cancellation of already-issued access tokens depends on server policy and enforcement. A locally verified JWT may remain usable until expiry unless the resource server checks additional revocation state.

## Security and troubleshooting

Use maintained protocol libraries, trusted issuer metadata, narrow scopes, and exact registered redirect matching, subject to the native-loopback port exception. Keep credentials, codes, and tokens out of logs and resource-request query strings. Retain transaction correlation, issuer checks, and replay defenses even when using PKCE. See [redirect protection](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.1).

| Symptom | Inspect |
|---------|---------|
| Redirect rejected | Registration, exact scheme/host/path, proxy configuration, native redirect rules |
| `invalid_client` | Client registration, credential expiry, authentication method; public versus confidential type |
| `invalid_grant` | Expired/reused code, redirect mismatch, wrong verifier, revoked/reused refresh token |
| `invalid_scope` | Provider's scope names, resource, consent and application permissions |
| Login succeeds; API rejects | Access versus ID token, target audience, scope, expiry and object permissions |
| Repeated consent/login prompts | Requested scope, session policy, refresh issuance/storage and provider settings |
| Device polling never completes | Poll interval, `slow_down`, denied consent and device-code expiry |

Test cancellation, altered/missing transaction values, reused codes, wrong verifier, wrong issuer/audience, denied permissions, refresh races, and logout behavior with your provider. Unit tests with a mocked principal cannot prove the redirect/token-exchange boundary.

## References

- [RFC 6749 — OAuth 2.0](https://www.rfc-editor.org/rfc/rfc6749.html)
- [RFC 9700 — OAuth security guidance](https://www.rfc-editor.org/rfc/rfc9700.html)
- [RFC 7636 — PKCE](https://www.rfc-editor.org/rfc/rfc7636.html)
- [RFC 8252 — native applications](https://www.rfc-editor.org/rfc/rfc8252.html)
- [RFC 8628 — device authorization](https://www.rfc-editor.org/rfc/rfc8628.html)
- [RFC 7662 — token introspection](https://www.rfc-editor.org/rfc/rfc7662.html)
- [RFC 7009 — token revocation](https://www.rfc-editor.org/rfc/rfc7009.html)
- [OpenID Connect Core 1.0, errata set 2](https://openid.net/specs/openid-connect-core-1_0.html)
- [RFC 5849 — OAuth 1.0](https://www.rfc-editor.org/rfc/rfc5849.html)
- [OAuth 2.1 draft status](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)

[^oauth]: Open Authorization — a framework for delegated access.
[^rfc]: Request for Comments — a document in the Internet technical specification series.
[^pkce]: Proof Key for Code Exchange — binds authorization-code redemption to a verifier created by the initiating client.
[^jwt]: JSON Web Token; JSON means JavaScript Object Notation — a format for carrying claims.
[^oidc]: OpenID Connect — an authentication layer over OAuth 2.0.
[^id]: Identifier; an ID token carries identity claims for the client application.
[^api]: Application Programming Interface — the contract through which software components interact.
[^uri]: Uniform Resource Identifier — identifies a resource; the redirect URI names the client's callback.
[^sha]: Secure Hash Algorithm.
[^csrf]: Cross-Site Request Forgery — unwanted requests made using a user's browser context or automatically attached credentials.
[^http]: Hypertext Transfer Protocol.
[^tls]: Transport Layer Security — protects traffic in transit and authenticates the connection's peer.

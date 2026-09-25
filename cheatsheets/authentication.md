# Authentication cheat sheet

> Baseline: OAuth[^oauth] 2.0 security BCP[^bcp] (RFC[^rfc] 9700), OpenID Connect 1.0, and browser sessions. Reviewed: 2026-09-24.

Authentication answers **who is this?** Authorization answers **what may they do?** Keep the two separate in design and in code. See [authorization.md](authorization.md).

## Building blocks

| Term | Meaning |
|------|---------|
| Principal | The actor (user, service, device) |
| Credential | Secret or proof used to authenticate (password, key, assertion) |
| Subject | Identifier inside a token or session (`sub`) |
| Session | Server-side record of an authenticated principal |
| Token | Client-held assertion the server can verify |
| Identity provider (IdP) | Issues and validates authentications (Keycloak, Entra ID[^id], Cognito, an internal SSO[^sso]) |

## Common patterns

### Session cookie (browser apps)

1. User submits credentials to the app or IdP.
2. Server creates a session, stores it server-side.
3. Browser holds an `HttpOnly; Secure; SameSite` cookie with the session id.
4. CSRF[^csrf] protection is required for cookie-authenticated mutating requests.

Fits server-rendered and same-site web apps. Do not store the session blob in a non-`HttpOnly` cookie.

### Bearer tokens (APIs[^api])

Client sends `Authorization: Bearer <token>` on each request. The API is stateless with respect to login *if* it can validate the token locally or via introspection.

### HTTP[^http] Basic

`Authorization: Basic base64(user:pass)` on every request. Acceptable only over TLS[^tls] and usually only for machine clients or break-glass. Passwords in logs and proxies are the failure mode.

### Mutual TLS

Client presents a certificate. Strong for service-to-service inside a mesh or closed network. Certificate lifecycle becomes the operational problem.

### API keys

A static secret identifying a *client*, not a person. Fine for low-stakes server-to-server. Rotate. Scope narrowly. Do not embed in mobile apps or public SPAs[^spa].

## OAuth 2 / OpenID Connect (practical view)

OAuth 2 is **delegation**: an authorization server issues an access token so a client can call an API on behalf of a user or itself. OpenID Connect adds an **ID token** (JWT[^jwt]) that authenticates the user to the client.

| Grant | Who uses it |
|-------|-------------|
| Authorization code + PKCE[^pkce] | Browser and mobile user login (default) |
| Client credentials | Service-to-service |
| Refresh token | Silent renewal after code flow |
| Device code | Limited-input devices |
| Implicit / password | Legacy. Do not start new systems on these |

Access token: what the *API* consumes.  
ID token: what the *client application* consumes to establish a user session. APIs should not treat an ID token as an access token unless that is an explicit, documented exception.

## JWT, briefly

See the [JWT cheat sheet](jwt.md) for claim meanings, validation steps, key rotation, and troubleshooting.

A signed JWT in JWS[^jws] compact form has three dot-separated base64url parts: header, payload, signature. An encrypted JWT in JWE[^jwe] compact form has five parts; use a library implementing the expected token profile.

Validate at least:

- signature (and algorithm allow-list; reject `alg=none`)
- `iss`, `aud`, `exp`, and usually `nbf`
- that the token is the *kind* you expected (access vs id)

Do not put secrets or unnecessary PII[^pii] in the payload. It is encoded, not encrypted, unless you are using JWE.

Opaque tokens plus introspection trade local validation for the ability to revoke immediately.

## Passwords (when you must store them)

- Hash with Argon2id or bcrypt; never reversible encryption, never SHA[^sha]-256 alone.
- Per-password salt (the algorithm should do this).
- Rate-limit attempts. Add MFA[^mfa] for human accounts of any value.
- Reset flows expire quickly and invalidate the token after use.

## Service identity

| Mechanism | Notes |
|-----------|-------|
| Client credentials | OAuth client id + secret or signed JWT assertion |
| mTLS[^mtls] | Strong binding to workload identity |
| Cloud workload identity | Prefer over long-lived static keys in AWS[^aws]/Azure/GCP[^gcp] |
| SPIFFE[^spiffe] / mesh identity | Short-lived SVIDs[^svid] between services |

Static keys in config maps are an incident waiting for a dump.

## Design rules

1. TLS everywhere that credentials or tokens travel.
2. Short-lived access tokens; rotate refresh tokens; make revocation a planned path.
3. One identity pipeline per app — do not mix session cookies and hand-rolled JWTs without a written reason.
4. Log authentication *events* (success/failure, subject, method). Do not log secrets or full tokens.
5. Clock skew: allow a small leeway when validating `exp`.

## Gotchas

- Putting JWTs in `localStorage` exposes them to XSS[^xss]. Prefer memory + refresh cookie, or a BFF[^bff].
- “Stateless JWT” does not mean “cannot revoke.” It means revocation is harder (deny list, short TTL[^ttl]).
- Authenticating a user is not authorization to every resource they can guess the URL[^url] of.

## References

- [RFC 9700 — OAuth 2.0 security best current practice](https://www.rfc-editor.org/rfc/rfc9700.html)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [OWASP — password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)[^owasp]

[^oauth]: Open Authorization — a framework for delegated access.
[^bcp]: Best Current Practice — a series of Internet standards guidance documents.
[^rfc]: Request for Comments — a document in the Internet technical specification series.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).
[^sso]: Single Sign-On.
[^csrf]: Cross-Site Request Forgery.
[^api]: Application Programming Interface — the contract through which software components interact.
[^http]: Hypertext Transfer Protocol.
[^tls]: Transport Layer Security — encrypts traffic and authenticates the connection's peer.
[^spa]: Single-Page Application.
[^jwt]: JSON Web Token; JSON means JavaScript Object Notation.
[^pkce]: Proof Key for Code Exchange.
[^jws]: JSON Web Signature; JSON means JavaScript Object Notation.
[^jwe]: JSON Web Encryption; JSON means JavaScript Object Notation.
[^pii]: Personally Identifiable Information.
[^sha]: Secure Hash Algorithm.
[^mfa]: Multi-Factor Authentication.
[^mtls]: Mutual Transport Layer Security — both peers authenticate with certificates.
[^aws]: Amazon Web Services.
[^gcp]: Google Cloud Platform.
[^spiffe]: Secure Production Identity Framework for Everyone.
[^svid]: SPIFFE Verifiable Identity Document; SPIFFE means Secure Production Identity Framework for Everyone.
[^xss]: Cross-Site Scripting.
[^bff]: Backend for Frontend.
[^ttl]: Time To Live.
[^url]: Uniform Resource Locator.
[^owasp]: Open Worldwide Application Security Project.

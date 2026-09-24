# Authentication cheat sheet

Authentication answers **who is this?** Authorization answers **what may they do?** Keep the two separate in design and in code. See [authorization.md](authorization.md).

## Building blocks

| Term | Meaning |
|------|---------|
| Principal | The actor (user, service, device) |
| Credential | Secret or proof used to authenticate (password, key, assertion) |
| Subject | Identifier inside a token or session (`sub`) |
| Session | Server-side record of an authenticated principal |
| Token | Client-held assertion the server can verify |
| Identity provider (IdP) | Issues and validates authentications (Keycloak, Entra ID, Cognito, an internal SSO) |

## Common patterns

### Session cookie (browser apps)

1. User submits credentials to the app or IdP.
2. Server creates a session, stores it server-side.
3. Browser holds an `HttpOnly; Secure; SameSite` cookie with the session id.
4. CSRF protection is required for cookie-authenticated mutating requests.

Fits server-rendered and same-site web apps. Do not store the session blob in a non-`HttpOnly` cookie.

### Bearer tokens (APIs)

Client sends `Authorization: Bearer <token>` on each request. The API is stateless with respect to login *if* it can validate the token locally or via introspection.

### HTTP Basic

`Authorization: Basic base64(user:pass)` on every request. Acceptable only over TLS and usually only for machine clients or break-glass. Passwords in logs and proxies are the failure mode.

### Mutual TLS

Client presents a certificate. Strong for service-to-service inside a mesh or closed network. Certificate lifecycle becomes the operational problem.

### API keys

A static secret identifying a *client*, not a person. Fine for low-stakes server-to-server. Rotate. Scope narrowly. Do not embed in mobile apps or public SPAs.

## OAuth 2.1 / OpenID Connect (practical view)

OAuth 2 is **delegation**: an authorization server issues an access token so a client can call an API on behalf of a user or itself. OpenID Connect adds an **ID token** (JWT) that authenticates the user to the client.

| Grant | Who uses it |
|-------|-------------|
| Authorization code + PKCE | Browser and mobile user login (default) |
| Client credentials | Service-to-service |
| Refresh token | Silent renewal after code flow |
| Device code | Limited-input devices |
| Implicit / password | Legacy. Do not start new systems on these |

Access token: what the *API* consumes.  
ID token: what the *client application* consumes to establish a user session. APIs should not treat an ID token as an access token unless that is an explicit, documented exception.

## JWT, briefly

A JWT is three base64url parts: header, payload, signature.

Validate at least:

- signature (and algorithm allow-list; reject `alg=none`)
- `iss`, `aud`, `exp`, and usually `nbf`
- that the token is the *kind* you expected (access vs id)

Do not put secrets or unnecessary PII in the payload. It is encoded, not encrypted, unless you are using JWE.

Opaque tokens plus introspection trade local validation for the ability to revoke immediately.

## Passwords (when you must store them)

- Hash with Argon2id or bcrypt; never reversible encryption, never SHA-256 alone.
- Per-password salt (the algorithm should do this).
- Rate-limit attempts. Add MFA for human accounts of any value.
- Reset flows expire quickly and invalidate the token after use.

## Service identity

| Mechanism | Notes |
|-----------|-------|
| Client credentials | OAuth client id + secret or signed JWT assertion |
| mTLS | Strong binding to workload identity |
| Cloud workload identity | Prefer over long-lived static keys in AWS/Azure/GCP |
| SPIFFE / mesh identity | Short-lived SVIDs between services |

Static keys in config maps are an incident waiting for a dump.

## Design rules

1. TLS everywhere that credentials or tokens travel.
2. Short-lived access tokens; rotate refresh tokens; make revocation a planned path.
3. One identity pipeline per app — do not mix session cookies and hand-rolled JWTs without a written reason.
4. Log authentication *events* (success/failure, subject, method). Do not log secrets or full tokens.
5. Clock skew: allow a small leeway when validating `exp`.

## Gotchas

- Putting JWTs in `localStorage` exposes them to XSS. Prefer memory + refresh cookie, or a BFF.
- “Stateless JWT” does not mean “cannot revoke.” It means revocation is harder (deny list, short TTL).
- Authenticating a user is not authorization to every resource they can guess the URL of.

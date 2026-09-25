# Microsoft Entra ID[^id], SSO[^sso], and JWT[^jwt] cheat sheet

> Baseline: Microsoft identity platform OAuth[^oauth] 2.0 / OpenID Connect, workforce tenants, and registered custom APIs[^api]. Reviewed: 2026-09-25.

Single sign-on reuses an identity-provider login. Each application still needs its own session/token handling and authorization policy.

Related: [authentication](authentication.md), [JWT](jwt.md), [authorization](authorization.md), [Spring Security](spring-security.md), [Azure](azure.md).

## Objects and flows

| Term / scenario | Meaning / choice |
|-----------------|------------------|
| App registration | Application definition: client ID, redirect URIs[^uri], exposed permissions |
| Service principal / enterprise application | Tenant-local instance with assignments and consent |
| Delegated permission | Application acts with a signed-in user; API checks scopes and user/resource rights |
| Application permission | Application acts as itself; API checks assigned application permissions/roles |
| Interactive browser/desktop/mobile login | Authorization code with PKCE[^pkce] via a maintained identity library |
| Server daemon | Client credentials using an appropriate confidential credential or federation |
| Managed Azure workload | Managed identity where the target service supports it |

A public SPA[^spa] or desktop app cannot protect a shared client secret. Register exact redirect URIs and keep development/production registrations or redirect policy deliberate. A server login session and an API bearer token are different boundaries.

## API validation checklist

Use a maintained resource-server library configured for the expected tenant/issuer and API audience. Validate signature against trusted issuer metadata/keys, allowed algorithms, issuer, audience, expiry and not-before. Configure bounded clock skew and key refresh. Never build the key URL[^url] from an untrusted token field.

The API accepts an **access token intended for that API**. An ID token authenticates the client application's session, and a Microsoft Graph token has a different resource audience. Clients should treat access tokens as opaque; custom APIs validate tokens issued for themselves.

After validation, check delegated `scp` or application `roles` as appropriate and enforce resource/tenant ownership. Token validity alone grants no access to arbitrary records. Token versions and issuer metadata must agree; do not infer the token version only from which authorization endpoint the client used.

## SSO and operational failures

| Symptom | Inspect |
|---------|---------|
| Redirect mismatch | Registered URI, scheme/host/path, proxy-forwarded URL |
| Login succeeds; API rejects | Access versus ID token, audience, tenant, scopes/roles |
| Works in one tenant only | Tenant policy, service principal, consent and assignments |
| Repeated interactive prompts | Conditional Access, session/token cache, clock, refresh handling |
| User renamed or email changed | Stable issuer/subject or tenant/object identifiers; avoid email as the authority key |

Local logout, identity-provider logout, and invalidating already issued tokens have different effects. Test token expiry, key rotation, denied consent, missing permission, and tenant separation. Capture correlation IDs and error codes; keep tokens and authorization codes out of logs.

## References

- [Microsoft identity authorization code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
- [Microsoft access-token ownership and validation](https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens)
- [Microsoft application and service-principal objects](https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals)

[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).
[^sso]: Single Sign-On.
[^jwt]: JSON Web Token; JSON means JavaScript Object Notation.
[^oauth]: Open Authorization — a framework for delegated access.
[^api]: Application Programming Interface — the contract through which software components interact.
[^uri]: Uniform Resource Identifier.
[^pkce]: Proof Key for Code Exchange.
[^spa]: Single-Page Application.
[^url]: Uniform Resource Locator.

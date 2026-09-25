# Application security cheat sheet

> Baseline: Browser applications and Java services; adapt controls to the application threat model. Reviewed: 2026-09-24.

Security for people who *build* the software. Not a pentest playbook. Goal: default-safe design, fewer classes of bug, faster review.

Related: [authentication.md](authentication.md), [authorization.md](authorization.md), [http-and-tls.md](http-and-tls.md).

## Threats that show up in application code

OWASP[^owasp]-style classes, in builder language:

| Class | Typical miss |
|-------|----------------|
| Injection | SQL[^sql]/OS[^os]/template strings built with user text |
| Broken authn | Session fixation, weak reset, tokens in logs |
| Broken authz | Checked the route, not the object |
| Insecure design | No threat model; admin debug left on |
| Misconfiguration | Default passwords, actuator open, directory listing |
| Vulnerable components | Unpinned, unpatched dependencies |
| Integrity failures | Unsigned artifacts, untrusted deserialization |
| Logging / alerting gaps | No audit of admin actions; secrets in logs |
| SSRF[^ssrf] | Server fetches a user-supplied URL[^url] |
| XSS[^xss] | Unescaped HTML[^html] in a page that reflects input |

## Input and output

- Parse, then validate against a schema ([openapi-and-json-schema.md](openapi-and-json-schema.md)).
- Parameterized SQL only. Never `WHERE id = '" + id + "'`.
- Encode at the edge that needs it (HTML encode for HTML, not twice).
- Treat uploaded files as hostile: size cap, type allow-list, store outside the web root, generated names.

## Authn and authz (minimum bar)

- TLS[^tls] for anything with credentials ([http-and-tls.md](http-and-tls.md)).
- Server-side authorization on every object id the client can guess ([authorization.md](authorization.md)).
- Short-lived tokens; store refresh material carefully ([authentication.md](authentication.md)).
- Enable framework CSRF[^csrf] protection for cookie-authenticated mutations. Treat `SameSite` as additional protection; replacing tokens requires a documented alternative and threat model, including sibling subdomains.
- Lock out / rate-limit login and reset.

## Secrets and config

- Secrets in a manager or platform mount, not Git, not the image layer.
- Different secrets per environment.
- Rotate with a runbook. Know who can read prod.
- `.env` files are local conveniences; they are not a production design.

## Dependencies and supply chain

```bash
./mvnw -q org.owasp:dependency-check-maven:check
./mvnw -q versions:display-dependency-updates
```

- Pin versions. Read changelogs on major bumps.
- Generate an SBOM[^sbom] in CI[^ci] ([devops.md](devops.md)).
- Do not run `curl | sudo bash` in a Dockerfile.
- Java serialization of untrusted bytes is a historic RCE[^rce] class. Do not.

## Web and HTTP[^http] hardening

| Control | Why |
|---------|-----|
| `Secure; HttpOnly; SameSite` cookies | Cut theft and CSRF surface |
| CSP[^csp] | Limit where scripts load |
| HSTS[^hsts] | Clients remember HTTPS[^https] |
| Disable unused actuator routes | `/env` is a secret dump |
| CORS[^cors] allow-list | `*` plus cookies is a mistake |

## Safe defaults in Java services

- Bean Validation on request bodies.
- Central error handler that does not leak stack traces to users.
- Prepared statements / named parameters (JDBC[^jdbc], MyBatis).
- Resolve untrusted paths against an allowed root, normalize, and verify containment. Normalization alone does not reject escapes; account for symlinks and races when attackers can modify the filesystem.
- Redirects only to allow-listed hosts.

## Review questions

1. Who is the principal on this request?
2. Why may they touch *this* row?
3. Where did this string come from, and which interpreter sees it next?
4. What is logged, and is any of it a secret?
5. What happens if this dependency is down or hostile?

## Gotchas

- Hiding a button in the UI[^ui] and calling that authorization.
- Logging request bodies “just in case.”
- Opening actuator or swagger UI on the public route.
- `TrustManager` that accepts every certificate “for local.”
- Treating internal network as a security boundary with no authn between services.

## References

- [OWASP — CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP — Java security](https://cheatsheetseries.owasp.org/cheatsheets/Java_Security_Cheat_Sheet.html)

[^owasp]: Open Worldwide Application Security Project.
[^sql]: Structured Query Language.
[^os]: Operating System.
[^ssrf]: Server-Side Request Forgery.
[^url]: Uniform Resource Locator.
[^xss]: Cross-Site Scripting.
[^html]: Hypertext Markup Language.
[^tls]: Transport Layer Security — encrypts traffic and authenticates the connection's peer.
[^csrf]: Cross-Site Request Forgery.
[^sbom]: Software Bill of Materials.
[^ci]: Continuous Integration.
[^rce]: Remote Code Execution.
[^http]: Hypertext Transfer Protocol.
[^csp]: Content Security Policy.
[^hsts]: HTTP Strict Transport Security; HTTP means Hypertext Transfer Protocol.
[^https]: Hypertext Transfer Protocol Secure — web communication over an encrypted, authenticated connection.
[^cors]: Cross-Origin Resource Sharing.
[^jdbc]: Java Database Connectivity.
[^ui]: User Interface.

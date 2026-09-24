# Application security cheat sheet

Security for people who *build* the software. Not a pentest playbook. Goal: default-safe design, fewer classes of bug, faster review.

Related: [authentication.md](authentication.md), [authorization.md](authorization.md), [http-and-tls.md](http-and-tls.md).

## Threats that show up in application code

OWASP-style classes, in builder language:

| Class | Typical miss |
|-------|----------------|
| Injection | SQL/OS/template strings built with user text |
| Broken authn | Session fixation, weak reset, tokens in logs |
| Broken authz | Checked the route, not the object |
| Insecure design | No threat model; admin debug left on |
| Misconfiguration | Default passwords, actuator open, directory listing |
| Vulnerable components | Unpinned, unpatched dependencies |
| Integrity failures | Unsigned artifacts, untrusted deserialization |
| Logging / alerting gaps | No audit of admin actions; secrets in logs |
| SSRF | Server fetches a user-supplied URL |
| XSS | Unescaped HTML in a page that reflects input |

## Input and output

- Parse, then validate against a schema ([openapi-and-json-schema.md](openapi-and-json-schema.md)).
- Parameterized SQL only. Never `WHERE id = '" + id + "'`.
- Encode at the edge that needs it (HTML encode for HTML, not twice).
- Treat uploaded files as hostile: size cap, type allow-list, store outside the web root, generated names.

## Authn and authz (minimum bar)

- TLS for anything with credentials ([http-and-tls.md](http-and-tls.md)).
- Server-side authorization on every object id the client can guess ([authorization.md](authorization.md)).
- Short-lived tokens; store refresh material carefully ([authentication.md](authentication.md)).
- CSRF tokens or `SameSite` policy for cookie sessions.
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
- Generate an SBOM in CI ([devops.md](devops.md)).
- Do not run `curl | sudo bash` in a Dockerfile.
- Java serialization of untrusted bytes is a historic RCE class. Do not.

## Web and HTTP hardening

| Control | Why |
|---------|-----|
| `Secure; HttpOnly; SameSite` cookies | Cut theft and CSRF surface |
| CSP | Limit where scripts load |
| HSTS | Clients remember HTTPS |
| Disable unused actuator routes | `/env` is a secret dump |
| CORS allow-list | `*` plus cookies is a mistake |

## Safe defaults in Java services

- Bean Validation on request bodies.
- Central error handler that does not leak stack traces to users.
- Prepared statements / named parameters (JDBC, MyBatis).
- Path normalization when touching the filesystem (`../` escapes).
- Redirects only to allow-listed hosts.

## Review questions

1. Who is the principal on this request?
2. Why may they touch *this* row?
3. Where did this string come from, and which interpreter sees it next?
4. What is logged, and is any of it a secret?
5. What happens if this dependency is down or hostile?

## Gotchas

- Hiding a button in the UI and calling that authorization.
- Logging request bodies “just in case.”
- Opening actuator or swagger UI on the public route.
- `TrustManager` that accepts every certificate “for local.”
- Treating internal network as a security boundary with no authn between services.

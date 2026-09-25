# HTTP[^http] and TLS[^tls] cheat sheet

> Baseline: RFC[^rfc] 9110 semantics, HTTP/1.1 example syntax, TLS 1.2/1.3, and browser cookie rules. Reviewed: 2026-09-24.

HTTP is the application protocol. TLS is the encrypted tunnel it almost always rides on. REST[^rest] ([rest-apis.md](rest-apis.md)) is a style on top of HTTP.

## HTTP message

Separate request and response header excerpts; the response body is omitted:

```http
GET /api/v1/orders/4821 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer ...
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

Request line: method, target, version. Headers are name/value. Body is optional and typed by `Content-Type`.

HTTP/1.1 uses textual headers and persistent connections by default. HTTP/2 multiplexes binary streams, normally over TLS in browser deployments. HTTP/3 uses QUIC[^quic] over UDP[^udp] with TLS 1.3 integrated. Check client/proxy/server support rather than assuming all hops use the same version.

## Methods, safety, idempotency

Covered in [rest-apis.md](rest-apis.md). Recap: `GET`/`HEAD` safe; `GET`/`PUT`/`DELETE` idempotent; `POST`/`PATCH` usually not.

## Headers that actually matter

| Header | Role |
|--------|------|
| `Host` | Which virtual server (required on 1.1) |
| `Content-Type` | Body media type |
| `Accept` | What the client wants back |
| `Authorization` | Credentials — [authentication.md](authentication.md) |
| `Cache-Control` / `ETag` / `If-None-Match` | Caching and optimistic concurrency |
| `Location` | URI[^uri] of a created or redirected resource |
| `Retry-After` | Back off |
| `X-Request-Id` / `traceparent` | Correlation — [observability.md](observability.md) |
| `Connection: close` | Do not reuse (1.1) |

Hop-by-hop headers (`Connection`, `Transfer-Encoding`) are for the next hop, not the app. Behind a proxy, `X-Forwarded-For` / `Forwarded` / `X-Forwarded-Proto` tell you the original client. Trust them only from *your* proxy.

## Status families

| Range | Meaning |
|-------|---------|
| 1xx | Intermediate (rare in app code) |
| 2xx | Success |
| 3xx | Redirection or cache validation (`304` reuses a stored representation) |
| 4xx | Client / call problem |
| 5xx | Server / dependency problem |

`301`/`308` permanent; `302`/`307` temporary. `307`/`308` keep the method. Browsers historically turned `301`/`302` POST into GET.

## URL[^url] and origin

```text
https://api.example.com:443/api/v1/orders/4821?status=OPEN#frag
|       |                 |  |                  |           |
scheme  host              port path             query       fragment (not sent)
```

Origin = scheme + host + port. CORS[^cors] governs browser access across origins. Cookies use host/domain and path matching plus attributes such as `Secure` and `SameSite`; **ports do not isolate cookies**. Same-site and same-origin are different boundaries. Use a URL library for path encoding.

## TLS

TLS provides confidentiality, integrity, and server authentication (and optionally client authentication).

```text
ClientHello → ServerHello + certificate
           → key exchange
           → Finished
           → HTTP
```

- Certificates: public key + names (`SAN`[^san]) + issuer chain + expiry.
- The client verifies: chain to a trust root, name matches the host, not expired, signature valid.
- TLS 1.2 and 1.3 only. SSLv3[^sslv3] / TLS 1.0 / 1.1 are done.

```bash
openssl s_client -connect api.example.com:443 -servername api.example.com
echo | openssl s_client -connect host:443 2>/dev/null | openssl x509 -noout -dates -subject
```

## Certificates in practice

| File | Typical use |
|------|-------------|
| `.pem` / `.crt` | Certificate (Base64 DER[^der]) |
| `.key` | Private key — never in Git |
| `.p12` / `.pfx` | Keystore bundle (Java often) |
| Java `cacerts` | Default trust roots |
| `keytool` | Inspect/import into a JKS[^jks]/PKCS12[^pkcs12] |

Hostname must match `SAN`. A cert for `example.com` does not cover `api.example.com` unless a SAN says so.

mTLS[^mtls]: the server also requests a client certificate. Used for service identity. Lifecycle of client certs is the hard part.

## Proxies and TLS termination

Common production shape: TLS ends at the load balancer / OpenShift route; the app sees HTTP on an internal port. Then:

- App must honor forwarded proto when generating redirect URLs.
- Cookies need `Secure` as if the client used HTTPS[^https].
- Health checks may hit HTTP internally; users hit HTTPS externally.

End-to-end TLS (passthrough or re-encrypt) is stricter and operationally heavier.

## Gotchas

- Mixed content: HTTPS page calling HTTP API[^api].
- Clock skew fails cert validation (`not yet valid`).
- Missing intermediate cert: works in a browser (AIA[^aia] fetch) and fails in Java.
- `localhost` certificates and corporate MITM[^mitm] proxies break developer trust stores.
- Logging `Authorization` or full cookies is a credential leak.

## References

- [RFC 9110 — HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 6265 — cookie scope and port isolation](https://datatracker.ietf.org/doc/html/rfc6265#section-8.5)
- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)

[^http]: Hypertext Transfer Protocol.
[^tls]: Transport Layer Security — encrypts traffic and authenticates the connection's peer.
[^rfc]: Request for Comments — a document in the Internet technical specification series.
[^rest]: Representational State Transfer.
[^quic]: QUIC is the name of a secure, multiplexed transport protocol; it is not expanded as an acronym in the current standard. See [the transport specification](https://www.rfc-editor.org/rfc/rfc9000.html).
[^udp]: User Datagram Protocol.
[^uri]: Uniform Resource Identifier.
[^url]: Uniform Resource Locator.
[^cors]: Cross-Origin Resource Sharing.
[^san]: Subject Alternative Name — a certificate extension listing identities covered by the certificate.
[^sslv3]: Secure Sockets Layer version 3 — an obsolete encrypted-transport protocol.
[^der]: Distinguished Encoding Rules — a binary encoding used for certificates.
[^jks]: Java KeyStore — the Java-specific keystore file format.
[^pkcs12]: Public-Key Cryptography Standards #12 — a format for bundling keys and certificates.
[^mtls]: Mutual Transport Layer Security — both peers authenticate with certificates.
[^https]: Hypertext Transfer Protocol Secure — web communication over an encrypted, authenticated connection.
[^api]: Application Programming Interface — the contract through which software components interact.
[^aia]: Authority Information Access — a certificate extension that can identify where to retrieve issuer information.
[^mitm]: Man-In-The-Middle — an intermediary that intercepts a connection.

# HTTP and TLS cheat sheet

HTTP is the application protocol. TLS is the encrypted tunnel it almost always rides on. REST ([rest-apis.md](rest-apis.md)) is a style on top of HTTP.

## HTTP message

```http
GET /api/v1/orders/4821 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer ...

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 128
```

Request line: method, target, version. Headers are name/value. Body is optional and typed by `Content-Type`.

HTTP/1.1 is text and connection-reuse via `keep-alive`. HTTP/2 multiplexes streams on one TLS connection. HTTP/3 runs on QUIC/UDP. APIs rarely care beyond “the client and proxy speak a version the server accepts.”

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
| `Location` | URI of a created or redirected resource |
| `Retry-After` | Back off |
| `X-Request-Id` / `traceparent` | Correlation — [observability.md](observability.md) |
| `Connection: close` | Do not reuse (1.1) |

Hop-by-hop headers (`Connection`, `Transfer-Encoding`) are for the next hop, not the app. Behind a proxy, `X-Forwarded-For` / `Forwarded` / `X-Forwarded-Proto` tell you the original client. Trust them only from *your* proxy.

## Status families

| Range | Meaning |
|-------|---------|
| 1xx | Intermediate (rare in app code) |
| 2xx | Success |
| 3xx | Go look somewhere else |
| 4xx | Client / call problem |
| 5xx | Server / dependency problem |

`301`/`308` permanent; `302`/`307` temporary. `307`/`308` keep the method. Browsers historically turned `301`/`302` POST into GET.

## URL and origin

```text
https://api.example.com:443/api/v1/orders/4821?status=OPEN#frag
|       |                 |  |                  |           |
scheme  host              port path             query       fragment (not sent)
```

Origin = scheme + host + port. Cookies and CORS are origin-scoped. Path encoding: do not hand-roll; use a URL library.

## TLS

TLS provides confidentiality, integrity, and server authentication (and optionally client authentication).

```text
ClientHello → ServerHello + certificate
           → key exchange
           → Finished
           → HTTP
```

- Certificates: public key + names (`SAN`) + issuer chain + expiry.
- The client verifies: chain to a trust root, name matches the host, not expired, signature valid.
- TLS 1.2 and 1.3 only. SSLv3 / TLS 1.0 / 1.1 are done.

```bash
openssl s_client -connect api.example.com:443 -servername api.example.com
echo | openssl s_client -connect host:443 2>/dev/null | openssl x509 -noout -dates -subject
```

## Certificates in practice

| File | Typical use |
|------|-------------|
| `.pem` / `.crt` | Certificate (Base64 DER) |
| `.key` | Private key — never in Git |
| `.p12` / `.pfx` | Keystore bundle (Java often) |
| Java `cacerts` | Default trust roots |
| `keytool` | Inspect/import into a JKS/PKCS12 |

Hostname must match `SAN`. A cert for `example.com` does not cover `api.example.com` unless a SAN says so.

mTLS: the server also requests a client certificate. Used for service identity. Lifecycle of client certs is the hard part.

## Proxies and TLS termination

Common production shape: TLS ends at the load balancer / OpenShift route; the app sees HTTP on an internal port. Then:

- App must honor forwarded proto when generating redirect URLs.
- Cookies need `Secure` as if the client used HTTPS.
- Health checks may hit HTTP internally; users hit HTTPS externally.

End-to-end TLS (passthrough or re-encrypt) is stricter and operationally heavier.

## Gotchas

- Mixed content: HTTPS page calling HTTP API.
- Clock skew fails cert validation (`not yet valid`).
- Missing intermediate cert: works in a browser (AIA fetch) and fails in Java.
- `localhost` certificates and corporate MITM proxies break developer trust stores.
- Logging `Authorization` or full cookies is a credential leak.

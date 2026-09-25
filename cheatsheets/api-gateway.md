# API[^api] Gateway cheat sheet

> Baseline: HTTP[^http] API gateways and vendor-neutral architectural guidance; policy syntax and defaults vary by implementation. Reviewed: 2026-09-24.

An **API gateway** is a client-facing API entry point that routes requests and can enforce shared policies. It can serve public, partner, or internal clients. Useful responsibilities include TLS[^tls] termination, authentication, request limits, and consistent telemetry.

Related: [Enterprise Service Bus](enterprise-service-bus.md), [REST APIs](rest-apis.md)[^rest], [HTTP and TLS](http-and-tls.md), [authorization](authorization.md), [resilience](resilience.md).

## Three gateway patterns

| Pattern | Purpose | Boundary |
|---------|---------|----------|
| Routing | Present stable API routes over changing backend locations | Preserve the public contract when rewriting paths or headers |
| Offloading | Apply shared transport, security, and traffic policies | Domain decisions still need domain context |
| Aggregation | Combine backend results into one client response | Define latency, partial failure, and consistency semantics |

See [API gateway architecture](https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway) and [Gateway Offloading](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-offloading). An ESB[^esb] emphasizes application integration and mediation; a gateway emphasizes API access. An API gateway can front an ESB without routing every request through it.

## Place client-specific composition deliberately

```text
web client ----> API gateway ----> web BFF ------> domain services
mobile client -> API gateway ----> mobile BFF ---> domain services
partner ------> API gateway -------------------> partner API
```

A **Backend for Frontend (BFF[^bff])** shapes an API for a particular client experience. It is optional; separate BFFs earn their cost when client needs differ materially. Shared business rules belong in domain services. See the [BFF pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends).

Simple composition may live in a gateway. For substantial aggregation, consider a service behind it so fan-out work can scale and fail independently of shared request routing. See [Gateway Aggregation](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation).

## Establish the trust boundary

- Validate access tokens using the issuer's supported mechanism; enforce intended audience, expiry, and required access scope. An ID[^id] token is not an API access token.
- Services must enforce resource- and tenant-level authorization. A gateway accepting a token does not establish permission to read a specific order.
- Strip or overwrite caller-supplied identity headers before injecting trusted identity. Backends may trust them only over an authenticated, restricted gateway path; a public bypass invalidates that trust.
- Authenticate and protect the gateway-to-backend connection as required. TLS termination at the edge protects only the client-to-edge hop.
- If a downstream service needs a different token audience, use an explicit delegation/token-exchange policy. Do not blindly relay credentials to arbitrary destinations.
- Treat CORS[^cors] as browser access policy, not authentication. Restrict administrative APIs separately from application traffic.

These are implementation checks; see [OAuth security BCP](https://www.rfc-editor.org/rfc/rfc9700.html)[^oauth][^bcp], [token exchange](https://www.rfc-editor.org/rfc/rfc8693.html), and the [authentication sheet](authentication.md).

## Failure and traffic policy

| Concern | Decision to make |
|---------|------------------|
| Timeouts | Fit connection, backend execution, and response transfer within an end-to-end budget; propagate deadlines where supported |
| Retries | Retry only safe/idempotent operations or operations with a verified idempotency contract; avoid multiplying client, gateway, and service retries |
| Rate limits | Name the key: tenant, client, user, route, or IP[^ip]; document whether counters are per instance or shared |
| Concurrency limits | Bound in-flight work separately from requests per second; slow requests consume capacity longer |
| Request limits | Bound body/header sizes and validate allowed routes/methods; test streaming and upload behavior |
| Failure responses | Preserve meaningful status and error contracts; do not disguise dependency failure as successful empty data |

Suggested policy: one layer owns retries for each call path, with a bounded budget. A gateway timeout cannot undo work already committed downstream. Neither adding replicas nor adding a gateway creates an end-to-end delivery guarantee. See [resilience](resilience.md).

## Aggregation and caching

For aggregation, define required versus optional dependencies. Bound fan-out, isolate slow services, and make omitted or stale fields explicit. A composed response from several services is not automatically a consistent snapshot. Keep business transactions and long-running workflows outside incidental response composition.

For caching, honor HTTP cache directives and representation selection, including `Vary`. Shared caches have special restrictions for requests carrying `Authorization`; do not assume that forwarding an authenticated request makes its response safe to reuse. Cache keys and policy must prevent reuse across unauthorized users or tenants. Prefer no shared caching of personalized results until that contract is verified. See [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html)[^rfc].

## Operate and test the boundary

- Test expired/wrong-audience tokens, spoofed identity headers, direct backend access, and cross-tenant cache reuse.
- Inject slow or failed dependencies; verify deadlines, partial responses, and bounded fan-out.
- Load-test policy execution and large responses, including rate limits across multiple replicas.
- Version and validate routing/policy configuration; use staged rollout and a tested rollback path.
- Track gateway overhead separately from backend latency, plus rejected requests, upstream failures, and saturation. Redact tokens and sensitive payloads.

A single API with modest needs may only require its framework and a reverse proxy. Add a gateway when shared access policy, routing, or client-facing composition justifies another production dependency.

## References

- [Microsoft — API gateway architecture](https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway)
- [Microsoft — Gateway Offloading](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-offloading)
- [Microsoft — Gateway Aggregation](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation)
- [Microsoft — Backends for Frontends](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends)
- [RFC 9111 — HTTP caching](https://www.rfc-editor.org/rfc/rfc9111.html)
- [RFC 9700 — OAuth 2.0 security best current practice](https://www.rfc-editor.org/rfc/rfc9700.html)

[^api]: Application Programming Interface — the contract through which software components interact.
[^http]: Hypertext Transfer Protocol.
[^tls]: Transport Layer Security — encrypts traffic and authenticates the connection's peer.
[^rest]: Representational State Transfer.
[^esb]: Enterprise Service Bus.
[^bff]: Backend for Frontend.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).
[^cors]: Cross-Origin Resource Sharing.
[^oauth]: Open Authorization — a framework for delegated access.
[^bcp]: Best Current Practice — a series of Internet standards guidance documents.
[^ip]: Internet Protocol.
[^rfc]: Request for Comments — a document in the Internet technical specification series.

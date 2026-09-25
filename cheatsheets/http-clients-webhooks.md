# HTTP[^http] clients and webhook delivery cheat sheet

> Baseline: Java 21, Spring Framework 6.2 clients, and GitHub's HMAC[^hmac]-SHA256[^sha256] webhook format as one concrete signature example. Other providers have different signing contracts. Reviewed: 2026-09-24.

An HTTP exchange can fail after the remote side has acted. Design outbound calls and webhook reception around that uncertainty.

Related: [HTTP and TLS](http-and-tls.md)[^tls], [REST APIs](rest-apis.md)[^rest][^api], [resilience](resilience.md), [messaging](messaging-and-events.md).

## Client choices and budgets

| Choice | Use when | Remember |
|--------|----------|----------|
| JDK[^jdk] `HttpClient` | Framework-independent synchronous/asynchronous calls | Reuse the client and consume/close response bodies appropriately |
| Spring `RestClient` | Imperative Spring application | Configure the underlying request factory/client, including timeouts |
| Spring `WebClient` | Reactive composition or streaming | Avoid blocking event-loop threads; cancellation and body ownership matter |

Budget pool acquisition, connection/TLS, response, body consumption, and retries within the caller's deadline. Timeout names differ across transports. Cap response size and concurrent requests; streaming does not make unlimited data safe to retain.

Retry only when the failure and operation semantics allow it. Use bounded exponential backoff with jitter; honor applicable `Retry-After` responses. A stable idempotency key helps only when the provider implements its semantics. Never blindly replay a timed-out write with a new key. See [Spring REST clients](https://docs.spring.io/spring-framework/reference/6.2/integration/rest-clients.html).

## Verify the exact received bytes

Method fragment for GitHub's `X-Hub-Signature-256` header. Imports: `javax.crypto.Mac`, `javax.crypto.spec.SecretKeySpec`, `java.security.MessageDigest`, `java.security.GeneralSecurityException`, and `java.util.HexFormat`. The secret is supplied as bytes using the provider's agreed encoding. This method authenticates the body only; it does not provide replay protection.

```java
static boolean validSignature(byte[] body, String header, byte[] secret)
        throws GeneralSecurityException {
    if (header == null || !header.startsWith("sha256=") || header.length() != 71) {
        return false;
    }
    final byte[] supplied;
    try {
        supplied = HexFormat.of().parseHex(header.substring(7));
    } catch (IllegalArgumentException malformedHex) {
        return false;
    }
    var mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(secret, "HmacSHA256"));
    return MessageDigest.isEqual(mac.doFinal(body), supplied);
}
```

Verify before deserializing or reformatting JSON[^json]. Preserve the original request bytes with a size limit. For providers signing a timestamp and body together, enforce their timestamp tolerance and canonicalization rules; do not invent a timestamp field for GitHub's body-only signature.

## Durable reception

1. Validate authentication/signature and basic envelope constraints.
2. In a database transaction, insert the event into an inbox with a unique provider/subscription/delivery-ID[^id] key.
3. Acknowledge after durable acceptance; acknowledge known duplicates without repeating effects.
4. Let a worker process the inbox with bounded retries and a recorded terminal failure state.
5. Make local business changes and completion bookkeeping atomic where possible; protect external effects with their own idempotency/reconciliation design.

Delivery-ID deduplication handles ordinary redelivery, but an unsigned delivery-ID header is not cryptographic replay protection. Define retention and business-level idempotency for the operation; do not assume every redelivery mechanism or provider uses the same ID.

For outbound webhooks, persist delivery attempts, reuse the logical event ID across retries, sign the actual bytes sent, and track destination-specific backoff and disablement. Validate configured destinations to prevent server-side request forgery.

## References

- [JDK HttpClient](https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/HttpClient.html)
- [GitHub webhook signature validation](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries)
- [GitHub webhook delivery practices](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks)

[^http]: Hypertext Transfer Protocol.
[^hmac]: Hash-based Message Authentication Code.
[^sha256]: Secure Hash Algorithm with a 256-bit digest.
[^tls]: Transport Layer Security — encrypts traffic and authenticates the connection's peer.
[^rest]: Representational State Transfer.
[^api]: Application Programming Interface — the contract through which software components interact.
[^jdk]: Java Development Kit.
[^json]: JavaScript Object Notation.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).

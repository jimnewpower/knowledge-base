# Enterprise Integration Patterns cheat sheet

> Baseline: Hohpe/Woolf EIP vocabulary; broker-neutral design guidance, not transport guarantees. Reviewed: 2026-09-24.

Use **Enterprise Integration Patterns (EIP)** to name how independent applications exchange data and coordinate work. Start with the business boundary, delivery requirements, and failure behavior before selecting a broker or framework.

Related: [routing and coordination](integration-routing-and-coordination.md), [message transformation](integration-transformation.md), [messaging and events](messaging-and-events.md), [resilience](resilience.md), [Enterprise Service Bus](enterprise-service-bus.md), [API Gateway](api-gateway.md), [Spring Integration in practice](spring-integration.md).

## Choose an integration style

| Style | Useful when | Cost to accept |
|-------|-------------|----------------|
| File Transfer | Batch imports, exports, legacy handoffs | File completeness, duplicate detection, reconciliation, delayed results |
| Shared Database | Applications deliberately share a data contract | Schema and release coupling; unclear write ownership can break invariants |
| Remote Procedure Invocation | Caller needs an immediate result | Availability and latency coupling; timeout leaves outcome uncertain |
| Messaging | Work can complete later; buffering or independent consumers matter | Duplicate delivery, lag, ordering, schema evolution, operational state |

These styles can coexist. A nightly file can enter through an adapter and become messages. An asynchronous transport does not make an application independent if it immediately blocks waiting for a reply. See the [integration styles catalog](https://www.enterpriseintegrationpatterns.com/patterns/messaging/IntegrationStylesIntro.html).

## Find the pattern family

| Family | Question | Examples |
|--------|----------|----------|
| Messaging systems | What connects the pieces? | Message, Message Channel, Pipes and Filters |
| Channels | Who should receive the message? | Point-to-Point, Publish-Subscribe, Dead Letter Channel |
| Message construction | What does this message mean? | Command, Document, Event, Request-Reply |
| Routing | Where does it go next? | Content-Based Router, Splitter, Aggregator |
| Transformation | How do models fit together? | Message Translator, Normalizer, Claim Check |
| Endpoints | How does application code participate? | Messaging Gateway, Service Activator, Idempotent Receiver |
| System management | How do we inspect and control the flow? | Wire Tap, Message History, Control Bus |

Names follow the [original EIP catalog](https://www.enterpriseintegrationpatterns.com/patterns/messaging/). The tables below add practical selection and failure guidance.

## Channels and endpoints

| Pattern | Use it for | Watch for |
|---------|------------|-----------|
| Point-to-Point Channel + Competing Consumers | One logical work queue, multiple workers | Redelivery can repeat work; concurrency can change completion order |
| Publish-Subscribe Channel | Independent reactions to the same fact | Each logical subscription needs its own delivery/retention policy |
| Durable Subscriber | Retain messages for a temporarily absent subscriber | Retention limits and backlog still matter |
| Channel Adapter | Connect a file, database, or application interface to messaging | Polling checkpoints and partial transfers |
| Messaging Bridge | Connect separate messaging systems | Loops, header loss, and incompatible delivery semantics |
| Messaging Gateway | Hide messaging APIs behind an application-facing interface | Hiding the API does not hide latency or failures |
| Service Activator | Invoke an application service when a message arrives | Transaction and acknowledgment boundaries |
| Invalid Message Channel | Quarantine messages the receiver cannot understand | Preserve a reason and enough metadata to diagnose |
| Dead Letter Channel | Retain messages the messaging system cannot deliver | Broker-specific triggers; application failures may need explicit routing |

Sources: [channels](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MessagingChannelsIntro.html), [endpoints](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MessagingEndpointsIntro.html).

## Request-Reply over messaging

```text
requester -- request + return address --> request channel --> service
requester <-- reply + correlation ID --- reply channel <---- service
```

Return Address says where to reply; Correlation Identifier connects the reply to the outstanding request. Give each request attempt a distinct correlation identity when late replies must not satisfy a later attempt. Keep the business idempotency key stable across retries of the same operation.

Define a deadline, duplicate-reply handling, and a policy for replies after timeout. A timeout does not cancel work already accepted by the receiver. Restrict reply destinations to authorized channels. See [Request-Reply](https://www.enterpriseintegrationpatterns.com/patterns/messaging/RequestReply.html).

## Reliability and operations

- **Idempotent Receiver:** make repeat delivery safe through operation semantics or durable deduplication. Scope keys to the logical consumer and operation; do not deduplicate every event sharing an order ID. See the [pattern](https://www.enterpriseintegrationpatterns.com/patterns/messaging/IdempotentReceiver.html) and the [atomic inbox/outbox guidance](messaging-and-events.md).
- **Wire Tap:** copy traffic for diagnostics; bound its capacity and redact payloads. Decide whether tap failure can affect business delivery.
- **Message History / Message Store:** retain route metadata or message records for investigation under an explicit retention policy. Diagnostic history alone is not a replay mechanism.
- **Control Bus:** manage routes and endpoints through an authenticated administrative path; audit pause, purge, and replay operations.

Monitor queue age, failures, retries, duplicates, and incomplete aggregation groups alongside throughput. The [system management catalog](https://www.enterpriseintegrationpatterns.com/patterns/messaging/SystemManagementIntro.html) supplies the vocabulary; capacity and recovery policies belong to the implementation.

## Modern integration concerns

The [DZone article](https://dzone.com/articles/the-timeless-architecture-enterprise-integration-p) groups enduring concerns into transformation, asynchronous messaging, idempotency, orchestration/choreography, and security propagation. Treat this as a perspective on integration, not the complete EIP taxonomy.

Security propagation needs an explicit trust boundary: authenticate producers, restrict channel access, and authorize the requested operation at the consumer. A `userId` in a payload is not proof of identity. Distinguish the initiating user from the executing service, including for delayed work and replay. Where delegated OAuth access is required, [RFC 8693 token exchange](https://www.rfc-editor.org/rfc/rfc8693.html) defines audience/resource and scope parameters; policy determines what is issued. Do not indiscriminately forward bearer tokens. See [authentication](authentication.md) and [authorization](authorization.md).

## References

- [Hohpe and Woolf — Enterprise Integration Patterns catalog](https://www.enterpriseintegrationpatterns.com/patterns/messaging/)
- [Wairagade — The Timeless Architecture: Enterprise Integration Patterns That Exceed Technology Trends (DZone, January 13, 2026)](https://dzone.com/articles/the-timeless-architecture-enterprise-integration-p) — contextual reading; pattern definitions above use primary sources.
- [Spring Integration — framework overview](https://docs.spring.io/spring-integration/reference/overview.html) — Java implementation entry point; match documentation to the version deployed.

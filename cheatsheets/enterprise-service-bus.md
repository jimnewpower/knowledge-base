# Enterprise Service Bus cheat sheet

> Baseline: ESB[^esb] architectural responsibilities and Hohpe/Woolf integration patterns; capabilities and guarantees vary by product. Reviewed: 2026-09-24.

An **Enterprise Service Bus (ESB)** provides a shared integration layer for connecting applications with different interfaces, protocols, and data models. Typical responsibilities include adapters, routing, transformation, and protocol mediation. Central coordination need not mean one physical runtime; deployment and ownership boundaries determine the actual failure scope.

Related: [Enterprise Integration Patterns](enterprise-integration-patterns.md), [API Gateway](api-gateway.md)[^api], [routing and coordination](integration-routing-and-coordination.md), [transformation](integration-transformation.md).

## Distinguish the responsibilities

| Component | Primary job | Does not establish by itself |
|-----------|-------------|------------------------------|
| ESB | Mediate integrations among heterogeneous applications | Business ownership, end-to-end atomicity, independent releases |
| API gateway | Route API calls and enforce common access policies | Durable workflows or reliable asynchronous delivery |
| Message broker | Transport, retain, and deliver messages according to configuration | Business mappings or application-level exactly-once effects |
| Service mesh | Manage service communication, traffic policy, and transport security | Enterprise data-model translation or API product governance |

Products can combine these roles. Select capabilities and operational boundaries, not labels. ESB responsibilities are described in [IBM's overview](https://www.ibm.com/think/topics/esb)[^ibm]; gateway and mesh roles are covered by [Microsoft](https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway) and [Istio](https://istio.io/latest/about/service-mesh/).

## Recognize the EIP[^eip] building blocks

| Integration need | Pattern | Design decision |
|------------------|---------|-----------------|
| Connect a legacy file or SOAP[^soap] interface | Channel Adapter / Service Activator | Checkpointing, credentials, timeout, and error mapping |
| Translate partner records | Message Translator / Normalizer | Versioned mapping and ownership of meaning |
| Select the receiving system | Content-Based Router / Recipient List | No-match behavior, route version, allowed destinations |
| Process parts and combine results | Splitter / Aggregator | Correlation, completion, duplicate and late-message handling |
| Coordinate a business process | Process Manager | Durable state, timers, compensation, recovery owner |
| Exchange through a common model | Message Bus / Canonical Data Model | Scope and governance of the shared contract |

The [Message Bus pattern](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MessageBus.html) describes messaging infrastructure, a common data model, and common commands. An ESB is a broader architectural/product term; installing one does not automatically establish those contracts. An EIP **Messaging Gateway** is an application-facing messaging abstraction, a different responsibility from an API gateway.

## Example: coexist with a legacy system

Conceptual deployment; the broker and integration workers can scale separately.

Example abbreviations: DB[^db].

```text
API client --> API gateway --> order service --> order DB + outbox
                                                   |
                                              outbox relay
                                                   v
legacy ERP <-- SOAP adapter <-- translator <-- message broker
                integration runtime / ESB
```

The order service owns order acceptance. The integration route owns delivery and translation to the ERP[^erp]. A gateway response must distinguish accepted work from completed ERP processing. SOAP over HTTP[^http] remains a remote call with an uncertain outcome after timeout.

For implementation, define a stable operation key, bounded retries, and reconciliation with the ERP. A database transaction inside the ESB cannot roll back an ERP call. If the ERP lacks idempotency support, reconcile ambiguous outcomes before replaying side effects. See [resilience](resilience.md) and [inbox/outbox boundaries](messaging-and-events.md).

## When an ESB earns its cost

Consider it when several integrations reuse difficult legacy connectors, substantial transformations, or shared operational tooling. Confirm that connector maintenance, runtime availability, and support ownership are funded.

For a few straightforward HTTP calls or events, direct adapters and a broker may be enough. Existing ESBs can remain useful while selected routes move to independently deployed integration services. Shared runtimes can introduce release queues and failure coupling; [IBM's discussion](https://www.ibm.com/think/topics/esb) describes these tradeoffs.

## Practical boundaries

These are recommended implementation policies, not guarantees of an ESB product:

- Keep pricing, eligibility, and state transitions with their domain owners. Give any ESB-hosted workflow an explicit business owner and durable state model.
- Isolate slow partners with separate concurrency limits, queues, and connection pools. Test whether one route can exhaust shared resources.
- Version routes and mappings as deployable artifacts. Record the mapping version needed to reproduce a historical exchange.
- Define acknowledgment, persistence, and transaction boundaries for every connector. HTTP success, broker acceptance, and business completion are distinct outcomes.
- Monitor backlog age, delivery failures, rejected records, and reconciliation status. Assign owners for dead-letter queues and replay approval procedures.

## Modernize one flow at a time

1. Inventory contracts, consumers, credentials, timers, and hidden business rules.
2. Capture representative inputs and expected outputs before changing a route.
3. Run candidate mappings against recorded or safely copied inputs; suppress external side effects during comparison.
4. Move a bounded flow, reconcile results, and retain a rollback route that cannot double-submit work.
5. Retire the old route only after consumers, in-flight work, and recovery obligations have moved.

Replacing the runtime alone does not remove coupling in a shared schema or release process.

## References

- [IBM — What is an enterprise service bus?](https://www.ibm.com/think/topics/esb)
- [Hohpe and Woolf — Message Bus](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MessageBus.html)
- [Hohpe and Woolf — Messaging Gateway](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MessagingGateway.html)
- [Hohpe and Woolf — Process Manager](https://www.enterpriseintegrationpatterns.com/patterns/messaging/ProcessManager.html)

[^esb]: Enterprise Service Bus.
[^api]: Application Programming Interface — the contract through which software components interact.
[^ibm]: International Business Machines.
[^eip]: Enterprise Integration Patterns.
[^soap]: Originally Simple Object Access Protocol; SOAP is now the protocol's name.
[^erp]: Enterprise Resource Planning.
[^http]: Hypertext Transfer Protocol.
[^db]: Database.

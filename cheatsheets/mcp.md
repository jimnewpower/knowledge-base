# MCP[^mcp] cheat sheet

> Baseline: Model Context Protocol specification 2025-11-25; features must be negotiated and host support varies. Reviewed: 2026-09-25.

Use this when connecting an AI[^ai] host to external tools and context through a shared protocol. MCP supplies an integration boundary; the host still owns orchestration and permission decisions.

Related: [agents and workflows](ai-agents-and-workflows.md), [skills development](agent-skills-development.md), [AI security](ai-security.md), [API contracts](openapi-and-json-schema.md)[^api].

## Components and primitives

| Component | Responsibility |
|-----------|----------------|
| Host | Runs the assistant, manages clients, aggregates context, applies consent policies |
| Client | Maintains a connection to a server and negotiates capabilities |
| Server | Exposes a focused set of capabilities backed by local or remote systems |

| Server primitive | Purpose | Example |
|------------------|---------|---------|
| Tools | Callable operations the model can request | Search documents or create a draft |
| Resources | Addressable contextual data the application can read | A project schema |
| Prompts | Reusable templates selected through the client | A review procedure with arguments |

Not every server implements every primitive. Server-initiated features such as sampling also depend on client capability and host policy.

## Connection lifecycle

```text
connect -> initialize/version and capability negotiation -> initialized
        -> discover supported capabilities -> invoke/read -> handle results
```

Messages use JSON-RPC[^jsonrpc] 2.0. The 2025-11-25 standard transports are standard input/output (`stdio`) and Streamable HTTP[^http]. For `stdio`, keep protocol messages on standard output and diagnostic logging on standard error. Streamable HTTP can use SSE[^sse]; it replaces the older HTTP+SSE transport from 2024-11-05.

## Tool-call example

Complete JSON[^json] message example, after initialization and discovery of a hypothetical `search_notes` tool; this is not a complete session.

```json validate
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "search_notes",
    "arguments": { "query": "connection pool", "limit": 5 }
  }
}
```

Tools declare an input schema; they can also declare an output schema. Validate arguments and business permissions at the server. Distinguish protocol errors from execution results marked `isError`; a received response does not necessarily mean the operation succeeded.

## Design and security checks

- Give each tool a clear purpose, bounded results, and explicit side effects. Separate searching from changing data.
- Treat tool annotations and descriptions as claims from the server, not proof that a call is safe.
- Enforce caller identity and resource authorization on every operation. A session identifier is not an access credential.
- For remote servers, follow the specification's authorization requirements; do not pass through tokens issued for a different audience.
- Validate `Origin` on HTTP connections and bind local servers to loopback as recommended by the transport specification.
- Treat returned text and resources as untrusted data. Protocol compliance does not prevent prompt injection.
- Make retries of side-effecting operations safe through an application-level idempotency contract; do not assume protocol request identifiers provide it.

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Connected, but no tool visible | Negotiated capabilities, discovery response, host support |
| Local connection fails while logging | Non-protocol text on standard output |
| Tool returned but task failed | Execution error, schema mismatch, downstream authorization |
| Works locally, fails remotely | Transport version, identity, origin handling, network policy |

## References

- [MCP 2025-11-25 — architecture](https://modelcontextprotocol.io/specification/2025-11-25/architecture)
- [MCP 2025-11-25 — transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- [MCP 2025-11-25 — tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- [MCP — security best practices](https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices)

[^mcp]: Model Context Protocol — a protocol for connecting language-model applications to tools and contextual data.
[^ai]: Artificial Intelligence.
[^api]: Application Programming Interface.
[^jsonrpc]: JavaScript Object Notation Remote Procedure Call — a message format for requests, responses, and notifications.
[^http]: Hypertext Transfer Protocol.
[^sse]: Server-Sent Events — an event stream delivered over an HTTP connection.
[^json]: JavaScript Object Notation.

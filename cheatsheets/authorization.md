# Authorization cheat sheet

> Baseline: General policy models; Spring examples target Security 6.x and proxy-based method security. Reviewed: 2026-09-24.

Authorization answers **what may this principal do to this resource, right now?** It is not login. See [authentication.md](authentication.md).

## Separate the concerns

```text
request
  -> authenticate  (establish principal)
  -> authorize     (allow or deny this action)
  -> business logic
```

Collapse those layers and every endpoint reimplements policy badly.

## Policy ingredients

| Ingredient | Example |
|------------|---------|
| Principal | user `jnewpower`, service `order-api` |
| Action | `order.submit`, `GET`, `invoice:write` |
| Resource | `order:4821`, path `/orders/4821` |
| Context | time, network zone, classification, tenant, token scopes |

A decision is `allow`, `deny`, or `not applicable` (then a default deny).

## Models

### Access control lists (ACL)

Resource holds the list of principals and verbs. Simple at small scale. Painful to audit across thousands of objects.

### Role-based (RBAC)

Principal has roles; roles have permissions.

```text
jnewpower -> [engineer, release-manager]
release-manager -> [deploy.prod, pipeline.approve]
```

Works when the organization actually thinks in roles. Explodes when every exception becomes a new role (`engineer-east-readonly-plus-invoices`).

### Attribute-based (ABAC)

Rules over attributes of subject, resource, and environment.

```text
allow if subject.clearance >= resource.classification
    and subject.tenant == resource.tenant
```

Expressive. Policy quality and attribute accuracy become the product.

### Relationship-based (ReBAC)

Authorization as a graph: `jnewpower is owner of folder X`, `folder X parent of doc Y`, therefore access flows. Google Zanzibar–style systems. Fits sharing and nested ownership. Operationally heavier.

### Scope-based (OAuth)

Access token carries scopes (`orders:read`). Scopes are *client grants*, not a complete user permission model. Still combine with user/role checks inside the API.

## Where policy lives

| Place | When it fits |
|-------|----------------|
| In-method `if (user.isAdmin())` | Prototypes only |
| Framework annotations | Coarse endpoint guards (`@PreAuthorize`) |
| Domain service | Invariants that *are* the business (“only the assignee may close”) |
| Central PDP (policy decision point) | Many apps, one language of policy (OPA, Cedar, vendor IAM) |
| API gateway | Coarse: authenticated, has scope, rate limit — not deep object ACLs |

A PEP (enforcement point) asks a PDP (decision point) and may cache. Do not let every microservice invent a different role vocabulary.

## HTTP mapping

| Status | Meaning |
|--------|---------|
| 401 | No usable identity |
| 403 | Identity known, action denied |
| 404 | Sometimes used to hide that the resource exists |

Pick a hide-vs-reveal policy for sensitive objects and apply it everywhere.

## Patterns that hold up

1. **Default deny.** Missing policy is not allow.
2. **Authorize on the server.** UI hiding is not control.
3. **Authorize the object, not just the route.** `GET /orders/4821` must check *that* order’s tenant and ACL, not merely `ROLE_USER`.
4. **Name permissions as `resource.action`.** `invoice.approve` beats `FLAG_7`.
5. **Keep “admin” rare.** Break-glass roles should be auditable and time-bounded.
6. **Log denials** with principal, action, resource id, policy id.

## Java / Spring sketch

Enable method security in a configuration class scanned by Spring (Spring Security 6+):

```java
@Configuration
@EnableMethodSecurity
class MethodSecurityConfig {}
```

The security starter does not enable method authorization automatically. Calls must pass through the Spring-managed proxy; self-invocation bypasses this advice. Test a denied call through the injected bean.

Service-method sketch; domain types and method body are application-specific:

```java
@PreAuthorize("hasAuthority('order.submit')")
public Order submit(OrderId id, Principal user) { ... }

// object-level
if (!policy.can(user, Action.SUBMIT, order)) {
    throw new ForbiddenException();
}
```

Annotations catch the coarse case. Domain checks catch the object case. You usually need both.

## Gotchas

- Confusing *authentication groups* from the IdP with *application permissions*. Map them explicitly.
- Caching allow-decisions without a revocation story.
- Multi-tenant apps that authorize only by role and forget `tenant_id`.
- Service tokens with `*` scopes “for convenience.”
- Mixing system-user bypasses into business methods until nobody can see the real policy.

## References

- [Spring Security — method authorization and activation](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html)
- [OWASP — authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

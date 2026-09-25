# Azure application operations cheat sheet

> Baseline: Azure CLI 2.x, Azure Resource Manager, and Microsoft Entra workload identities. Reviewed: 2026-09-25.

Tenant, subscription, resource group, and resource are different scopes. Verify them before debugging role assignments, networking, or deployment.

Related: [Entra ID](entra-id.md), [Terraform](terraform.md), [secrets management](secrets-management.md), [observability](observability.md).

## Establish context

Interactive login opens an authentication flow. `account set` changes the CLI's active subscription; the remaining commands inspect it. Replace the subscription placeholder with its actual ID.

```bash
az login
az account list --output table
az account set --subscription YOUR_SUBSCRIPTION_ID
az account show --query '{subscription:id,tenant:tenantId,name:name}' --output json
az group list --output table
```

Use managed identity on supported Azure resources, or workload federation for CI/external workloads. A developer login is not the identity of a deployed application. Distinguish an application registration, its service principal, and a managed identity when inspecting access.

## Service decisions

| Need | Candidate | Verify |
|------|-----------|--------|
| Managed web application | App Service | Runtime/container support, scale, private connectivity and slots |
| Managed container workload | Container Apps | Ingress, jobs, revisions, scaling and execution limits |
| Kubernetes | AKS | Cluster operation, node upgrades, workload identity and network model |
| Object storage | Blob Storage | Data-plane RBAC, retention, lifecycle and recovery |
| Relational storage | Azure SQL / managed PostgreSQL | Engine-specific compatibility, backup and failover behavior |
| Secret/key storage | Key Vault | Access model, network path and rotation behavior |
| Telemetry | Azure Monitor / Application Insights | Collection, retention, sampling, queries and cost |

## Access and networking

Azure resource-management permissions do not necessarily grant permission to read the service's data. Check the specific data-plane role and scope, then network access and service configuration. A private endpoint also needs correct DNS resolution and a viable route from the caller.

For an unexpected 403, record the application identity, tenant, resource, requested operation, correlation ID, and time. For a timeout, inspect DNS/routes/firewall rules before changing RBAC. Avoid assigning broad subscription roles to compensate for a narrow configuration error.

## Operate and recover

Record deployment digest, configuration, identity assignments, and database migration version together. Correlate control-plane changes in the Activity Log with runtime diagnostics in Azure Monitor. Set explicit retention and budget alerts; check regional service quotas before capacity changes.

Test recovery of data and required configuration into an isolated resource group. A deployment slot swap or rollback of an image does not revert database writes. Document cleanup of temporary resources to prevent unattended cost.

## References

- [Azure CLI authentication](https://learn.microsoft.com/en-us/cli/azure/authenticate-azure-cli)
- [Azure RBAC overview](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview)
- [Managed identities overview](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview)

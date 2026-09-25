# Azure cloud services cheat sheet

> Baseline: Selected Microsoft Azure public-cloud infrastructure and platform services; service roles rather than pricing, quotas, or an exhaustive catalog. Reviewed: 2026-09-25.

Use this sheet to identify Azure services by workload. Similar names can hide different hosting, identity, and networking models; confirm the chosen tier and region.

Related: [Azure operations](azure.md), [Entra identity](entra-id.md), [AWS services](aws-services.md)[^aws], [Google Cloud services](gcp-services.md), [Oracle Cloud services](oracle-cloud-services.md).

## Resource model

Microsoft Entra ID[^id] supplies the identity tenant. Management groups organize subscriptions; subscriptions contain resource groups and resources. Resource groups organize lifecycle and access scope, while resource location is selected separately. Resource-management permissions do not automatically grant permission to read stored data.

## Compute and containers

| Service | Role / common use |
|---------|-------------------|
| Virtual Machines / Virtual Machine Scale Sets | Servers / scalable server fleets |
| App Service | Managed hosting for web applications and APIs[^api] |
| Azure Functions | Functions triggered by requests, events, or timers |
| Container Apps | Managed container applications and jobs |
| AKS[^aks] | Managed Kubernetes clusters |
| Container Instances | Run container groups without a cluster |
| Container Registry | Store and distribute container images |
| Azure Batch | Schedule large batches of compute jobs |

Choose between application hosting, container hosting, and Kubernetes based on the operational control required. See the [compute selection guide](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/compute-decision-tree).

## Storage and databases

| Service | Role / common use |
|---------|-------------------|
| Blob Storage / Data Lake Storage Gen2 | Objects / analytics-oriented hierarchical storage capabilities |
| Managed Disks | Persistent block storage for virtual machines |
| Azure Files / Azure NetApp Files | Managed shared file storage |
| Azure Backup | Backup and recovery for supported workloads |
| Azure SQL[^sql] Database | Managed databases based on the SQL Server engine |
| Azure SQL Managed Instance | Broader instance-level SQL Server compatibility |
| Azure Database for PostgreSQL / MySQL | Managed open-source relational engines |
| Cosmos DB[^db] | Distributed database services; choose the data model and interface |
| Azure Managed Redis | Managed in-memory caching and data structures |

SQL Database and Managed Instance differ in instance features and migration fit. [Data-store guidance](https://learn.microsoft.com/en-us/azure/architecture/data-guide/technology-choices/understand-data-store-models) explains workload differences. [Azure Managed Redis](https://learn.microsoft.com/en-us/azure/redis/overview) is the current caching offering; older material may use Azure Cache for Redis.

## Networking and delivery

| Service | Role / common use |
|---------|-------------------|
| Virtual Network | Private address space, subnets, and routing |
| Load Balancer | Transport-level traffic distribution |
| Application Gateway | Regional web traffic routing and optional filtering |
| Front Door | Global web routing, acceleration, and caching |
| Azure DNS[^dns] | Public and private name resolution |
| Private Link | Private endpoints for supported services |
| VPN Gateway[^vpn] / ExpressRoute | Encrypted tunnels / dedicated private connectivity |
| API Management | API publishing, policies, subscriptions, and developer access |

See [Azure networking services](https://learn.microsoft.com/en-us/azure/networking/networking-overview).

## Messaging and integration

| Service | Role / common use |
|---------|-------------------|
| Service Bus | Business-message queues and publish/subscribe topics |
| Event Grid | Distribute events to interested handlers |
| Event Hubs | Ingest and retain high-volume event streams |
| Logic Apps | Connector-based integration workflows |
| Durable Functions | Stateful orchestration implemented with functions |

Service Bus, Event Grid, and Event Hubs solve different delivery problems. Compare ordering, replay, transaction, and consumer requirements in the [messaging guide](https://learn.microsoft.com/en-us/azure/service-bus-messaging/compare-messaging-services).

## Security and identity

| Service | Role / common use |
|---------|-------------------|
| Microsoft Entra ID / managed identities | Workforce and application identities / resource-bound credentials |
| Azure RBAC[^rbac] / Azure Policy | Authorization / resource governance rules |
| Key Vault | Secrets, keys, and certificates |
| Defender for Cloud | Security posture and workload protection |
| Microsoft Sentinel | Security analytics, detection, and response |
| Azure Firewall / WAF[^waf] | Network filtering / web request filtering |

See [Azure security capabilities](https://learn.microsoft.com/en-us/azure/security/fundamentals/overview).

## Analytics and artificial intelligence

| Service | Role / common use |
|---------|-------------------|
| Data Factory | Data movement and transformation pipelines |
| Synapse Analytics | Warehousing and analytical processing |
| Azure Databricks | Managed Spark, lakehouse, and data engineering |
| Azure Data Explorer | Interactive analysis of telemetry and event data |
| Azure Machine Learning | Train, track, and deploy machine-learning models |
| Microsoft Foundry | Build and operate AI[^ai] applications and agents; includes Azure OpenAI capabilities |
| Azure AI Search | Text, vector, and hybrid retrieval |

[Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/what-is-foundry) was previously branded Azure AI Foundry. Microsoft Fabric is a related analytics platform spanning multiple workloads; assess its capacity and governance model separately from individual Azure services.

## Delivery, operations, and migration

| Service | Role / common use |
|---------|-------------------|
| Azure Resource Manager / Bicep | Resource deployment / declarative infrastructure language |
| Azure DevOps / Azure Pipelines | Development collaboration / build and release pipelines |
| Azure Monitor / Application Insights | Metrics and logs / application telemetry |
| Log Analytics / Activity Log | Query collected logs / inspect subscription management events |
| Cost Management / Advisor | Spending analysis / configuration recommendations |
| Azure Migrate / Database Migration Service | Migration assessment and execution / database moves |
| Site Recovery / Azure Arc | Disaster recovery orchestration / management across environments |

The [Azure product catalog](https://azure.microsoft.com/en-us/products/) covers networking, security, analytics, and operations offerings above.

## Selection traps

- A private endpoint needs working name resolution and routing from the caller; granting a role cannot fix a network timeout.
- Deployment rollback does not undo database writes. Test data recovery separately.
- Serverless plans differ in scaling, execution limits, and minimum capacity. Check the actual plan before assuming scale-to-zero.

## References

- [Azure product catalog](https://azure.microsoft.com/en-us/products/)
- [Azure architecture technology choices](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/compute-decision-tree)
- [Azure role-based access control](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview)

[^aws]: Amazon Web Services.
[^id]: Identity — as used in the Microsoft Entra ID product name.
[^api]: Application Programming Interface.
[^aks]: Azure Kubernetes Service.
[^sql]: Structured Query Language.
[^db]: Database.
[^dns]: Domain Name System.
[^vpn]: Virtual Private Network.
[^rbac]: Role-Based Access Control.
[^waf]: Web Application Firewall.
[^ai]: Artificial Intelligence.

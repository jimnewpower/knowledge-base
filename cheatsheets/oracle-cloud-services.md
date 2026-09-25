# Oracle Cloud (OCI[^oci]) services cheat sheet

> Baseline: Selected Oracle Cloud Infrastructure and platform services; service roles rather than pricing, quotas, or an exhaustive catalog. Reviewed: 2026-09-25.

Use this sheet for Oracle's cloud infrastructure and managed platforms. Oracle Database is one part of the portfolio; Oracle Fusion Cloud Applications are separately packaged business applications.

Related: [Oracle Database](oracle.md), [AWS services](aws-services.md)[^aws], [Azure services](azure-services.md), [Google Cloud services](gcp-services.md), [Terraform](terraform.md).

## Resource model

A tenancy is the account boundary; compartments organize resources and policy scope. Regions contain availability domains, which contain fault domains. Availability-domain counts differ by region. Compartments are logical groupings, not network boundaries. See [OCI introduction](https://docs.oracle.com/en-us/iaas/Content/GSG/Concepts/baremetalintro.htm).

## Compute and containers

| Service | Role / common use |
|---------|-------------------|
| Compute | Virtual machines and bare-metal servers, including accelerator shapes |
| Instance pools / autoscaling | Manage and resize groups of compute instances |
| Kubernetes Engine (OKE[^oke]) | Managed Kubernetes clusters |
| Container Instances | Run containers without managing servers or a cluster |
| Functions | Event-driven function execution |
| Container Registry | Store container images |
| Oracle Cloud VMware Solution | Run VMware environments on dedicated infrastructure |

Container Instances supplies a simpler execution unit than a Kubernetes cluster. See [compute services](https://www.oracle.com/cloud/compute/).

## Storage and databases

| Service | Role / common use |
|---------|-------------------|
| Object Storage / Archive Storage | Object buckets / archival storage with retrieval delays |
| Block Volume | Persistent block devices for compute instances |
| File Storage | Shared managed file systems |
| Base Database Service | Oracle databases on virtual-machine database systems |
| Exadata Database Service | Oracle databases on Exadata infrastructure |
| Autonomous AI[^ai] Database | Oracle database service with automated operational management |
| HeatWave MySQL | Managed MySQL with integrated analytical capabilities |
| OCI Database with PostgreSQL | Managed PostgreSQL databases |
| Oracle NoSQL[^nosql] Database Cloud Service | Managed nonrelational application data |

Autonomous AI Database, formerly Autonomous Database, reduces operational work but still requires schema, access, and recovery decisions. Sources: [storage](https://www.oracle.com/cloud/storage/), [database services](https://www.oracle.com/database/), [Autonomous AI Database](https://www.oracle.com/autonomous-database/).

## Networking and delivery

| Service | Role / common use |
|---------|-------------------|
| VCN[^vcn] | Regional private network, subnets, and routing |
| Load Balancer / Network Load Balancer | Proxy-based application balancing / network traffic distribution |
| DNS[^dns] / Traffic Management | Name resolution / policy-based endpoint steering |
| API Gateway[^api] | Publish and control service endpoints |
| Service Gateway | Private access from a network to supported Oracle services |
| NAT Gateway[^nat] | Outbound internet connectivity for private resources |
| Site-to-Site VPN[^vpn] / FastConnect | Encrypted tunnels / dedicated connectivity |

See [networking services](https://www.oracle.com/cloud/networking/).

## Messaging and integration

| Service | Role / common use |
|---------|-------------------|
| Queue | Decouple producers and workers through queued messages |
| Streaming | Retain partitioned event streams for consumers |
| Notifications | Deliver messages to subscribed destinations |
| Events | Match resource events and trigger actions |
| Oracle Integration | Connect applications and coordinate integration flows |
| GoldenGate | Capture and replicate database changes |

Use Queue for work distribution and Streaming for retained streams; broker choice does not remove duplicate-processing concerns. See [application and data integration](https://www.oracle.com/integration/).

## Security and identity

| Service | Role / common use |
|---------|-------------------|
| IAM[^iam] / identity domains | Policies, users, federation, and application identities |
| Dynamic groups / instance principals | Identify workloads and authorize compute without embedded user keys |
| Vault | Manage encryption keys and secrets |
| Cloud Guard / Security Zones | Detect risky activity/configuration / enforce security restrictions |
| WAF[^waf] / Network Firewall | Web request filtering / network traffic inspection |
| Bastion | Controlled, temporary access to private resources |

Policies grant actions over resources in compartments. A network connection alone grants no service permission. See the [identity and access overview](https://docs.oracle.com/en-us/iaas/Content/Identity/Concepts/overview.htm).

## Analytics and artificial intelligence

| Service | Role / common use |
|---------|-------------------|
| Oracle Analytics Cloud | Reporting, visualization, and business analytics |
| Data Integration | Data preparation and transformation pipelines |
| Data Flow | Managed Apache Spark execution |
| Data Catalog | Discover and describe data assets |
| Data Science | Notebooks, model training, and model deployment |
| Generative AI | Access managed generative models |
| Document Understanding / Vision / Speech | Document extraction / image analysis / speech processing |

See [Oracle AI services](https://www.oracle.com/artificial-intelligence/) and the [cloud portfolio](https://www.oracle.com/cloud/).

## Delivery, operations, and migration

| Service | Role / common use |
|---------|-------------------|
| Resource Manager | Managed Terraform stacks and execution |
| DevOps | Build and deployment pipelines |
| Logging / Monitoring | Logs / metrics and alarms |
| Audit / Application Performance Monitoring | Service activity audit / application tracing and diagnostics |
| Connector Hub | Move data between supported services |
| Budgets / Cost Analysis / Cloud Advisor | Spending alerts / cost reports / optimization recommendations |
| Database Migration / Cloud Migrations | Database moves / supported virtual-machine migrations |
| Full Stack Disaster Recovery | Coordinate recovery across application components |
| Cloud@Customer / Dedicated Region | Cloud services delivered in customer environments |

See the [OCI portfolio](https://www.oracle.com/cloud/).

## Selection traps

- Oracle Database expertise does not imply tenancy-policy or network expertise. Diagnose database grants, cloud policy, and connectivity separately.
- Do not assume a region has multiple availability domains. Plan failure isolation using the actual topology.
- A database service's automation and an Exadata deployment's capacity model differ. Confirm licensing, patching responsibility, and restore options for the exact offering.

## References

- [Oracle Cloud Infrastructure portfolio](https://www.oracle.com/cloud/)
- [OCI concepts and terminology](https://docs.oracle.com/en-us/iaas/Content/GSG/Concepts/baremetalintro.htm)
- [OCI service documentation](https://docs.oracle.com/en-us/iaas/Content/services.htm)

[^oci]: Oracle Cloud Infrastructure.
[^aws]: Amazon Web Services.
[^oke]: Oracle Container Engine for Kubernetes — the established abbreviation for Kubernetes Engine.
[^ai]: Artificial Intelligence.
[^nosql]: Not Only SQL (Structured Query Language) — a broad label for nonrelational data models.
[^vcn]: Virtual Cloud Network.
[^dns]: Domain Name System.
[^api]: Application Programming Interface.
[^nat]: Network Address Translation.
[^vpn]: Virtual Private Network.
[^iam]: Identity and Access Management.
[^waf]: Web Application Firewall.

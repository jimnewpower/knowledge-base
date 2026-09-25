# Google Cloud (GCP[^gcp]) services cheat sheet

> Baseline: Selected Google Cloud public-cloud infrastructure and platform services; service roles rather than pricing, quotas, or an exhaustive catalog. Reviewed: 2026-09-25.

Use this sheet to map application needs to Google Cloud services. The matching categories in the other provider sheets help comparison, but do not imply identical behavior.

Related: [AWS services](aws-services.md)[^aws], [Azure services](azure-services.md), [Oracle Cloud services](oracle-cloud-services.md), [Terraform](terraform.md), [messaging](messaging-and-events.md).

## Resource model

Organizations and folders group projects; projects contain resources and enabled service APIs[^api], and are linked to billing accounts. Permissions inherit through the resource hierarchy. Resources may be global, regional, or zonal: a VPC[^vpc] network is global while its subnets are regional. See [resource hierarchy](https://docs.cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy).

## Compute and containers

| Service | Role / common use |
|---------|-------------------|
| Compute Engine / managed instance groups | Virtual machines / scalable server fleets |
| Cloud Run | Managed container services and jobs |
| Cloud Run functions | Event-driven functions; formerly Cloud Functions |
| GKE[^gke] | Managed Kubernetes with Standard and Autopilot modes |
| App Engine | Application platform with environment-specific runtime constraints |
| Batch | Schedule batch workloads on managed compute resources |
| Artifact Registry | Store container images and language packages |

Start by deciding how much runtime and cluster control the workload needs. See the [product catalog](https://cloud.google.com/products) and [Cloud Run functions documentation](https://docs.cloud.google.com/run/docs/functions/overview).

## Storage and databases

| Service | Role / common use |
|---------|-------------------|
| Cloud Storage | Object buckets for uploads, archives, and analytical data |
| Persistent Disk / Hyperdisk | Block storage for compute workloads |
| Filestore | Shared managed file storage |
| Backup and DR[^dr] Service | Backup management and recovery for supported workloads |
| Cloud SQL[^sql] | Managed PostgreSQL, MySQL, and SQL Server |
| AlloyDB for PostgreSQL | PostgreSQL-compatible database for demanding relational workloads |
| Spanner | Distributed transactions and horizontally scalable relational data |
| Firestore | Document database for application state |
| Bigtable | Wide-column data with high-throughput key-based access |
| Memorystore | Managed in-memory stores and caches |

Cloud SQL, Spanner, and BigQuery have different workload and transaction models. Sources: [databases](https://cloud.google.com/products/databases), [storage](https://cloud.google.com/products/storage).

## Networking and delivery

| Service | Role / common use |
|---------|-------------------|
| Virtual Private Cloud | Networks, firewall rules, subnets, and routes |
| Cloud Load Balancing | Application and network traffic distribution |
| Cloud DNS[^dns] | Managed public/private name resolution |
| Cloud CDN[^cdn] | Cache content near clients |
| Cloud NAT[^nat] | Outbound address translation for supported private workloads |
| Private Service Connect | Private access to supported service endpoints |
| Cloud VPN[^vpn] / Cloud Interconnect | Encrypted tunnels / dedicated or partner connectivity |
| API Gateway / Apigee | Managed API front doors / broader API lifecycle management |

See [networking products](https://cloud.google.com/resources/networking).

## Messaging and integration

| Service | Role / common use |
|---------|-------------------|
| Pub/Sub[^pubsub] | Asynchronous topics and independent subscriptions |
| Cloud Tasks | Explicit task dispatch with scheduling and retry controls |
| Eventarc | Route events to supported application destinations |
| Workflows | Coordinate service calls, conditions, and retries |
| Cloud Scheduler | Trigger recurring work |
| Managed Service for Apache Airflow | Data workflow orchestration; formerly Cloud Composer |

Choose Pub/Sub for event distribution and Cloud Tasks when the producer controls a task's destination and execution policy. See [Pub/Sub and related services](https://docs.cloud.google.com/pubsub/docs/overview) and [Managed Service for Apache Airflow](https://cloud.google.com/products/managed-service-for-apache-airflow).

## Security and identity

| Service | Role / common use |
|---------|-------------------|
| IAM[^iam] / service accounts | Permissions / workload identities |
| Workload Identity Federation | Exchange external identity for short-lived cloud access |
| Secret Manager / Cloud KMS[^kms] | Secret versions / encryption-key management |
| Cloud Armor | Edge traffic protection and web filtering |
| Security Command Center | Security posture and threat findings |
| Identity-Aware Proxy | Identity-based access to supported applications and resources |

See [security products](https://cloud.google.com/security/products/security-and-identity).

## Analytics and artificial intelligence

| Service | Role / common use |
|---------|-------------------|
| BigQuery | Analytical warehouse and large-scale SQL queries |
| Dataflow | Apache Beam batch and streaming pipelines |
| Managed Service for Apache Spark | Managed Spark processing; formerly Dataproc |
| Looker | Governed analytics and business reporting |
| Gemini Enterprise Agent Platform | Model development, generative AI[^ai], and agents; formerly Vertex AI |
| Document AI | Extract structured information from documents |

Current naming is documented in [Agent Platform](https://cloud.google.com/products/gemini-enterprise-agent-platform) and [Managed Service for Apache Spark](https://cloud.google.com/products/managed-service-for-apache-spark). Older tutorials may retain former product names.

## Delivery, operations, and migration

| Service | Role / common use |
|---------|-------------------|
| Cloud Build / Cloud Deploy | Build automation / managed application delivery |
| Infrastructure Manager | Managed Terraform deployment execution |
| Cloud Logging / Cloud Monitoring | Logs / metrics, dashboards, and alerts |
| Cloud Trace / Cloud Audit Logs | Distributed traces / administrative and data-access audit records |
| Cloud Billing budgets / Recommender | Spending alerts / optimization recommendations |
| Database Migration Service / Datastream | Database moves / change-data replication |
| Storage Transfer Service | Transfer object and file data into cloud storage |

See [developer tools](https://cloud.google.com/products/tools) and [observability](https://cloud.google.com/products/observability).

## Selection traps

- A project being selected in a tool does not prove the application uses the intended credentials or billing/quota project.
- A subscription's delivery guarantees do not make external side effects exactly once. Use idempotent processing.
- Budget alerts do not cap spending. Query scans, retained logs, transfer, and always-running resources can dominate cost.

## References

- [Google Cloud product catalog](https://cloud.google.com/products)
- [Google Cloud resource hierarchy](https://docs.cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy)
- [Google Cloud database portfolio](https://cloud.google.com/products/databases)

[^gcp]: Google Cloud Platform — the common abbreviation for Google Cloud.
[^aws]: Amazon Web Services.
[^api]: Application Programming Interface.
[^vpc]: Virtual Private Cloud.
[^gke]: Google Kubernetes Engine.
[^dr]: Disaster Recovery.
[^sql]: Structured Query Language.
[^dns]: Domain Name System.
[^cdn]: Content Delivery Network.
[^nat]: Network Address Translation.
[^vpn]: Virtual Private Network.
[^pubsub]: Publish/Subscribe — messaging that separates publishers from subscribers.
[^iam]: Identity and Access Management.
[^kms]: Key Management Service.
[^ai]: Artificial Intelligence.

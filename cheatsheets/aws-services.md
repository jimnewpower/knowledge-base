# AWS[^aws] cloud services cheat sheet

> Baseline: Selected AWS public-cloud infrastructure and platform services; service roles rather than pricing, quotas, or an exhaustive catalog. Reviewed: 2026-09-25.

Use this sheet to translate an application need into an AWS service shortlist. Check regional availability and the selected service's deployment model before designing around it.

Related: [AWS operations](aws.md), [Azure services](azure-services.md), [Google Cloud services](gcp-services.md), [Oracle Cloud services](oracle-cloud-services.md), [Terraform](terraform.md).

## Resource model

An account is an isolation and billing boundary; Organizations groups accounts. Most application resources live in a Region, with Availability Zones providing separate failure domains inside it. Identity and network configuration remain part of the application design even when compute is serverless.

## Compute and containers

| Service | Role / common use |
|---------|-------------------|
| EC2[^ec2] / EC2 Auto Scaling | Virtual machines and demand-based fleet sizing |
| Elastic Beanstalk | Deploy web applications onto managed application environments |
| Lambda | Run functions from requests, events, or schedules |
| ECS[^ecs] | AWS-native container orchestration |
| EKS[^eks] | Managed Kubernetes control plane |
| Fargate | Container compute for supported ECS/EKS workloads without managing servers |
| ECR[^ecr] | Store container images |
| Batch | Schedule queued batch jobs onto compute capacity |

Fargate supplies compute; ECS and EKS orchestrate workloads. Choosing EKS also means choosing Kubernetes concepts and operational responsibilities. See the [compute overview](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/compute-services.html).

## Storage and databases

| Service | Role / common use |
|---------|-------------------|
| S3[^s3] | Object storage for uploads, backups, and data lakes |
| S3 Glacier storage classes | Archival objects with retrieval tradeoffs |
| EBS[^ebs] | Persistent block volumes for EC2 |
| EFS[^efs] / FSx | Shared file storage / managed file-system families |
| AWS Backup | Central backup policies for supported resources |
| RDS[^rds] | Managed relational database engines |
| Aurora | Relational database compatible with MySQL or PostgreSQL |
| DynamoDB | Key-value and document access built around partition keys |
| ElastiCache | Managed in-memory caching |
| Neptune | Graph data and relationship queries |

An S3 object is not a mounted shared file. RDS engine choice, Aurora compatibility, and DynamoDB key design have different application implications. Sources: [storage](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/storage-services.html), [databases](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/database.html).

## Networking and delivery

| Service | Role / common use |
|---------|-------------------|
| VPC[^vpc] | Private networking, subnets, routes, and security groups |
| Elastic Load Balancing | Distribute traffic to application or network targets |
| Route 53 | DNS[^dns] hosting, routing, and health checks |
| CloudFront | Edge delivery and caching |
| API Gateway[^api] | Publish and control application endpoints |
| PrivateLink | Private access to supported services |
| Site-to-Site VPN[^vpn] / Direct Connect | Encrypted tunnels / dedicated connectivity |

See [networking services](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/networking-services.html).

## Messaging and integration

| Service | Role / common use |
|---------|-------------------|
| SQS[^sqs] | Work queues with independently consuming workers |
| SNS[^sns] | Publish notifications to multiple subscribers |
| EventBridge | Route events by rules and connect event sources |
| Step Functions | Coordinate workflows, branches, retries, and waits |
| Kinesis Data Streams | Retained event streams for multiple consumers |
| Amazon MQ[^mq] | Managed ActiveMQ or RabbitMQ brokers |

Queueing work, broadcasting notifications, and replaying streams are different needs. Design handlers for the chosen delivery guarantees. Sources: [integration](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/application-integration.html), [analytics](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/analytics.html).

## Security and identity

| Service | Role / common use |
|---------|-------------------|
| IAM[^iam] / IAM Identity Center | Resource permissions / workforce access across accounts |
| Cognito | Application customer sign-in and identity federation |
| KMS[^kms] / Secrets Manager | Encryption key control / application secret lifecycle |
| WAF[^waf] / Shield | Web request filtering / denial-of-service protection |
| GuardDuty / Inspector | Threat detection / workload vulnerability findings |

See [security services](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/security-services.html).

## Analytics and artificial intelligence

| Service | Role / common use |
|---------|-------------------|
| Athena | Query data in object storage using SQL[^sql] |
| Redshift | Analytical data warehouse |
| Glue | Data integration, cataloging, and transformation |
| EMR[^emr] | Managed Spark and related distributed processing |
| OpenSearch Service | Search and log analytics |
| Bedrock | Access foundation models and build generative AI[^ai] applications |
| SageMaker AI | Build, train, and deploy machine-learning models |

Sources: [analytics](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/analytics.html), [Bedrock](https://aws.amazon.com/bedrock/), [SageMaker AI](https://aws.amazon.com/sagemaker/ai/).

## Delivery, operations, and migration

| Service | Role / common use |
|---------|-------------------|
| CloudFormation / CDK[^cdk] | Infrastructure templates / code that synthesizes templates |
| CodeBuild / CodePipeline | Build execution / delivery orchestration |
| CloudWatch / CloudTrail | Runtime telemetry / account activity audit |
| Systems Manager / Config | Fleet operations / resource configuration history and rules |
| Organizations / Control Tower | Account governance / landing-zone setup and controls |
| Cost Explorer / Budgets | Cost analysis / spending alerts |
| DMS[^dms] / DataSync | Database migration and replication / data transfers |
| Outposts | AWS infrastructure deployed on premises |

See [management services](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/management-governance.html) and the [complete category index](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/amazon-web-services-cloud-platform.html).

## Selection traps

- CloudWatch explains runtime behavior; CloudTrail records account activity. Neither automatically captures every application-level action.
- Multi-zone availability does not recover accidentally deleted data. Verify backups and restore procedures separately.
- Budget alerts are notifications, not a universal spending cap. Include network transfer, logs, and idle resources in estimates.

## References

- [AWS service catalog by category](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/amazon-web-services-cloud-platform.html)
- [AWS Well-Architected framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)

[^aws]: Amazon Web Services.
[^ec2]: Elastic Compute Cloud.
[^ecs]: Elastic Container Service.
[^eks]: Elastic Kubernetes Service.
[^ecr]: Elastic Container Registry.
[^s3]: Simple Storage Service.
[^ebs]: Elastic Block Store.
[^efs]: Elastic File System.
[^rds]: Relational Database Service.
[^vpc]: Virtual Private Cloud.
[^dns]: Domain Name System.
[^api]: Application Programming Interface.
[^vpn]: Virtual Private Network.
[^sqs]: Simple Queue Service.
[^sns]: Simple Notification Service.
[^mq]: Message Queue — the messaging abbreviation used in broker product names.
[^iam]: Identity and Access Management.
[^kms]: Key Management Service.
[^waf]: Web Application Firewall.
[^sql]: Structured Query Language.
[^emr]: Elastic MapReduce — the historical expansion of the Amazon EMR product name.
[^ai]: Artificial Intelligence.
[^cdk]: Cloud Development Kit.
[^dms]: Database Migration Service.

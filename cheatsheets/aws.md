# AWS[^aws] application operations cheat sheet

> Baseline: AWS CLI[^cli] v2, IAM[^iam] roles, and regional application services; commands assume an existing authorized profile. Reviewed: 2026-09-25.

Verify the account, role, and Region before interpreting an AWS result or changing a resource.

Related: [DynamoDB](dynamodb.md), [CloudTrail and CloudWatch](cloudtrail-cloudwatch.md), [Terraform](terraform.md), [secrets management](secrets-management.md).

## Establish context

These commands authenticate using an existing IAM Identity Center profile and inspect identity/configuration. Replace `engineering-dev` with the configured profile. The Region is illustrative.

```bash
aws sso login --profile engineering-dev
aws sts get-caller-identity --profile engineering-dev
aws configure get region --profile engineering-dev
aws ec2 describe-vpcs --profile engineering-dev --region us-west-2
```

For unattended workloads, use an attached role or workload identity federation with constrained trust. Avoid copying developer credentials into a container. The CLI and SDK[^sdk] credential chains can select different sources; inspect the actual caller when an authorization result is surprising.

## Service selection and ownership

| Need | Candidate | Design question |
|------|-----------|-----------------|
| Object/file storage | S3[^s3] | Object identity, versioning, lifecycle, recovery and access policy |
| Relational state | RDS[^rds] / Aurora | Engine compatibility, failover, connection budget, restore time |
| Key-based access at scale | DynamoDB | Partition/sort keys, indexes, hot keys and consistency |
| Containers | ECS[^ecs] / EKS[^eks] | Who operates scheduling, upgrades, ingress and workload identity? |
| Event-driven function | Lambda | Duration/concurrency limits, retries and duplicate delivery |
| Work queue | SQS[^sqs] | Visibility timeout, redelivery, dead-letter handling and idempotency |
| Keys/secrets | KMS[^kms] / Secrets Manager | Encryption key policy versus credential lifecycle |

Treat these as candidates to evaluate against requirements, not automatic defaults. Confirm service quotas and regional availability for the chosen account.

## Diagnose in layers

1. Confirm caller, resource ARN[^arn], Region, and request time.
2. For access failures, inspect identity policy, resource policy, role trust, organization controls, permission boundaries, and encryption-key permissions as applicable. An explicit deny can override an allow.
3. For timeouts, check DNS[^dns], routes, security groups, network ACLs[^acl], service endpoints, and application deadline.
4. Correlate application request IDs[^id] with service metrics/logs and audit events.
5. Check quotas, throttling and retry volume before increasing capacity.

## Release and recovery

Promote immutable artifact digests through environments, keep infrastructure reviewable, and test restoring a backup into a separate environment. Multi-AZ[^az] availability does not substitute for recovery from deleted or corrupted data. Tag resources with owner/environment and set budgets for compute, storage, logs, and data transfer.

## References

- [AWS CLI IAM Identity Center authentication](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)
- [IAM policy evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- [AWS Well-Architected framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)

[^aws]: Amazon Web Services.
[^cli]: Command-Line Interface.
[^iam]: Identity and Access Management.
[^sdk]: Software Development Kit.
[^s3]: Amazon Simple Storage Service.
[^rds]: Amazon Relational Database Service.
[^ecs]: Amazon Elastic Container Service.
[^eks]: Amazon Elastic Kubernetes Service.
[^sqs]: Amazon Simple Queue Service.
[^kms]: Key Management Service.
[^arn]: Amazon Resource Name.
[^dns]: Domain Name System.
[^acl]: Access Control List.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).
[^az]: Availability Zone.

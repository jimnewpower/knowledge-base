# AWS application operations cheat sheet

> Baseline: AWS CLI v2, IAM roles, and regional application services; commands assume an existing authorized profile. Reviewed: 2026-09-25.

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

For unattended workloads, use an attached role or workload identity federation with constrained trust. Avoid copying developer credentials into a container. The CLI and SDK credential chains can select different sources; inspect the actual caller when an authorization result is surprising.

## Service selection and ownership

| Need | Candidate | Design question |
|------|-----------|-----------------|
| Object/file storage | S3 | Object identity, versioning, lifecycle, recovery and access policy |
| Relational state | RDS / Aurora | Engine compatibility, failover, connection budget, restore time |
| Key-based access at scale | DynamoDB | Partition/sort keys, indexes, hot keys and consistency |
| Containers | ECS / EKS | Who operates scheduling, upgrades, ingress and workload identity? |
| Event-driven function | Lambda | Duration/concurrency limits, retries and duplicate delivery |
| Work queue | SQS | Visibility timeout, redelivery, dead-letter handling and idempotency |
| Keys/secrets | KMS / Secrets Manager | Encryption key policy versus credential lifecycle |

Treat these as candidates to evaluate against requirements, not automatic defaults. Confirm service quotas and regional availability for the chosen account.

## Diagnose in layers

1. Confirm caller, resource ARN, Region, and request time.
2. For access failures, inspect identity policy, resource policy, role trust, organization controls, permission boundaries, and encryption-key permissions as applicable. An explicit deny can override an allow.
3. For timeouts, check DNS, routes, security groups, network ACLs, service endpoints, and application deadline.
4. Correlate application request IDs with service metrics/logs and audit events.
5. Check quotas, throttling and retry volume before increasing capacity.

## Release and recovery

Promote immutable artifact digests through environments, keep infrastructure reviewable, and test restoring a backup into a separate environment. Multi-AZ availability does not substitute for recovery from deleted or corrupted data. Tag resources with owner/environment and set budgets for compute, storage, logs, and data transfer.

## References

- [AWS CLI IAM Identity Center authentication](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)
- [IAM policy evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- [AWS Well-Architected framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)

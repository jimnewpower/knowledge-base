# Secrets management cheat sheet

> Baseline: application and CI[^ci] credentials across desktop, containers, AWS[^aws], and Azure; lifecycle guidance independent of a specific vault. Reviewed: 2026-09-25.

A secret needs an owner, scope, delivery path, rotation method, and revocation procedure. Moving a password from source code to an environment variable only changes its location.

Related: [authentication](authentication.md), [Entra ID](entra-id.md)[^id], [Terraform](terraform.md), [software supply chain](software-supply-chain.md).

## Choose the credential mechanism

| Situation | Starting choice | Boundary to check |
|-----------|-----------------|-------------------|
| Cloud workload to cloud service | Managed identity / role / workload federation | Trust policy, audience, subject, resource scope |
| CI deployment | Short-lived federated identity | Repository, ref/environment restrictions, trusted runner |
| Legacy database password | Managed secret store with rotation | Pool reconnection, overlap, database-side change |
| Desktop login cache | Supported identity library plus OS[^os]-protected storage | Current-user access, logout, device compromise |
| Signing private key | Managed key/signing service or controlled key store | Who may sign, audit, key version and recovery |

Bootstrap access to the secret store is itself an identity decision. Prefer a workload identity over another long-lived vault password.

## Lifecycle runbook

1. Inventory consumers, required privileges, owner, and maximum credential lifetime.
2. Issue a narrowly scoped credential; record metadata without recording the value in tickets/logs.
3. Deliver through a controlled channel and test startup, refresh, and loss of access.
4. Rotate with an overlap strategy where supported: introduce new, update consumers, verify use, revoke old.
5. Confirm stale processes and connection pools cannot keep using revoked credentials beyond the accepted window.
6. For exposure, revoke/rotate first, then remove copies and investigate access. Deleting a Git line cannot undo a leaked credential.

## Exposure surfaces

| Surface | Failure mode |
|---------|--------------|
| Environment variables | Process inspection, dumps, child inheritance, diagnostic endpoints |
| Command arguments | Process listings, shell history, build logs |
| Files/mounted volumes | Permissions, backups, image layers, stale copies |
| Terraform state/plans | Sensitive values retained despite display redaction |
| CI masking | Transformed/encoded values can evade masking; malicious jobs can exfiltrate them |
| Browser/mobile bundle | Distributed to users; cannot store a confidential shared secret |

Do not log full connection strings, authorization headers, tokens, or secret-store responses. Test redaction with synthetic markers. Limit secret read access to the needed path/version and keep an audit trail of access and rotation.

## Availability choices

Define whether a running service can use a cached credential during a vault outage, for how long, and how revocation affects that choice. Bound retries to prevent every instance hammering the vault at once. Test rotation under real traffic and recovery with the secret store temporarily unavailable.

## References

- [OWASP secrets management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)[^owasp]
- [AWS Secrets Manager rotation](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html)
- [Azure Key Vault secrets guidance](https://learn.microsoft.com/en-us/azure/key-vault/secrets/secrets-best-practices)

[^ci]: Continuous Integration.
[^aws]: Amazon Web Services.
[^id]: Identifier (or identity in a product name such as Microsoft Entra ID).
[^os]: Operating System.
[^owasp]: Open Worldwide Application Security Project.

# Terraform cheat sheet

> Baseline: Terraform 1.x; pin exact CLI[^cli]/provider versions and verify backend features for the selected release. Reviewed: 2026-09-25.

Configuration describes desired infrastructure. State connects resource addresses to remote objects; both the state and the plan require controlled access.

Related: [AWS](aws.md)[^aws], [Azure](azure.md), [secrets management](secrets-management.md), [CI/CD](devops.md)[^ci][^cd].

## Review-to-apply workflow

In an initialized project with reviewed provider configuration and credentials for the intended environment:

```bash
terraform fmt -check -recursive
terraform init
terraform validate
terraform plan -out=tfplan
terraform show tfplan
```

`init` installs providers/modules and configures the backend. A plan may contact provider APIs[^api] and read remote state. Only after reviewing the exact saved plan, apply with `terraform apply tfplan`; this changes infrastructure. Regenerate/review if the inputs or state change. Saved plans can contain secrets and must not be published as ordinary CI artifacts.

## Files and responsibilities

| Item | Treatment |
|------|-----------|
| `.tf` files | Version-controlled infrastructure definition; no credentials |
| `.terraform.lock.hcl` | Commit provider selections/checksums; module versions need separate pinning |
| `.terraform/` | Local initialization data; exclude from source control |
| State | Encrypted, access-controlled backend; versioning/recovery and supported locking |
| Variable files | Commit only nonsecret configuration appropriate for the repository |
| Plan | Short-lived review artifact tied to source, environment, and state |

`sensitive = true` primarily redacts display; it does not generally omit a value from state or plan files. Ephemeral values and write-only arguments have release/provider restrictions. Confirm support instead of treating them as universal secret storage.

## Changes that deserve scrutiny

- Replacement: understand which attribute forces replacement and whether a new instance can coexist with the old one.
- Rename/refactor: use documented `moved` blocks where applicable; otherwise an address change can look like delete/create.
- Import: reconcile imported state with configuration and inspect the next plan; import alone does not establish a correct declaration.
- Drift: determine whether a manual change was emergency repair or unauthorized divergence before overwriting it.
- Lock contention: find the active owner before force-unlocking; two writers can damage state.

Avoid routine `-target` use as a deployment strategy. It can leave the wider configuration unconverged. `prevent_destroy` is a guard on applicable planned operations, not a backup or an external deletion control. A workspace name alone is not an account/permission isolation boundary.

## References

- [Terraform plan](https://developer.hashicorp.com/terraform/cli/commands/plan)
- [Terraform sensitive data](https://developer.hashicorp.com/terraform/language/manage-sensitive-data)
- [Terraform dependency lock file](https://developer.hashicorp.com/terraform/language/files/dependency-lock)
- [Terraform resource refactoring](https://developer.hashicorp.com/terraform/language/modules/develop/refactoring)

[^cli]: Command-Line Interface.
[^aws]: Amazon Web Services.
[^ci]: Continuous Integration.
[^cd]: Continuous Delivery or Continuous Deployment; delivery keeps changes releasable, while deployment automatically releases them to production.
[^api]: Application Programming Interface — the contract through which software components interact.

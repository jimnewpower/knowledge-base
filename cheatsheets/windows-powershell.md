# Windows and PowerShell diagnostics cheat sheet

> Baseline: Windows 11 / Windows Server with PowerShell 7; Windows networking cmdlets require the corresponding OS modules. Reviewed: 2026-09-25.

PowerShell pipes objects. Keep them as objects until the final display/export step, and distinguish PowerShell cmdlets from native executables.

Related: [Bash](bash.md), [Linux diagnostics](linux-diagnostics.md), [Java desktop packaging](java-desktop-packaging.md).

## Read-only diagnostics

Run locally. Process, event, and network visibility depends on permissions; replace the example port and host with the target under investigation.

```powershell
Get-Process java* | Select-Object Id, ProcessName, CPU, WorkingSet64
Get-Service | Where-Object Status -eq 'Running'
Get-NetTCPConnection -LocalPort 8080 -State Listen
Test-NetConnection -ComputerName localhost -Port 8080
Get-Volume | Select-Object DriveLetter, SizeRemaining, Size
Get-WinEvent -FilterHashtable @{LogName='Application'; StartTime=(Get-Date).AddHours(-1)} -MaxEvents 30
```

`CPU` is accumulated processor time, not instantaneous utilization. Find a listening connection's `OwningProcess`, then inspect that PID. An empty result or access error needs interpretation; it does not by itself prove a service is healthy or absent.

## Quoting, files, and errors

| Need | PowerShell form |
|------|-----------------|
| Literal text | `'C:\Data\Project files'`; single quotes prevent interpolation |
| Variable interpolation | `"Build $buildNumber"`; avoid it for untrusted command text |
| File content | `Get-Content -LiteralPath $path` |
| Invoke executable with spaces | `& 'C:\Tools\app.exe' '--input' $path` |
| Fail on a cmdlet error | `-ErrorAction Stop`, then catch only when recovery/translation is needed |
| Native command status | Inspect `$LASTEXITCODE` immediately after invocation |
| SHA-256 of a file | `Get-FileHash -LiteralPath $path -Algorithm SHA256` |

Do not build command strings and pass them to `Invoke-Expression`. Prefer arguments and `-LiteralPath` when a filename can contain wildcard characters. `Format-Table` produces display objects; put it at the end of a pipeline, not before data processing.

## Java and environment checks

Use `Get-Command java -All` to find competing installations, then `java -version`. Compare the service's runtime, account, working directory, and environment with the interactive shell. Services do not necessarily inherit your current user environment or have access to mapped drives.

Preserve original logs and establish timestamps/time zones before restarting anything. For a file lock, inspect the owning process with Windows tooling; deleting lock files does not release OS handles. When a cleanup is necessary, resolve and inspect the exact target path first, then use one shell and explicit native filesystem operations.

## References

- [PowerShell quoting rules](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules)
- [PowerShell automatic variables](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_automatic_variables)
- [Windows TCP connection inspection](https://learn.microsoft.com/en-us/powershell/module/nettcpip/get-nettcpconnection)

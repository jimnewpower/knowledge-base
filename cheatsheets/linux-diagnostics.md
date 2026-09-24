# Linux diagnostics cheat sheet

> Baseline: Linux with procfs, systemd, iproute2, and optional sysstat tools; container images may omit them. Reviewed: 2026-09-24.

What to type when a process misbehaves on Linux. Pair with [bash.md](bash.md), [observability.md](observability.md), and [kubernetes-openshift.md](kubernetes-openshift.md) when the process is in a pod.

## Who is this machine, is it dying?

```bash
uname -a
uptime
free -h
df -h
df -i                 # inode exhaustion looks like "disk full" with space left
nproc
```

Load average is runnable+uninterruptible threads, not “CPU %.” Compare to core count.

## Process

```bash
ps aux | grep java
pidof java
top                   # Shift-P CPU, Shift-M memory
htop                  # if installed
pstree -p <pid>
ls -l /proc/<pid>/cwd
tr '\0' '\n' < /proc/<pid>/environ | sort
cat /proc/<pid>/limits
```

Signals: `TERM` (15) polite stop, `KILL` (9) cannot be caught, `HUP` often reload. JVM: `kill -3 <pid>` dumps threads to stdout.

```bash
kill -TERM <pid>
kill -3 <pid>
```

## CPU, memory, disk I/O

```bash
vmstat 1
iostat -xz 1          # sysstat package
pidstat -u -r -d 1
```

- `wa` in `vmstat` high → waiting on disk.
- `si`/`so` paging → memory pressure.
- RSS vs VSS: RSS is resident; Java VSS includes reserved heap.

OOM: `dmesg -T | grep -i oom` or `journalctl -k | grep -i oom`.

## Network

```bash
ss -lntup             # listen sockets
ss -antp | grep :8080
ip addr
ip route
curl -sv --max-time 3 http://127.0.0.1:8080/actuator/health
getent hosts api.example.com
```

`ss` replaces `netstat` on modern hosts. `LISTEN` vs `ESTAB` vs `TIME-WAIT`.

```bash
lsof -p <pid>
lsof -iTCP:8080 -sTCP:LISTEN
```

Too many open files: check `ulimit -n` and `/proc/<pid>/limits`. Raise the limit or find the leak.

## Logs and journals

```bash
journalctl -u order-api -f
journalctl --since "10 min ago" -p err
tail -f /var/log/app/order-api.log
```

On Kubernetes, logs are `kubectl logs` / `oc logs`; the node journal may never see them.

## Files and permissions

```bash
ls -la
stat file
namei -l /path/to/file
id
sudo -n true          # can I sudo without a password?
```

`Permission denied` is often the parent directory, not the file.

## Time and certs

```bash
timedatectl
date -u
openssl s_client -connect host:443 -servername host </dev/null
```

TLS failures from clock skew look like “certificate not yet valid.” See [http-and-tls.md](http-and-tls.md).

## Containers on a node

```bash
crictl ps             # kubelet runtime
docker ps             # if Docker is the runtime
nsenter -t <pid> -n ss -lnt
```

Inside a pod you often have a thin image (no `ss`, no `curl`). Install debug sidecars or `oc debug`.

## Gotchas

- Debugging as root “fixes” a permission bug you then ship.
- `kill -9` first. Always try `TERM` and read logs.
- Assuming the hostname in the alert is the same namespace/node you SSHed to.
- Filling the disk with heap dumps in `/tmp` on a tiny container.

## References

- [Linux kernel — procfs fields and behavior](https://www.kernel.org/doc/html/latest/filesystems/proc.html)
- [systemd — journalctl manual](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html)

# Kubernetes and OpenShift cheat sheet

> Baseline: Kubernetes apps/v1 Deployments and OpenShift 4.x; image guidance references OpenShift 4.18. Reviewed: 2026-09-24.

Kubernetes schedules **pods** (one or more containers) onto nodes. OpenShift is Kubernetes plus routes, stricter security defaults, `oc`, and an opinionated image/build flow.

Related: [docker.md](docker.md), [devops.md](devops.md), [observability.md](observability.md).

## Objects you actually touch

| Object | Role |
|--------|------|
| Namespace / Project | Isolation bucket (OpenShift project ≈ namespace + extras) |
| Pod | Smallest deployable; ephemeral |
| Deployment / DeploymentConfig | Desired replica set + rolling update |
| ReplicaSet | Pod copies (owned by Deployment) |
| Service | Stable DNS + cluster IP in front of pods |
| Route (OpenShift) / Ingress | Public HTTP(S) into a Service |
| ConfigMap | Non-secret config |
| Secret | Credential material — still base64, not magic safety |
| PVC | Durable disk |
| ServiceAccount | Identity the pod uses to talk to the API |
| NetworkPolicy | Who may speak to whom |

```text
Route / Ingress → Service → Pod(s) → container process
```

## Mental model

- Desired state lives in YAML (or Helm). The control plane converges reality toward it.
- Pods die. Disk in the container dies with them unless it is a volume.
- A Service selects pods by labels, not by name.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-api
spec:
  replicas: 2
  selector:
    matchLabels: { app: order-api }
  template:
    metadata:
      labels: { app: order-api }
    spec:
      containers:
        - name: app
          image: registry.example.com/order-api:1.4.0
          ports: [{ containerPort: 8080 }]
          readinessProbe:
            httpGet: { path: /actuator/health/readiness, port: 8080 }
          livenessProbe:
            httpGet: { path: /actuator/health/liveness, port: 8080 }
          resources:
            requests: { cpu: "100m", memory: "256Mi" }
            limits:   { memory: "512Mi" }
```

## Probes

| Probe | If it fails |
|-------|-------------|
| Liveness | Container is killed and restarted |
| Readiness | Pod is removed from the Service |
| Startup | Delays the other probes for slow boots |

A liveness probe that hits a stressed database will murder a healthy app. Liveness = process is deadlocked. Readiness = may take traffic.

## Commands

```bash
# Kubernetes
kubectl -n orders get pods
kubectl -n orders describe pod order-api-abc
kubectl -n orders logs -f deploy/order-api
kubectl -n orders exec -it deploy/order-api -- bash
kubectl -n orders apply -f deploy.yaml
kubectl -n orders rollout status deploy/order-api
kubectl -n orders rollout undo deploy/order-api

# OpenShift extras
oc login --server https://api.cluster.example:6443
oc project orders
oc get routes
oc rsh deploy/order-api
oc logs -f deploy/order-api
oc expose svc/order-api          # creates a Route
```

`oc` can do almost everything `kubectl` can. Prefer `oc` on OpenShift so you see Routes and projects.

## Config and secrets

```yaml
envFrom:
  - configMapRef: { name: order-api-config }
  - secretRef:    { name: order-api-db }
```

Or mount files. Do not bake env-specific config into the image. Same digest in every environment; see [devops.md](devops.md).

OpenShift often runs containers as an arbitrary non-root UID. Images that require UID 0 or a writable `/` fail. Use group-writable paths and a non-root `USER`.

## Rolling updates and health

A Deployment rolls out new pods, waits for readiness, then drops old ones. If readiness never passes, the rollout stalls. `rollout undo` is the rollback.

## Resource reality

- Requests: scheduler and noisy-neighbor planning.
- Limits: kill (memory) or throttle (CPU).
- JVM: set heap from cgroup (`-XX:MaxRAMPercentage=75`), not a laptop-sized `-Xmx`.

## Gotchas

- `CrashLoopBackOff`: `describe` + previous logs (`--previous`).
- Image pull errors: wrong tag, missing pull secret, private registry.
- Service exists but Route points at the wrong port.
- `latest` tag + `imagePullPolicy: Always` is not a release process. Pin digest.
- One replica + a liveness probe that fails during GC = self-DDoS.

## References

- [Kubernetes — liveness, readiness, and startup probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [OpenShift 4.18 — creating images and arbitrary UIDs](https://docs.redhat.com/en/documentation/openshift_container_platform/4.18/html/images/creating-images)

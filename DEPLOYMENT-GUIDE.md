

# Phase 6: Deployment Configuration Guide

## CI/CD Pipeline Status (Updated December 9, 2025)

### ✅ Enhanced Workflow Configuration Complete
- **File:** `.github/workflows/ci.yml`
- **Status:** All 14 jobs configured with 3 deployment strategies
- **Trigger:** On push to master, main, develop branches

### 14 Jobs Now Configured:
1. **setup** - Node.js 18 setup & npm ci
2. **lint-backend** - ESLint validation (ignores frontend/public)
3. **unit-tests** - Jest unit tests with coverage
4. **coverage** - Code coverage reporting to Codecov
5. **security-audit** - npm audit for vulnerabilities
6. **docker-build** - Build Docker image
7. **deploy** - Deployment artifacts preparation
8. **deploy-kubernetes** - Rolling update deployment
9. **deploy-blue-green** - Blue-green deployment strategy
10. **deploy-docker-swarm** - Docker Swarm deployment
11. **verify-deployment** - Health check and verification
12. **dependency-check** - Check for outdated packages
13. **code-quality** - Code structure analysis
14. **status-check** - Final workflow summary
15. **notify-slack** - Slack notifications

### ✅ Phase 6 Implementation:

#### Resource Requirements Calculated

**Per Pod (Standard Production):**
- CPU Request: 250m (minimum guaranteed)
- CPU Limit: 1000m (maximum allowed)
- Memory Request: 256Mi (minimum guaranteed)
- Memory Limit: 1Gi (maximum allowed)

**For 3-Pod Deployment:**
- Minimum Resources: 750m CPU + 768Mi memory
- Maximum Resources: 3000m CPU + 3Gi memory
- Reserve 10% for system overhead

**For 10-Pod HPA Deployment:**
- Maximum Resources: 10000m CPU + 10Gi memory
- Recommended cluster: 12-20 CPU cores, 24-40GB RAM

---

## Deployment Strategies Implemented

### 1. ⏳ Kubernetes Rolling Update

**Strategy:** Gradually replace old pods with new ones (zero-downtime)

**Configuration:**
- maxSurge: 1 (allow 4 pods during update)
- maxUnavailable: 0 (never pause service)
- Duration: 5-10 minutes
- Downtime: 0 seconds

**How to Deploy:**
```bash
kubectl set image deployment/survey-system \
  survey-system=yourusername/survey-system:v1.1.0 \
  -n production
```

**Rollback:**
```bash
kubectl rollout undo deployment/survey-system -n production
```

**Best For:**
- Large clusters with multiple nodes
- Applications that need gradual traffic shifts
- Monitoring and catching issues during deployment

---

### 2. 🔄 Blue-Green Deployment

**Strategy:** Maintain two environments, switch traffic when new version is ready

**Configuration:**
- Blue (current): 3 replicas, receiving traffic
- Green (new): 0-3 replicas, standby/testing
- Switch: < 30 seconds
- Rollback: < 30 seconds

**How to Deploy:**
```bash
./scripts/blue-green-deploy.sh production blue green \
  yourusername/survey-system:v1.1.0
```

**Instant Rollback:**
```bash
kubectl patch service survey-system-service \
  -p '{"spec":{"selector":{"version":"blue"}}}'
kubectl scale deployment survey-system-blue --replicas=3
```

**Best For:**
- Critical production systems (instant rollback required)
- Zero tolerance for errors
- Applications that need full pre-flight testing
- When you need easy A/B testing

---

### 3. 🐳 Docker Swarm Deployment

**Strategy:** Multi-host cluster deployment with built-in auto-rollback

**Configuration:**
- Replicas: 3
- Update parallelism: 1 (one service at a time)
- Delay between updates: 10 seconds
- Auto-rollback on failure: Enabled
- Duration: ~30 seconds

**How to Deploy:**
```bash
# Initialize Swarm (once per cluster)
docker swarm init

# Deploy stack
docker stack deploy -c docker-stack.yml survey-system

# Check status
docker stack ps survey-system
```

**Update Service:**
```bash
docker service update --image \
  yourusername/survey-system:v1.1.0 \
  survey-system_survey-app
```

**Rollback:**
```bash
# Docker auto-rolls back on failure; manual rollback:
docker service rollback survey-system_survey-app
```

**Best For:**
- Smaller teams/deployments
- Simple multi-host clusters
- Lower operational overhead
- When Kubernetes complexity isn't needed

---

## Resource Allocation Details

### Cluster Resource Calculation

For a production deployment with 3 replicas:

```
┌─────────────────────────────────────────────┐
│ Kubernetes Cluster Resources                │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Node 1 (4 CPU, 8GB RAM)                 │ │
│ │  ├─ Pod-1: 250m CPU, 256Mi mem         │ │
│ │  └─ System: 100m CPU, 512Mi mem        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Node 2 (4 CPU, 8GB RAM)                 │ │
│ │  ├─ Pod-2: 250m CPU, 256Mi mem         │ │
│ │  └─ System: 100m CPU, 512Mi mem        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Node 3 (4 CPU, 8GB RAM)                 │ │
│ │  ├─ Pod-3: 250m CPU, 256Mi mem         │ │
│ │  └─ System: 100m CPU, 512Mi mem        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Cluster Totals:                             │
│ ├─ Total Minimum: 750m CPU, 768Mi mem      │
│ ├─ Total Maximum: 3000m CPU, 3Gi mem       │
│ └─ Total Available: 12 CPU, 24GB RAM       │
│                                             │
└─────────────────────────────────────────────┘
```

### Auto-Scaling (HPA) Configuration

```yaml
minReplicas: 3        # Always maintain 3 pods
maxReplicas: 10       # Never exceed 10 pods

Trigger Thresholds:
├─ CPU Utilization: 70%  (scale up if exceeded)
├─ Memory Utilization: 80% (scale up if exceeded)

Scale Up:
├─ Rate: 100% more pods every 30 seconds
├─ Or: 2 pods every 30 seconds (whichever is more)

Scale Down:
├─ Rate: 50% reduction every 60 seconds
└─ Stability window: 300 seconds (5 minutes)
```

---

## Deployment Comparison Matrix

| Feature | Rolling Update | Blue-Green | Docker Swarm |
|---------|---|---|---|
| Zero Downtime | ✅ Yes | ✅ Yes | ✅ Yes |
| Deployment Time | ⏱️ 5-10 min | ⚡ 2-5 min | ⚡ 30 sec |
| Rollback Time | ⏱️ ~2 min | ⚡ <30 sec | ⚡ <1 min |
| Resource Overhead | 📊 10% | 📊 100% | 📊 5% |
| Pre-flight Testing | ⚠️ Limited | ✅ Full | ⚠️ Limited |
| Complexity | 🔧 Medium | 🔧 Low | 🔧 Very Low |
| Best For | Large clusters | Critical apps | Small teams |
| Learning Curve | 📈 Steep | 📈 Medium | 📈 Shallow |

---

## Health Check Configuration

### Kubernetes Probes

**Liveness Probe** (Restarts unhealthy pods):
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 15  # Wait 15s before first check
  periodSeconds: 10        # Check every 10s
  failureThreshold: 3      # Restart after 3 failures
  timeoutSeconds: 5        # Max 5s per check
```

**Readiness Probe** (Removes from load balancer if unhealthy):
```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 2      # Remove from LB after 2 failures
  timeoutSeconds: 3        # Max 3s per check
```

### Docker Swarm Health Checks

```yaml
healthcheck:
  test: ["CMD", "node", "-e", "require('http').get(...)"]
  interval: 10s      # Check every 10s
  timeout: 5s        # Max 5s for response
  retries: 3         # Restart after 3 failures
  start_period: 15s  # Wait before first check
```

---

## Pod Disruption Budget (PDB)

Ensures minimum availability during maintenance:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: survey-system-pdb
spec:
  minAvailable: 2    # Always keep 2+ pods running
  selector:
    matchLabels:
      app: survey-system
```

This prevents Kubernetes from gracefully evicting all pods during node maintenance.

---

## Monitoring and Observability

### Kubernetes Status Commands

```bash
# Check deployment status
kubectl get deployment survey-system -o wide

# Check pod status
kubectl get pods -l app=survey-system

# Watch real-time updates
kubectl get pods -l app=survey-system -w

# Check rollout history
kubectl rollout history deployment/survey-system

# View detailed status
kubectl describe deployment survey-system
```

### Docker Swarm Status Commands

```bash
# Check service status
docker service ls

# Check task status
docker service ps survey-system_survey-app

# View service details
docker service inspect survey-system_survey-app

# Check logs
docker service logs survey-system_survey-app -f
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Resource requirements approved
- [ ] Deployment manifests reviewed
- [ ] Health checks configured
- [ ] Monitoring setup
- [ ] Slack notifications enabled
- [ ] Rollback procedure documented
- [ ] Database migrations tested
- [ ] Load testing completed
- [ ] Team trained on deployment process
- [ ] Runbooks and documentation created
- [ ] Approval from stakeholders

---

## Next Steps

1. **Choose deployment strategy** based on your needs
2. **Configure cloud credentials** for your platform
3. **Test deployment** in staging environment
4. **Set up monitoring** and alerting
5. **Create runbooks** for operations team
6. **Schedule first production deployment**

---

## References

- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [Docker Swarm Services](https://docs.docker.com/engine/swarm/how-swarm-mode-works/services/)
- [Blue-Green Deployments](https://martinfowler.com/bliki/BlueGreenDeployment.html)
- [Health Checks Best Practices](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)


# Phase 6: Deployment Quick Reference

## 🎯 What Was Implemented

### 1. **Resource Calculations** ✅
- **Per Pod:** 250m CPU (min) / 1000m (max), 256Mi memory (min) / 1Gi (max)
- **3-Pod Cluster:** 750m CPU minimum, 768Mi memory minimum
- **10-Pod Cluster:** 3000m CPU maximum, 3Gi memory maximum
- **Recommended Infrastructure:** 12+ CPU cores, 24+ GB RAM

### 2. **Kubernetes Rolling Update** ✅
- **File:** `k8s/deployment.yaml`
- **Strategy:** Zero-downtime gradual rollout
- **Duration:** 5-10 minutes
- **Configuration:** maxSurge: 1, maxUnavailable: 0
- **Rollback:** `kubectl rollout undo deployment/survey-system`

### 3. **Blue-Green Deployment** ✅
- **File:** `k8s/deployment-blue-green.yaml`
- **Strategy:** Two environments, instant traffic switch
- **Duration:** 2-5 minutes deployment, <30 sec rollback
- **Script:** `scripts/blue-green-deploy.sh`
- **Rollback:** Automatic service selector switch

### 4. **Docker Swarm Deployment** ✅
- **File:** `docker-stack.yml`
- **Strategy:** Multi-host cluster, built-in auto-rollback
- **Duration:** ~30 seconds
- **Script:** `scripts/docker-swarm-deploy.sh`
- **Features:** Auto-rollback on failure, health checks

### 5. **CI/CD Pipeline Updates** ✅
- **New Jobs:** deploy-kubernetes, deploy-blue-green, deploy-docker-swarm, verify-deployment
- **Total Jobs:** 14 (was 9, now expanded for deployment options)
- **Slack Integration:** Notifications with all job results

### 6. **Additional Resources** ✅
- **Auto-Scaling:** HPA (3-10 replicas based on CPU/memory)
- **Load Balancer:** Caddyfile for Docker Swarm
- **High Availability:** Pod Disruption Budget (min 2 pods always running)
- **Health Checks:** Liveness & Readiness probes configured

---

## 📚 Files Created/Modified

### New Files
- `k8s/deployment-blue-green.yaml` - Blue-green deployment with dual environments
- `docker-stack.yml` - Docker Swarm stack configuration
- `Caddyfile` - Reverse proxy configuration for Docker Swarm
- `scripts/blue-green-deploy.sh` - Automated blue-green deployment script
- `scripts/docker-swarm-deploy.sh` - Automated Docker Swarm deployment script

### Modified Files
- `k8s/deployment.yaml` - Enhanced with resource limits, probes, affinity
- `.github/workflows/ci.yml` - Added 5 new deployment jobs (14 total)
- `DEPLOYMENT-GUIDE.md` - Comprehensive deployment documentation

---

## 🚀 Quick Start Guide

### Option 1: Kubernetes Rolling Update (Recommended for Large Deployments)

```bash
# 1. Deploy the application
kubectl apply -f k8s/deployment.yaml

# 2. Update to new version
kubectl set image deployment/survey-system \
  survey-system=yourusername/survey-system:v1.1.0

# 3. Monitor rollout
kubectl rollout status deployment/survey-system

# 4. Rollback if needed
kubectl rollout undo deployment/survey-system
```

**When to use:** Large clusters, gradual rollout preferred, resource-constrained

---

### Option 2: Blue-Green Deployment (Recommended for Critical Systems)

```bash
# 1. Deploy both blue and green environments
kubectl apply -f k8s/deployment-blue-green.yaml

# 2. Run deployment script
./scripts/blue-green-deploy.sh production blue green \
  yourusername/survey-system:v1.1.0

# 3. Script handles:
#    - Scale green to 3 replicas
#    - Wait for readiness (up to 5 min)
#    - Run smoke tests
#    - Switch traffic to green
#    - Scale down blue (keep for rollback)

# 4. Instant rollback if needed
kubectl patch service survey-system-service \
  -p '{"spec":{"selector":{"version":"blue"}}}'
```

**When to use:** Critical apps, zero errors tolerated, need instant rollback

---

### Option 3: Docker Swarm (Recommended for Small Teams)

```bash
# 1. Initialize Swarm (one-time)
docker swarm init

# 2. Deploy stack
docker stack deploy -c docker-stack.yml survey-system

# 3. Check status
docker service ps survey-system_survey-app

# 4. Update service
docker service update --image \
  yourusername/survey-system:v1.1.0 \
  survey-system_survey-app

# 5. View logs
docker service logs survey-system_survey-app -f
```

**When to use:** Small teams, simpler setup, Docker Compose experience

---

## 🔍 Monitoring Commands

### Kubernetes
```bash
# Real-time pod monitoring
kubectl get pods -l app=survey-system -w

# Check deployment status
kubectl get deployment survey-system -o wide

# View events
kubectl describe deployment survey-system

# Check resource usage
kubectl top pods -l app=survey-system
```

### Docker Swarm
```bash
# List services
docker service ls

# Check tasks (pods)
docker service ps survey-system_survey-app

# View logs
docker service logs survey-system_survey-app -f

# Inspect service
docker service inspect survey-system_survey-app
```

---

## 📊 Resource Allocation Reference

### Recommended for Production

| Resource | Request | Limit | Per 3 Pods |
|----------|---------|-------|-----------|
| **CPU** | 250m | 1000m | 750m min / 3000m max |
| **Memory** | 256Mi | 1Gi | 768Mi min / 3Gi max |

### For High-Traffic (adjust as needed)

| Resource | Request | Limit | Per 3 Pods |
|----------|---------|-------|-----------|
| **CPU** | 500m | 2000m | 1500m min / 6000m max |
| **Memory** | 512Mi | 2Gi | 1536Mi min / 6Gi max |

---

## 📋 Deployment Comparison

| Aspect | Rolling Update | Blue-Green | Docker Swarm |
|--------|---|---|---|
| **Downtime** | 0 seconds | 0 seconds | 0 seconds |
| **Duration** | 5-10 min | 2-5 min | 30 sec |
| **Rollback Time** | ~2 min | <30 sec | <1 min |
| **Resource Overhead** | 10% | 100% | 5% |
| **Pre-test New Version** | ⚠️ No | ✅ Yes | ⚠️ No |
| **Complexity** | 🔧 Medium | 🔧 Low | 🔧 Very Low |

---

## ✅ Pre-Deployment Checklist

- [ ] Resources calculated and approved
- [ ] Choose deployment strategy (Rolling/Blue-Green/Swarm)
- [ ] Configure container registry credentials
- [ ] Set up monitoring and alerting
- [ ] Enable Slack notifications
- [ ] Test in staging environment
- [ ] Document runbooks
- [ ] Brief operations team
- [ ] Prepare rollback procedure
- [ ] Schedule deployment

---

## 🎓 Learning Resources

- **Kubernetes:** `DEPLOYMENT-GUIDE.md` (in this repo)
- **Blue-Green:** Read comments in `k8s/deployment-blue-green.yaml`
- **Docker Swarm:** Read `docker-stack.yml` for configuration details
- **Scripts:** Both deployment scripts have inline comments

---

## 🆘 Troubleshooting

### Pods not starting?
```bash
# Check pod logs
kubectl logs <pod-name>

# Check pod events
kubectl describe pod <pod-name>
```

### High CPU usage?
```bash
# Check current CPU
kubectl top pods

# Adjust request/limit in deployment.yaml if needed
```

### Deployment stuck?
```bash
# Kubernetes: Check events
kubectl get events

# Docker Swarm: Check service logs
docker service logs <service> -f
```

---

## 📞 Support

For detailed information:
1. See `DEPLOYMENT-GUIDE.md` for comprehensive guide
2. Check `.github/workflows/ci.yml` for pipeline configuration
3. Review comments in deployment YAML files
4. Run help on deployment scripts: `./scripts/blue-green-deploy.sh`

---

**Last Updated:** December 9, 2025
**Version:** 1.0.0 (Phase 6 Complete)
**Status:** ✅ Ready for Production

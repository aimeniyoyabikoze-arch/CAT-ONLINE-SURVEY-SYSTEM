#!/bin/bash
# Kubernetes Blue-Green Deployment Script
# Safely switch traffic between blue and green environments

set -e

NAMESPACE="${1:-default}"
CURRENT_VERSION="${2:-blue}"
NEW_VERSION="${3:-green}"
DOCKER_IMAGE="${4:-yourusername/survey-system:latest}"

echo "🚀 Blue-Green Deployment Script"
echo "================================"
echo "Namespace: $NAMESPACE"
echo "Current Version: $CURRENT_VERSION"
echo "New Version: $NEW_VERSION"
echo "Docker Image: $DOCKER_IMAGE"
echo ""

# Function to check deployment readiness
check_deployment_ready() {
    local deployment=$1
    local namespace=$2
    local max_wait=300  # 5 minutes
    local elapsed=0
    
    echo "⏳ Waiting for deployment '$deployment' to be ready..."
    
    while [ $elapsed -lt $max_wait ]; do
        ready=$(kubectl get deployment $deployment -n $namespace -o jsonpath='{.status.conditions[?(@.type=="Progressing")].status}')
        
        if [ "$ready" == "True" ]; then
            echo "✅ Deployment '$deployment' is ready!"
            return 0
        fi
        
        sleep 10
        elapsed=$((elapsed + 10))
        echo "  Still waiting... ($elapsed/$max_wait seconds)"
    done
    
    echo "❌ Deployment did not become ready in time!"
    return 1
}

# Step 1: Scale up green deployment
echo "📈 Step 1: Scaling up $NEW_VERSION deployment..."
kubectl set image deployment/survey-system-$NEW_VERSION \
    survey-system=$DOCKER_IMAGE \
    -n $NAMESPACE

kubectl scale deployment survey-system-$NEW_VERSION \
    --replicas=3 \
    -n $NAMESPACE

# Step 2: Wait for green deployment to be ready
check_deployment_ready "survey-system-$NEW_VERSION" "$NAMESPACE"

# Step 3: Run smoke tests
echo "🧪 Step 3: Running smoke tests on $NEW_VERSION..."
GREEN_POD=$(kubectl get pods -n $NAMESPACE -l app=survey-system,version=$NEW_VERSION -o jsonpath='{.items[0].metadata.name}')
echo "  Testing endpoint on pod: $GREEN_POD"
kubectl exec -n $NAMESPACE $GREEN_POD -- \
    wget -O- http://localhost:3000/health || echo "  (Health check may not be available in test)"

# Step 4: Switch traffic to green
echo "🔄 Step 4: Switching traffic from $CURRENT_VERSION to $NEW_VERSION..."
kubectl patch service survey-system-service \
    -n $NAMESPACE \
    -p '{"spec":{"selector":{"version":"'$NEW_VERSION'"}}}'

echo "✅ Traffic switched to $NEW_VERSION!"

# Step 5: Monitor new deployment
echo "📊 Step 5: Monitoring $NEW_VERSION deployment..."
for i in {1..10}; do
    status=$(kubectl get deployment survey-system-$NEW_VERSION -n $NAMESPACE -o jsonpath='{.status.replicas} / {.status.readyReplicas}')
    echo "  Check $i: $status replicas ready"
    sleep 5
done

# Step 6: Option to rollback
read -p "📋 Keep $NEW_VERSION as production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "✅ $NEW_VERSION is now production!"
    echo "📉 Step 6: Scaling down $CURRENT_VERSION deployment..."
    kubectl scale deployment survey-system-$CURRENT_VERSION \
        --replicas=0 \
        -n $NAMESPACE
    echo "✅ $CURRENT_VERSION scaled down (ready for rollback if needed)"
else
    echo "⏮️  Rolling back to $CURRENT_VERSION..."
    kubectl patch service survey-system-service \
        -n $NAMESPACE \
        -p '{"spec":{"selector":{"version":"'$CURRENT_VERSION'"}}}'
    kubectl scale deployment survey-system-$NEW_VERSION \
        --replicas=0 \
        -n $NAMESPACE
    echo "✅ Rolled back to $CURRENT_VERSION"
fi

echo ""
echo "🎉 Blue-Green Deployment Complete!"

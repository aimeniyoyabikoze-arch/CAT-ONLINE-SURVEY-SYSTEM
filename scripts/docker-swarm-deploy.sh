#!/bin/bash
# Docker Swarm Deployment Script
# Deploy and manage services in Docker Swarm mode

set -e

ACTION="${1:-deploy}"
STACK_NAME="${2:-survey-system}"
COMPOSE_FILE="${3:-docker-stack.yml}"

echo "🐳 Docker Swarm Deployment Script"
echo "=================================="
echo "Action: $ACTION"
echo "Stack Name: $STACK_NAME"
echo "Compose File: $COMPOSE_FILE"
echo ""

# Function to check if Swarm is initialized
check_swarm() {
    if ! docker info | grep -q "Swarm: active"; then
        echo "❌ Docker Swarm is not initialized!"
        echo "Initialize Swarm with: docker swarm init"
        exit 1
    fi
    echo "✅ Docker Swarm is active"
}

# Function to deploy stack
deploy_stack() {
    echo "📦 Deploying stack '$STACK_NAME'..."
    docker stack deploy -c "$COMPOSE_FILE" "$STACK_NAME"
    echo "✅ Stack deployed!"
}

# Function to check service status
check_services() {
    echo "📊 Service Status:"
    docker service ls | grep "$STACK_NAME"
    echo ""
    echo "📋 Task Details:"
    docker service ps "$STACK_NAME"_survey-app
}

# Function to update service
update_service() {
    local service=$1
    local image=$2
    echo "🔄 Updating service '$service' to image '$image'..."
    docker service update --image "$image" "$STACK_NAME"_"$service"
    echo "✅ Service updated!"
}

# Function to scale service
scale_service() {
    local service=$1
    local replicas=$2
    echo "📈 Scaling '$service' to $replicas replicas..."
    docker service scale "$STACK_NAME"_"$service"=$replicas
    echo "✅ Service scaled!"
}

# Function to remove stack
remove_stack() {
    read -p "⚠️  Remove stack '$STACK_NAME'? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing stack '$STACK_NAME'..."
        docker stack rm "$STACK_NAME"
        echo "✅ Stack removed!"
    else
        echo "❌ Removal cancelled"
    fi
}

# Function to view logs
view_logs() {
    local service=$1
    echo "📝 Logs for service '$service':"
    docker service logs "$STACK_NAME"_"$service" -f --tail 50
}

# Main execution
check_swarm

case $ACTION in
    deploy)
        deploy_stack
        check_services
        ;;
    status)
        check_services
        ;;
    update)
        if [ -z "$3" ] || [ -z "$4" ]; then
            echo "Usage: $0 update <stack> <service> <image>"
            exit 1
        fi
        update_service "$3" "$4"
        ;;
    scale)
        if [ -z "$3" ] || [ -z "$4" ]; then
            echo "Usage: $0 scale <stack> <service> <replicas>"
            exit 1
        fi
        scale_service "$3" "$4"
        ;;
    logs)
        if [ -z "$3" ]; then
            echo "Usage: $0 logs <stack> <service>"
            exit 1
        fi
        view_logs "$3"
        ;;
    remove)
        remove_stack
        ;;
    *)
        echo "Usage: $0 {deploy|status|update|scale|logs|remove} [stack] [service/image/replicas]"
        exit 1
        ;;
esac

echo ""
echo "🎉 Command completed!"

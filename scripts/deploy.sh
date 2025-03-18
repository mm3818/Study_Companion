#!/bin/bash
# Usage: ./scripts/deploy.sh [environment]
# Default environment is "local" if not provided.

ENVIRONMENT=${1:-local}
echo "Deploying to ${ENVIRONMENT} environment using Kustomize..."
kubectl apply -k infra/k8s/overlays/${ENVIRONMENT}

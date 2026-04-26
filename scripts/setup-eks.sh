#!/bin/bash
# ─────────────────────────────────────────────────────────
# scripts/setup-eks.sh
# Bootstrap EKS cluster with all required components
# Prerequisites: eksctl, kubectl, helm, awscli installed
# Usage: ./scripts/setup-eks.sh
# ─────────────────────────────────────────────────────────
set -euo pipefail

CLUSTER_NAME="taskmanager-cluster"
AWS_REGION="us-east-1"
NODE_TYPE="t3.medium"
NODE_COUNT=2

echo "═══════════════════════════════════════════════════"
echo "  Creating EKS cluster: ${CLUSTER_NAME}"
echo "═══════════════════════════════════════════════════"

# 1. Create EKS cluster
eksctl create cluster \
    --name "${CLUSTER_NAME}" \
    --region "${AWS_REGION}" \
    --nodegroup-name standard-nodes \
    --node-type "${NODE_TYPE}" \
    --nodes "${NODE_COUNT}" \
    --nodes-min 1 \
    --nodes-max 4 \
    --managed \
    --with-oidc \
    --ssh-access=false

echo "✓ EKS cluster created"

# 2. Update kubeconfig
aws eks update-kubeconfig --name "${CLUSTER_NAME}" --region "${AWS_REGION}"
echo "✓ kubeconfig updated"

# 3. Install AWS Load Balancer Controller
echo ""
echo "Installing AWS Load Balancer Controller..."
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
    --namespace kube-system \
    --set clusterName="${CLUSTER_NAME}" \
    --set serviceAccount.create=true \
    --set region="${AWS_REGION}"

echo "✓ ALB Controller installed"

# 4. Install metrics-server (required for HPA)
echo ""
echo "Installing metrics-server..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
echo "✓ metrics-server installed"

# 5. Install Prometheus + Grafana
echo ""
echo "Installing Prometheus + Grafana..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
    -f monitoring/prometheus-values.yaml \
    --namespace monitoring \
    --create-namespace

echo "✓ Monitoring stack installed"

# 6. Create app namespace
kubectl create namespace taskmanager --dry-run=client -o yaml | kubectl apply -f -
echo "✓ Namespace 'taskmanager' ready"

echo ""
echo "═══════════════════════════════════════════════════"
echo "  Setup complete!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Create RDS PostgreSQL instance in same VPC as EKS"
echo "  2. Create secret in AWS Secrets Manager:"
echo '     aws secretsmanager create-secret \'
echo '       --name taskmanager/db \'
echo "       --secret-string '{\"username\":\"taskuser\",\"password\":\"YOURPASS\"}'"
echo "  3. Update k8s/base/configmap.yaml with RDS endpoint"
echo "  4. Run Jenkins pipeline"
echo ""
echo "Grafana UI:"
echo "  kubectl port-forward svc/prometheus-grafana 3001:80 -n monitoring"
echo "  URL: http://localhost:3001  (admin / admin)"

#!/bin/bash
# ─────────────────────────────────────────────────────────
# scripts/setup-ecr.sh
# Run once to create ECR repositories
# Usage: ./scripts/setup-ecr.sh
# ─────────────────────────────────────────────────────────
set -euo pipefail

AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "Creating ECR repositories in account ${AWS_ACCOUNT_ID}..."

for repo in taskmanager-backend taskmanager-frontend; do
    aws ecr describe-repositories --repository-names "$repo" --region "$AWS_REGION" 2>/dev/null || \
    aws ecr create-repository \
        --repository-name "$repo" \
        --region "$AWS_REGION" \
        --image-scanning-configuration scanOnPush=true \
        --encryption-configuration encryptionType=AES256

    echo "✓ ECR repo ready: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${repo}"
done

echo ""
echo "Update Jenkinsfile with:"
echo "  AWS_ACCOUNT_ID = '${AWS_ACCOUNT_ID}'"

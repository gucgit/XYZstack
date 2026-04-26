# TaskManager — Full Three-Tier DevOps Project

A production-grade Task Management application demonstrating a complete DevOps pipeline.

## Architecture

```
User → CloudFront → S3 (React Frontend)
                ↓
         ALB (AWS Load Balancer)
                ↓
         EKS (Spring Boot Backend pods)
                ↓
         RDS PostgreSQL (AWS managed DB)
```

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React 18, Axios, TailwindCSS      |
| Backend     | Java 17, Spring Boot 3, JPA       |
| Database    | AWS RDS PostgreSQL 15             |
| Container   | Docker, AWS ECR                   |
| Orchestration | AWS EKS (Kubernetes 1.28)       |
| CI/CD       | Jenkins (pipeline-as-code)        |
| IaC         | Terraform (EKS + RDS + ECR)       |
| Monitoring  | Prometheus + Grafana (Helm)       |
| Secrets     | AWS Secrets Manager               |
| CDN         | CloudFront + S3                   |

## Repository Structure

```
taskmanager/
├── frontend/               # React app → deploys to S3+CloudFront
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page-level components
│   │   └── services/       # API call layer (axios)
│   ├── Dockerfile          # Multi-stage: build → nginx
│   └── nginx.conf
├── backend/                # Spring Boot REST API → deploys to EKS
│   ├── src/main/java/com/taskmanager/
│   │   ├── controller/     # REST endpoints
│   │   ├── service/        # Business logic
│   │   ├── repository/     # JPA repositories
│   │   ├── model/          # Entity classes
│   │   └── config/         # CORS, Security, AWS config
│   ├── Dockerfile          # Multi-stage: maven build → JRE runtime
│   └── pom.xml
├── k8s/
│   ├── base/               # Core K8s manifests (kustomize base)
│   └── overlays/
│       ├── dev/            # Dev overrides (1 replica, small resources)
│       └── prod/           # Prod overrides (3 replicas, HPA enabled)
├── jenkins/
│   └── Jenkinsfile         # Full pipeline definition
├── monitoring/
│   ├── prometheus-values.yaml
│   └── grafana-values.yaml
├── scripts/
│   ├── setup-eks.sh        # Bootstrap EKS cluster
│   ├── setup-ecr.sh        # Create ECR repos
│   └── deploy.sh           # Manual deploy helper
├── docker-compose.yaml     # Local dev (all 3 tiers)
└── .github/
    └── workflows/          # GitHub Actions (optional, parallel to Jenkins)
```

## Quick Start (Local Dev)

```bash
# 1. Clone repo
git clone https://github.com/gucgit/taskmanager.git
cd taskmanager

# 2. Start all three tiers locally
docker compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# PostgreSQL: localhost:5432
```

## CI/CD Flow

```
git push → GitHub Webhook → Jenkins triggered
  → Stage 1: Checkout
  → Stage 2: Unit Tests (Maven)
  → Stage 3: Build JAR
  → Stage 4: Docker Build (multi-stage)
  → Stage 5: Push to ECR
  → Stage 6: Deploy to EKS (kubectl apply)
  → Stage 7: Health check
  → Stage 8: Notify (Slack/email)
```

## Key DevOps Concepts Demonstrated

- Pipeline-as-code (Jenkinsfile in repo, not GUI)
- Multi-stage Docker builds (smaller final image)
- Kubernetes: Deployment, Service, Ingress, ConfigMap, Secret, HPA, StatefulSet, PVC
- Database separation from cluster (RDS, not K8s pod)
- Secrets never in source code (AWS Secrets Manager → K8s ExternalSecret)
- Zero-downtime rolling deployments
- Resource requests/limits on every pod
- Liveness and readiness probes on every deployment
- Prometheus metrics exposed via /actuator/prometheus

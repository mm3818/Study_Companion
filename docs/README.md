# Study Companion App

This project is a study companion web application that includes:
- A backend built with Flask.
- A frontend built with React.

The app is containerized using Docker and deployed via Kubernetes. CI/CD is managed with GitHub Actions, and GitOps deployment is handled by Argo CD.

## Directory Overview

- **app/**: Application source code for backend and frontend.
- **infra/**: Kubernetes manifests (using Kustomize overlays) and optional Helm charts.
- **ci-cd/**: CI/CD pipeline configurations (GitHub Actions workflows and Argo CD Application).
- **docker/**: Dockerfiles and docker-compose for local testing.
- **scripts/**: Utility scripts (e.g., deploy.sh).
- **docs/**: Project documentation.

## Getting Started

1. **Local Testing with Docker Compose:**
   ```bash
   docker-compose up --build

cicd
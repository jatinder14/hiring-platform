#!/usr/bin/env bash
# Build and deploy the Next.js app to Cloud Run (from frontend/).
#
# Prerequisites: gcloud CLI, logged in (gcloud auth login). Project has Cloud Run + Artifact Registry + Cloud Build APIs.
#
# By default, after deploy runs ./scripts/push-env-to-cloud-run.sh to set env from .env + .env.cloudrun.
# Set SKIP_PUSH_ENV=1 to skip pushing env.
#
# Usage:
#   cd frontend && ./scripts/deploy-cloud-run.sh
#   SKIP_PUSH_ENV=1 ./scripts/deploy-cloud-run.sh

set -e

PROJECT_ID="${PROJECT_ID:-favorable-axe-485111-b0}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-hireu-frontend}"
SKIP_PUSH_ENV="${SKIP_PUSH_ENV:-0}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Project:       $PROJECT_ID"
echo "Region:        $REGION"
echo "Service name:  $SERVICE_NAME"
echo ""

gcloud config set project "$PROJECT_ID"

echo "[...] Enabling Cloud Run, Artifact Registry, Cloud Build APIs ..."
enable_output=$(gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com --quiet 2>&1)
enable_exit=$?
if [[ $enable_exit -ne 0 ]]; then
  if echo "$enable_output" | grep -qi "already enabled\|already exists"; then
    echo "[OK] APIs already enabled."
  else
    echo "[ERROR] Failed to enable APIs (exit $enable_exit):"
    echo "$enable_output"
    echo "Check permissions, billing, and quota then re-run."
    exit $enable_exit
  fi
fi

echo "[...] Building and deploying to Cloud Run (this may take several minutes) ..."
gcloud run deploy "$SERVICE_NAME" \
  --source=. \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --no-invoker-iam-check \
  --port=8080 \
  --memory=512Mi \
  --min-instances=0 \
  --max-instances=10

echo ""
echo "[OK] Deployed. Fetching service URL ..."
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format='value(status.url)' 2>/dev/null || true)
if [[ -n "$SERVICE_URL" ]]; then
  echo "Service URL: $SERVICE_URL"
fi

if [[ "$SKIP_PUSH_ENV" == "1" ]]; then
  echo ""
  echo "Skipping push-env (SKIP_PUSH_ENV=1). Run ./scripts/push-env-to-cloud-run.sh to set env from .env + .env.cloudrun."
  exit 0
fi

echo ""
echo "[...] Pushing env from .env + .env.cloudrun to Cloud Run ..."
cd "$FRONTEND_DIR"
"$SCRIPT_DIR/push-env-to-cloud-run.sh"
echo ""
echo "Done. Deploy and env update complete."

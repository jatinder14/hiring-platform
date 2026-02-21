#!/usr/bin/env bash
# Push environment variables from .env to the Cloud Run service.
# Run from frontend/: ./scripts/push-env-to-cloud-run.sh
#
# IMPORTANT: Do NOT commit .env to git. This script reads .env locally and
# sends vars to Cloud Run; secrets stay on your machine and in GCP only.
#
# Before running: set NEXTAUTH_URL in .env to your Cloud Run URL
# (e.g. https://hireu-frontend-50507660058.us-central1.run.app or https://hire.hookstep.in)

set -e

PROJECT_ID="${PROJECT_ID:-favorable-axe-485111-b0}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-hireu-frontend}"
FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${FRONTEND_DIR}/.env"
ENV_PROD="${FRONTEND_DIR}/.env.cloudrun"
ENV_YAML="${FRONTEND_DIR}/.env.cloudrun.yaml"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: .env not found at $ENV_FILE"
  exit 1
fi

# Merge .env with .env.cloudrun (prod overrides) so NEXTAUTH_URL is correct on Cloud Run
ENV_FILES="$ENV_FILE"
if [[ -f "$ENV_PROD" ]]; then
  ENV_FILES="$ENV_FILE $ENV_PROD"
  echo "Using production overrides from .env.cloudrun (e.g. NEXTAUTH_URL)"
fi

# gcloud run services update expects YAML (map-like), not raw .env
node "${FRONTEND_DIR}/scripts/env-to-yaml.js" $ENV_FILES > "$ENV_YAML"
if [[ ! -s "$ENV_YAML" ]]; then
  echo "Error: no valid KEY=VALUE lines in .env"
  rm -f "$ENV_YAML"
  exit 1
fi

echo "Project:  $PROJECT_ID"
echo "Region:   $REGION"
echo "Service: $SERVICE_NAME"
echo "Env: $ENV_FILES -> YAML $ENV_YAML"
echo ""
echo "Pushing env vars to Cloud Run (creates a new revision)..."
gcloud run services update "$SERVICE_NAME" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --env-vars-file="$ENV_YAML"

rm -f "$ENV_YAML"
echo ""
echo "Done. New revision is live. Edit .env.cloudrun (NEXTAUTH_URL) if you use a different domain, then re-run this script."

#!/bin/bash
# ============================================================
# StoryMind — GCP deploy script
# Run once: bash deploy.sh
# ============================================================

set -e

echo "🚀 StoryMind deployment starting..."

# ── CONFIG — edit these ─────────────────────────────────────
PROJECT_ID="${GCP_PROJECT:-your-project-id}"
REGION="us-central1"
GEMINI_KEY="${GEMINI_API_KEY:-your-gemini-key-here}"
# ────────────────────────────────────────────────────────────

gcloud config set project "$PROJECT_ID"

echo "📦 Enabling APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  texttospeech.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com \
  --project="$PROJECT_ID"

echo "🔐 Storing Gemini API key in Secret Manager..."
echo -n "$GEMINI_KEY" | gcloud secrets create gemini-api-key \
  --data-file=- --project="$PROJECT_ID" 2>/dev/null || \
echo -n "$GEMINI_KEY" | gcloud secrets versions add gemini-api-key \
  --data-file=- --project="$PROJECT_ID"

echo "🏗️  Building & deploying backend..."
gcloud builds submit ./backend \
  --tag "gcr.io/$PROJECT_ID/storymind-backend" \
  --project="$PROJECT_ID"

BACKEND_URL=$(gcloud run deploy storymind-backend \
  --image="gcr.io/$PROJECT_ID/storymind-backend" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --set-env-vars="GCP_PROJECT=$PROJECT_ID,GCP_LOCATION=$REGION" \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
  --format="value(status.url)" \
  --project="$PROJECT_ID")

echo "✅ Backend deployed: $BACKEND_URL"

echo "🎨 Building & deploying frontend..."
gcloud builds submit ./frontend \
  --tag "gcr.io/$PROJECT_ID/storymind-frontend" \
  --project="$PROJECT_ID"

FRONTEND_URL=$(gcloud run deploy storymind-frontend \
  --image="gcr.io/$PROJECT_ID/storymind-frontend" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --memory=512Mi \
  --set-env-vars="NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL" \
  --format="value(status.url)" \
  --project="$PROJECT_ID")

echo ""
echo "🎉 StoryMind is LIVE!"
echo "   Frontend : $FRONTEND_URL"
echo "   Backend  : $BACKEND_URL"
echo ""
echo "Update cloudbuild.yaml backend URL, then connect your repo to Cloud Build for CI/CD."

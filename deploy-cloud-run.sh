#!/bin/bash
# Cloud Run Deployment Script for Mediseen Backend
# Run this from the project root directory

PROJECT_ID="mediseen-37997"
SERVICE_NAME="mediseen-api"
REGION="us-central1"
IMAGE_NAME="backend"

echo "🚀 Deploying Mediseen Backend to Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# 1. Set project
echo "1️⃣ Setting GCP project..."
gcloud config set project $PROJECT_ID

# 2. Build Docker image
echo "2️⃣ Building Docker image (this may take 2-3 minutes)..."
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/$IMAGE_NAME

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Make sure you have gcloud CLI installed and authenticated."
    exit 1
fi

# 3. Deploy to Cloud Run
echo "3️⃣ Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --allow-unauthenticated \
  --no-gen2 \
  --set-env-vars="PORT=8080,APP_ENV=production,GEMINI_API_KEY=YOUR_GEMINI_API_KEY,FIREBASE_STORAGE_BUCKET=YOUR_BUCKET.appspot.com,MAX_UPLOAD_BYTES=10485760,MAX_SYMPTOMS_LENGTH=2000,MAX_IMAGE_PIXELS=50000000,ALLOWED_ORIGINS=capacitor://localhost,http://localhost,http://127.0.0.1:3000"

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "Your service is now live at:"
    gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)'
    echo ""
    echo "📝 Next steps:"
    echo "1. Copy the URL above"
    echo "2. Update your frontend .env with: NEXT_PUBLIC_API_URL=<URL>"
    echo "3. Rebuild Android app"
    echo "4. Upload to Play Store"
else
    echo "❌ Deployment failed"
    exit 1
fi

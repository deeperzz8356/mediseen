# Cloud Run Deployment Script for Mediseen Backend (Windows PowerShell)
# Run this from the project root directory

$PROJECT_ID = "mediseen-37997"
$SERVICE_NAME = "mediseen-api"
$REGION = "us-central1"
$IMAGE_NAME = "backend"

Write-Host "🚀 Deploying Mediseen Backend to Cloud Run..." -ForegroundColor Cyan
Write-Host "Project: $PROJECT_ID"
Write-Host "Service: $SERVICE_NAME"
Write-Host "Region: $REGION"
Write-Host ""

# 1. Set project
Write-Host "1️⃣ Setting GCP project..." -ForegroundColor Green
gcloud config set project $PROJECT_ID

# 2. Build Docker image
Write-Host "2️⃣ Building Docker image (this may take 2-3 minutes)..." -ForegroundColor Green
Push-Location backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/$IMAGE_NAME

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Make sure you have gcloud CLI installed and authenticated." -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

# 3. Deploy to Cloud Run
Write-Host "3️⃣ Deploying to Cloud Run..." -ForegroundColor Green
gcloud run deploy $SERVICE_NAME `
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME `
  --platform managed `
  --region $REGION `
  --memory 512Mi `
  --cpu 1 `
  --timeout 300 `
  --allow-unauthenticated `
  --no-gen2 `
  --set-env-vars="PORT=8080,APP_ENV=production,GEMINI_API_KEY=YOUR_GEMINI_API_KEY,FIREBASE_STORAGE_BUCKET=YOUR_BUCKET.appspot.com,MAX_UPLOAD_BYTES=10485760,MAX_SYMPTOMS_LENGTH=2000,MAX_IMAGE_PIXELS=50000000,ALLOWED_ORIGINS=capacitor://localhost,http://localhost,http://127.0.0.1:3000"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    
    $SERVICE_URL = gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)'
    Write-Host "Your service is now live at:" -ForegroundColor Yellow
    Write-Host $SERVICE_URL
    Write-Host ""
    
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Copy the URL above"
    Write-Host "2. Update your frontend .env with: NEXT_PUBLIC_API_URL=<URL>"
    Write-Host "3. Rebuild Android app"
    Write-Host "4. Upload to Play Store"
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

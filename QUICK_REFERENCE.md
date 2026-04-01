# Quick Reference: Cloud Run Deployment Commands

## One-Liner Deployment (Windows PowerShell)

```powershell
.\deploy-cloud-run.ps1
```

## One-Liner Deployment (macOS/Linux)

```bash
chmod +x deploy-cloud-run.sh && ./deploy-cloud-run.sh
```

---

## Manual Commands (if script doesn't work)

### 1. Authenticate
```bash
gcloud auth login
gcloud config set project mediseen-37997
```

### 2. Build Docker Image
```bash
cd backend
gcloud builds submit --tag gcr.io/mediseen-37997/backend
```

### 3. Deploy to Cloud Run
```bash
gcloud run deploy mediseen-api \
  --image gcr.io/mediseen-37997/backend \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --allow-unauthenticated \
  --set-env-vars="PORT=8080,APP_ENV=production,GEMINI_API_KEY=YOUR_GEMINI_API_KEY,FIREBASE_STORAGE_BUCKET=YOUR_BUCKET.appspot.com,ALLOWED_ORIGINS=capacitor://localhost,http://localhost,http://127.0.0.1:3000"
```

### 4. Get Your API URL
```bash
gcloud run services describe mediseen-api --region us-central1 --format='value(status.url)'
```

### 5. View Real-Time Logs
```bash
gcloud run logs read mediseen-api --region us-central1 --follow
```

---

## Environment Variables to Update

Before running deployment, edit these:

```bash
# In deploy-cloud-run.ps1 or deploy-cloud-run.sh

GEMINI_API_KEY=<your-key-from-google-ai-studio>
FIREBASE_STORAGE_BUCKET=<your-bucket>.appspot.com
```

Get these from:
- **GEMINI_API_KEY**: https://ai.google.dev/tutorials/setup (get from Google AI Studio)
- **FIREBASE_STORAGE_BUCKET**: Firebase Console → Storage → Copy bucket name

---

## After Deployment

```bash
# 1. Copy API URL from output
# Example: https://mediseen-api-xxx-uc.a.run.app

# 2. Update frontend .env
echo "NEXT_PUBLIC_API_URL=https://mediseen-api-xxx-uc.a.run.app" >> frontend/.env.production

# 3. Rebuild Android
cd frontend
npm run android:build
cd android
gradlew.bat bundleRelease

# 4. AAB file ready at:
# frontend/android/app/build/outputs/bundle/release/app-release.aab
```

---

## Troubleshooting Commands

```bash
# See all logs
gcloud run logs read mediseen-api --region us-central1 --limit 50

# Check service status
gcloud run services describe mediseen-api --region us-central1

# Update environment variables
gcloud run services update mediseen-api \
  --set-env-vars="GEMINI_API_KEY=new-key" \
  --region us-central1

# View service metrics
gcloud run dashboards describe

# Delete service (if needed)
gcloud run services delete mediseen-api --region us-central1
```

---

## Important Notes

✅ **What's automated:**
- Docker build
- Image push to Google Cloud Registry
- Cloud Run deployment
- HTTPS certificate (automatic)

❌ **What you still need to do:**
- Set correct environment variables (API keys, bucket name)
- Test backend by visiting the URL
- Update frontend with backend URL
- Rebuild Android app
- Upload AAB to Play Store

---

## Expected Output After Deployment

```
✅ Deployment successful!

Your service is now live at:
https://mediseen-api-abc123-uc.a.run.app

📝 Next steps:
1. Copy the URL above
2. Update your frontend .env with: NEXT_PUBLIC_API_URL=<URL>
3. Rebuild Android app
4. Upload to Play Store
```

If you see errors, check:
1. Docker Desktop is running
2. gcloud is authenticated: `gcloud auth application-default login`
3. All environment variables are set correctly
4. firebase_admin.json exists in backend folder

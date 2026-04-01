# Google Cloud Run Deployment Guide for Mediseen

## Overview
This guide walks you through deploying your FastAPI backend to Google Cloud Run for your Play Store app.

**Why Cloud Run?**
- ✅ No VM management (zero DevOps overhead)
- ✅ Free tier: 2 million requests/month
- ✅ Auto-scaling (handles 1 user or 1000 users)
- ✅ HTTPS included (required for Play Store)
- ✅ Simple Docker-based deployment
- ✅ Your Google Cloud account is already active

---

## Prerequisites

1. **Google Cloud CLI installed** (gcloud)
   - Download from: https://cloud.google.com/sdk/docs/install
   - Verify: `gcloud --version` in terminal

2. **Docker installed locally** (for building images)
   - Download from: https://www.docker.com/products/docker-desktop

3. **Authenticated to Google Cloud**
   ```bash
   gcloud auth login
   gcloud config set project mediseen-37997
   ```

4. **Environment variables ready:**
   - `GEMINI_API_KEY` (from Firebase/Google AI console)
   - `FIREBASE_STORAGE_BUCKET` (e.g., mediseen-xxxxx.appspot.com)

---

## Deployment Steps

### Option 1: Automated (Windows PowerShell)

Run this one command in your project root:
```powershell
.\deploy-cloud-run.ps1
```

It will:
1. Set your GCP project
2. Build Docker image
3. Push to Cloud Registry
4. Deploy to Cloud Run
5. Display your public API URL

### Option 2: Automated (macOS/Linux)

```bash
chmod +x deploy-cloud-run.sh
./deploy-cloud-run.sh
```

### Option 3: Manual Steps

**Step 1: Build Docker image**
```bash
cd backend
gcloud builds submit --tag gcr.io/mediseen-37997/backend
```

**Step 2: Deploy to Cloud Run**
```bash
gcloud run deploy mediseen-api \
  --image gcr.io/mediseen-37997/backend \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --allow-unauthenticated \
  --set-env-vars="PORT=8080,APP_ENV=production,GEMINI_API_KEY=YOUR_KEY,FIREBASE_STORAGE_BUCKET=YOUR_BUCKET.appspot.com,ALLOWED_ORIGINS=capacitor://localhost,http://localhost"
```

**Step 3: Get your service URL**
```bash
gcloud run services describe mediseen-api --region us-central1 --format='value(status.url)'
```

You'll get something like: `https://mediseen-api-xyz123-uc.a.run.app`

---

## After Deployment

### 1. Update Frontend API URL

In your frontend directory, update or create `.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://mediseen-api-xyz123-uc.a.run.app
```

### 2. Rebuild Android App

```bash
cd frontend
npm install
npm run android:build
cd android
gradlew.bat bundleRelease
```

Your AAB file will be in: `frontend/android/app/build/outputs/bundle/release/app-release.aab`

### 3. Upload to Play Store

1. Open Google Play Console
2. Create new app or select existing
3. Upload `app-release.aab`
4. Fill in app details, privacy policy, data safety form
5. Submit for review

---

## Monitor Your Deployment

**View logs in real-time:**
```bash
gcloud run logs read mediseen-api --region us-central1 --follow
```

**Monitor metrics:**
- Go to Cloud Console → Cloud Run → Select mediseen-api
- View requests/second, latency, error rate

**Check autoscaling:**
- Cloud Run automatically scales from 0 to 100 instances
- To keep at least 1 instance warm (avoid cold start): Set "Minimum Instances" to 1 in Cloud Run dashboard (costs ~$1-2/month after free tier)

---

## Important Security Notes

### 1. Firebase Admin JSON
- Your `firebase_admin.json` inside Docker image is secure
- Cloud Run containers are isolated (only your app has access)
- Still, use Cloud Run Secrets for extra security:

```bash
gcloud secrets create firebase-admin-json --data-file=backend/firebase_admin.json
gcloud run services update mediseen-api \
  --set-secrets FIREBASE_ADMIN_JSON=firebase-admin-json:latest \
  --region us-central1
```

### 2. CORS Configuration
Your backend already has CORS middleware, but verify it allows:
```
- capacitor://localhost (for Android Capacitor)
- http://localhost (for iOS Capacitor)
- http://127.0.0.1:3000 (for local testing)
```

### 3. Environment Variables
**DO NOT put secrets in code.** Use Cloud Run environment variables or Secrets Manager:
```bash
gcloud run services update mediseen-api \
  --set-env-vars GEMINI_API_KEY=your_key \
  --region us-central1
```

---

## Troubleshooting

### Build fails with "dependency not found"
- Check `requirements.txt` has all packages
- Verify Python version in Dockerfile (3.11) matches your dev environment

### Service returns 500 errors
```bash
gcloud run logs read mediseen-api --region us-central1
```
Check logs for Firebase connection issues or missing API keys.

### "Too many requests" on app startup
- Increase `--memory` to 1Gi (1 GB) for faster inference
- This costs more but speeds up cold starts

### Cold start takes >30 seconds
- Set "Minimum Instances" to 1 in Cloud Run dashboard
- Or use `gcloud run services update mediseen-api --min-instances=1`

---

## Cost Estimate

**Free Tier:**
- 2 million requests/month
- 360,000 GB-seconds/month
- Enough for ~5000 daily active users on a medical app

**After free tier:**
- CPU: $0.000024 per vCPU-second
- Memory: First 512 MB free, then $0.0000025 per GB-second
- Typical small app: $2-5/month

---

## Next Steps

1. ✅ Backend deployed to Cloud Run (you are here)
2. ⏭️ Update frontend with Cloud Run URL
3. ⏭️ Build Android APK/AAB
4. ⏭️ Upload to Play Store
5. ⏭️ Complete Play Store forms (privacy, data safety)
6. ⏭️ Submit for app review

Questions? Check Cloud Run docs: https://cloud.google.com/run/docs

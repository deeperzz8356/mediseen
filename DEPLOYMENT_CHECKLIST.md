# Cloud Run Deployment Checklist

## Pre-Deployment ✅

- [ ] Google Cloud CLI (`gcloud`) installed and authenticated
- [ ] Docker Desktop installed and running
- [ ] `backend/firebase_admin.json` exists and is valid
- [ ] `GEMINI_API_KEY` obtained from Google AI Console
- [ ] `FIREBASE_STORAGE_BUCKET` name noted (e.g., mediseen-xxxxx.appspot.com)
- [ ] Read CLOUD_RUN_DEPLOYMENT.md guide

## Files Created ✅

- [ ] `backend/Dockerfile` ✅ Created
- [ ] `backend/.dockerignore` ✅ Created
- [ ] `deploy-cloud-run.sh` ✅ Created (for macOS/Linux)
- [ ] `deploy-cloud-run.ps1` ✅ Created (for Windows)
- [ ] `backend/main.py` updated to support PORT env var ✅ Done

## Deployment Steps

### 1. Build & Deploy (Windows)
```powershell
# From project root
.\deploy-cloud-run.ps1
```

### 1. Build & Deploy (macOS/Linux)
```bash
# From project root
chmod +x deploy-cloud-run.sh
./deploy-cloud-run.sh
```

- [ ] Deployment succeeds and returns URL

### 2. Test Backend
- [ ] Copy the Cloud Run URL from terminal output
- [ ] Test in browser: `https://your-url/` → Should return `{"status": "Mediseen API running"}`
- [ ] Save this URL for next steps

## After Deployment ✅

### Frontend Integration
- [ ] Create `frontend/.env.production` with:
  ```
  NEXT_PUBLIC_API_URL=https://your-cloud-run-url
  ```
- [ ] Verify no hardcoded localhost URLs in frontend code

### Android Build
- [ ] Update Android version code in `frontend/android/app/build.gradle`
- [ ] Rebuild Android project:
  ```bash
  cd frontend
  npm run android:build
  cd android
  gradlew.bat bundleRelease
  ```
- [ ] Verify AAB output: `frontend/android/app/build/outputs/bundle/release/app-release.aab`

### Play Store
- [ ] Create Google Play developer account (if not already)
- [ ] Create app in Play Console
- [ ] Upload app-release.aab
- [ ] Fill in app details:
  - [ ] Title: "Mediseen" or your app name
  - [ ] Description
  - [ ] Screenshots
  - [ ] Category: "Medical" or "Health & Fitness"
- [ ] Create Privacy Policy (required for medical apps)
- [ ] Fill Data Safety form:
  - [ ] Data Collection: Images (camera), Authentication info
  - [ ] Data Processing: Medical diagnosis
  - [ ] Data Security: Encrypted in transit (HTTPS)
- [ ] Request app review

## Optional Enhancements

- [ ] Set Cloud Run Minimum Instances = 1 (to avoid cold starts, ~$1-2/month)
- [ ] Add custom domain: `api.yourdomain.com` (requires DNS update)
- [ ] Enable Cloud Run Secrets for firebase_admin.json
- [ ] Set up Cloud Monitoring alerts for errors
- [ ] Monitor usage in Cloud Run dashboard to stay within free tier

## Important Reminders

- ❌ Do NOT commit firebase_admin.json to git (already in .gitignore)
- ❌ Do NOT use localhost URLs in production Android app
- ❌ Medical apps require Privacy Policy and Data Safety disclosure
- ✅ Cloud Run URL will be public (that's OK, API checks Firebase tokens)
- ✅ Free tier covers ~5000 daily active users

## Support & Help

- Cloud Run Docs: https://cloud.google.com/run/docs
- Deployment Issues: Check `gcloud run logs read mediseen-api --follow`
- Questions: Review CLOUD_RUN_DEPLOYMENT.md

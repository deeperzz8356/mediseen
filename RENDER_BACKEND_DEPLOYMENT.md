# Render Backend Deployment Fix

## Problem
The Android app's default API URL points to `https://mediseen-backend.onrender.com`, which currently serves the frontend (Next.js), not the FastAPI backend. This causes `/diagnose` requests to fail with 405 errors.

## Solution: Deploy Backend to Separate Render Service

### Step 1: Deploy Backend Service

1. Go to **[Render Dashboard](https://dashboard.render.com)**
2. Click **+ New** → **Web Service**
3. Connect your GitHub repository
4. Fill in these settings:
   - **Name:** `mediseen-api-backend` (or similar, must be unique)
   - **Environment:** Docker
   - **Build Command:** (leave blank - uses Dockerfile)
   - **Start Command:** (leave blank - uses Dockerfile)
   - **Plan:** Free (or appropriate plan)

5. **Environment Variables** (add these):
   - `APP_ENV` = `production`
   - `GEMINI_API_KEY` = (get from Google AI Studio)
   - `CLOUDINARY_NAME` = (from Cloudinary dashboard)
   - `CLOUDINARY_KEY` = (from Cloudinary)
   - `CLOUDINARY_SECRET` = (from Cloudinary)
   - `PORT` = `10000`

6. Click **Create Web Service**
7. Wait for deployment to complete (3-5 minutes)
8. **Copy the service URL** from the Render dashboard (e.g., `https://mediseen-api-backend.onrender.com`)

### Step 2: Update Frontend Configuration

1. Open `frontend/.env`
2. Replace the placeholder with your actual backend URL:
   ```
   NEXT_PUBLIC_API_URL=https://mediseen-api-backend.onrender.com
   ```
   (Use the URL from Step 1.8)

### Step 3: Rebuild Android App

```powershell
cd frontend
npm run build
npx cap sync android
cd android
./gradlew.bat clean assembleRelease
```

The APK will now use the correct backend URL.

### Step 4: Deploy Frontend (Optional)

If you want the frontend on Render too:

1. Create another Render Web Service
2. Connect to your GitHub repo
3. Set **Name:** `mediseen-frontend`
4. Build Command: `cd frontend && npm run build`
5. Start Command: `cd frontend && npx next start`

---

## Alternative: Single Service with Reverse Proxy

If you prefer one URL for both frontend and backend:

1. Modify `backend/Dockerfile` to run both nginx and FastAPI
2. Configure nginx to route:
   - `/` → Next.js frontend
   - `/api/*` → FastAPI backend (port 8000)

This requires more Docker configuration but keeps everything at one URL.

---

## Verification

After deployment, test the backend:

```powershell
# Should return FastAPI OpenAPI docs (JSON), not Next.js HTML
curl https://mediseen-api-backend.onrender.com/openapi.json

# Should return 404 or proper response, not 405
curl -X POST https://mediseen-api-backend.onrender.com/diagnose
```

If both show FastAPI responses, the backend is correctly deployed.

---

## Why This Happens

- `render.yaml` defines the backend service correctly
- But the deployed Render service at `mediseen-backend.onrender.com` is running the frontend
- The Android app's hardcoded DEFAULT_RENDER_API_URL needs to point to the actual backend service
- Deploying to separate services keeps concerns separated and makes scaling easier

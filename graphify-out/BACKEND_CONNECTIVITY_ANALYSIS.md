# Backend Connectivity Analysis Report
**Generated:** 2026-04-29  
**Status:** Critical Issue Identified

---

## Executive Summary

The MediSeen application's frontend is **not connecting to the API backend** due to URL misconfiguration. The frontend is pointing to the frontend service instead of the API backend service on Render.

**Impact Level:** 🔴 CRITICAL
- All API endpoints unreachable
- `/diagnose` endpoint (ML diagnosis) non-functional
- Authentication endpoints failing
- User registration and verification broken

---

## Connectivity Test Results

### Test 1: Current Backend URL
```
URL: https://meediseen-backend.onrender.com/
Response: 200 OK
Content: HTML (Next.js Frontend Page)
Conclusion: ❌ WRONG SERVICE - This is the frontend, not the API
```

### Test 2: Expected Backend URL
```
URL: https://mediseen-api-backend.onrender.com/
Response: 404 Not Found
Conclusion: ❌ SERVICE NOT DEPLOYED
```

### Test 3: Root Health Check
```
URL: https://meediseen-backend.onrender.com/
Content: "MediSeen Clinical Studio" HTML page with React elements
Conclusion: Confirmed frontend service is running, not API backend
```

---

## Root Cause Analysis

### Problem 1: Configuration Error
**File:** `frontend/.env`  
**Line 4:**
```env
NEXT_PUBLIC_API_URL=https://meediseen-backend.onrender.com
```

**Issues:**
1. Service name typo: "meediseen" instead of "mediseen"
2. Wrong service entirely: points to Frontend, not API Backend
3. Should point to: `https://mediseen-api-backend.onrender.com`

### Problem 2: API Resolution Logic
**File:** `frontend/app/config.ts`

The API URL resolution has fallback behavior:
- Line 38: Normalizes the env URL
- Lines 40-55: Runtime checks for Capacitor/native environment
- Lines 98-99: Warning when URL not set

**Current flow:**
```
process.env.NEXT_PUBLIC_API_URL
→ https://meediseen-backend.onrender.com (FRONTEND)
→ Used for all API calls
→ Frontend returns HTML, not JSON
→ API calls fail
```

### Problem 3: Backend Not Deployed
The FastAPI backend service (`mediseen-api-backend.onrender.com`) doesn't exist on Render, returning 404.

---

## Affected API Endpoints

All these endpoints are unreachable on the current configuration:

### Authentication Endpoints
| Endpoint | Method | Purpose | File |
|----------|--------|---------|------|
| `/auth/verify` | POST | Verify Firebase token | main.py:180 |
| `/auth/register` | POST | Register new user | main.py:203 |
| `/auth/disable-account` | POST | Deactivate account | main.py:250 |

### Diagnosis Endpoints
| Endpoint | Method | Purpose | File |
|----------|--------|---------|------|
| `/diagnose` | POST | ML diagnosis with image | main.py:266 |
| `/diagnose/usage` | GET | Usage statistics | main.py:407 |
| `/report` | GET | Retrieve report | main.py:429 |

### Health Check
| Endpoint | Method | Response | File |
|----------|--------|----------|------|
| `/` | GET | `{"status": "Mediseen API running"}` | main.py:175 |

---

## Backend Implementation Details

### CORS Configuration
**Middleware:** CORSOriginMiddleware (main.py:97)

**Allowed Origins:**
- `capacitor://` - Capacitor native apps (all origins)
- `file://` - Local file access
- `http://localhost` - Local development
- `http://127.0.0.1` - Loopback
- Explicit whitelist from `ALLOWED_ORIGINS_RAW` env var

**CORS Headers Added:**
```
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: *
Access-Control-Expose-Headers: *
Access-Control-Max-Age: 600
```

### Authentication
**Method:** Firebase ID Token + Bearer Token

**Token Verification:**
- Function: `verify_bearer_token()` (main.py:132)
- Required: `Authorization: Bearer <token>` header
- Development bypass: `Bearer dev` token when `APP_ENV != "production"`
- Production: Full Firebase token validation with revocation check

### Request Structure
**Diagnosis Request Example:**
```python
POST /diagnose
Authorization: Bearer <firebase-token>
Content-Type: multipart/form-data

- image: File (JPEG, PNG, WebP, HEIC)
- symptoms: String (max 2000 chars)
```

**Response Structure:**
```json
{
  "session_id": "uuid",
  "diagnosis": "string",
  "confidence": 0.0-1.0,
  "explanation": "string",
  "heatmap_url": "string",
  "report_url": "string"
}
```

---

## Service Dependencies

### Backend Services Used (main.py imports)
1. **Firebase** (`services/firebase_svc.py`)
   - Authentication
   - Firestore database
   - Rate limiting
   - Caching

2. **Storage** (`services/storage_svc.py`)
   - Image upload/storage

3. **Cloudinary** (`services/cloudinary_svc.py`)
   - Image hosting
   - URL generation

4. **Gemini API** (`services/gemini_svc.py`)
   - ML diagnosis model

5. **LLM** (`services/llm_svc.py`)
   - Language model for explanation

---

## Required Actions

### Immediate (Critical)
1. **Deploy backend to Render**
   - Service name: `mediseen-api-backend`
   - Environment: Docker
   - Get URL from Render dashboard

2. **Update frontend configuration**
   - File: `frontend/.env`
   - Change line 4 to correct URL
   - Verify with test request

3. **Rebuild frontend**
   - Clear `.env` cache
   - Rebuild Next.js app
   - Redeploy to Render

### Verification
```bash
# Test backend health
curl https://mediseen-api-backend.onrender.com/

# Test diagnose endpoint
curl -X POST https://mediseen-api-backend.onrender.com/diagnose \
  -H "Authorization: Bearer dev" \
  -F "image=@test.jpg" \
  -F "symptoms=test"
```

---

## Configuration Checklist

- [ ] Backend deployed to Render with correct service name
- [ ] Backend URL obtained from Render dashboard
- [ ] `frontend/.env` updated with correct URL
- [ ] Frontend rebuilt with new configuration
- [ ] Health check endpoint responding (GET /)
- [ ] Auth endpoints responding (POST /auth/verify)
- [ ] Diagnosis endpoint responding (POST /diagnose)
- [ ] CORS headers correctly set for frontend origin
- [ ] Firebase credentials configured in backend
- [ ] Cloudinary credentials configured
- [ ] Gemini API key configured
- [ ] Rate limiting enabled

---

## Historical Context

**Previous Issues:**
- Typo in backend URL: "meediseen" vs "mediseen"
- Multiple service deployment (frontend and backend on separate Render services)
- CORS policy for Capacitor native app support
- Firebase authentication integration

**Documentation References:**
- `RENDER_BACKEND_DEPLOYMENT.md` - Original deployment guide
- `backend/main.py` - API implementation
- `frontend/app/config.ts` - Frontend configuration
- `frontend/app/services/api.ts` - API client wrapper

---

**Last Updated:** 2026-04-29 14:30 UTC  
**Next Review:** After backend deployment

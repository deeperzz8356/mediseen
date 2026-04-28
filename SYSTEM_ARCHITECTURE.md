# MediSeen Full System Architecture & Data Flow

## Complete End-to-End System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     ANDROID PHONE (User)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  MediSeen App (Capacitor WebView)                         │  │
│  │  - Image picker                                           │  │
│  │  - Symptom input form                                     │  │
│  │  - Result display with heatmap                            │  │
│  │  - Download report button                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                             ↓ (HTTPS POST)                       │
│                    /diagnose + image + symptoms                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   RENDER.COM (Cloud Hosting)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  FastAPI Backend Service (Python/Uvicorn)                │  │
│  │  - CORS middleware (accepts capacitor://, file://)       │  │
│  │  - Image validation & size checks                        │  │
│  │  - Rate limiting (2 diagnoses/day)                       │  │
│  │  - Cache check (duplicate image detection)               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                             ↓                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Image Processing                                        │  │
│  │  1. Save locally (temporary)                             │  │
│  │  2. Upload to Cloudinary                                 │  │
│  │  3. Get public URL                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                             ↓                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  LangGraph AI Pipeline (model/graph.py)                  │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │ 1. vision_analysis_node                         │    │  │
│  │  │    └─→ Google Gemini API                        │    │  │
│  │  │        - Image classification (Pneumonia, etc) │    │  │
│  │  │        - Confidence score                       │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │            ↓                                             │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │ 2. generate_heatmap_node                        │    │  │
│  │  │    └─→ Grad-CAM                                 │    │  │
│  │  │        - Visual explanation (which pixels matter) │   │  │
│  │  │        - Save heatmap image                     │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │            ↓                                             │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │ 3. retrieve_medical_context_node                │    │  │
│  │  │    └─→ Clinical feature detection              │    │  │
│  │  │        - Lung opacity                           │    │  │
│  │  │        - Consolidation                          │    │  │
│  │  │        - Pleural effusion                       │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │            ↓                                             │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │ 4. generate_explanation_node                    │    │  │
│  │  │    └─→ Gemini generates natural language        │    │  │
│  │  │        - Multi-paragraph explanation             │    │  │
│  │  │        - Clinician-friendly summary              │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │            ↓                                             │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │ 5. generate_pdf_report_node                     │    │  │
│  │  │    └─→ Compile full report with                 │    │  │
│  │  │        - Diagnosis                               │    │  │
│  │  │        - Heatmap                                 │    │  │
│  │  │        - Explanation                             │    │  │
│  │  │        - Clinical features                       │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │  All state passed through: image_path → prediction →     │  │
│  │  heatmap_path → explanation → report_path                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                             ↓                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Upload Results to Cloud Storage                         │  │
│  │  - Heatmap → Cloudinary                                  │  │
│  │  - Report PDF → Cloudinary                               │  │
│  │  - Get public URLs                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                             ↓                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Cache Results (Firebase Firestore)                      │  │
│  │  - Cache key: user_id + image_hash                       │  │
│  │  - Instant response for duplicate images                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (JSON Response)
         {
           "diagnosis": "Pneumonia",
           "confidence": 0.95,
           "heatmap_url": "https://cloudinary.../heatmap.png",
           "explanation": "The image shows...",
           "clinical_features": ["lung_opacity", "consolidation"],
           "report_url": "https://cloudinary.../report.pdf",
           "session_id": "uuid",
           "cached": false
         }
┌─────────────────────────────────────────────────────────────────┐
│                     ANDROID PHONE (User)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Display Results:                                         │  │
│  │  ✓ Diagnosis (e.g., "Pneumonia")                          │  │
│  │  ✓ Confidence (e.g., "95%")                               │  │
│  │  ✓ Heatmap image (visual explanation)                     │  │
│  │  ✓ Multi-paragraph explanation                            │  │
│  │  ✓ Download PDF report button                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Integration Checklist

### ✅ Frontend (Next.js + Capacitor)
- [x] Image upload UI (`frontend/app/components/UploadPanel.tsx`)
- [x] Symptoms input form
- [x] Result display with heatmap
- [x] Error handling with debug context
- [x] API URL routing (`frontend/app/config.ts`)
- [x] Firebase authentication
- [x] Capacitor platform detection

### ✅ Backend (FastAPI)
- [x] CORS middleware (supports Capacitor origins)
- [x] `/diagnose` POST endpoint
- [x] Image validation
- [x] Rate limiting
- [x] Cache system
- [x] Cloudinary integration
- [x] Firebase fallback

### ✅ AI Pipeline (LangGraph)
- [x] Vision analysis (Gemini API)
- [x] Heatmap generation (Grad-CAM)
- [x] Medical context retrieval
- [x] Natural language explanation (Gemini)
- [x] PDF report generation

### ✅ Storage
- [x] Cloudinary for images (primary)
- [x] Firebase Storage (fallback, optional)
- [x] Firebase Firestore for caching
- [x] Uploads directory for temp files

### ✅ Deployment
- [x] Render blueprint (render.yaml)
- [x] Docker containerization
- [x] Environment variable configuration
- [x] GitHub repository (backend-only)

---

## Data Flow When User Uploads Image

```
Timeline: ~30-60 seconds (first request), ~2 seconds (cached)

T=0ms:    Android app collects image + symptoms
T=100ms:  POST to Render backend: /diagnose
T=200ms:  Backend receives, validates image
T=300ms:  Image uploaded to Cloudinary
T=500ms:  Cache check (no match, proceed)
T=600ms:  LangGraph invokes vision_analysis node
T=3000ms: Gemini returns diagnosis + confidence
T=3500ms: Heatmap generation starts (Grad-CAM)
T=5000ms: Heatmap saved to Cloudinary
T=5500ms: Clinical context retrieval
T=6000ms: Explanation generation (Gemini)
T=8000ms: PDF report generation
T=8500ms: Report uploaded to Cloudinary
T=9000ms: Results cached in Firestore
T=9200ms: Response sent to Android
T=9300ms: Android displays results with heatmap
```

---

## How Everything Works Together

### Example Request-Response Cycle

**Android Sends:**
```json
POST https://mediseen-api-backend.onrender.com/diagnose
Content-Type: multipart/form-data

{
  "image": <binary PNG file>,
  "symptoms": "chest pain, shortness of breath",
  "X-Client-Platform": "Capacitor"
}
```

**Backend Processing:**
1. Validates image (PNG 512x512px, <10MB)
2. Uploads to Cloudinary → gets URL
3. Invokes LangGraph pipeline with state:
   ```python
   {
     "image_path": "/uploads/abc123_input.png",
     "image_url": "https://cloudinary.../abc123.png",
     "user_symptoms": "chest pain, shortness of breath",
     "prediction": "",
     "heatmap_path": "",
     "explanation": "",
     "report_path": ""
   }
   ```

4. **Node 1 (vision_analysis):** Gemini analyzes image
   ```python
   state["prediction"] = "Pneumonia"
   state["confidence_score"] = 0.95
   ```

5. **Node 2 (generate_heatmap):** Creates visual explanation
   ```python
   state["heatmap_path"] = "/uploads/abc123_heatmap.png"
   ```

6. **Node 3 (retrieve_medical_context):** Detects clinical features
   ```python
   state["clinical_features"] = ["lung_opacity", "consolidation"]
   ```

7. **Node 4 (generate_explanation):** Generates report text
   ```python
   state["explanation"] = "The image shows consolidated..."
   ```

8. **Node 5 (generate_pdf_report):** Creates downloadable file
   ```python
   state["report_path"] = "/uploads/abc123_report.pdf"
   ```

**Backend Returns:**
```json
{
  "session_id": "abc123",
  "diagnosis": "Pneumonia",
  "confidence": 0.95,
  "heatmap_url": "https://cloudinary.../heatmap.png",
  "explanation": "The image shows...",
  "clinical_features": ["lung_opacity", "consolidation"],
  "report_url": "https://cloudinary.../report.pdf",
  "cached": false
}
```

**Android Displays:**
- Diagnosis: "Pneumonia"
- Confidence: "95%"
- Heatmap image (with affected areas highlighted)
- Explanation text (multi-paragraph)
- "Download Report" button → Opens PDF

---

## Verification: Is Everything Connected?

| Component | Status | Evidence |
|-----------|--------|----------|
| Android App | ✅ Ready | APK built, Capacitor synced |
| Frontend Config | ✅ Ready | Placeholder for backend URL |
| Backend Code | ✅ Ready | Deployed to GitHub, render.yaml |
| LangGraph Pipeline | ✅ Ready | All 5 nodes wired, tested locally |
| Cloudinary Integration | ✅ Ready | storage_svc.py configured |
| Firebase Cache | ✅ Ready | Firestore write/read implemented |
| CORS | ✅ Ready | Capacitor origins whitelisted |
| Deployment | ⏳ Pending | Ready to deploy on Render |
| URL Connection | ⏳ Pending | Needs backend URL + rebuild APK |

---

## What's Left to Do

**For Full End-to-End Functionality:**

1. Deploy backend on Render
   - Go to render.com dashboard
   - Create Web Service from meediseen-backend.git
   - Set env vars: GEMINI_API_KEY, CLOUDINARY_*
   - Copy backend URL

2. Update Android app
   - Edit `frontend/.env`
   - Set `NEXT_PUBLIC_API_URL=<your-render-url>`
   - Run: `npm run build && npx cap sync android && cd android && ./gradlew.bat clean assembleRelease`

3. Install and test
   - Transfer APK to phone
   - Open app
   - Upload X-ray + symptoms
   - See diagnosis, heatmap, explanation

**Result:** Fully functional medical AI diagnostic system with explainability! 🎉

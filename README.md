---
title: MediSeen
emoji: 🩺
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# MediSeen: Comprehensive AI Health Insights & Educational Platform

**Problem Statement ID:** HVAI-03  
**Hackathon:** Hackverse 2.0

## 📝 Project Overview
Current AI health analysis models often operate as "Black Boxes", providing accurate results without explaining the underlying reasoning. Furthermore, healthcare tools are often fragmented, with separate apps for health analysis, diet planning, and health education.

**MediSeen** is a unified, multi-platform healthcare tool that implements **Explainable AI (XAI)** to bridge the trust gap in health analysis, while offering a complete suite of patient-centric features. The core system assesses health images while simultaneously providing a multi-layered justification for its insights. Additionally, MediSeen provides personalized diet plans, health data syncing, an AI-powered health chat, and a robust medical library.

### 🌟 Key Features
1. **Explainable AI Health Analysis (LangGraph Pipeline):**
   - **Visual Heatmaps (Grad-CAM):** Identifies the critical pixels and anatomical regions that influenced the model's insight.
   - **Clinical Feature Identification:** Cross-references saliency with clinical features like Lung Opacity, Consolidation, and Pleural Effusion.
   - **Natural Language Explanation:** Summarizes detected clinical features to provide a human-readable justification.
2. **AI Health Assistant Chat:** A conversational agent integrated via OpenRouter to answer health queries interactively.
3. **Personalized Diet & Nutrition:** Generates custom diet plans, supports grocery list generation, food swapping, and diet feedback recalibration.
4. **Health Data Tracking:** Syncs and stores user health data (steps, calories, sleep) to Firestore.
5. **Medical Library:** A centralized repository for medical context, conditions, and educational materials.
6. **Cross-Platform Support:** Web app built with Next.js and a native Android app powered by Capacitor.
7. **Secure User Profiles:** Full authentication and profile management using Firebase Auth, including a "delete account" compliance feature.

## 👥 Team Members & Roles
* **Deepkumar Pandey** – AI/ML Engineer ([GitHub](https://github.com/deeperzz8356))
* **Shrushti Pandey** – Frontend Developer ([GitHub](https://github.com/Shrushti211))
* **Bhushan Acharekar** – AI/ML Engineer ([GitHub](https://github.com/B-Acharekar))
* **Kalpesh Dandekar** – Backend Developer ([GitHub](https://github.com/Kalpesh-Dandekar))

## 🛠️ Tech Stack
- **Frontend:** Next.js (App Router), React.js, Tailwind CSS, Framer Motion, Lucide Icons, Capacitor (for Android)
- **Backend:** FastAPI (Python), Uvicorn, LangGraph
- **AI/ML:** TensorFlow/Keras, OpenCV, NumPy, Pillow, OpenRouter (LLM chat)
- **Database & Auth:** Firebase Auth, Firestore
- **Storage:** Cloudinary (primary), Firebase Storage (fallback)
- **Environment Management:** Python-Dotenv

---

## 🚀 Getting Started

### 🤗 Hugging Face Docker Space Deployment

This repository is configured to run on Hugging Face Docker Spaces with a single container:
- Nginx serves the static frontend on port `7860`
- FastAPI backend runs internally on `127.0.0.1:8000`
- `/api/*` is reverse-proxied to backend endpoints

#### Required Space environment settings
Set these in your Space settings before first run.

**Space Secrets (private):**
- `GEMINI_API_KEY`
- `FIREBASE_STORAGE_BUCKET`

**Space Variables (public frontend config; required at build time):**
- `NEXT_PUBLIC_API_URL` (set to `/api`)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

*Important:* this frontend is built with static export, so `NEXT_PUBLIC_*` values must be present during image build. After changing Variables/Secrets, rebuild/restart the Space. If you prefer not to commit service credentials, store Firebase service account JSON in a Space Secret and load it at runtime.

---

### 🚀 Render Backend Deployment

This repo also includes a Render blueprint for deploying the FastAPI backend with Cloudinary-backed image uploads.

#### Required Render environment variables
Set these in Render before first deploy:
- `APP_ENV=production`
- `ALLOWED_ORIGINS=https://your-frontend.onrender.com,capacitor://localhost,http://localhost,http://127.0.0.1:3000`
- `GEMINI_API_KEY`
- `CLOUDINARY_NAME`
- `CLOUDINARY_KEY`
- `CLOUDINARY_SECRET`
- `FIREBASE_STORAGE_BUCKET` (only if you want Firebase Storage as a fallback)

*(Note: `firebase_admin.json` is optional on Render; if not provided, the backend boots without Firebase Storage and continues with Cloudinary-only uploads).*

#### Deploy Steps
1. Push the repo to GitHub.
2. In Render, create a new Web Service from the repo or import the `render.yaml` blueprint.
3. Use the backend service defined in `render.yaml`.
4. After deploy, copy the service URL (e.g., `https://your-service.onrender.com`).
5. Set `NEXT_PUBLIC_API_URL` in the frontend to that Render service URL.
6. Rebuild the Android app so the Capacitor shell points at the Render backend.

---

### 📱 Android App Configuration

For Capacitor Android builds, the app must use a public HTTPS backend URL. Do not use localhost or a LAN IP in production.

Set one of these before building:
- `NEXT_PUBLIC_API_URL=https://your-service.onrender.com`
- or `NEXT_PUBLIC_API_URL=https://your-service.onrender.com/api`

Then run:
```bash
cd frontend
npm run build
npx cap sync android
```
If you change any Render secrets or variables, redeploy the backend and rebuild the frontend export again so the Android shell and API URL stay in sync.

---

### 💻 Local Development Setup

#### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- NPM or Yarn

#### 1. Clone the repository
```bash
git clone [Insert Repository Link]
cd wiet-hackverse-2-0-hackathon-project-submission-aiml-701-wa05_hackmatrix-main
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`

#### 3. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload
```
The gateway API (including model endpoints) will be available at: `http://localhost:8000`

---

## 📊 Dataset Reference
- **Dataset Name:** Chest X-Ray Images (Pneumonia)
- **Link:** [Kaggle - Chest X-Ray Images (Pneumonia)](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia)
- **Link:** [Kaggle - Skin Cancer MNIST: HAM10000 (Skin)](https://www.kaggle.com/datasets/kmader/skin-cancer-mnist-ham10000)

## 🔗 Project Links
- **Screen Recording:** [Insert YouTube/Loom Link]
- **Presentation Video:** [Insert Video Link]

## 🏗️ Architecture
- **Agentic Workflow (LangGraph):**
    - **Analysis:** Input medical images are analyzed by the model to predict disease likelihood.
    - **Heatmap Generation:** Visual explanations (e.g., Grad-CAM) highlight affected areas for interpretability.
    - **Dataset Feedback (Reverser):** Insights from the heatmap are fed back into the dataset to refine model understanding or augment training.
    - **Explainability Loop:** Once feedback conditions are satisfied, the system reverses the process to generate final explainable outputs for clinicians.
- **XAI Engine:** Grad-CAM generator that produces heatmaps to highlight pathological regions.
- **Explainability Layer:** Post-processed analysis that translates heatmaps and pixel intensity into clinical features (Opacity, Nodules, etc.).
- **Bi-Directional Interface:** Web and Mobile dashboard featuring live diagnosis results, medical chatbot, and diet generation modules.

---
*Built with ❤️ by Team HackMatrix for Hackverse 2.0*

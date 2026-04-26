---
title: MediSeen
emoji: 🩺
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# Explainable-Med: Transparency & Interpretability in Medical AI Diagnostics

**Problem Statement ID:** HVAI-03  
**Hackathon:** Hackverse 2.0

## 📝 Project Overview
Current AI diagnostic models often operate as "Black Boxes", providing accurate results without explaining the underlying reasoning. This lack of transparency leads to hesitation among medical professionals to trust AI-generated outcomes in critical clinical settings.

**Explainable-Med** is a diagnostic tool that implements **Explainable AI (XAI)** to bridge this trust gap. The system classifies chest X-ray images for conditions like **Pneumonia** while simultaneously providing a multi-layered justification for its decisions:
1. **Visual Heatmaps (Grad-CAM):** Identifying the critical pixels and anatomical regions that influenced the model's prediction.
2. **Radiology Feature Detection:** A heuristic-driven analysis that cross-references saliency with clinical features like Lung Opacity, Consolidation, and Pleural Effusion.
3. **Natural Language Explanation:** Summarizing the detected clinical features to provide a human-readable justification for the diagnosis.

## 👥 Team Members & Roles
* **Deepkumar Pandey** – AI/ML Engineer ([GitHub](https://github.com/deeperzz8356))
* **Shrushti Pandey** – Frontend Developer ([GitHub](https://github.com/Shrushti211))
* **Bhushan Acharekar** – AI/ML Engineer ([GitHub](https://github.com/B-Acharekar))
* **Kalpesh Dandekar** – Backend Developer ([GitHub](https://github.com/Kalpesh-Dandekar))

## 🛠️ Tech Stack
- **Frontend:** Next.js, React.js, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend:** FastAPI (Python), Uvicorn, HTTPX
- **AI/ML:** TensorFlow/Keras, OpenCV, NumPy, Pillow
- **Authentication:** Firebase Auth
- **Environment Management:** Python-Dotenv

## 🚀 Getting Started

## 🤗 Hugging Face Docker Space Deployment

This repository is configured to run on Hugging Face Docker Spaces with a single container:
- Nginx serves the static frontend on port `7860`
- FastAPI backend runs internally on `127.0.0.1:8000`
- `/api/*` is reverse-proxied to backend endpoints

### Required Space environment settings

Set these in your Space settings before first run.

Space Secrets (private):
- `GEMINI_API_KEY`
- `FIREBASE_STORAGE_BUCKET`

Space Variables (public frontend config; required at build time for static Next export):
- `NEXT_PUBLIC_API_URL` (set to `/api`)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Important: this frontend is built with static export, so `NEXT_PUBLIC_*` values must be present during image build. After changing Variables/Secrets, rebuild/restart the Space.

If you prefer not to commit service credentials, store Firebase service account JSON in a Space Secret and load it at runtime.

### Push to Space

```bash
git clone https://huggingface.co/spaces/meediseen/meediseen
cd meediseen
# copy project files, then:
git add .
git commit -m "Configure full-stack Docker Space runtime"
git push
```

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- NPM or Yarn

### Installation & Setup

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
The backend now includes the AI/ML model, so no separate model server is needed.
The gateway API (including model endpoints) will be available at: http://localhost:8000

## 📊 Dataset Reference
- **Dataset Name:** Chest X-Ray Images (Pneumonia)
- **Link:** [Kaggle - Chest X-Ray Images (Pneumonia)](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia)
- **Link:**[Kaggle - Skin Cancer MNIST: HAM10000 (Skin)](https://www.kaggle.com/datasets/kmader/skin-cancer-mnist-ham10000)

## 🔗 Project Links
- **Screen Recording:** [Insert YouTube/Loom Link]
- **Presentation Video:** [Insert Video Link]

## 🏗️ Architecture
- **Agentic Workflow:
    Analysis: Input medical images are analyzed by the model to predict disease likelihood.
    Heatmap Generation: Visual explanations (e.g., Grad-CAM) highlight affected areas for interpretability.
    Dataset Feedback (Reverser): Insights from the heatmap are fed back into the dataset to refine model understanding or augment training.
    Explainability Loop: Once feedback conditions are satisfied, the system reverses the process to generate final explainable outputs for clinicians.
- **XAI Engine:** Grad-CAM generator that produces heatmaps to highlight pathological regions.
- **Explainability Layer:** Post-processed analysis that translates heatmaps and pixel intensity into clinical features (Opacity, Nodules, etc.).
- **Bi-Directional Interface:** Dashboard featuring live diagnosis result along with interpretability modules.

---
*Built with ❤️ by Team HackMatrix for Hackverse 2.0*

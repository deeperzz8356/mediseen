# Sign-Sync: Real-time Bi-Directional Sign Language Translator

**Problem Statement ID:** HVAI-02  
**Hackathon:** Hackverse 2.0

## 📝 Project Overview
Sign-Sync is a high-speed, low-latency communication bridge designed to break the barrier between the hearing/speech-impaired and the rest of society. By leveraging advanced Computer Vision and Deep Learning, the system provides a seamless bi-directional translation experience:
1. **Sign-to-Text/Speech:** Real-time recognition of hand gestures and motion sequences translated into fluent text and audio.
2. **Text/Speech-to-Sign:** Reverse translation where input text is converted into a visual sequence or animated sign language avatar for truly natural conversation.

## 👥 Team Members & Roles
- **Deepkumar Pandey** - [Insert Role, e.g., Frontend Developer & UI/UX]
- **Shrushti Pandey** - [Insert Role, e.g., Backend Developer & Integration]
- **Bhushan Acharekar** - [Insert Role, e.g., AI/ML Engineer & Model Optimization]
- **Kalpesh Dandekar** - [Insert Role, e.g., DevOps & Deployment]

## 🛠️ Tech Stack
- **Frontend:** Next.js, React.js, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend:** FastAPI (Python), Uvicorn, HTTPX
- **AI/ML:** TensorFlow/Keras, OpenCV, NumPy, Pillow
- **Authentication:** Firebase Auth
- **Environment Management:** Python-Dotenv

## 🚀 Getting Started

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

#### 4. Model Server Setup
```bash
cd model
python -m pip install -r requirements.txt # (Add dependencies like tensorflow, opencv-python)
python -m uvicorn app:app --port 8005 --reload
```

## 📊 Dataset Reference
- **Dataset Name:** [Insert Dataset Name, e.g., ASL Alphabet Dataset]
- **Link:** [Insert Link to Dataset on Kaggle/Google Drive/HuggingFace]

## 🔗 Project Links
- **Frontend URL:** [Insert Vercel/Netlify Link]
- **Backend API:** [Insert Backend Deployment Link]
- **Screen Recording:** [Insert YouTube/Loom Link]
- **Presentation Video:** [Insert Video Link]

## 🏗️ Architecture
- **Recognition Engine:** Robust CV model for complex sequence identification.
- **Bi-Directional Interface:** Dashboard featuring live sign translation and reverse avatar animations.
- **Performance Pipeline:** Optimized for minimal lag to maintain natural conversation flow.

---
*Built with ❤️ by Team HackMatrix for Hackverse 2.0*

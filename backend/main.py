import os
import uuid
import traceback

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles  # <--- Added for URL access
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path


# Firebase
import firebase_admin
from firebase_admin import credentials, auth

# Graph Pipeline
import sys
sys.path.append("..")

from model.graph import build_graph

load_dotenv()

app = FastAPI(title="Mediseen Backend")

# ---------------------------------------------------
# 0️⃣ Path Configuration & Static Mounting
# ---------------------------------------------------
# This ensures we are always in the 'backend' folder context
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serves files at: http://localhost:8000/uploads/
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
# ---------------------------------------------------
# Build LangGraph once
# ---------------------------------------------------
graph = build_graph()

# 1️⃣ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2️⃣ Firebase Init
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_admin.json")
    firebase_admin.initialize_app(cred)

# 3️⃣ Request Models
class TokenRequest(BaseModel):
    token: str

# 4️⃣ Health Check
@app.get("/")
def root():
    return {"status": "Mediseen API running", "upload_dir": UPLOAD_DIR}

# 5️⃣ Verify Firebase Token
@app.post("/auth/verify")
async def verify_token(data: TokenRequest):
    try:
        decoded = auth.verify_id_token(data.token)
        return {"status": "verified", "uid": decoded["uid"]}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")

# ---------------------------------------------------
# 6️⃣ AI Diagnosis Endpoint (Updated Paths)
# ---------------------------------------------------
@app.post("/diagnose")
async def diagnose(
    image: UploadFile = File(...),
    symptoms: str = Form(...)
):
    try:
        session_id = str(uuid.uuid4())
        
        # 1. Save to UPLOAD_DIR with absolute path
        image_filename = f"{session_id}_{image.filename}"
        image_path = os.path.join(UPLOAD_DIR, image_filename)

        with open(image_path, "wb") as buffer:
            buffer.write(await image.read())

        # 2. Prepare Graph State
        state = {
            "session_id": session_id,
            "image_path": image_path,
            "user_symptoms": symptoms,
            "prediction": "",
            "confidence_score": 0.0,
            "explanation": "",
            "db_context": "",
            "final_report": "",
            "heatmap_path": "",
            "report_path": ""
        }

        # 3. Run AI pipeline
        result = graph.invoke(state)

        # 4. Generate Public URLs (instead of just local paths)
        # Note: result["heatmap_path"] is an absolute local path. 
        # We extract just the filename to give the frontend a URL.
        heatmap_file = os.path.basename(result["heatmap_path"])
        report_file = os.path.basename(result["report_path"])

        # 5. Cleanup the ORIGINAL uploaded image to save space
        # (Only do this if your report_node has already finished using it)
        try:
            os.remove(image_path)
        except:
            pass

        return {
            "session_id": session_id,
            "diagnosis": result["prediction"],
            "confidence": result["confidence_score"],
            "explanation": result["final_report"],
            "heatmap_url": f"/uploads/{heatmap_file}",
            "report_url": f"/uploads/{report_file}"
        }

    except Exception as e:
        print("❌ DIAGNOSIS ERROR")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Diagnosis pipeline failed")

# 7️⃣ Download Local Report
@app.get("/report")
def download_report(filename: str):
    # Security: Only allow files from the UPLOAD_DIR
    file_path = os.path.join(UPLOAD_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        file_path,
        media_type="application/octet-stream",
        filename=filename
    )
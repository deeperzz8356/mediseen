import firebase_admin
from firebase_admin import credentials, firestore, storage
import random
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Global DB instance
_db = None


def _resolve_firebase_cred_path(cred_path: str) -> Path:
    """Resolve the Firebase service-account path from the local working directory or backend package."""
    resolved_cred_path = Path(cred_path)
    if resolved_cred_path.is_absolute() or resolved_cred_path.exists():
        return resolved_cred_path

    return Path(__file__).resolve().parents[1] / cred_path


def init_firebase(cred_path: str = "firebase_admin.json"):
    """
    Initialize Firebase only once with storage support.
    Supports both a JSON file and a FIREBASE_SERVICE_ACCOUNT_JSON env var.
    """
    global _db

    if _db is not None:
        return _db

    try:
        if not firebase_admin._apps:
            cred = None
            
            # 1. Try environment variable first (best for Render/Cloud)
            env_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
            if env_json:
                try:
                    import json
                    cred_dict = json.loads(env_json)
                    cred = credentials.Certificate(cred_dict)
                    print("OK: Firebase initialized from environment variable")
                except Exception as json_err:
                    print(f"WARNING: Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: {json_err}")

            # 2. Try local file if env var failed
            if not cred:
                resolved_cred_path = _resolve_firebase_cred_path(cred_path)
                if resolved_cred_path.exists():
                    cred = credentials.Certificate(str(resolved_cred_path))
                    print(f"OK: Firebase initialized from {cred_path}")
                else:
                    print(
                        "WARNING: Firebase credentials not found (no file and no env var); "
                        "skipping Firebase initialization"
                    )
                    _db = None
                    return _db

            bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")
            firebase_admin.initialize_app(cred, {
                'storageBucket': bucket_name
            })

        _db = firestore.client()
        print("OK: Firestore & Storage connected")

    except Exception as e:
        print(f"ERROR: Firebase initialization failed: {e}")
        _db = None

    return _db


def get_db():
    """
    Get Firestore client instance.
    """
    global _db
    if _db is None:
        _db = init_firebase()
    return _db


# ---------------------------------------------------
# Medical Knowledge Retrieval
# ---------------------------------------------------

def fetch_medical_context(prediction: str) -> dict:
    """
    Fetches comprehensive medical context for a given disease prediction.
    Returns a unified structure for Library and Diet systems.
    """
    db = get_db()
    if db is None:
        return {
            "disease": prediction,
            "symptoms": ["Consult a medical professional for symptoms."],
            "precautions": ["Consult a medical professional for precautions."],
            "diet": {
                "recommended": [],
                "avoid": [],
                "plan": "No specific diet plan available."
            }
        }

    # Using 'medical_knowledge' as the single source of truth for all disease data
    collection_ref = db.collection("medical_knowledge")
    
    try:
        # Try exact match first
        query = collection_ref.where("disease_name", "==", prediction).limit(1)
        results = query.get()

        if results:
            doc = results[0].to_dict()
            return {
                "disease": doc.get("disease_name", prediction),
                "symptoms": doc.get("symptoms", []),
                "precautions": doc.get("precautions", []),
                "diet": doc.get("diet", {
                    "recommended": doc.get("diet_recommended", []),
                    "avoid": doc.get("diet_avoid", []),
                    "plan": doc.get("diet_plan", "Standard clinical diet recommended.")
                })
            }

        # Fallback to label-based matching if no exact match
        target_label = 0 if "Normal" in prediction else 1
        query = collection_ref.where("label", "==", target_label).limit(3)
        results = query.get()

        if results:
            doc = random.choice(results).to_dict()
            return {
                "disease": doc.get("disease_name", prediction),
                "symptoms": doc.get("symptoms", []),
                "precautions": doc.get("precautions", []),
                "diet": doc.get("diet", {
                    "recommended": doc.get("diet_recommended", []),
                    "avoid": doc.get("diet_avoid", []),
                    "plan": doc.get("diet_plan", "General guidance provided.")
                })
            }

    except Exception as e:
        print(f"WARNING: Firestore medical context fetch error: {e}")

    # Final fallback
    return {
        "disease": prediction,
        "symptoms": ["Information currently unavailable in clinical database."],
        "precautions": ["Seek immediate professional medical advice."],
        "diet": {
            "recommended": [],
            "avoid": [],
            "plan": "Consult your doctor for a personalized nutrition plan."
        }
    }


# ---------------------------------------------------
# Firebase Storage Utilities
# ---------------------------------------------------

def upload_image(local_path: str, destination_blob_name: str) -> str:
    """
    Uploads a file to Firebase Storage and returns a short-lived signed URL.
    """
    try:
        init_firebase() # Ensure app is initialized
        bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")
        if not bucket_name:
            print("WARNING: FIREBASE_STORAGE_BUCKET not set. Skipping Firebase upload.")
            return ""

        bucket = storage.bucket()
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_filename(local_path)
        signed_url_ttl_seconds = int(os.getenv("SIGNED_URL_TTL_SECONDS", "3600"))
        return blob.generate_signed_url(
            expiration=timedelta(seconds=signed_url_ttl_seconds),
            method="GET",
        )

    except Exception as e:
        print(f"ERROR: Storage upload error: {e}")
        return ""


# ---------------------------------------------------
# Rate Limiting (2 diagnoses per user per day)
# ---------------------------------------------------

DAILY_LIMIT = int(os.getenv("DAILY_DIAGNOSIS_LIMIT", "10"))


@firestore.transactional
def _increment_daily_rate_limit(transaction, doc_ref, uid: str, today: str) -> dict:
    snapshot = doc_ref.get(transaction=transaction)
    count = snapshot.to_dict().get("count", 0) if snapshot.exists else 0

    if count >= DAILY_LIMIT:
        return {"allowed": False, "used": count, "limit": DAILY_LIMIT}

    next_count = count + 1
    transaction.set(
        doc_ref,
        {
            "uid": uid,
            "date": today,
            "count": next_count,
            "last_updated": datetime.now(timezone.utc).isoformat(),
        },
        merge=True,
    )
    return {"allowed": True, "used": next_count, "limit": DAILY_LIMIT}


def check_and_increment_rate_limit(uid: str) -> dict:
    """
    TEMPORARILY DISABLED: Always allow for testing.
    """
    return {"allowed": True, "used": 0, "limit": 9999}

    # Development shortcut: allow unlimited requests for local dev user 'dev-user'
    app_env = os.getenv("APP_ENV", os.getenv("ENV", "development")).lower()
    if app_env != "production" and str(uid).startswith("dev"):
        return {"allowed": True, "used": 0, "limit": DAILY_LIMIT}

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    doc_ref = db.collection("rate_limits").document(f"{uid}_{today}")

    try:
        transaction = db.transaction()
        return _increment_daily_rate_limit(transaction, doc_ref, uid, today)

    except Exception as e:
        print(f"WARNING: Rate limit check error: {e}")
        # Fail closed to avoid bypass during Firestore issues.
        return {"allowed": False, "used": 0, "limit": DAILY_LIMIT}


# ---------------------------------------------------
# Diagnosis Cache (by image hash)
# ---------------------------------------------------

import hashlib


def get_image_hash(image_bytes: bytes) -> str:
    """SHA-256 hash of image bytes for cache key."""
    return hashlib.sha256(image_bytes).hexdigest()


def get_cached_diagnosis(image_hash: str) -> dict | None:
    """
    Look up a cached diagnosis result by image hash.
    Returns the cached result dict or None if not found.
    """
    db = get_db()
    if db is None:
        return None

    try:
        doc = db.collection("diagnosis_cache").document(image_hash).get()
        if doc.exists:
            data = doc.to_dict()
            print(f"OK: Cache hit for image hash {image_hash[:12]}...")
            return data.get("result")
    except Exception as e:
        print(f"WARNING: Cache lookup error: {e}")

    return None


def save_diagnosis_cache(image_hash: str, result: dict):
    """
    Save a diagnosis result to cache keyed by image hash.
    """
    db = get_db()
    if db is None:
        return

    try:
        db.collection("diagnosis_cache").document(image_hash).set({
            "result": result,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "hit_count": 1
        })
        print(f"OK: Cached diagnosis for hash {image_hash[:12]}...")
    except Exception as e:
        print(f"WARNING: Cache save error: {e}")


def increment_cache_hit(image_hash: str):
    """Track how many times a cached result was served."""
    db = get_db()
    if db is None:
        return
    try:
        doc_ref = db.collection("diagnosis_cache").document(image_hash)
        doc = doc_ref.get()
        if doc.exists:
            current = doc.to_dict().get("hit_count", 1)
            doc_ref.update({"hit_count": current + 1, "last_hit": datetime.now(timezone.utc).isoformat()})
    except Exception as e:
        print(f"WARNING: Cache hit increment error: {e}")


# ---------------------------------------------------
# Data Collection (save every diagnosis for knowledge)
# ---------------------------------------------------

def save_diagnosis_record(
    uid: str,
    session_id: str,
    symptoms: str,
    result: dict,
    image_url: str,
    platform: str = "unknown",
):
    """
    Save every diagnosis to Firestore for data collection.
    This builds your medical knowledge dataset over time.
    """
    db = get_db()
    if db is None:
        return

    try:
        db.collection("diagnosis_records").document(session_id).set({
            "uid": uid,
            "session_id": session_id,
            "symptoms": symptoms,
            "diagnosis": result.get("diagnosis"),
            "confidence": result.get("confidence"),
            "image_url": image_url,
            "heatmap_url": result.get("heatmap_url"),
            "report_url": result.get("report_url"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "platform": platform or "unknown",
        })
        print(f"OK: Diagnosis record saved for session {session_id}")
    except Exception as e:
        print(f"WARNING: Data collection save error: {e}")


def delete_user_data(uid: str):
    """
    Deletes all Firestore records associated with the user UID.
    This includes profile, diagnosis records, and rate limits.
    """
    db = get_db()
    if db is None:
        return

    try:
        # 1. Delete user profile
        db.collection("users").document(uid).delete()

        # 2. Delete diagnosis records
        records_ref = db.collection("diagnosis_records").where("uid", "==", uid)
        records = records_ref.stream()
        for doc in records:
            doc.reference.delete()

        # 3. Delete rate limits
        limits_ref = db.collection("rate_limits").where("uid", "==", uid)
        limits = limits_ref.stream()
        for doc in limits:
            doc.reference.delete()

        print(f"OK: All Firestore data deleted for user {uid}")
    except Exception as e:
        print(f"ERROR: Failed to delete user data for {uid}: {e}")

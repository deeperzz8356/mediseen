import firebase_admin
from firebase_admin import credentials, firestore
import random
import os

# Global DB instance
_db = None


def init_firebase(cred_path: str = "firebase_admin.json"):
    """
    Initialize Firebase only once.
    """
    global _db

    if _db is not None:
        return _db

    try:

        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)

        _db = firestore.client()

        print("✅ Firestore connected")

    except Exception as e:

        print(f"❌ Firebase initialization failed: {e}")
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

def fetch_medical_context(prediction: str) -> str:

    db = get_db()

    if db is None:
        return "Database unavailable. Using general clinical reasoning."

    collection_ref = db.collection("medical_knowledge")

    db_context = None

    try:

        # -------------------------
        # Exact disease match
        # -------------------------

        query = (
            collection_ref
            .where("disease_name", "==", prediction)
            .limit(1)
        )

        results = query.get()

        if results:

            doc = results[0].to_dict()

            db_context = (
                f"Protocol: {doc.get('description','Standard treatment recommended.')}\n"
                f"Indicators: {doc.get('visual_indicators','Not specified.')}"
            )

            print(f"✅ Exact DB match for {prediction}")

    except Exception as e:

        print(f"⚠️ Firestore query error: {e}")

    # -------------------------
    # Fallback by category
    # -------------------------

    if not db_context:

        try:

            target_label = 0 if "Normal" in prediction else 1

            query = (
                collection_ref
                .where("label", "==", target_label)
                .limit(3)
            )

            results = query.get()

            if results:

                doc = random.choice(results).to_dict()

                db_context = (
                    f"Protocol: {doc.get('description','Consult clinical guidelines.')}\n"
                    f"Indicators: {doc.get('visual_indicators','N/A')}"
                )

                print(f"ℹ️ Fallback DB match via label {target_label}")

        except Exception as e:

            print(f"⚠️ Firestore fallback error: {e}")

    # -------------------------
    # Final fallback
    # -------------------------

    if not db_context:
        db_context = "No database reference found. Use general diagnostic reasoning."

    return db_context
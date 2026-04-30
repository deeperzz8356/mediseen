import os
from dotenv import load_dotenv

load_dotenv()

def upload_image(local_path: str, destination_blob_name: str) -> str:
    """
    Uploads image to Cloudinary exclusively.
    """
    try:
        from .cloudinary_svc import upload_image as upload_cloudinary
        return upload_cloudinary(local_path, destination_blob_name)
    except Exception as e:
        print(f"❌ Storage service (Cloudinary) failed: {e}")
        return ""

import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
CLOUDINARY_NAME = os.getenv("CLOUDINARY_NAME")
CLOUDINARY_KEY = os.getenv("CLOUDINARY_KEY")
CLOUDINARY_SECRET = os.getenv("CLOUDINARY_SECRET")
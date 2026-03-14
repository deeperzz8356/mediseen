import google.generativeai as genai
from backend.config import GEMINI_API_KEY


genai.configure(api_key=GEMINI_API_KEY)


def get_flash_model():
    return genai.GenerativeModel("gemini-2.5-flash-lite")


def call_gemini(model, content, retries=3):

    delay = 3

    for i in range(retries):

        try:
            return model.generate_content(content)

        except Exception:

            if i == retries - 1:
                raise

            import time
            time.sleep(delay)
            delay *= 2
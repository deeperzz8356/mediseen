import os
import httpx
import json

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = "anthropic/claude-3-haiku" # Fast and smart for medical chat

async def get_chat_response(messages: list):
    """
    Sends messages to OpenRouter and returns the AI response.
    Includes a strict medical persona.
    """
    if not OPENROUTER_API_KEY:
        return "Chat service is currently unavailable (API Key missing)."

    system_prompt = {
        "role": "system",
        "content": (
            "You are MediSeen AI, a professional and empathetic medical assistant. "
            "Your goal is to provide accurate health information, explain medical terms, "
            "and suggest management steps based on general medical knowledge. "
            "\n\nSTRICT RULES:\n"
            "1. Only answer queries related to health, medicine, nutrition, and wellness. "
            "2. If a user asks something unrelated to health (e.g., coding, politics, general trivia), "
            "politely decline and remind them that you are a medical assistant. "
            "3. ALWAYS include a disclaimer that you are an AI and not a substitute for a doctor. "
            "4. Keep responses concise, professional, and easy to understand for patients."
        )
    }

    # Prepend system prompt if not present
    if not messages or messages[0].get("role") != "system":
        messages.insert(0, system_prompt)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "https://mediseen.onrender.com", # Required by OpenRouter
                    "X-Title": "MediSeen AI",
                    "Content-Type": "application/json"
                },
                json={
                    "model": MODEL,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 1000
                }
            )
            
            if response.status_code != 200:
                print(f"OpenRouter Error: {response.text}")
                return "I'm having trouble connecting to my medical database. Please try again later."

            data = response.json()
            return data["choices"][0]["message"]["content"]

    except Exception as e:
        print(f"Chat Service Exception: {e}")
        return "An unexpected error occurred while processing your request."

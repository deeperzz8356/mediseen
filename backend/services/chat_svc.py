import os
import httpx
import json
from typing import AsyncGenerator

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = "anthropic/claude-3-haiku" # Fast and smart for medical chat

def _build_system_prompt() -> dict:
    return {
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


def _normalize_messages(messages: list) -> list:
    if not messages or messages[0].get("role") != "system":
        return [_build_system_prompt(), *messages]
    return messages


async def stream_chat_response(messages: list) -> AsyncGenerator[bytes, None]:
    """Stream the OpenRouter response back to the client as plain text chunks."""
    if not OPENROUTER_API_KEY:
        yield b"Chat service is currently unavailable (API Key missing)."
        return

    normalized_messages = _normalize_messages(messages)

    try:
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST",
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "https://mediseen.onrender.com", # Required by OpenRouter
                    "X-Title": "MediSeen AI",
                    "Content-Type": "application/json"
                },
                json={
                    "model": MODEL,
                    "messages": normalized_messages,
                    "temperature": 0.7,
                    "max_tokens": 1000,
                    "stream": True,
                },
            ) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    print(f"OpenRouter Error: {error_text.decode('utf-8', errors='ignore')}")
                    yield b"I'm having trouble connecting to my medical database. Please try again later."
                    return

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    if line.strip() == "data: [DONE]":
                        break
                    if not line.startswith("data: "):
                        continue

                    payload = line[6:]
                    try:
                        data = json.loads(payload)
                    except json.JSONDecodeError:
                        continue

                    choices = data.get("choices") or []
                    if not choices:
                        continue

                    delta = choices[0].get("delta") or {}
                    chunk = delta.get("content")
                    if chunk:
                        yield chunk.encode("utf-8")

    except Exception as e:
        print(f"Chat Service Exception: {e}")
        yield b"An unexpected error occurred while processing your request."


async def get_chat_response(messages: list) -> str:
    """Compatibility helper that collects the streamed response into a string."""
    chunks: list[str] = []
    async for chunk in stream_chat_response(messages):
        chunks.append(chunk.decode("utf-8", errors="ignore"))
    return "".join(chunks)

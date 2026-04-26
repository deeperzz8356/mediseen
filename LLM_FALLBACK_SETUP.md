# Multi-API LLM Fallback System Setup Guide

## Overview
Your project now supports a **fallback system** that automatically tries multiple LLM providers if the primary one fails. This ensures your application remains resilient even if one API experiences issues.

## Supported Providers

### 1. **Google Gemini** (Primary)
- **Cost**: Free tier with daily limits, then pay-as-you-go
- **Models**: `gemini-1.5-flash`, `gemini-1.5-pro`
- **Setup**: [Get API Key](https://ai.google.dev)
- **Supports**: Text & images (vision capabilities)

### 2. **OpenRouter** (Fallback 1)
- **Cost**: Free tier available, then pay-as-you-go
- **Free Models Available**:
  - `qwen/qwen-2.5-72b-instruct` - Powerful open-source model
  - `meta-llama/llama-2-70b-chat` - Meta's Llama
  - `mistralai/mistral-7b-instruct` - Efficient Mistral
  - `nousresearch/nous-hermes-2-mixtral-8x7b-dpo` - High-quality model
- **Setup**: [Get API Key](https://openrouter.ai/)
- **Note**: Automatically selects the most cost-effective model

### 3. **HuggingFace Inference API** (Fallback 2)
- **Cost**: Free tier with rate limits (~30k requests/month)
- **Models**:
  - `mistralai/Mistral-7B-Instruct-v0.1`
  - `meta-llama/Llama-2-70b-chat-hf`
- **Setup**: [Get API Key](https://huggingface.co/settings/tokens)
- **Note**: Best for high-volume testing with rate limits

## Configuration

### Step 1: Update Backend `.env` File
Edit `backend/.env`:

```env
# Google Gemini (Already configured)
GEMINI_API_KEY=your_gemini_key_here

# OpenRouter (Add this)
OPENROUTER_API_KEY=your_openrouter_key_here

# HuggingFace (Optional)
HUGGINGFACE_API_KEY=your_huggingface_key_here

# Firebase (Keep existing)
FIREBASE_STORAGE_BUCKET=mediseen-37997.firebasestorage.app
```

### Step 2: Get API Keys

#### For OpenRouter (Recommended Free Tier):
1. Visit https://openrouter.ai/
2. Sign up (free account)
3. Go to Settings → API Keys
4. Copy your API key
5. Paste in `.env` as `OPENROUTER_API_KEY`

#### For HuggingFace (Alternative Free Tier):
1. Visit https://huggingface.co/settings/tokens
2. Create a new token (read access is enough)
3. Copy the token
4. Paste in `.env` as `HUGGINGFACE_API_KEY`

### Step 3: Restart Backend
```bash
# Stop current backend process
# Restart with new environment variables
python backend/main.py
# or
uvicorn backend.main:app --reload
```

## How the Fallback Works

The system automatically tries providers in this order:

```
1. Google Gemini (primary)
   ↓ (if fails)
2. OpenRouter + Qwen/Llama/Mistral models
   ↓ (if fails)
3. HuggingFace Inference API
   ↓ (if all fail)
   ❌ Error returned to client
```

### Example Flow:
1. Request comes in → Try Gemini
2. Gemini is down/rate-limited → Try OpenRouter
3. OpenRouter succeeds → Return response ✓
4. If OpenRouter fails → Try HuggingFace
5. Continue until one succeeds or all fail

## Code Architecture

### New Files:
- `backend/services/llm_svc.py` - Multi-API fallback service

### Modified Files:
- `backend/config.py` - API configuration
- `backend/.env` - API keys
- `model/nodes.py` - Updated to use new LLM service

### Old Files (No Longer Used):
- `backend/services/gemini_svc.py` - Kept for reference, not called

## Usage in Code

### Simple Text Call:
```python
from backend.services.llm_svc import call_llm

response = call_llm("Analyze this medical condition...")
```

### With Image:
```python
from PIL import Image
from backend.services.llm_svc import call_llm

img = Image.open("skin_condition.jpg")
response = call_llm("Analyze this skin image...", image=img)
```

### Prefer Specific Provider:
```python
response = call_llm(prompt, image=img, preferred_provider="openrouter")
```

## Monitoring & Debugging

### Check Available Providers:
```python
from backend.services.llm_svc import get_llm_service

service = get_llm_service()
providers = service.get_available_providers()
print(f"Available: {providers}")  # Output: ['gemini', 'openrouter', 'huggingface']
```

### Enable Detailed Logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Cost Optimization Tips

1. **Use OpenRouter Free Tier First**: Cheapest option for testing
   - Free requests available
   - Auto-selects most cost-effective model

2. **Rate Limiting**: HuggingFace free tier has ~30k/month
   - Perfect for MVP testing
   - Scale up later

3. **Fallback Strategy**: 
   - Primary: Gemini (your existing API, already paid)
   - Fallback 1: OpenRouter (cheapest paid option)
   - Fallback 2: HuggingFace (free tier for testing)

4. **Monitor Usage**:
   - Gemini: Console.cloud.google.com
   - OpenRouter: openrouter.ai/dashboard
   - HuggingFace: huggingface.co/account

## Troubleshooting

### Issue: "No LLM providers available"
**Solution**: Add at least one API key to `.env`

### Issue: All providers failing
**Check**:
1. Verify API keys are correct
2. Check provider status pages
3. Look at backend logs for specific error
4. Ensure internet connection is stable

### Issue: Slow responses
**Try**:
1. Add `OPENROUTER_API_KEY` for faster fallback
2. Check provider rate limits
3. Monitor API usage in provider dashboards

## Advanced Configuration

### Custom Model Selection:
Edit `backend/config.py` to customize models for each provider:

```python
LLM_CONFIG = {
    "providers": [
        {
            "name": "openrouter",
            "models": [
                "qwen/qwen-2.5-72b-instruct",  # Your preferred model
                "meta-llama/llama-2-70b-chat",
            ],
        }
    ]
}
```

## Next Steps

1. ✅ Get your OpenRouter API key
2. ✅ Update `backend/.env`
3. ✅ Restart the backend
4. ✅ Test with: `curl http://localhost:8000/diagnose` (with image)
5. ✅ Monitor logs to see which provider is being used

---

**Questions?** Check the provider documentation:
- [Gemini Docs](https://ai.google.dev/docs)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [HuggingFace Docs](https://huggingface.co/docs/inference-api)

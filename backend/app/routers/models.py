from fastapi import APIRouter, Depends, HTTPException
import httpx, os
from ..database import get_db
from .auth import get_current_user

router = APIRouter()

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
OPENAI_BASE_URL = os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1")
OPENAI_API_KEY  = os.environ.get("OPENAI_API_KEY", "")

IS_GROQ = "groq.com" in OPENAI_BASE_URL

KNOWN_OPENAI_MODELS = [
    {"id": "gpt-4o",        "name": "GPT-4o",        "provider": "openai", "context": 128000},
    {"id": "gpt-4o-mini",   "name": "GPT-4o Mini",   "provider": "openai", "context": 128000},
    {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "provider": "openai", "context": 16385},
]

KNOWN_GROQ_MODELS = [
    {"id": "llama-3.3-70b-versatile",       "name": "Llama 3.3 70B",       "provider": "groq", "context": 128000},
    {"id": "llama-3.1-8b-instant",          "name": "Llama 3.1 8B (Fast)", "provider": "groq", "context": 128000},
    {"id": "llama3-70b-8192",               "name": "Llama 3 70B",         "provider": "groq", "context": 8192},
    {"id": "llama3-8b-8192",                "name": "Llama 3 8B",          "provider": "groq", "context": 8192},
    {"id": "mixtral-8x7b-32768",            "name": "Mixtral 8x7B",        "provider": "groq", "context": 32768},
    {"id": "gemma2-9b-it",                  "name": "Gemma 2 9B",          "provider": "groq", "context": 8192},
    {"id": "deepseek-r1-distill-llama-70b", "name": "DeepSeek R1 70B",     "provider": "groq", "context": 128000},
]

@router.get("/")
async def list_models(user=Depends(get_current_user)):
    models = []

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                for m in resp.json().get("models", []):
                    models.append({
                        "id": m["name"],
                        "name": m["name"],
                        "provider": "ollama",
                        "size": m.get("size"),
                        "context": None
                    })
    except Exception:
        pass

    if OPENAI_API_KEY:
        if IS_GROQ:
            models.extend(KNOWN_GROQ_MODELS)
        else:
            models.extend(KNOWN_OPENAI_MODELS)

    return {"models": models}

@router.post("/ollama/pull")
async def pull_model(body: dict, user=Depends(get_current_user)):
    from fastapi.responses import StreamingResponse
    model_name = body.get("name", "")

    async def stream_pull():
        async with httpx.AsyncClient(timeout=600) as client:
            async with client.stream("POST", f"{OLLAMA_BASE_URL}/api/pull", json={"name": model_name}) as resp:
                async for line in resp.aiter_lines():
                    if line.strip():
                        yield f"data: {line}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream_pull(), media_type="text/event-stream")

@router.delete("/ollama/{model_name:path}")
async def delete_model(model_name: str, user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.delete(f"{OLLAMA_BASE_URL}/api/delete", json={"name": model_name})
        return {"success": resp.status_code == 200}
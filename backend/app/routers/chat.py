from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, AsyncGenerator
import httpx, json, uuid, os
from datetime import datetime
from ..database import get_db
from .auth import get_current_user

router = APIRouter()

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
OPENAI_BASE_URL = os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1")
OPENAI_API_KEY  = os.environ.get("OPENAI_API_KEY", "")

def build_messages(messages, system=None):
    date_str = datetime.now().strftime("%B %d, %Y")
    base = f"You are a helpful assistant. Today's date is {date_str}."
    combined = base + ("\n\n" + system if system else "")
    msgs = [{"role": "system", "content": combined}]
    msgs.extend([{"role": m["role"], "content": m["content"]} for m in messages])
    return msgs

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    model: str
    messages: List[Message]
    system_prompt: Optional[str] = None
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 2048
    stream: Optional[bool] = True
    title: Optional[str] = None

def is_ollama_model(model: str) -> bool:
    if OPENAI_API_KEY and "localhost" not in OPENAI_BASE_URL:
        return False
    return True

async def stream_api(model, messages, system=None, temperature=0.7, max_tokens=2048):
    if not OPENAI_API_KEY:
        yield f"data: {json.dumps({'content': 'API key not configured.', 'done': True})}\n\n"
        yield "data: [DONE]\n\n"
        return

    msgs = build_messages(messages, system)
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
    payload = {"model": model, "messages": msgs, "stream": True, "temperature": temperature, "max_tokens": max_tokens}

    async with httpx.AsyncClient(timeout=120) as client:
        async with client.stream("POST", f"{OPENAI_BASE_URL}/chat/completions", json=payload, headers=headers) as resp:
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    data_str = line[6:].strip()
                    if data_str == "[DONE]":
                        yield "data: [DONE]\n\n"
                        break
                    try:
                        data = json.loads(data_str)
                        delta = data["choices"][0]["delta"]
                        if "content" in delta and delta["content"]:
                            yield f"data: {json.dumps({'content': delta['content'], 'done': False})}\n\n"
                    except (json.JSONDecodeError, KeyError, IndexError):
                        pass

async def stream_ollama(model, messages, system=None, temperature=0.7):
    msgs = build_messages(messages, system)
    payload = {"model": model, "messages": msgs, "stream": True, "options": {"temperature": temperature}}

    async with httpx.AsyncClient(timeout=120) as client:
        async with client.stream("POST", f"{OLLAMA_BASE_URL}/api/chat", json=payload) as resp:
            async for line in resp.aiter_lines():
                if line.strip():
                    try:
                        data = json.loads(line)
                        if "message" in data and "content" in data["message"]:
                            yield f"data: {json.dumps({'content': data['message']['content'], 'done': data.get('done', False)})}\n\n"
                        if data.get("done"):
                            yield "data: [DONE]\n\n"
                            break
                    except json.JSONDecodeError:
                        pass

@router.post("/stream")
async def chat_stream(req: ChatRequest, user=Depends(get_current_user), db=Depends(get_db)):
    model = req.model
    messages = [m.dict() for m in req.messages]
    use_ollama = is_ollama_model(model)

    async def generate():
        full_response = ""
        gen = stream_ollama(model, messages, req.system_prompt, req.temperature or 0.7) \
              if use_ollama else \
              stream_api(model, messages, req.system_prompt, req.temperature or 0.7, req.max_tokens or 2048)

        async for chunk in gen:
            yield chunk
            if chunk.startswith("data: ") and chunk.strip() != "data: [DONE]":
                try:
                    d = json.loads(chunk[6:])
                    full_response += d.get("content", "")
                except:
                    pass

        conv_id = req.conversation_id
        if not conv_id:
            conv_id = str(uuid.uuid4())
            title = req.title or (messages[-1]["content"][:60] if messages else "New Chat")
            await db.execute(
                "INSERT INTO conversations (id, user_id, title, model) VALUES (?, ?, ?, ?)",
                (conv_id, user["id"], title, model)
            )

        await db.execute(
            "INSERT INTO messages (id, conversation_id, role, content, model) VALUES (?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), conv_id, "user", messages[-1]["content"], model)
        )
        await db.execute(
            "INSERT INTO messages (id, conversation_id, role, content, model) VALUES (?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), conv_id, "assistant", full_response, model)
        )
        await db.execute(
            "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP, model = ? WHERE id = ?",
            (model, conv_id)
        )
        await db.commit()
        yield f"data: {json.dumps({'conversation_id': conv_id, 'done': True, 'final': True})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

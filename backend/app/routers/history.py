from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import uuid
from ..database import get_db
from .auth import get_current_user

router = APIRouter()

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    pinned: Optional[bool] = None
    tags: Optional[List[str]] = None
    system_prompt: Optional[str] = None

@router.get("/conversations")
async def get_conversations(
    limit: int = 50,
    offset: int = 0,
    search: Optional[str] = None,
    user=Depends(get_current_user),
    db=Depends(get_db)
):
    if search:
        query = """SELECT c.*, COUNT(m.id) as message_count
                   FROM conversations c
                   LEFT JOIN messages m ON m.conversation_id = c.id
                   WHERE c.user_id = ? AND (c.title LIKE ? OR EXISTS (
                       SELECT 1 FROM messages WHERE conversation_id = c.id AND content LIKE ?
                   ))
                   GROUP BY c.id ORDER BY c.pinned DESC, c.updated_at DESC LIMIT ? OFFSET ?"""
        like = f"%{search}%"
        async with db.execute(query, (user["id"], like, like, limit, offset)) as c:
            rows = await c.fetchall()
    else:
        query = """SELECT c.*, COUNT(m.id) as message_count
                   FROM conversations c
                   LEFT JOIN messages m ON m.conversation_id = c.id
                   WHERE c.user_id = ?
                   GROUP BY c.id ORDER BY c.pinned DESC, c.updated_at DESC LIMIT ? OFFSET ?"""
        async with db.execute(query, (user["id"], limit, offset)) as c:
            rows = await c.fetchall()

    return {"conversations": [dict(r) for r in rows]}

@router.get("/conversations/{conv_id}")
async def get_conversation(conv_id: str, user=Depends(get_current_user), db=Depends(get_db)):
    async with db.execute("SELECT * FROM conversations WHERE id = ? AND user_id = ?", (conv_id, user["id"])) as c:
        conv = await c.fetchone()
    if not conv:
        raise HTTPException(status_code=404, detail="Not found")

    async with db.execute("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC", (conv_id,)) as c:
        messages = await c.fetchall()

    return {"conversation": dict(conv), "messages": [dict(m) for m in messages]}

@router.patch("/conversations/{conv_id}")
async def update_conversation(conv_id: str, update: ConversationUpdate, user=Depends(get_current_user), db=Depends(get_db)):
    async with db.execute("SELECT id FROM conversations WHERE id = ? AND user_id = ?", (conv_id, user["id"])) as c:
        if not await c.fetchone():
            raise HTTPException(status_code=404, detail="Not found")

    if update.title is not None:
        await db.execute("UPDATE conversations SET title = ? WHERE id = ?", (update.title, conv_id))
    if update.pinned is not None:
        await db.execute("UPDATE conversations SET pinned = ? WHERE id = ?", (int(update.pinned), conv_id))
    if update.tags is not None:
        import json
        await db.execute("UPDATE conversations SET tags = ? WHERE id = ?", (json.dumps(update.tags), conv_id))
    if update.system_prompt is not None:
        await db.execute("UPDATE conversations SET system_prompt = ? WHERE id = ?", (update.system_prompt, conv_id))

    await db.commit()
    return {"success": True}

@router.delete("/conversations/{conv_id}")
async def delete_conversation(conv_id: str, user=Depends(get_current_user), db=Depends(get_db)):
    async with db.execute("SELECT id FROM conversations WHERE id = ? AND user_id = ?", (conv_id, user["id"])) as c:
        if not await c.fetchone():
            raise HTTPException(status_code=404, detail="Not found")
    await db.execute("DELETE FROM conversations WHERE id = ?", (conv_id,))
    await db.commit()
    return {"success": True}

@router.delete("/conversations")
async def delete_all_conversations(user=Depends(get_current_user), db=Depends(get_db)):
    await db.execute("DELETE FROM conversations WHERE user_id = ?", (user["id"],))
    await db.commit()
    return {"success": True}

# Prompts (slash commands)
@router.get("/prompts")
async def get_prompts(user=Depends(get_current_user), db=Depends(get_db)):
    async with db.execute("SELECT * FROM prompts WHERE user_id = ? ORDER BY created_at DESC", (user["id"],)) as c:
        rows = await c.fetchall()
    return {"prompts": [dict(r) for r in rows]}

@router.post("/prompts")
async def create_prompt(body: dict, user=Depends(get_current_user), db=Depends(get_db)):
    prompt_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO prompts (id, user_id, title, command, content) VALUES (?, ?, ?, ?, ?)",
        (prompt_id, user["id"], body["title"], body["command"], body["content"])
    )
    await db.commit()
    return {"id": prompt_id, **body}

@router.delete("/prompts/{prompt_id}")
async def delete_prompt(prompt_id: str, user=Depends(get_current_user), db=Depends(get_db)):
    await db.execute("DELETE FROM prompts WHERE id = ? AND user_id = ?", (prompt_id, user["id"]))
    await db.commit()
    return {"success": True}

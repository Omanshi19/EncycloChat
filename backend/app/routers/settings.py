from fastapi import APIRouter, Depends
from ..database import get_db
from .auth import get_current_user
import json

router = APIRouter()

@router.get("/")
async def get_settings(user=Depends(get_current_user), db=Depends(get_db)):
    async with db.execute("SELECT settings FROM users WHERE id = ?", (user["id"],)) as c:
        row = await c.fetchone()
    settings = json.loads(row["settings"] or "{}") if row else {}
    return settings

@router.put("/")
async def update_settings(body: dict, user=Depends(get_current_user), db=Depends(get_db)):
    await db.execute("UPDATE users SET settings = ? WHERE id = ?", (json.dumps(body), user["id"]))
    await db.commit()
    return body

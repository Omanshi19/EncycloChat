from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import Optional
import uuid, os, aiofiles
from ..database import get_db
from .auth import get_current_user

router = APIRouter()

UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "data/uploads")

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
    db=Depends(get_db)
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1]
    saved_name = f"{file_id}{ext}"
    path = os.path.join(UPLOAD_DIR, saved_name)

    async with aiofiles.open(path, 'wb') as f:
        content = await file.read()
        await f.write(content)

    await db.execute(
        "INSERT INTO user_files (id, user_id, filename, original_name, mime_type, size) VALUES (?, ?, ?, ?, ?, ?)",
        (file_id, user["id"], saved_name, file.filename, file.content_type, len(content))
    )
    await db.commit()

    return {
        "id": file_id,
        "filename": file.filename,
        "size": len(content),
        "mime_type": file.content_type
    }

@router.get("/")
async def list_files(user=Depends(get_current_user), db=Depends(get_db)):
    async with db.execute("SELECT * FROM user_files WHERE user_id = ? ORDER BY created_at DESC", (user["id"],)) as c:
        rows = await c.fetchall()
    return {"files": [dict(r) for r in rows]}

@router.delete("/{file_id}")
async def delete_file(file_id: str, user=Depends(get_current_user), db=Depends(get_db)):
    async with db.execute("SELECT * FROM user_files WHERE id = ? AND user_id = ?", (file_id, user["id"])) as c:
        row = await c.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    path = os.path.join(UPLOAD_DIR, row["filename"])
    if os.path.exists(path):
        os.remove(path)
    await db.execute("DELETE FROM user_files WHERE id = ?", (file_id,))
    await db.commit()
    return {"success": True}

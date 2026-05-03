from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import uuid, bcrypt, jwt, os
from datetime import datetime, timedelta
from ..database import get_db

router = APIRouter()
security = HTTPBearer(auto_error=False)

SECRET_KEY = os.environ.get("SECRET_KEY", "mywebui-secret-change-in-production-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 7  # 7 days

class RegisterRequest(BaseModel):
    username: str
    email: Optional[str] = None
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db)
):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = verify_token(credentials.credentials)
    async with db.execute("SELECT * FROM users WHERE id = ?", (payload["sub"],)) as cursor:
        user = await cursor.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(user)

@router.post("/register")
async def register(req: RegisterRequest, db=Depends(get_db)):
    # Check if first user (becomes admin)
    async with db.execute("SELECT COUNT(*) as count FROM users") as c:
        row = await c.fetchone()
        is_first = row["count"] == 0

    async with db.execute("SELECT id FROM users WHERE username = ?", (req.username,)) as c:
        if await c.fetchone():
            raise HTTPException(status_code=400, detail="Username taken")

    user_id = str(uuid.uuid4())
    pw_hash = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt()).decode()
    role = "admin" if is_first else "user"

    await db.execute(
        "INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        (user_id, req.username, req.email, pw_hash, role)
    )
    await db.commit()
    token = create_token(user_id, role)
    return {"token": token, "user": {"id": user_id, "username": req.username, "role": role}}

@router.post("/login")
async def login(req: LoginRequest, db=Depends(get_db)):
    async with db.execute("SELECT * FROM users WHERE username = ?", (req.username,)) as c:
        user = await c.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not bcrypt.checkpw(req.password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user["id"], user["role"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "role": user["role"],
            "avatar": user["avatar"]
        }
    }

@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "avatar": user["avatar"],
        "settings": user["settings"]
    }

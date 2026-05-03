from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from contextlib import asynccontextmanager
import os, json

from .routers import chat, models, settings, auth, history, files, search
from .database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="MyWebUI",
    description="Self-hosted AI Chat Interface",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/api/auth",     tags=["auth"])
app.include_router(chat.router,     prefix="/api/chat",     tags=["chat"])
app.include_router(models.router,   prefix="/api/models",   tags=["models"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(history.router,  prefix="/api/history",  tags=["history"])
app.include_router(files.router,    prefix="/api/files",    tags=["files"])
app.include_router(search.router,   prefix="/api/search",   tags=["search"])

# Serve frontend static files
FRONTEND_BUILD = os.path.join(os.path.dirname(__file__), "../../frontend/build")
if os.path.exists(FRONTEND_BUILD):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_BUILD, "assets")), name="assets")

    @app.get("/{full_path:path}", response_class=HTMLResponse)
    async def serve_spa(full_path: str):
        index = os.path.join(FRONTEND_BUILD, "index.html")
        if os.path.exists(index):
            return FileResponse(index)
        return HTMLResponse("<h1>Frontend not built. Run: cd frontend && npm run build</h1>")

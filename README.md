# EncycloChat 🤖

A **self-hosted, privacy-first AI chat interface** — your personal ChatBot.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)
![Stack](https://img.shields.io/badge/Frontend-React+Vite-61dafb?style=flat-square)
![Stack](https://img.shields.io/badge/DB-SQLite-blue?style=flat-square)
![Stack](https://img.shields.io/badge/Auth-JWT-orange?style=flat-square)

---

## ✨ Features

### Core (same as Open WebUI)
- 🦙 **Ollama integration** — use any local model (llama3, mistral, codestral, etc.)
- 🤖 **OpenAI API** — GPT-4o, GPT-4, GPT-3.5, o1, o3-mini, etc.
- 🔐 **JWT Auth** with user roles (admin/user)
- 📜 **Full conversation history** with search, pin, rename, delete
- 🖊️ **Rich markdown rendering** — code blocks, tables, LaTeX, GFM
- ⚡ **Real-time streaming** responses (SSE)
- 📁 **File uploads** with management
- 🌐 **Web search** via DuckDuckGo (no API key needed)
- 📋 **Prompt library** (slash commands)
- 🌙 **Dark/light mode** toggle

### My Additions 🆕
- 🌡️ **Temperature slider** right in the chat bar
- 📝 **Per-chat system prompt** override
- 👍/👎 **Message feedback** buttons
- 🔁 **Retry/regenerate** last AI response
- 📦 **Collapse long messages**
- 🏷️ **Pin conversations** to top
- ✏️ **Inline conversation rename** (click the edit button)
- 🔢 **Context window** info shown in model selector
- 🏠 **Welcome screen** with quick-start suggestions
- 🧩 **Provider badges** (Ollama vs OpenAI clearly marked)

---

## 🚀 Quick Start

### Option 1: Local Dev (recommended for development)

```bash
# Clone / extract this project
cd mywebui

# Run the start script (handles everything)
chmod +x start.sh
./start.sh
```

Then open **http://localhost:5173**

### Option 2: Docker (recommended for production)

```bash
# Copy and edit .env
cp .env.example .env
nano .env  # set SECRET_KEY and optionally OPENAI_API_KEY

# Run
docker compose up -d

# Open http://localhost:8080
```

---

## ⚙️ Configuration

Edit `.env`:

```env
# Required: change this for security
SECRET_KEY=your-random-secret-here

# Ollama (usually http://localhost:11434, or Docker: http://host.docker.internal:11434)
OLLAMA_BASE_URL=http://localhost:11434

# Optional: OpenAI
OPENAI_API_KEY=sk-...
# Custom OpenAI-compatible base (Groq, LMStudio, Mistral, etc.)
OPENAI_API_BASE=https://api.groq.com/openai/v1
```

---

## 🦙 Using with Ollama

1. Install Ollama: https://ollama.com
2. Pull a model: `ollama pull llama3.2`
3. Start: `ollama serve`
4. Models appear automatically in MyWebUI

Popular models:
```bash
ollama pull llama3.2        # Meta's Llama 3.2
ollama pull mistral         # Mistral 7B
ollama pull codestral       # Code-focused
ollama pull phi3            # Microsoft Phi-3 (small, fast)
ollama pull deepseek-coder  # DeepSeek Coder
```

---

## 🗂️ Project Structure

```
mywebui/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS + static serving
│   │   ├── database.py      # SQLite schema + init
│   │   └── routers/
│   │       ├── auth.py      # Register/login/me (JWT)
│   │       ├── chat.py      # Streaming chat (Ollama + OpenAI)
│   │       ├── models.py    # List/pull/delete models
│   │       ├── history.py   # Conversations + messages CRUD
│   │       ├── files.py     # File upload/delete
│   │       ├── settings.py  # User settings persistence
│   │       └── search.py    # Web search (DuckDuckGo)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Root with routing
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx  # Login / Register
│   │   │   └── ChatPage.jsx  # Main layout
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatWindow.jsx     # Main chat with streaming
│   │   │   │   ├── ChatInput.jsx      # Input bar
│   │   │   │   ├── MessageBubble.jsx  # Markdown message rendering
│   │   │   │   ├── ModelSelector.jsx  # Model dropdown
│   │   │   │   └── WelcomeScreen.jsx  # Landing screen
│   │   │   └── sidebar/
│   │   │       └── Sidebar.jsx        # Conversation history
│   │   ├── stores/
│   │   │   └── index.js      # Zustand stores (auth, UI, chat)
│   │   └── lib/
│   │       └── api.js        # API client + streaming helper
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── Dockerfile
├── docker-compose.yaml
├── .env.example
├── start.sh
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.11) |
| Auth | JWT (PyJWT + bcrypt) |
| Database | SQLite via aiosqlite (async) |
| HTTP Client | httpx (async streaming) |
| Frontend | React 18 + Vite |
| State | Zustand |
| Styling | Tailwind CSS v3 |
| Markdown | react-markdown + remark-gfm |
| Icons | lucide-react |
| Routing | react-router-dom v6 |

---

## 🔧 API Reference

```
POST /api/auth/register    Register new user
POST /api/auth/login       Login → JWT token
GET  /api/auth/me          Current user info

GET  /api/models/          List all models
POST /api/models/ollama/pull  Pull Ollama model

POST /api/chat/stream      Streaming chat (SSE)
POST /api/chat/            Non-streaming chat

GET  /api/history/conversations         List conversations
GET  /api/history/conversations/:id     Get with messages
PATCH /api/history/conversations/:id    Update title/pin/tags
DELETE /api/history/conversations/:id   Delete

POST /api/files/upload     Upload file
GET  /api/files/           List files
DELETE /api/files/:id      Delete file

GET  /api/settings/        Get user settings
PUT  /api/settings/        Save user settings

GET  /api/search/web?q=    Web search
```

---

## 🤝 Extending

### Add a new LLM provider
Edit `backend/app/routers/chat.py` — add a new stream generator function following the pattern of `stream_openai` or `stream_ollama`.

### Add new frontend features
The state is managed in `frontend/src/stores/index.js` with Zustand. Components in `frontend/src/components/` follow a clean import structure.

---

## 📜 License

MIT — Use this however you like, for personal or commercial projects.

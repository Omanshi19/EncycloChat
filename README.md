# EncycloChat 🤖

> A self-hosted AI chat interface powered by Groq's free LLM API, featuring real-time streaming, conversation history and a clean dark UI.

## 🌐 Live Demo

[encyclochat.vercel.app](https://encyclochat.vercel.app)


![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776ab?style=for-the-badge&logo=python&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646cff?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003b57?style=for-the-badge&logo=sqlite&logoColor=white)

## ✨ Features

- ⚡ Real-time streaming responses via SSE
- 🦙 Groq API support — Llama 3.3, Mixtral, DeepSeek, Gemma and more
- 🔐 JWT authentication with admin/user roles
- 📜 Full conversation history — search, pin, rename, delete
- 📝 Per-chat system prompt + temperature control
- 🖊️ Markdown rendering with syntax-highlighted code blocks
- 🔁 Retry/regenerate last response
- 🌙 Dark theme with black & amber palette

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand |
| Backend | FastAPI, Python 3.11, aiosqlite |
| Auth | JWT (PyJWT + bcrypt) |
| AI | Groq API (OpenAI-compatible) |
| Hosting | Vercel (frontend) + Render (backend) |


## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app
│   │   ├── database.py    # SQLite schema
│   │   └── routers/       # auth, chat, models, history
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/    # chat, sidebar, model selector
    │   ├── pages/         # auth, chat
    │   ├── stores/        # Zustand state
    │   └── lib/api.js     # API client
    └── package.json
```

## 📜 Developed By- 

OMANSHI KAUSHAL

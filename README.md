# EncycloChat 🤖

> A self-hosted AI chat interface powered by Groq's free LLM API, featuring real-time streaming, conversation history and a clean dark UI.

<h3 align="center">
  <a href="https://encyclochat.vercel.app">
    <ins><i>LIVE DEMO LINK</i></ins>
  </a> 
</h3>
 
---
## 🚀 Photos  

<img width="1440" height="900" alt="image" src="https://github.com/user-attachments/assets/c743b631-dfd5-41e2-92ce-8676ec5d25a8" />

<img width="1436" height="900" alt="image" src="https://github.com/user-attachments/assets/08c43ca9-7cb3-453a-bed1-97491219b1c1" />

<img width="1440" height="900" alt="image" src="https://github.com/user-attachments/assets/fbc33725-a2f3-43ab-8890-230d951cd509" />

---
## 🚀 Tech Stack 
<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq_API-F55036?style=for-the-badge&logo=groq&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black" />
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
</p>

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

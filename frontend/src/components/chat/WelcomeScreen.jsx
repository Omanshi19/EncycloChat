import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Sparkles, Code, BookOpen, Lightbulb, ChevronDown } from 'lucide-react'
import { useChatStore, useAuthStore } from '../../stores'
import { api } from '../../lib/api'
import ChatInput from './ChatInput.jsx'

const SUGGESTIONS = [
  { icon: Sparkles, text: "Explain quantum computing in simple terms", category: "Explain" },
  { icon: Code, text: "Write a Python function to sort a list of dictionaries by a key", category: "Code" },
  { icon: BookOpen, text: "Summarize the key ideas of 'Atomic Habits'", category: "Summarize" },
  { icon: Lightbulb, text: "Give me 5 creative startup ideas for 2025", category: "Brainstorm" },
]

export default function WelcomeScreen() {
  const { user } = useAuthStore()
  const { models, selectedModel, setSelectedModel, prependConversation, setMessages, setActiveConv } = useChatStore()
  const navigate = useNavigate()

  const handleSend = async (text) => {
    if (!text.trim() || !selectedModel) return

    const userMsg = { id: Date.now(), role: 'user', content: text }
    const asstMsg = { id: Date.now() + 1, role: 'assistant', content: '', streaming: true }

    setMessages([userMsg, asstMsg])
    setActiveConv(null)

    // Navigate immediately, ChatWindow will pick up messages
    navigate('/c/new', { state: { initialMessages: [userMsg], model: selectedModel } })
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-surface-950 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-500/20 mb-5">
          <Bot className="w-8 h-8 text-yellow-400" />
        </div>
        <h1 className="text-3xl font-semibold text-white mb-2">
          Hello, {user?.username} 👋
        </h1>
        <p className="text-surface-400 text-base max-w-sm">
          What would you like to explore today?
        </p>
      </div>

      {/* Model selector */}
      {models.length > 0 && (
        <div className="mb-6">
          <div className="relative inline-block">
            <select
              value={selectedModel || ''}
              onChange={e => setSelectedModel(e.target.value)}
              className="appearance-none bg-surface-900 border border-surface-700 text-white rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none focus:border-accent-500 transition-colors cursor-pointer"
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.provider === 'ollama' ? '🦙' : '🤖'} {m.name || m.id}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-xl">
        {SUGGESTIONS.map((s, i) => (
          <button key={i} onClick={() => handleSend(s.text)}
            className="flex items-start gap-3 p-4 bg-surface-900/60 hover:bg-surface-800 border border-surface-800 hover:border-surface-700 rounded-2xl text-left transition-all group">
            <s.icon className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs text-surface-500 block mb-0.5">{s.category}</span>
              <span className="text-sm text-surface-300 group-hover:text-white transition-colors leading-snug">{s.text}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="w-full max-w-2xl">
        <ChatInput onSend={handleSend} disabled={!selectedModel} placeholder={
          !selectedModel
            ? 'No models available — start Ollama or set OPENAI_API_KEY'
            : `Message ${selectedModel || ''}…`
        } />
      </div>

      {!models.length && (
        <p className="mt-4 text-xs text-surface-600 text-center">
          Start Ollama with <code className="text-surface-500">ollama serve</code> or set{' '}
          <code className="text-surface-500">OPENAI_API_KEY</code> in your environment.
        </p>
      )}
    </div>
  )
}

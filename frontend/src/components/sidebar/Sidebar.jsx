import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  Plus, Search, Trash2, Pin, PinOff,
  LogOut, MessageSquare, Bot, X, Edit2
} from 'lucide-react'
import { useAuthStore, useUIStore, useChatStore } from '../../stores'
import { api } from '../../lib/api'

function ConvItem({ conv, active, onDelete, onPin, onRename }) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(conv.title)
  const [hovered, setHovered] = useState(false)

  const save = async () => {
    if (title.trim() && title !== conv.title) {
      await api.patch(`/history/conversations/${conv.id}`, { title })
      onRename(conv.id, title)
    }
    setEditing(false)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !editing && navigate(`/c/${conv.id}`)}
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all text-sm ${
        active ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
      }`}
    >
      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-50" />
      {editing ? (
        <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
          onBlur={save} onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
          className="flex-1 bg-transparent outline-none text-white min-w-0"
          onClick={e => e.stopPropagation()} />
      ) : (
        <span className="flex-1 truncate">{conv.title}</span>
      )}
      {conv.pinned ? <Pin className="w-3 h-3 text-yellow-400 shrink-0" /> : null}
      {(hovered || active) && !editing && (
        <div className="flex items-center gap-0.5 ml-auto" onClick={e => e.stopPropagation()}>
          <button onClick={() => setEditing(true)} className="p-1 hover:text-white rounded transition-colors"><Edit2 className="w-3 h-3" /></button>
          <button onClick={() => onPin(conv)} className="p-1 hover:text-white rounded transition-colors">
            {conv.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
          </button>
          <button onClick={() => onDelete(conv.id)} className="p-1 hover:text-red-400 rounded transition-colors"><Trash2 className="w-3 h-3" /></button>
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const { convId } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { conversations, setConversations, setActiveConv, setMessages } = useChatStore()
  const [search, setSearch] = useState('')

  useEffect(() => { loadConversations() }, [])

  async function loadConversations(q = '') {
    try {
      const data = await api.get(`/history/conversations?search=${encodeURIComponent(q)}&limit=100`)
      setConversations(data.conversations)
    } catch {}
  }

  const filtered = search
    ? conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : conversations

  const pinned = filtered.filter(c => c.pinned)
  const recent = filtered.filter(c => !c.pinned)

  const handleNew = () => { setActiveConv(null); setMessages([]); navigate('/') }

  const handleDelete = async (id) => {
    await api.delete(`/history/conversations/${id}`)
    setConversations(conversations.filter(c => c.id !== id))
    if (convId === id) navigate('/')
  }

  const handlePin = async (conv) => {
    await api.patch(`/history/conversations/${conv.id}`, { pinned: !conv.pinned })
    setConversations(conversations.map(c => c.id === conv.id ? { ...c, pinned: !c.pinned } : c))
  }

  const handleRename = (id, title) => {
    setConversations(conversations.map(c => c.id === id ? { ...c, title } : c))
  }

  if (!sidebarOpen) {
    return (
      <div className="flex flex-col items-center py-4 gap-2 border-r border-zinc-800 bg-black w-14">
        <button onClick={toggleSidebar} className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-colors">
          <MessageSquare className="w-5 h-5" />
        </button>
        <button onClick={handleNew} className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <aside className="flex flex-col w-64 border-r border-zinc-800 bg-black overflow-hidden shrink-0">
      <div className="flex items-center gap-2 p-3 border-b border-zinc-800/50">
        <button onClick={toggleSidebar} className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-yellow-400" />
          </div>
          <span className="font-semibold text-white text-sm">EncycloChat</span>
        </div>
        <button onClick={handleNew} className="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-400 hover:text-yellow-300 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chats…"
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 py-1">
        {pinned.length > 0 && (
          <>
            <p className="px-2 py-1 text-xs text-zinc-600 font-medium uppercase tracking-wider">Pinned</p>
            {pinned.map(c => <ConvItem key={c.id} conv={c} active={c.id === convId} onDelete={handleDelete} onPin={handlePin} onRename={handleRename} />)}
            <div className="border-t border-zinc-800/50 my-2" />
          </>
        )}
        {recent.length > 0 ? (
          <>
            {pinned.length > 0 && <p className="px-2 py-1 text-xs text-zinc-600 font-medium uppercase tracking-wider">Recent</p>}
            {recent.map(c => <ConvItem key={c.id} conv={c} active={c.id === convId} onDelete={handleDelete} onPin={handlePin} onRename={handleRename} />)}
          </>
        ) : !search && (
          <div className="px-3 py-8 text-center">
            <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-600 text-sm">No conversations yet</p>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800/50 p-3 space-y-1">
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs text-yellow-400 font-medium">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm text-zinc-400 truncate">{user?.username}</span>
          {user?.role === 'admin' && <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-md">admin</span>}
        </div>
      </div>
    </aside>
  )
}

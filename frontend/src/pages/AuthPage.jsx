import React, { useState } from 'react'
import { useAuthStore } from '../stores'
import { api } from '../lib/api'
import { Bot, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', password: '', email: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = mode === 'login'
        ? await api.post('/auth/login', { username: form.username, password: form.password })
        : await api.post('/auth/register', form)
      setAuth(data.user, data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950 p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-yellow-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 mb-4">
            <Bot className="w-7 h-7 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white">EncycloChat</h1>
          <p className="text-surface-400 text-sm mt-1">Your self-hosted AI chat interface</p>
        </div>

        {/* Card */}
        <div className="bg-surface-900/80 backdrop-blur border border-surface-800 rounded-2xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex mb-6 bg-surface-800/50 rounded-xl p-1">
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === m
                    ? 'bg-surface-700 text-white shadow-sm'
                    : 'text-surface-400 hover:text-surface-300'
                }`}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Username</label>
              <input
                type="text" required autoFocus
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3.5 py-2.5 text-white placeholder-surface-500 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="Enter username"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Email <span className="text-surface-500">(optional)</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3.5 py-2.5 text-white placeholder-surface-500 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3.5 py-2.5 pr-10 text-white placeholder-surface-500 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3.5 py-2.5 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-all text-sm mt-2 flex items-center justify-center gap-2">
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : null}
              {loading ? 'Loading…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'register' && (
            <p className="text-xs text-surface-500 text-center mt-4">
              First account becomes admin automatically.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

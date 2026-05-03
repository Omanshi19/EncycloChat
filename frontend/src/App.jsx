import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useUIStore } from './stores'
import AuthPage from './pages/AuthPage.jsx'
import ChatPage from './pages/ChatPage.jsx'

export default function App() {
  const { token } = useAuthStore()
  const { darkMode } = useUIStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <Routes>
      <Route path="/auth" element={token ? <Navigate to="/" /> : <AuthPage />} />
      <Route path="/*" element={token ? <ChatPage /> : <Navigate to="/auth" />} />
    </Routes>
  )
}

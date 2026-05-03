import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/sidebar/Sidebar.jsx'
import ChatWindow from '../components/chat/ChatWindow.jsx'
import WelcomeScreen from '../components/chat/WelcomeScreen.jsx'
import { useUIStore, useChatStore, useAuthStore } from '../stores'
import { api } from '../lib/api'

export default function ChatPage() {
  const { sidebarOpen } = useUIStore()
  const { setModels, setSelectedModel, models } = useChatStore()
  const { logout } = useAuthStore()

  useEffect(() => {
    api.get('/models/').then(data => {
      setModels(data.models || [])
      if (data.models?.length > 0 && !useChatStore.getState().selectedModel) {
        setSelectedModel(data.models[0].id)
      }
    }).catch(err => {
      if (err.message.includes('401')) logout()
    })
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      <Sidebar />
      <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/c/:convId" element={<ChatWindow />} />
        </Routes>
      </main>
    </div>
  )
}

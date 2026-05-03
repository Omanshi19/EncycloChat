import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown, Sliders } from 'lucide-react'
import { useChatStore } from '../../stores'
import { api } from '../../lib/api'
import MessageBubble from './MessageBubble.jsx'
import ChatInput from './ChatInput.jsx'
import ModelSelector from './ModelSelector.jsx'

export default function ChatWindow() {
  const { convId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const bottomRef = useRef(null)
  const abortRef = useRef(null)
  const [localMessages, setLocalMessages] = useState([])
  const [localConvId, setLocalConvId] = useState(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [temperature, setTemperature] = useState(0.7)
  const [showSettings, setShowSettings] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState('')
  const containerRef = useRef(null)

  const { selectedModel, setSelectedModel, models, prependConversation, setActiveConv } = useChatStore()

  useEffect(() => {
    if (convId && convId !== 'new') {
      loadConversation(convId)
    } else if (location.state?.initialMessages) {
      const initMsgs = location.state.initialMessages
      if (location.state.model) setSelectedModel(location.state.model)
      const asstMsg = { id: `a-${Date.now()}`, role: 'assistant', content: '', model: location.state.model, streaming: true }
      setLocalMessages([...initMsgs, asstMsg])
      sendMessage(initMsgs[initMsgs.length - 1].content, initMsgs, null)
    }
  }, [convId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages])

  async function loadConversation(id) {
    try {
      const data = await api.get(`/history/conversations/${id}`)
      setLocalMessages(data.messages || [])
      setLocalConvId(id)
      setActiveConv(id)
      if (data.conversation.system_prompt) setSystemPrompt(data.conversation.system_prompt)
    } catch (e) {
      console.error(e)
    }
  }

  const sendMessage = useCallback(async (text, prevMessages, convIdOverride) => {
    if (!text?.trim() || !selectedModel) return

    const currentConvId = convIdOverride !== undefined ? convIdOverride : localConvId
    const base = Array.isArray(prevMessages) ? prevMessages : localMessages
    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: text, model: selectedModel }
    const asstMsg = { id: `a-${Date.now()}`, role: 'assistant', content: '', model: selectedModel, streaming: true }
    const allMessages = [...base, userMsg]

    setLocalMessages([...allMessages, asstMsg])
    setIsStreaming(true)

    const abort = new AbortController()
    abortRef.current = abort

    try {
      let fullContent = ''
      let newConvId = currentConvId

      const historyForAPI = allMessages.map(m => ({ role: m.role, content: m.content }))

      for await (const chunk of api.chatStream({
        conversation_id: currentConvId,
        model: selectedModel,
        messages: historyForAPI,
        system_prompt: systemPrompt || undefined,
        temperature,
        stream: true
      }, abort.signal)) {
        if (chunk.final && chunk.conversation_id) {
          newConvId = chunk.conversation_id
          setLocalConvId(newConvId)
          setActiveConv(newConvId)
          if (!currentConvId || convId === 'new') {
            navigate(`/c/${newConvId}`, { replace: true })
            prependConversation({
              id: newConvId,
              title: text.slice(0, 60),
              model: selectedModel,
              updated_at: new Date().toISOString(),
              pinned: 0
            })
          }
        } else if (!chunk.final && chunk.content) {
          fullContent += chunk.content
          setLocalMessages(prev => {
            const msgs = [...prev]
            const lastIdx = msgs.length - 1
            if (msgs[lastIdx]?.role === 'assistant') {
              msgs[lastIdx] = { ...msgs[lastIdx], content: fullContent }
            }
            return msgs
          })
        }
      }

      setLocalMessages(prev => {
        const msgs = [...prev]
        const lastIdx = msgs.length - 1
        if (msgs[lastIdx]?.role === 'assistant') {
          msgs[lastIdx] = { ...msgs[lastIdx], content: fullContent, streaming: false }
        }
        return msgs
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setLocalMessages(prev => {
          const msgs = [...prev]
          const lastIdx = msgs.length - 1
          if (msgs[lastIdx]?.role === 'assistant') {
            msgs[lastIdx] = { ...msgs[lastIdx], content: `Error: ${err.message}`, streaming: false }
          }
          return msgs
        })
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [selectedModel, localMessages, localConvId, temperature, systemPrompt, convId])

  const handleSend = (text) => sendMessage(text)

  const handleStop = () => {
    abortRef.current?.abort()
    setIsStreaming(false)
    setLocalMessages(prev => {
      const msgs = [...prev]
      if (msgs[msgs.length - 1]?.streaming) {
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], streaming: false }
      }
      return msgs
    })
  }

  const handleRegenerate = () => {
    const userMessages = localMessages.filter(m => m.role === 'user')
    const lastUserMsg = userMessages[userMessages.length - 1]
    if (!lastUserMsg) return
    const withoutLast = localMessages.slice(0, -1)
    setLocalMessages(withoutLast)
    sendMessage(lastUserMsg.content, withoutLast.slice(0, -1))
  }

  return (
    <div className="flex flex-col h-full bg-surface-950">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-800/50 bg-surface-950/80 backdrop-blur-sm">
        <ModelSelector models={models} selectedModel={selectedModel} onChange={setSelectedModel} />
        <button onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-xl transition-colors ${showSettings ? 'bg-surface-800 text-white' : 'text-surface-500 hover:text-surface-300 hover:bg-surface-900'}`}>
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {showSettings && (
        <div className="px-4 py-3 bg-surface-900/50 border-b border-surface-800/30 animate-slide-up">
          <div className="flex items-start gap-6 flex-wrap">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-surface-400 mb-1.5">System prompt</label>
              <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={2}
                placeholder="You are a helpful assistant…"
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-sm text-white placeholder-surface-600 focus:outline-none focus:border-accent-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">
                Temperature: <span className="text-accent-400">{temperature}</span>
              </label>
              <input type="range" min="0" max="2" step="0.1" value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))} className="w-32 accent-accent-500" />
              <div className="flex justify-between text-xs text-surface-600 mt-0.5">
                <span>Precise</span><span>Creative</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {localMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-surface-700 text-sm">
            Start typing to begin this conversation
          </div>
        ) : (
          localMessages.map((msg, i) => (
            <MessageBubble key={msg.id || i} message={msg}
              onRegenerate={
                !msg.streaming && msg.role === 'assistant' && i === localMessages.length - 1
                  ? handleRegenerate : undefined
              } />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-surface-800/50">
        <ChatInput onSend={handleSend} onStop={handleStop}
          disabled={isStreaming} isStreaming={isStreaming}
          placeholder={selectedModel ? `Message ${selectedModel}…` : 'Select a model to start chatting'} />
        <p className="text-center text-xs text-surface-700 mt-2">AI can make mistakes. Verify important information.</p>
      </div>
    </div>
  )
}

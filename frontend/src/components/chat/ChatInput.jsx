import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic, Square, Globe } from 'lucide-react'

export default function ChatInput({ onSend, onStop, disabled, placeholder, isStreaming }) {
  const [text, setText] = useState('')
  const [rows, setRows] = useState(1)
  const textareaRef = useRef(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const scrollH = ta.scrollHeight
    const newRows = Math.min(Math.ceil(scrollH / 24), 8)
    setRows(newRows)
    ta.style.height = `${Math.min(scrollH, 8 * 24 + 32)}px`
  }, [text])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const submit = () => {
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  return (
    <div className="relative bg-surface-900 border border-surface-700 hover:border-surface-600 focus-within:border-accent-500/70 rounded-2xl transition-colors shadow-lg">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled && !isStreaming}
        placeholder={placeholder || 'Type a message…'}
        rows={1}
        className="w-full bg-transparent resize-none text-white placeholder-surface-500 text-sm px-4 pt-3.5 pb-12 focus:outline-none leading-6 max-h-48 overflow-y-auto"
        style={{ scrollbarWidth: 'none' }}
      />

        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-600">
            {text.length > 0 ? `${text.length} chars` : 'Shift+Enter for newline'}
          </span>
          {isStreaming ? (
            <button onClick={onStop}
              className="p-2 bg-red-600/80 hover:bg-red-600 rounded-xl text-white transition-colors">
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button onClick={submit} disabled={!text.trim() || disabled}
              className="p-2 bg-accent-600 hover:bg-accent-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-white transition-all">
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

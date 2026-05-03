import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Cpu, Cloud, Check } from 'lucide-react'

export default function ModelSelector({ models, selectedModel, onChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = (models || []).filter(m =>
    (m.name || m.id).toLowerCase().includes(search.toLowerCase())
  )

  const ollamaModels = filtered.filter(m => m.provider === 'ollama')
  const openaiModels = filtered.filter(m => m.provider === 'openai')

  const selected = models?.find(m => m.id === selectedModel)

  return (
    <div className="relative flex-1" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-surface-900 hover:bg-surface-800 border border-surface-700 rounded-xl text-sm text-white transition-colors max-w-xs">
        {selected?.provider === 'ollama'
          ? <Cpu className="w-4 h-4 text-orange-400 shrink-0" />
          : <Cloud className="w-4 h-4 text-blue-400 shrink-0" />
        }
        <span className="truncate flex-1 text-left">{selected?.name || selected?.id || 'Select model'}</span>
        <ChevronDown className={`w-4 h-4 text-surface-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up">
          <div className="p-2 border-b border-surface-800">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-500" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search models…"
                className="w-full pl-8 pr-3 py-1.5 bg-surface-800 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
            {ollamaModels.length > 0 && (
              <>
                <p className="px-2 py-1 text-xs text-surface-600 font-medium flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-orange-400" /> Ollama (Local)
                </p>
                {ollamaModels.map(m => (
                  <ModelOption key={m.id} model={m} selected={m.id === selectedModel}
                    onClick={() => { onChange(m.id); setOpen(false); setSearch('') }} />
                ))}
              </>
            )}

            {openaiModels.length > 0 && (
              <>
                {ollamaModels.length > 0 && <div className="border-t border-surface-800/50 my-1" />}
                <p className="px-2 py-1 text-xs text-surface-600 font-medium flex items-center gap-1.5">
                  <Cloud className="w-3 h-3 text-blue-400" /> OpenAI
                </p>
                {openaiModels.map(m => (
                  <ModelOption key={m.id} model={m} selected={m.id === selectedModel}
                    onClick={() => { onChange(m.id); setOpen(false); setSearch('') }} />
                ))}
              </>
            )}

            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-surface-500">No models found</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ModelOption({ model, selected, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left ${
        selected ? 'bg-accent-600/20 text-white' : 'text-surface-300 hover:bg-surface-800 hover:text-white'
      }`}>
      {model.provider === 'ollama'
        ? <Cpu className="w-3.5 h-3.5 text-orange-400 shrink-0" />
        : <Cloud className="w-3.5 h-3.5 text-blue-400 shrink-0" />
      }
      <div className="flex-1 min-w-0">
        <span className="block truncate">{model.name || model.id}</span>
        {model.context && (
          <span className="text-xs text-surface-600">{(model.context / 1000).toFixed(0)}k ctx</span>
        )}
      </div>
      {selected && <Check className="w-4 h-4 text-accent-400 shrink-0" />}
    </button>
  )
}

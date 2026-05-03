import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Bot, User, ChevronDown, ChevronUp } from 'lucide-react'

function CodeBlock({ className, children, ...props }) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const lang = match?.[1] || 'text'
  const code = String(children).replace(/\n$/, '')

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!match && !code.includes('\n')) {
    return <code className="bg-surface-800/80 px-1.5 py-0.5 rounded text-sm font-mono text-surface-200">{children}</code>
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-surface-700/50 bg-surface-900">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-800/60 border-b border-surface-700/30">
        <span className="text-xs font-mono text-surface-400 uppercase tracking-wider">{lang}</span>
        <button onClick={copy}
          className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed text-surface-200">
        <code className={`language-${lang} font-mono`}>{code}</code>
      </pre>
    </div>
  )
}

const MARKDOWN_COMPONENTS = {
  code: CodeBlock,
  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
  h1: ({ children }) => <h1 className="text-xl font-semibold mt-5 mb-3">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-semibold mt-4 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-2">{children}</h3>,
  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-sm">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-sm">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-accent-500/40 pl-4 my-3 text-surface-400 italic">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="text-left p-2.5 bg-surface-800 font-medium border border-surface-700/50 text-surface-200">{children}</th>
  ),
  td: ({ children }) => (
    <td className="p-2.5 border border-surface-700/50 text-surface-300">{children}</td>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="text-accent-400 hover:text-accent-300 underline decoration-accent-400/40 hover:decoration-accent-300">{children}</a>
  ),
  hr: () => <hr className="border-surface-700/50 my-4" />,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-1">
      {[0,1,2].map(i => (
        <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </span>
  )
}

export default function MessageBubble({ message, onRegenerate }) {
  const isUser = message.role === 'user'
  const [feedback, setFeedback] = useState(null)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`flex gap-3 group animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-medium mt-1 ${
        isUser
          ? 'bg-accent-600/30 text-accent-400'
          : 'bg-surface-800 text-surface-400 border border-surface-700/50'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 max-w-2xl ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {isUser ? (
          <div className="bg-accent-600/20 border border-accent-600/30 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white leading-relaxed max-w-lg">
            {message.content}
          </div>
        ) : (
          <div className={`w-full text-sm text-surface-200 ${collapsed ? 'line-clamp-3' : ''}`}>
            {message.streaming && !message.content ? (
              <TypingDots />
            ) : (
              <div className="prose-chat">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
                  {message.content}
                </ReactMarkdown>
                {message.streaming && <TypingDots />}
              </div>
            )}
          </div>
        )}

        {/* Actions (AI messages only) */}
        {!isUser && !message.streaming && message.content && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => navigator.clipboard.writeText(message.content)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-surface-500 hover:text-surface-300 hover:bg-surface-800 rounded-lg transition-colors">
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
            {onRegenerate && (
              <button onClick={onRegenerate}
                className="flex items-center gap-1 px-2 py-1 text-xs text-surface-500 hover:text-surface-300 hover:bg-surface-800 rounded-lg transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            )}
            <button onClick={() => setFeedback('up')}
              className={`p-1.5 text-xs rounded-lg transition-colors ${feedback === 'up' ? 'text-green-400 bg-green-400/10' : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800'}`}>
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setFeedback('down')}
              className={`p-1.5 text-xs rounded-lg transition-colors ${feedback === 'down' ? 'text-red-400 bg-red-400/10' : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800'}`}>
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            {message.content && message.content.length > 500 && (
              <button onClick={() => setCollapsed(!collapsed)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-surface-500 hover:text-surface-300 hover:bg-surface-800 rounded-lg transition-colors">
                {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                {collapsed ? 'Expand' : 'Collapse'}
              </button>
            )}
          </div>
        )}

        {/* Model tag */}
        {!isUser && message.model && !message.streaming && (
          <span className="text-xs text-surface-700 mt-1 px-1">{message.model}</span>
        )}
      </div>
    </div>
  )
}

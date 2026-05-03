import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'mywebui-auth' }
  )
)

export const useUIStore = create(
  persist(
    (set, get) => ({
      darkMode: true,
      sidebarOpen: true,
      fontSize: 'base',
      toggleDark: () => {
        const next = !get().darkMode
        set({ darkMode: next })
        document.documentElement.classList.toggle('dark', next)
      },
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    { name: 'mywebui-ui' }
  )
)

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConvId: null,
  messages: [],
  isLoading: false,
  streamingContent: '',
  models: [],
  selectedModel: null,

  setConversations: (conversations) => set({ conversations }),
  setActiveConv: (id) => set({ activeConvId: id, streamingContent: '' }),
  setMessages: (messages) => set({ messages }),
  setModels: (models) => set({ models }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setLoading: (isLoading) => set({ isLoading }),
  setStreamingContent: (content) => set({ streamingContent: content }),

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateLastMessage: (content) => set((s) => {
    const msgs = [...s.messages]
    if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
      msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content }
    }
    return { messages: msgs }
  }),
  prependConversation: (conv) => set((s) => ({
    conversations: [conv, ...s.conversations.filter(c => c.id !== conv.id)]
  })),
}))

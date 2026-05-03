const BASE = '/api'

function getToken() {
  try {
    const s = JSON.parse(localStorage.getItem('mywebui-auth') || '{}')
    return s.state?.token || null
  } catch { return null }
}

async function request(method, path, body, signal) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  get:    (path, signal)        => request('GET',    path, null, signal),
  post:   (path, body, signal)  => request('POST',   path, body, signal),
  patch:  (path, body)          => request('PATCH',  path, body),
  put:    (path, body)          => request('PUT',    path, body),
  delete: (path)                => request('DELETE', path),

  // Streaming chat
  chatStream: async function* (payload, signal) {
    const token = getToken()
    const res = await fetch(`${BASE}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload),
      signal
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Chat failed' }))
      throw new Error(err.detail || `HTTP ${res.status}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') return
          try { yield JSON.parse(raw) } catch {}
        }
      }
    }
  }
}

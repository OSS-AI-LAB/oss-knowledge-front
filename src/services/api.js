import axios from 'axios'

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const MOCK_MODE = import.meta.env.VITE_MOCK_API === 'true'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Mock responses
const mockResponses = [
  "I understand you're looking for assistance. How can I help you today?",
  "That's an interesting question. Let me think about that for a moment...",
  "Based on what you've shared, here are my thoughts:",
  "I'd be happy to help you with that. Could you provide more details?",
  "Here's what I understand from your message:",
  "Let me break this down for you:",
  "That's a great point. Here's my perspective:",
  "I appreciate you sharing that. Let me offer some insights:"
]

// Mock streaming function
async function mockStream(onChunk, signal) {
  const response = mockResponses[Math.floor(Math.random() * mockResponses.length)]
  const words = response.split(' ')

  for (let i = 0; i < words.length; i++) {
    if (signal?.aborted) break

    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
    onChunk(words[i] + (i < words.length - 1 ? ' ' : ''))
  }
}

// API functions
export async function sendMessage(content, attachments = []) {
  if (MOCK_MODE) {
    // Mock response
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      id: `msg_${Date.now()}`,
      content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      role: 'assistant',
      timestamp: new Date().toISOString()
    }
  }

  return api.post('/messages', {
    content,
    attachments
  })
}

export async function streamMessage(content, attachments = [], onChunk, signal) {
  if (MOCK_MODE) {
    return mockStream(onChunk, signal)
  }

  // Real streaming implementation
  const response = await fetch(`${API_BASE_URL}/messages/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
    },
    body: JSON.stringify({ content, attachments }),
    signal
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') {
          return
        }
        try {
          const json = JSON.parse(data)
          if (json.content) {
            onChunk(json.content)
          }
        } catch (e) {
          console.error('Error parsing SSE data:', e)
        }
      }
    }
  }
}

export async function getConversations() {
  if (MOCK_MODE) {
    // Return mock conversations from localStorage
    const saved = localStorage.getItem('conversations')
    return saved ? JSON.parse(saved) : []
  }

  return api.get('/conversations')
}

export async function getConversation(id) {
  if (MOCK_MODE) {
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]')
    return conversations.find(c => c.id === id)
  }

  return api.get(`/conversations/${id}`)
}

export async function createConversation(title) {
  if (MOCK_MODE) {
    const conversation = {
      id: `conv_${Date.now()}`,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]')
    conversations.unshift(conversation)
    localStorage.setItem('conversations', JSON.stringify(conversations))

    return conversation
  }

  return api.post('/conversations', { title })
}

export async function updateConversation(id, updates) {
  if (MOCK_MODE) {
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]')
    const index = conversations.findIndex(c => c.id === id)
    if (index !== -1) {
      conversations[index] = { ...conversations[index], ...updates }
      localStorage.setItem('conversations', JSON.stringify(conversations))
      return conversations[index]
    }
    throw new Error('Conversation not found')
  }

  return api.patch(`/conversations/${id}`, updates)
}

export async function deleteConversation(id) {
  if (MOCK_MODE) {
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]')
    const filtered = conversations.filter(c => c.id !== id)
    localStorage.setItem('conversations', JSON.stringify(filtered))
    return { success: true }
  }

  return api.delete(`/conversations/${id}`)
}

export async function uploadFile(file) {
  if (MOCK_MODE) {
    // Mock file upload
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      id: `file_${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }
  }

  const formData = new FormData()
  formData.append('file', file)

  return api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export default api
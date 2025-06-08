import axios from 'axios'

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const API_KEY = import.meta.env.VITE_API_KEY || ''

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  timeout: 30000
})

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 토큰 추가 등의 처리
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // 인증 오류 처리
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 메시지 전송 API
export let sendMessageAPI = async (content, conversationId, files = []) => {
  const formData = new FormData()
  formData.append('content', content)
  formData.append('conversationId', conversationId)

  // 파일 추가
  files.forEach(file => {
    formData.append('files', file.file)
  })

  return apiClient.post('/messages', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 스트리밍 메시지 API
export let streamMessageAPI = async (content, conversationId, files = [], onChunk) => {
  const response = await fetch(`${API_BASE_URL}/messages/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      content,
      conversationId,
      files: files.map(f => ({ name: f.name, type: f.type, size: f.size }))
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') {
          return
        }
        try {
          const parsed = JSON.parse(data)
          if (parsed.content) {
            onChunk(parsed.content)
          }
        } catch (e) {
          console.error('JSON 파싱 오류:', e)
        }
      }
    }
  }
}

// 대화 목록 가져오기
export let getConversationsAPI = async () => {
  return apiClient.get('/conversations')
}

// 대화 생성
export let createConversationAPI = async (title = 'New Chat') => {
  return apiClient.post('/conversations', { title })
}

// 대화 업데이트
export let updateConversationAPI = async (id, updates) => {
  return apiClient.patch(`/conversations/${id}`, updates)
}

// 대화 삭제
export let deleteConversationAPI = async (id) => {
  return apiClient.delete(`/conversations/${id}`)
}

// 메시지 목록 가져오기
export let getMessagesAPI = async (conversationId) => {
  return apiClient.get(`/conversations/${conversationId}/messages`)
}

// 파일 업로드
export let uploadFileAPI = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  return apiClient.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// Mock 구현 (개발용)
if (import.meta.env.VITE_MOCK_API === 'true' || import.meta.env.DEV) {
  console.log('API Mock 모드 활성화')

  // Mock 데이터 저장소
  let mockConversations = []
  let mockMessages = {}

  // 실제 API 함수들을 Mock으로 오버라이드
  sendMessageAPI = async (content, conversationId, files = []) => {
    return {
      id: Date.now().toString(),
      content,
      conversationId,
      role: 'user',
      timestamp: new Date().toISOString()
    }
  }

  streamMessageAPI = async (content, conversationId, files = [], onChunk) => {
    const mockResponses = [
      `안녕하세요! "${content}"에 대해 도움을 드리겠습니다.\n\n`,
      `이것은 Mock 응답입니다. 실제 백엔드를 연결하려면 .env 파일에서 VITE_MOCK_API를 false로 설정하고 API 엔드포인트를 구성하세요.\n\n`,
      `다음과 같은 기능들을 사용할 수 있습니다:\n`,
      `- 마크다운 **포맷팅**\n`,
      `- 코드 블록\n`,
      `\`\`\`javascript\nconst example = "Hello World";\nconsole.log(example);\n\`\`\`\n`,
      `- 리스트와 기타 마크다운 요소들`
    ]

    const fullResponse = mockResponses.join('')
    let index = 0

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (index < fullResponse.length) {
          const chunkSize = Math.min(5 + Math.floor(Math.random() * 10), fullResponse.length - index)
          onChunk(fullResponse.slice(index, index + chunkSize))
          index += chunkSize
        } else {
          clearInterval(interval)
          resolve()
        }
      }, 50)
    })
  }

  getConversationsAPI = async () => {
    return mockConversations
  }

  createConversationAPI = async (title = 'New Chat') => {
    const conversation = {
      id: Date.now().toString(),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    mockConversations.unshift(conversation)
    mockMessages[conversation.id] = []
    return conversation
  }

  updateConversationAPI = async (id, updates) => {
    const index = mockConversations.findIndex(c => c.id === id)
    if (index !== -1) {
      mockConversations[index] = {
        ...mockConversations[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      return mockConversations[index]
    }
    throw new Error('Conversation not found')
  }

  deleteConversationAPI = async (id) => {
    mockConversations = mockConversations.filter(c => c.id !== id)
    delete mockMessages[id]
    return { success: true }
  }

  getMessagesAPI = async (conversationId) => {
    return mockMessages[conversationId] || []
  }
}
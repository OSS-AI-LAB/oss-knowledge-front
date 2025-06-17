/**
 * API 서비스 모듈
 * 실제 백엔드와 통신하는 함수들을 정의합니다.
 * 현재는 mock 구현이며, 실제 API 연동 시 수정이 필요합니다.
 */

// API 기본 URL (환경변수로 관리 권장)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// API 헤더 설정
const getHeaders = () => ({
  'Content-Type': 'application/json',
  // 'Authorization': `Bearer ${getAuthToken()}` // 인증 토큰이 필요한 경우
})

/**
 * 메시지 전송 API
 * @param {Object} payload - 메시지 정보
 * @returns {Promise} 응답 스트림
 */
export const sendMessageAPI = async (payload) => {
  // Mock 구현 - 실제 API 연동 시 아래와 같이 구현
  /*
  const response = await fetch(`${API_BASE_URL}/chat/messages`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  // 스트리밍 응답 처리
  return response.body.getReader()
  */

  // Mock 응답
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          message: 'Mock API 응답입니다.',
          conversationId: payload.conversationId
        }
      })
    }, 1000)
  })
}

/**
 * 대화 목록 조회 API
 * @returns {Promise<Array>} 대화 목록
 */
export const getConversationsAPI = async () => {
  // Mock 구현
  return new Promise((resolve) => {
    resolve({
      data: []
    })
  })
}

/**
 * 대화 삭제 API
 * @param {string} conversationId - 대화 ID
 * @returns {Promise}
 */
export const deleteConversationAPI = async (conversationId) => {
  // Mock 구현
  return new Promise((resolve) => {
    resolve({
      success: true
    })
  })
}

/**
 * 파일 업로드 API
 * @param {File} file - 업로드할 파일
 * @returns {Promise<Object>} 업로드된 파일 정보
 */
export const uploadFileAPI = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  // Mock 구현
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          fileId: Date.now().toString(),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          url: URL.createObjectURL(file)
        }
      })
    }, 500)
  })
}

/**
 * WebSocket 연결 (실시간 스트리밍용)
 * @param {string} conversationId - 대화 ID
 * @returns {WebSocket}
 */
export const createWebSocketConnection = (conversationId) => {
  // 실제 구현 예시
  /*
  const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/chat/stream/${conversationId}`)

  ws.onopen = () => {
    console.log('WebSocket 연결됨')
  }

  ws.onerror = (error) => {
    console.error('WebSocket 에러:', error)
  }

  return ws
  */

  return null
}

/**
 * Server-Sent Events 연결 (실시간 스트리밍용)
 * @param {string} conversationId - 대화 ID
 * @returns {EventSource}
 */
export const createSSEConnection = (conversationId) => {
  // 실제 구현 예시
  /*
  const eventSource = new EventSource(`${API_BASE_URL}/chat/stream/${conversationId}`)

  eventSource.onerror = (error) => {
    console.error('SSE 에러:', error)
    eventSource.close()
  }

  return eventSource
  */

  return null
}
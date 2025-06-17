import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useConversationStore } from './conversation'
import { useUIStore } from './ui'

export const useChatStore = defineStore('chat', () => {
  const conversationStore = useConversationStore()
  const uiStore = useUIStore()

  // 채팅 상태
  const isStreaming = ref(false)
  const streamingMessage = ref('')
  const uploadedFiles = ref([])

  // 메시지 전송
  const sendMessage = async (content, files = []) => {
    if (!content.trim() && files.length === 0) return

    const currentConvId = conversationStore.currentConversationId

    // 사용자 메시지 추가
    const userMessage = {
      role: 'user',
      content,
      files: files.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size
      }))
    }

    conversationStore.addMessage(currentConvId, userMessage)

    // AI 응답 시뮬레이션
    isStreaming.value = true
    streamingMessage.value = ''

    // Mock 응답 생성
    const mockResponse = generateMockResponse(content)

    // 스트리밍 효과 시뮬레이션
    let index = 0
    const streamInterval = setInterval(() => {
      if (index < mockResponse.length) {
        streamingMessage.value += mockResponse[index]
        index++
      } else {
        clearInterval(streamInterval)

        // 완성된 메시지 추가
        conversationStore.addMessage(currentConvId, {
          role: 'assistant',
          content: streamingMessage.value
        })

        isStreaming.value = false
        streamingMessage.value = ''
      }
    }, 20) // 20ms 간격으로 문자 추가

    // 업로드된 파일 초기화
    uploadedFiles.value = []
  }

  // Mock 응답 생성
  const generateMockResponse = (userInput) => {
    const responses = [
      `안녕하세요! "${userInput}"에 대해 도움을 드리겠습니다.\n\n이것은 시뮬레이션된 응답입니다. 실제 구현에서는 백엔드 API와 연동하여 실시간 응답을 받게 됩니다.`,
      `"${userInput}"는 흥미로운 주제네요!\n\n여기에 대해 더 자세히 설명드리면:\n1. 첫 번째 포인트\n2. 두 번째 포인트\n3. 세 번째 포인트\n\n추가로 궁금한 점이 있으시면 말씀해 주세요.`,
      `네, 이해했습니다. "${userInput}"에 대한 답변입니다.\n\n\`\`\`javascript\n// 예시 코드\nconst example = () => {\n  console.log('Hello, World!');\n};\n\`\`\`\n\n이 코드는 예시입니다. 실제 상황에 맞게 수정해서 사용하세요.`
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 파일 추가
  const addFile = (file) => {
    // 파일 유효성 검사
    const allowedTypes = ['text/plain', 'image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      uiStore.setError('지원하지 않는 파일 형식입니다. (txt, png, jpg, pdf만 가능)')
      return false
    }

    if (file.size > maxSize) {
      uiStore.setError('파일 크기는 10MB 이하여야 합니다.')
      return false
    }

    uploadedFiles.value.push(file)
    return true
  }

  // 파일 제거
  const removeFile = (index) => {
    uploadedFiles.value.splice(index, 1)
  }

  // 스트리밍 중단
  const stopStreaming = () => {
    isStreaming.value = false
    if (streamingMessage.value) {
      conversationStore.addMessage(conversationStore.currentConversationId, {
        role: 'assistant',
        content: streamingMessage.value
      })
      streamingMessage.value = ''
    }
  }

  return {
    isStreaming,
    streamingMessage,
    uploadedFiles,
    sendMessage,
    addFile,
    removeFile,
    stopStreaming
  }
})
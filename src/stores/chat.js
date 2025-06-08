import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sendMessageAPI, streamMessageAPI, getMessagesAPI } from '@/services/api'

export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const isLoading = ref(false)
  const currentStreamingMessageId = ref(null)

  // 메시지 추가
  const addMessage = (message) => {
    messages.value.push({
      id: Date.now().toString(),
      ...message,
      timestamp: new Date().toISOString()
    })
    return messages.value[messages.value.length - 1]
  }

  // 메시지 업데이트
  const updateMessage = (messageId, updates) => {
    const index = messages.value.findIndex(m => m.id === messageId)
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], ...updates }
    }
  }

  // 메시지 전송
  const sendMessage = async (content, conversationId, files = []) => {
    isLoading.value = true

    // 사용자 메시지 추가
    const userMessage = addMessage({
      role: 'user',
      content,
      files,
      conversationId
    })

    // AI 응답 메시지 초기화
    const aiMessage = addMessage({
      role: 'assistant',
      content: '',
      conversationId,
      isStreaming: true
    })

    currentStreamingMessageId.value = aiMessage.id

    try {
      // 스트리밍 응답 처리
      await streamMessageAPI(
        content,
        conversationId,
        files,
        (chunk) => {
          // 스트리밍 청크 처리
          const currentMessage = messages.value.find(m => m.id === aiMessage.id)
          if (currentMessage) {
            currentMessage.content += chunk
          }
        }
      )

      // 스트리밍 완료
      updateMessage(aiMessage.id, { isStreaming: false })
    } catch (error) {
      console.error('메시지 전송 오류:', error)
      updateMessage(aiMessage.id, { 
        content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
        error: true,
        isStreaming: false
      })
    } finally {
      isLoading.value = false
      currentStreamingMessageId.value = null
    }
  }

  // 메시지 재시도
  const retryMessage = async (messageId) => {
    const message = messages.value.find(m => m.id === messageId)
    if (!message || message.role !== 'assistant') return

    const userMessageIndex = messages.value.findIndex(
      (m, i) => i < messages.value.indexOf(message) && m.role === 'user'
    )

    if (userMessageIndex !== -1) {
      const userMessage = messages.value[userMessageIndex]
      
      // 실패한 AI 메시지 제거
      messages.value = messages.value.filter(m => m.id !== messageId)
      
      // 재전송
      await sendMessage(userMessage.content, userMessage.conversationId, userMessage.files)
    }
  }

  // 파일 추가
  const addFileToMessage = (file) => {
    // 파일 처리 로직
    console.log('파일 추가:', file)
  }

  // 메시지 불러오기
  const loadMessages = async (conversationId) => {
    try {
      const loadedMessages = await getMessagesAPI(conversationId)
      messages.value = loadedMessages
    } catch (error) {
      console.error('메시지 불러오기 오류:', error)
      messages.value = []
    }
  }

  // 메시지 초기화
  const clearMessages = () => {
    messages.value = []
    currentStreamingMessageId.value = null
  }

  // 스트리밍 중단
  const stopStreaming = () => {
    if (currentStreamingMessageId.value) {
      updateMessage(currentStreamingMessageId.value, { 
        isStreaming: false,
        stopped: true 
      })
      currentStreamingMessageId.value = null
      isLoading.value = false
    }
  }

  return {
    messages,
    isLoading,
    currentStreamingMessageId,
    addMessage,
    updateMessage,
    sendMessage,
    retryMessage,
    addFileToMessage,
    loadMessages,
    clearMessages,
    stopStreaming
  }
})
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sendMessage, streamMessage } from '@/services/api'
import { useConversationStore } from './conversation'

export const useChatStore = defineStore('chat', () => {
  // State
  const messages = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const streamingMessageId = ref(null)
  const abortController = ref(null)

  // Getters
  const hasMessages = computed(() => messages.value.length > 0)
  const lastMessage = computed(() => messages.value[messages.value.length - 1])
  const isStreaming = computed(() => streamingMessageId.value !== null)

  // Actions
  async function sendUserMessage(content, attachments = []) {
    const conversationStore = useConversationStore()

    // Add user message
    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      attachments,
      timestamp: new Date().toISOString(),
      conversationId: conversationStore.currentConversationId
    }

    messages.value.push(userMessage)

    // Create AI message placeholder
    const aiMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      conversationId: conversationStore.currentConversationId,
      isStreaming: true
    }

    messages.value.push(aiMessage)
    streamingMessageId.value = aiMessage.id

    try {
      isLoading.value = true
      error.value = null

      // Create abort controller for cancellation
      abortController.value = new AbortController()

      // Stream response
      await streamMessage(
        content,
        attachments,
        (chunk) => {
          const index = messages.value.findIndex(m => m.id === aiMessage.id)
          if (index !== -1) {
            messages.value[index].content += chunk
          }
        },
        abortController.value.signal
      )

      // Mark streaming as complete
      const index = messages.value.findIndex(m => m.id === aiMessage.id)
      if (index !== -1) {
        messages.value[index].isStreaming = false
      }

      // Update conversation title if it's the first message
      if (messages.value.length === 2) {
        conversationStore.updateConversationTitle(userMessage.content.slice(0, 50))
      }

    } catch (err) {
      if (err.name !== 'AbortError') {
        error.value = err.message || 'Failed to send message'
        // Remove empty AI message on error
        messages.value = messages.value.filter(m => m.id !== aiMessage.id)
      }
    } finally {
      isLoading.value = false
      streamingMessageId.value = null
      abortController.value = null
    }
  }

  function stopStreaming() {
    if (abortController.value) {
      abortController.value.abort()
      streamingMessageId.value = null
    }
  }

  function clearMessages() {
    messages.value = []
    error.value = null
  }

  function loadMessages(conversationId) {
    // Load messages from storage or API
    const savedMessages = localStorage.getItem(`messages_${conversationId}`)
    if (savedMessages) {
      messages.value = JSON.parse(savedMessages)
    } else {
      messages.value = []
    }
  }

  function saveMessages(conversationId) {
    localStorage.setItem(`messages_${conversationId}`, JSON.stringify(messages.value))
  }

  function deleteMessage(messageId) {
    messages.value = messages.value.filter(m => m.id !== messageId)
  }

  function editMessage(messageId, newContent) {
    const index = messages.value.findIndex(m => m.id === messageId)
    if (index !== -1) {
      messages.value[index].content = newContent
      messages.value[index].edited = true
      messages.value[index].editedAt = new Date().toISOString()
    }
  }

  function copyMessage(messageId) {
    const message = messages.value.find(m => m.id === messageId)
    if (message) {
      navigator.clipboard.writeText(message.content)
    }
  }

  function regenerateLastMessage() {
    // Find last user message
    let lastUserMessage = null
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i].role === 'user') {
        lastUserMessage = messages.value[i]
        break
      }
    }

    if (lastUserMessage) {
      // Remove all messages after the last user message
      const index = messages.value.indexOf(lastUserMessage)
      messages.value = messages.value.slice(0, index + 1)

      // Resend the message
      sendUserMessage(lastUserMessage.content, lastUserMessage.attachments)
    }
  }

  return {
    // State
    messages,
    isLoading,
    error,
    streamingMessageId,

    // Getters
    hasMessages,
    lastMessage,
    isStreaming,

    // Actions
    sendUserMessage,
    stopStreaming,
    clearMessages,
    loadMessages,
    saveMessages,
    deleteMessage,
    editMessage,
    copyMessage,
    regenerateLastMessage
  }
})
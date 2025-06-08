import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getFromStorage, saveToStorage } from '@/services/storage'
import { createConversationAPI } from '@/services/api'

export const useConversationStore = defineStore('conversations', () => {
  const conversations = ref([])
  const currentConversationId = ref(null)
  const searchQuery = ref('')

  // 현재 대화
  const currentConversation = computed(() =>
    conversations.value.find(c => c.id === currentConversationId.value)
  )

  // 필터된 대화 목록
  const filteredConversations = computed(() => {
    if (!searchQuery.value) return conversations.value

    const query = searchQuery.value.toLowerCase()
    return conversations.value.filter(conv =>
      conv.title.toLowerCase().includes(query) ||
      conv.messages?.some(msg => msg.content.toLowerCase().includes(query))
    )
  })

  // 대화 생성
  const createConversation = async (title = 'New Chat') => {
    try {
      const newConversation = await createConversationAPI(title)

      conversations.value.unshift(newConversation)
      currentConversationId.value = newConversation.id
      await saveConversations()

      return newConversation
    } catch (error) {
      console.error('대화 생성 실패:', error)
      // 오프라인 모드로 폴백
      const newConversation = {
        id: Date.now().toString(),
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      }

      conversations.value.unshift(newConversation)
      currentConversationId.value = newConversation.id
      await saveConversations()

      return newConversation
    }
  }

  // 대화 업데이트
  const updateConversation = async (id, updates) => {
    const index = conversations.value.findIndex(c => c.id === id)
    if (index !== -1) {
      conversations.value[index] = {
        ...conversations.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      // 최근 대화가 맨 위로 오도록 정렬
      conversations.value.sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)
      )

      await saveConversations()
    }
  }

  // 대화 삭제
  const deleteConversation = async (id) => {
    conversations.value = conversations.value.filter(c => c.id !== id)

    if (currentConversationId.value === id) {
      currentConversationId.value = null
    }

    await saveConversations()
  }

  // 대화 이름 변경
  const renameConversation = async (id, newTitle) => {
    await updateConversation(id, { title: newTitle })
  }

  // 대화 불러오기
  const loadConversation = async (id) => {
    const conversation = conversations.value.find(c => c.id === id)
    if (conversation) {
      currentConversationId.value = id
      return conversation
    }
    return null
  }

  // 현재 대화 설정
  const setCurrentConversation = (conversation) => {
    currentConversationId.value = conversation?.id || null
  }

  // 대화 목록 불러오기
  const loadConversations = async () => {
    try {
      const saved = await getFromStorage('conversations')
      if (saved) {
        conversations.value = saved.sort((a, b) =>
          new Date(b.updatedAt) - new Date(a.updatedAt)
        )
      }
    } catch (error) {
      console.error('대화 목록 불러오기 실패:', error)
    }
  }

  // 대화 저장
  const saveConversations = async () => {
    try {
      await saveToStorage('conversations', conversations.value)
    } catch (error) {
      console.error('대화 저장 실패:', error)
    }
  }

  // 대화 검색
  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  // 모든 대화 삭제
  const clearAllConversations = async () => {
    conversations.value = []
    currentConversationId.value = null
    await saveConversations()
  }

  // 초기화
  loadConversations()

  return {
    conversations,
    currentConversation,
    currentConversationId,
    filteredConversations,
    searchQuery,
    createConversation,
    updateConversation,
    deleteConversation,
    renameConversation,
    loadConversation,
    setCurrentConversation,
    loadConversations,
    setSearchQuery,
    clearAllConversations
  }
})
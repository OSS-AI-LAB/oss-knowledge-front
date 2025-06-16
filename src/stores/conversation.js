import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export const useConversationStore = defineStore('conversation', () => {
  // State
  const conversations = ref([])
  const currentConversationId = ref(null)
  const searchQuery = ref('')

  // Getters
  const currentConversation = computed(() =>
    conversations.value.find(c => c.id === currentConversationId.value)
  )

  const filteredConversations = computed(() => {
    if (!searchQuery.value) {
      return conversations.value
    }

    const query = searchQuery.value.toLowerCase()
    return conversations.value.filter(conv =>
      conv.title.toLowerCase().includes(query) ||
      conv.preview?.toLowerCase().includes(query)
    )
  })

  const sortedConversations = computed(() => {
    return [...filteredConversations.value].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  })

  const conversationsByDate = computed(() => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: []
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    sortedConversations.value.forEach(conv => {
      const convDate = new Date(conv.updatedAt)

      if (convDate >= today) {
        groups.today.push(conv)
      } else if (convDate >= yesterday) {
        groups.yesterday.push(conv)
      } else if (convDate >= weekAgo) {
        groups.thisWeek.push(conv)
      } else if (convDate >= monthAgo) {
        groups.thisMonth.push(conv)
      } else {
        groups.older.push(conv)
      }
    })

    return groups
  })

  // Actions
  function createConversation(title = 'New conversation') {
    const conversation = {
      id: uuidv4(),
      title,
      preview: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      archived: false
    }

    conversations.value.unshift(conversation)
    currentConversationId.value = conversation.id
    saveToLocalStorage()

    return conversation
  }

  function selectConversation(conversationId) {
    currentConversationId.value = conversationId
  }

  function updateConversationTitle(title) {
    const conv = currentConversation.value
    if (conv) {
      conv.title = title
      conv.updatedAt = new Date().toISOString()
      saveToLocalStorage()
    }
  }

  function updateConversationPreview(preview) {
    const conv = currentConversation.value
    if (conv) {
      conv.preview = preview.slice(0, 100)
      conv.updatedAt = new Date().toISOString()
      conv.messageCount = (conv.messageCount || 0) + 1
      saveToLocalStorage()
    }
  }

  function deleteConversation(conversationId) {
    conversations.value = conversations.value.filter(c => c.id !== conversationId)

    // If deleted current conversation, select another one
    if (currentConversationId.value === conversationId) {
      currentConversationId.value = conversations.value[0]?.id || null
    }

    // Also delete messages from localStorage
    localStorage.removeItem(`messages_${conversationId}`)
    saveToLocalStorage()
  }

  function archiveConversation(conversationId) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      conv.archived = true
      conv.updatedAt = new Date().toISOString()
      saveToLocalStorage()
    }
  }

  function renameConversation(conversationId, newTitle) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      conv.title = newTitle
      conv.updatedAt = new Date().toISOString()
      saveToLocalStorage()
    }
  }

  function clearConversations() {
    // Clear all conversations and their messages
    conversations.value.forEach(conv => {
      localStorage.removeItem(`messages_${conv.id}`)
    })

    conversations.value = []
    currentConversationId.value = null
    saveToLocalStorage()
  }

  function setSearchQuery(query) {
    searchQuery.value = query
  }

  // Local storage
  function saveToLocalStorage() {
    localStorage.setItem('conversations', JSON.stringify(conversations.value))
    localStorage.setItem('currentConversationId', currentConversationId.value || '')
  }

  function loadFromLocalStorage() {
    const saved = localStorage.getItem('conversations')
    if (saved) {
      conversations.value = JSON.parse(saved)
    }

    const savedId = localStorage.getItem('currentConversationId')
    if (savedId && conversations.value.find(c => c.id === savedId)) {
      currentConversationId.value = savedId
    } else if (conversations.value.length > 0) {
      currentConversationId.value = conversations.value[0].id
    }
  }

  // Initialize
  loadFromLocalStorage()

  return {
    // State
    conversations,
    currentConversationId,
    searchQuery,

    // Getters
    currentConversation,
    filteredConversations,
    sortedConversations,
    conversationsByDate,

    // Actions
    createConversation,
    selectConversation,
    updateConversationTitle,
    updateConversationPreview,
    deleteConversation,
    archiveConversation,
    renameConversation,
    clearConversations,
    setSearchQuery,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})

// 스토리지 키 접두사
const STORAGE_PREFIX = 'claude_chat_'

// 스토리지에 저장
export const saveToStorage = (key, data) => {
  try {
    const serialized = JSON.stringify(data)
    localStorage.setItem(STORAGE_PREFIX + key, serialized)
    return true
  } catch (error) {
    console.error('스토리지 저장 오류:', error)
    return false
  }
}

// 스토리지에서 불러오기
export const getFromStorage = (key) => {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key)
    if (!item) return null
    return JSON.parse(item)
  } catch (error) {
    console.error('스토리지 불러오기 오류:', error)
    return null
  }
}

// 스토리지에서 삭제
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key)
    return true
  } catch (error) {
    console.error('스토리지 삭제 오류:', error)
    return false
  }
}

// 스토리지 전체 삭제
export const clearStorage = () => {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
    return true
  } catch (error) {
    console.error('스토리지 초기화 오류:', error)
    return false
  }
}

// 스토리지 용량 확인
export const getStorageSize = () => {
  let totalSize = 0
  const keys = Object.keys(localStorage)

  keys.forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      const item = localStorage.getItem(key)
      if (item) {
        totalSize += item.length
      }
    }
  })

  return {
    bytes: totalSize,
    kb: (totalSize / 1024).toFixed(2),
    mb: (totalSize / 1024 / 1024).toFixed(2)
  }
}

// 대화 저장 (압축 포함)
export const saveConversation = (conversationId, data) => {
  const key = `conversation_${conversationId}`

  // 큰 대화의 경우 메시지 수 제한
  if (data.messages && data.messages.length > 100) {
    data.messages = data.messages.slice(-100)
  }

  return saveToStorage(key, data)
}

// 대화 불러오기
export const loadConversation = (conversationId) => {
  const key = `conversation_${conversationId}`
  return getFromStorage(key)
}

// 모든 대화 ID 가져오기
export const getAllConversationIds = () => {
  const ids = []
  const keys = Object.keys(localStorage)

  keys.forEach(key => {
    if (key.startsWith(STORAGE_PREFIX + 'conversation_')) {
      const id = key.replace(STORAGE_PREFIX + 'conversation_', '')
      ids.push(id)
    }
  })

  return ids
}

// 설정 저장/불러오기
export const saveSettings = (settings) => {
  return saveToStorage('settings', settings)
}

export const loadSettings = () => {
  return getFromStorage('settings') || {
    theme: 'system',
    fontSize: 'medium',
    enterToSend: true,
    soundEnabled: false,
    autoSave: true
  }
}

// 임시 저장 (자동 저장)
export const saveDraft = (conversationId, content) => {
  const key = `draft_${conversationId || 'new'}`
  return saveToStorage(key, {
    content,
    timestamp: new Date().toISOString()
  })
}

export const loadDraft = (conversationId) => {
  const key = `draft_${conversationId || 'new'}`
  const draft = getFromStorage(key)

  if (draft) {
    // 24시간 이상 된 임시 저장은 삭제
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    if (new Date(draft.timestamp) < dayAgo) {
      removeFromStorage(key)
      return null
    }
  }

  return draft
}

export const clearDraft = (conversationId) => {
  const key = `draft_${conversationId || 'new'}`
  return removeFromStorage(key)
}
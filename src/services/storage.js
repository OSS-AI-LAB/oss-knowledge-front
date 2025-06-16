const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PREFERENCES: 'userPreferences',
  CONVERSATIONS: 'conversations',
  CURRENT_CONVERSATION: 'currentConversationId',
  SIDEBAR_STATE: 'sidebarVisible',
  DARK_MODE: 'darkMode',
  REMEMBERED_EMAIL: 'rememberedEmail'
}

class StorageService {
  constructor() {
    this.prefix = 'claude_'
  }

  // Get full key with prefix
  getKey(key) {
    return `${this.prefix}${key}`
  }

  // Set item in localStorage
  set(key, value) {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(this.getKey(key), serialized)
      return true
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      return false
    }
  }

  // Get item from localStorage
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.getKey(key))
      if (item === null) {
        return defaultValue
      }
      return JSON.parse(item)
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return defaultValue
    }
  }

  // Remove item from localStorage
  remove(key) {
    try {
      localStorage.removeItem(this.getKey(key))
      return true
    } catch (error) {
      console.error('Error removing from localStorage:', error)
      return false
    }
  }

  // Clear all items with prefix
  clear() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }

  // Check if key exists
  has(key) {
    return localStorage.getItem(this.getKey(key)) !== null
  }

  // Get storage size for this app
  getSize() {
    let size = 0
    const keys = Object.keys(localStorage)

    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        const item = localStorage.getItem(key)
        size += item ? item.length : 0
      }
    })

    return size
  }

  // Check if localStorage is available
  isAvailable() {
    try {
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch (error) {
      return false
    }
  }

  // Migrate old storage format
  migrate() {
    // Example migration logic
    const oldConversations = localStorage.getItem('conversations')
    if (oldConversations && !this.has(STORAGE_KEYS.CONVERSATIONS)) {
      try {
        this.set(STORAGE_KEYS.CONVERSATIONS, JSON.parse(oldConversations))
        localStorage.removeItem('conversations')
      } catch (error) {
        console.error('Migration failed:', error)
      }
    }
  }
}

// Create singleton instance
const storage = new StorageService()

// Check availability on startup
if (!storage.isAvailable()) {
  console.warn('localStorage is not available. Data will not persist.')
}

// Run migrations
storage.migrate()

// Specific storage functions
export const authStorage = {
  getToken() {
    return storage.get(STORAGE_KEYS.AUTH_TOKEN)
  },

  setToken(token) {
    return storage.set(STORAGE_KEYS.AUTH_TOKEN, token)
  },

  removeToken() {
    return storage.remove(STORAGE_KEYS.AUTH_TOKEN)
  },

  isAuthenticated() {
    return !!this.getToken()
  }
}

export const conversationStorage = {
  getAll() {
    return storage.get(STORAGE_KEYS.CONVERSATIONS, [])
  },

  save(conversations) {
    return storage.set(STORAGE_KEYS.CONVERSATIONS, conversations)
  },

  getCurrent() {
    return storage.get(STORAGE_KEYS.CURRENT_CONVERSATION)
  },

  setCurrent(id) {
    return storage.set(STORAGE_KEYS.CURRENT_CONVERSATION, id)
  },

  getMessages(conversationId) {
    return storage.get(`messages_${conversationId}`, [])
  },

  saveMessages(conversationId, messages) {
    return storage.set(`messages_${conversationId}`, messages)
  },

  deleteMessages(conversationId) {
    return storage.remove(`messages_${conversationId}`)
  }
}

export const preferencesStorage = {
  get() {
    return storage.get(STORAGE_KEYS.USER_PREFERENCES, {
      theme: 'auto',
      fontSize: 'medium',
      compactMode: false,
      sendOnEnter: true,
      showTimestamps: true,
      enableSounds: false
    })
  },

  save(preferences) {
    return storage.set(STORAGE_KEYS.USER_PREFERENCES, preferences)
  },

  update(updates) {
    const current = this.get()
    return this.save({ ...current, ...updates })
  }
}

export const uiStorage = {
  getSidebarState() {
    return storage.get(STORAGE_KEYS.SIDEBAR_STATE, true)
  },

  setSidebarState(visible) {
    return storage.set(STORAGE_KEYS.SIDEBAR_STATE, visible)
  },

  getDarkMode() {
    return storage.get(STORAGE_KEYS.DARK_MODE, null)
  },

  setDarkMode(enabled) {
    return storage.set(STORAGE_KEYS.DARK_MODE, enabled)
  }
}

// Export default storage instance
export default storage

// Export storage keys for direct access if needed
export { STORAGE_KEYS }
class WebSocketService {
  constructor() {
    this.ws = null
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:3000'
    this.reconnectInterval = 5000
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.listeners = new Map()
    this.messageQueue = []
    this.isConnected = false
  }

  // Connect to WebSocket server
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = this.onOpen.bind(this)
      this.ws.onmessage = this.onMessage.bind(this)
      this.ws.onerror = this.onError.bind(this)
      this.ws.onclose = this.onClose.bind(this)
    } catch (error) {
      console.error('WebSocket connection error:', error)
      this.scheduleReconnect()
    }
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
    this.reconnectAttempts = 0
  }

  // Send message to server
  send(type, data) {
    const message = JSON.stringify({ type, data, timestamp: Date.now() })

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message)
    } else {
      // Queue message if not connected
      this.messageQueue.push(message)
      this.connect()
    }
  }

  // Subscribe to message type
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type).add(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(type)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.listeners.delete(type)
        }
      }
    }
  }

  // Emit event to listeners
  emit(type, data) {
    const callbacks = this.listeners.get(type)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in WebSocket listener for ${type}:`, error)
        }
      })
    }

    // Also emit wildcard event
    const wildcardCallbacks = this.listeners.get('*')
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach(callback => {
        try {
          callback({ type, data })
        } catch (error) {
          console.error('Error in WebSocket wildcard listener:', error)
        }
      })
    }
  }

  // WebSocket event handlers
  onOpen() {
    console.log('WebSocket connected')
    this.isConnected = true
    this.reconnectAttempts = 0

    // Send queued messages
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      this.ws.send(message)
    }

    // Emit connected event
    this.emit('connected', { url: this.url })

    // Send authentication if needed
    const token = localStorage.getItem('authToken')
    if (token) {
      this.send('auth', { token })
    }
  }

  onMessage(event) {
    try {
      const message = JSON.parse(event.data)
      this.emit(message.type, message.data)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
      this.emit('error', { error: 'Invalid message format' })
    }
  }

  onError(error) {
    console.error('WebSocket error:', error)
    this.emit('error', { error })
  }

  onClose(event) {
    console.log('WebSocket closed', event.code, event.reason)
    this.isConnected = false
    this.ws = null

    // Emit disconnected event
    this.emit('disconnected', { code: event.code, reason: event.reason })

    // Attempt to reconnect if not intentional close
    if (event.code !== 1000 && event.code !== 1001) {
      this.scheduleReconnect()
    }
  }

  // Reconnection logic
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.emit('reconnect_failed', { attempts: this.reconnectAttempts })
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1)

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay })

    setTimeout(() => {
      this.connect()
    }, delay)
  }

  // Utility methods
  getState() {
    if (!this.ws) return 'DISCONNECTED'

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING'
      case WebSocket.OPEN:
        return 'CONNECTED'
      case WebSocket.CLOSING:
        return 'CLOSING'
      case WebSocket.CLOSED:
        return 'DISCONNECTED'
      default:
        return 'UNKNOWN'
    }
  }

  isReady() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }
}

// Create singleton instance
const wsService = new WebSocketService()

// Auto-connect in production
if (import.meta.env.PROD && !import.meta.env.VITE_MOCK_API) {
  wsService.connect()
}

// Export service instance and types
export default wsService

// Message types
export const WS_TYPES = {
  // Authentication
  AUTH: 'auth',
  AUTH_SUCCESS: 'auth_success',
  AUTH_ERROR: 'auth_error',

  // Chat messages
  MESSAGE: 'message',
  MESSAGE_UPDATE: 'message_update',
  MESSAGE_DELETE: 'message_delete',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',

  // Conversation events
  CONVERSATION_CREATE: 'conversation_create',
  CONVERSATION_UPDATE: 'conversation_update',
  CONVERSATION_DELETE: 'conversation_delete',

  // System events
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong'
}

// Helper functions
export function subscribeToMessages(callback) {
  return wsService.on(WS_TYPES.MESSAGE, callback)
}

export function subscribeToTyping(callback) {
  return wsService.on(WS_TYPES.TYPING, callback)
}

export function sendMessage(content, conversationId) {
  wsService.send(WS_TYPES.MESSAGE, {
    content,
    conversationId,
    timestamp: Date.now()
  })
}

export function sendTypingIndicator(conversationId, isTyping = true) {
  wsService.send(isTyping ? WS_TYPES.TYPING : WS_TYPES.STOP_TYPING, {
    conversationId,
    timestamp: Date.now()
  })
}

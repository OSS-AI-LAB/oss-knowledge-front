<template>
  <div class="chat-view">
    <!-- Messages Area -->
    <div class="messages-container" ref="messagesContainer">
      <MessageList
        :messages="messages"
        @scroll-to-bottom="scrollToBottom"
      />

      <!-- Welcome message when no messages -->
      <div v-if="!hasMessages" class="welcome-message">
        <h1>Welcome to Claude</h1>
        <p class="subtitle">Start a conversation to begin</p>

        <div class="suggestions">
          <h3>Try asking me to:</h3>
          <div class="suggestion-grid">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              @click="handleSuggestion(suggestion)"
              class="suggestion-item"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-container">
      <ChatInput
        :disabled="isLoading"
        :is-streaming="isStreaming"
        @send-message="handleSendMessage"
        @stop-streaming="handleStopStreaming"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useConversationStore } from '@/stores/conversation'
import MessageList from '@/components/chat/MessageList.vue'
import ChatInput from '@/components/chat/ChatInput.vue'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const conversationStore = useConversationStore()

// Refs
const messagesContainer = ref(null)

// Computed
const messages = computed(() => chatStore.messages)
const hasMessages = computed(() => chatStore.hasMessages)
const isLoading = computed(() => chatStore.isLoading)
const isStreaming = computed(() => chatStore.isStreaming)

// Suggestions for new users
const suggestions = [
  "Help me write code",
  "Explain a complex topic",
  "Brainstorm ideas",
  "Analyze some data",
  "Write a story",
  "Solve a problem"
]

// Methods
async function handleSendMessage({ content, attachments }) {
  // Create new conversation if needed
  if (!conversationStore.currentConversationId) {
    conversationStore.createConversation()
  }

  await chatStore.sendUserMessage(content, attachments)

  // Update conversation preview
  conversationStore.updateConversationPreview(content)

  // Save messages
  chatStore.saveMessages(conversationStore.currentConversationId)

  // Scroll to bottom
  await nextTick()
  scrollToBottom()
}

function handleStopStreaming() {
  chatStore.stopStreaming()
}

function handleSuggestion(suggestion) {
  handleSendMessage({ content: suggestion, attachments: [] })
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Watch for conversation changes
watch(() => route.params.conversationId, (newId) => {
  if (newId) {
    conversationStore.selectConversation(newId)
    chatStore.loadMessages(newId)
  } else {
    // New conversation
    conversationStore.currentConversationId = null
    chatStore.clearMessages()
  }
}, { immediate: true })

// Watch for new messages to auto-scroll
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// Handle new conversation event
onMounted(() => {
  window.addEventListener('new-conversation', () => {
    router.push('/')
    conversationStore.currentConversationId = null
    chatStore.clearMessages()
  })
})
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: var(--color-background);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  padding-bottom: var(--spacing-2xl);
}

.welcome-message {
  max-width: var(--chat-max-width);
  margin: 0 auto;
  padding: var(--spacing-2xl);
  text-align: center;

  h1 {
    font-size: 2.5rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-sm);
  }

  .subtitle {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-2xl);
  }
}

.suggestions {
  margin-top: var(--spacing-2xl);

  h3 {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-lg);
  }
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  max-width: 600px;
  margin: 0 auto;
}

.suggestion-item {
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--color-sidebar);
    border-color: var(--color-primary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &:active {
    transform: translateY(0);
  }
}

.input-container {
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: var(--spacing-md);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .messages-container {
    padding: var(--spacing-sm);
  }

  .welcome-message {
    padding: var(--spacing-lg);

    h1 {
      font-size: 2rem;
    }
  }

  .suggestion-grid {
    grid-template-columns: 1fr;
  }
}
</style>
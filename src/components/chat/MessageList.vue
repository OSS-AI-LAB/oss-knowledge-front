<template>
  <div class="message-list">
    <div
      v-for="message in messages"
      :key="message.id"
      class="message-wrapper"
    >
      <ChatMessage
        :message="message"
        @copy="handleCopy"
        @edit="handleEdit"
        @delete="handleDelete"
        @regenerate="handleRegenerate"
      />
    </div>
  </div>
</template>

<script setup>
import { useChatStore } from '@/stores/chat'
import ChatMessage from './ChatMessage.vue'

const props = defineProps({
  messages: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['scroll-to-bottom'])

const chatStore = useChatStore()

// Methods
function handleCopy(messageId) {
  chatStore.copyMessage(messageId)
  // Show toast notification
  showToast('Message copied to clipboard')
}

function handleEdit(messageId, newContent) {
  chatStore.editMessage(messageId, newContent)
}

function handleDelete(messageId) {
  if (confirm('Are you sure you want to delete this message?')) {
    chatStore.deleteMessage(messageId)
  }
}

function handleRegenerate() {
  chatStore.regenerateLastMessage()
}

function showToast(message) {
  // Simple toast implementation
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.classList.add('show')
  }, 10)

  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 2000)
}
</script>

<style scoped>
.message-list {
  max-width: var(--chat-max-width);
  margin: 0 auto;
  padding: var(--spacing-lg) 0;
}

.message-wrapper {
  margin-bottom: var(--spacing-lg);

  &:last-child {
    margin-bottom: 0;
  }
}

/* Global toast styles */
:global(.toast) {
  position: fixed;
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  background-color: var(--color-text-primary);
  color: var(--color-background);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  z-index: 10000;
  transition: transform var(--transition-base);

  &.show {
    transform: translateX(-50%) translateY(0);
  }
}
</style>
<template>
  <div class="chat-input-wrapper">
    <div class="chat-input-container">
      <!-- File attachments -->
      <div v-if="attachments.length > 0" class="attachments">
        <div
          v-for="(file, index) in attachments"
          :key="index"
          class="attachment-item"
        >
          <img v-if="isImage(file)" :src="file.preview" alt="" class="attachment-preview" />
          <div v-else class="attachment-info">
            <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="file-name">{{ file.name }}</span>
          </div>
          <button @click="removeAttachment(index)" class="remove-attachment">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Input area -->
      <div class="input-area">
        <button @click="triggerFileInput" class="attach-button" :disabled="disabled">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        <textarea
          ref="textareaRef"
          v-model="message"
          @keydown.enter.exact="handleEnter"
          @input="adjustHeight"
          :placeholder="placeholder"
          :disabled="disabled"
          class="message-input"
          :rows="1"
        />

        <button
          @click="handleSubmit"
          class="send-button"
          :disabled="!canSend"
          :class="{ 'stop-button': isStreaming }"
        >
          <svg v-if="!isStreaming" class="icon" viewBox="0 0 24 24" fill="none">
            <path d="M7 11L12 6L17 11M12 18V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else class="icon" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="6" width="12" height="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        multiple
        accept="image/*,.pdf,.txt,.doc,.docx"
        @change="handleFileSelect"
        class="hidden-file-input"
      />
    </div>

    <!-- Character count / info -->
    <div class="input-info">
      <span v-if="message.length > 0" class="char-count">
        {{ message.length }} / 12000
      </span>
      <span class="shortcut-hint">
        Press Enter to send, Shift+Enter for new line
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  isStreaming: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send-message', 'stop-streaming'])

// Refs
const message = ref('')
const attachments = ref([])
const textareaRef = ref(null)
const fileInputRef = ref(null)

// Computed
const canSend = computed(() => {
  if (props.isStreaming) return true
  return message.value.trim().length > 0 || attachments.value.length > 0
})

const placeholder = computed(() => {
  return props.isStreaming ? 'Claude is thinking...' : 'Message Claude...'
})

// Methods
function handleSubmit() {
  if (props.isStreaming) {
    emit('stop-streaming')
    return
  }

  if (canSend.value) {
    emit('send-message', {
      content: message.value.trim(),
      attachments: attachments.value
    })

    // Clear input
    message.value = ''
    attachments.value = []

    // Reset textarea height
    nextTick(() => {
      adjustHeight()
    })
  }
}

function handleEnter(event) {
  if (!event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}

function adjustHeight() {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    const scrollHeight = textareaRef.value.scrollHeight
    const maxHeight = 200
    textareaRef.value.style.height = Math.min(scrollHeight, maxHeight) + 'px'
  }
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files)

  files.forEach(file => {
    const reader = new FileReader()

    reader.onload = (e) => {
      attachments.value.push({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: isImage(file) ? e.target.result : null
      })
    }

    if (isImage(file)) {
      reader.readAsDataURL(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  })

  // Clear input
  event.target.value = ''
}

function removeAttachment(index) {
  attachments.value.splice(index, 1)
}

function isImage(file) {
  return file.type?.startsWith('image/')
}

// Focus on mount
onMounted(() => {
  textareaRef.value?.focus()
})

// Auto-resize on content change
watch(message, () => {
  nextTick(() => {
    adjustHeight()
  })
})
</script>

<style scoped>
.chat-input-wrapper {
  max-width: var(--chat-max-width);
  margin: 0 auto;
  width: 100%;
}

.chat-input-container {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-fast);

  &:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(217, 119, 87, 0.1);
  }
}

.attachments {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  padding-bottom: 0;
  flex-wrap: wrap;
}

.attachment-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-sidebar);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
}

.attachment-preview {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.file-icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-secondary);
}

.file-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-secondary);
}

.remove-attachment {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-round);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--color-border);
  }

  .icon {
    width: 12px;
    height: 12px;
  }
}

.input-area {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
}

.attach-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background-color: var(--color-sidebar);
    color: var(--color-text-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon {
    width: 20px;
    height: 20px;
  }
}

.message-input {
  flex: 1;
  min-height: 40px;
  max-height: 200px;
  padding: var(--spacing-sm) 0;
  background: transparent;
  border: none;
  resize: none;
  font-family: inherit;
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--color-text-primary);

  &::placeholder {
    color: var(--color-text-tertiary);
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    opacity: 0.7;
  }
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: var(--color-primary);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }

  &:disabled {
    background-color: var(--color-border);
    cursor: not-allowed;
  }

  &.stop-button {
    background-color: var(--color-text-secondary);

    &:hover {
      background-color: var(--color-text-primary);
    }
  }

  .icon {
    width: 20px;
    height: 20px;
  }
}

.hidden-file-input {
  display: none;
}

.input-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.char-count {
  font-variant-numeric: tabular-nums;
}

.shortcut-hint {
  opacity: 0.7;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .shortcut-hint {
    display: none;
  }

  .attachment-item {
    font-size: var(--font-size-xs);
  }

  .file-name {
    max-width: 100px;
  }
}
</style>
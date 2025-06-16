
<template>
  <div class="message" :class="`message-${message.role}`">
    <div class="message-content">
      <!-- Avatar -->
      <div class="avatar">
        <div v-if="message.role === 'user'" class="user-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div v-else class="ai-avatar">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </div>
      </div>

      <!-- Message body -->
      <div class="message-body">
        <!-- Message header -->
        <div class="message-header">
          <span class="message-role">{{ message.role === 'user' ? 'You' : 'Claude' }}</span>
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>

        <!-- Attachments -->
        <div v-if="message.attachments?.length > 0" class="message-attachments">
          <div
            v-for="(attachment, index) in message.attachments"
            :key="index"
            class="attachment"
          >
            <img
              v-if="isImage(attachment)"
              :src="attachment.preview || attachment.url"
              :alt="attachment.name"
              class="attachment-image"
              @click="expandImage(attachment)"
            />
            <div v-else class="attachment-file">
              <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{{ attachment.name }}</span>
            </div>
          </div>
        </div>

        <!-- Message text -->
        <div class="message-text">
          <div v-if="isEditing" class="edit-mode">
            <textarea
              v-model="editContent"
              @keydown.enter.ctrl="saveEdit"
              @keydown.escape="cancelEdit"
              class="edit-textarea"
              ref="editTextarea"
            />
            <div class="edit-actions">
              <button @click="saveEdit" class="edit-button save">Save</button>
              <button @click="cancelEdit" class="edit-button cancel">Cancel</button>
            </div>
          </div>

          <div v-else>
            <!-- Streaming indicator -->
            <div v-if="message.isStreaming && !message.content" class="streaming-indicator">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>

            <!-- Rendered content -->
            <div
              v-else
              class="rendered-content"
              v-html="renderedContent"
            />

            <!-- Edited indicator -->
            <span v-if="message.edited" class="edited-indicator">
              (edited)
            </span>
          </div>
        </div>

        <!-- Message actions -->
        <div class="message-actions" v-if="!isEditing">
          <button @click="copyMessage" class="action-button" title="Copy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            v-if="message.role === 'user'"
            @click="startEdit"
            class="action-button"
            title="Edit"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            v-if="isLastAIMessage"
            @click="regenerate"
            class="action-button"
            title="Regenerate"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'isomorphic-dompurify'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  isLastAIMessage: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['copy', 'edit', 'delete', 'regenerate'])

// State
const isEditing = ref(false)
const editContent = ref('')
const editTextarea = ref(null)

// Configure marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

// Computed
const renderedContent = computed(() => {
  const html = marked(props.message.content || '')
  return DOMPurify.sanitize(html)
})

// Methods
function formatTime(timestamp) {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // Less than 1 minute
  if (diff < 60000) {
    return 'just now'
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}m ago`
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  }

  // Format as date
  return date.toLocaleDateString()
}

function isImage(attachment) {
  return attachment.type?.startsWith('image/')
}

function expandImage(attachment) {
  // Implement image expansion/lightbox
  console.log('Expand image:', attachment)
}

function copyMessage() {
  emit('copy', props.message.id)
}

function startEdit() {
  isEditing.value = true
  editContent.value = props.message.content
  nextTick(() => {
    editTextarea.value?.focus()
    editTextarea.value?.select()
  })
}

function saveEdit() {
  if (editContent.value.trim() !== props.message.content) {
    emit('edit', props.message.id, editContent.value.trim())
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
  editContent.value = ''
}

function regenerate() {
  emit('regenerate')
}
</script>

<style scoped>
.message {
  display: flex;
  padding: var(--spacing-md) 0;
}

.message-content {
  display: flex;
  gap: var(--spacing-md);
  width: 100%;
}

.avatar {
  flex-shrink: 0;
}

.user-avatar,
.ai-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
}

.user-avatar {
  background-color: var(--color-primary);
  color: white;
}

.ai-avatar {
  background-color: var(--color-sidebar);
  color: var(--color-primary);
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.message-role {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.message-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.message-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.attachment {
  position: relative;
}

.attachment-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform var(--transition-fast);

  &:hover {
    transform: scale(1.02);
  }
}

.attachment-file {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background-color: var(--color-sidebar);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);

  .file-icon {
    width: 16px;
    height: 16px;
    color: var(--color-text-secondary);
  }
}

.message-text {
  position: relative;
}

.edit-mode {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.edit-textarea {
  width: 100%;
  min-height: 100px;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: var(--font-size-base);
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
}

.edit-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.edit-button {
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);

  &.save {
    background-color: var(--color-primary);
    color: white;

    &:hover {
      background-color: var(--color-primary-hover);
    }
  }

  &.cancel {
    background-color: var(--color-border);
    color: var(--color-text-primary);

    &:hover {
      background-color: var(--color-border-light);
    }
  }
}

.streaming-indicator {
  display: flex;
  gap: 4px;
  padding: var(--spacing-sm) 0;

  .dot {
    width: 8px;
    height: 8px;
    background-color: var(--color-text-tertiary);
    border-radius: 50%;
    animation: pulse 1.4s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes pulse {
  0%, 60%, 100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}

.rendered-content {
  color: var(--color-text-primary);
  line-height: 1.6;

  :deep(p) {
    margin-bottom: var(--spacing-md);

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(code) {
    background-color: var(--color-sidebar);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    font-family: var(--font-family-mono);
    font-size: 0.9em;
  }

  :deep(pre) {
    background-color: var(--color-sidebar);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    overflow-x: auto;
    margin-bottom: var(--spacing-md);

    code {
      background: none;
      padding: 0;
      font-size: var(--font-size-sm);
    }
  }

  :deep(ul),
  :deep(ol) {
    margin-bottom: var(--spacing-md);
    padding-left: var(--spacing-lg);
  }

  :deep(blockquote) {
    border-left: 4px solid var(--color-primary);
    padding-left: var(--spacing-md);
    margin: var(--spacing-md) 0;
    color: var(--color-text-secondary);
  }
}

.edited-indicator {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-style: italic;
  margin-left: var(--spacing-xs);
}

.message-actions {
  display: flex;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.message:hover .message-actions {
  opacity: 1;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--color-sidebar);
    color: var(--color-text-primary);
    border-color: var(--color-border-light);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .message-actions {
    opacity: 1;
  }

  .attachment-image {
    max-width: 150px;
    max-height: 150px;
  }
}
</style>
<template>
  <div class="chat-message" :class="{ 'user-message': isUser, 'assistant-message': !isUser }">
    <div class="message-avatar">
      <div v-if="isUser" class="user-avatar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
        </svg>
      </div>
      <div v-else class="assistant-avatar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <div class="message-content">
      <div class="message-header">
        <span class="message-role">{{ isUser ? 'You' : 'Claude' }}</span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>

      <!-- 파일 첨부 표시 -->
      <div v-if="message.files && message.files.length > 0" class="message-files">
        <div v-for="file in message.files" :key="file.name" class="file-item">
          <img v-if="isImage(file)" :src="file.url" :alt="file.name" class="file-image" />
          <div v-else class="file-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" stroke="currentColor" stroke-width="2"/>
              <path d="M14 2v6h6" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>{{ file.name }}</span>
          </div>
        </div>
      </div>

      <!-- 메시지 내용 -->
      <div class="message-text" v-if="!message.isStreaming || message.content">
        <MarkdownRenderer :content="message.content" />
      </div>

      <!-- 스트리밍 중 표시 -->
      <div v-if="message.isStreaming && !message.content" class="streaming-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <!-- 에러 상태 -->
      <div v-if="message.error" class="message-error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
        </svg>
        <span>메시지 전송에 실패했습니다.</span>
      </div>

      <!-- 메시지 액션 -->
      <div class="message-actions" v-if="!isUser && !message.isStreaming">
        <button @click="copyMessage" class="action-btn" title="복사">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
          </svg>
        </button>
        <button v-if="message.error" @click="$emit('retry')" class="action-btn" title="재시도">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownRenderer from './MarkdownRenderer.vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['retry', 'copy'])

const isUser = computed(() => props.message.role === 'user')

// 시간 포맷
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 이미지 파일 체크
const isImage = (file) => {
  return file.type?.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
}

// 메시지 복사
const copyMessage = () => {
  emit('copy', props.message.content)
  // 복사 완료 피드백 (임시)
  const btn = event.currentTarget
  const originalTitle = btn.title
  btn.title = '복사됨!'
  setTimeout(() => {
    btn.title = originalTitle
  }, 2000)
}
</script>

<style lang="scss" scoped>
.chat-message {
  display: flex;
  gap: 16px;
  animation: fadeIn 0.3s ease;

  &.user-message {
    .message-content {
      background-color: var(--bg-secondary);
    }
  }

  &.assistant-message {
    .message-content {
      background-color: transparent;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;

  .user-avatar,
  .assistant-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .user-avatar {
    background-color: var(--accent-color);
    color: white;
  }

  .assistant-avatar {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }
}

.message-content {
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  .message-role {
    font-weight: 600;
    font-size: 14px;
  }

  .message-time {
    font-size: 12px;
    color: var(--text-tertiary);
  }
}

.message-files {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;

  .file-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background-color: var(--bg-tertiary);
    border-radius: 6px;
    font-size: 12px;
  }

  .file-image {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
    cursor: pointer;
  }
}

.message-text {
  line-height: 1.6;
  word-break: break-word;
}

.streaming-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;

  span {
    width: 8px;
    height: 8px;
    background-color: var(--text-tertiary);
    border-radius: 50%;
    animation: pulse 1.4s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: -0.2s;
    }

    &:nth-child(3) {
      animation-delay: -0.4s;
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

.message-error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.2s;

  .chat-message:hover & {
    opacity: 1;
  }

  .action-btn {
    padding: 6px;
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background-color: var(--hover-bg);
      color: var(--text-primary);
    }
  }
}

@media (max-width: 768px) {
  .chat-message {
    gap: 12px;
  }

  .message-avatar {
    width: 28px;
    height: 28px;

    .user-avatar,
    .assistant-avatar {
      width: 28px;
      height: 28px;
    }
  }

  .message-content {
    padding: 10px 14px;
  }

  .message-actions {
    opacity: 1;
  }
}
</style>
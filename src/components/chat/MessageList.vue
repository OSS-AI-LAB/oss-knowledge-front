<template>
  <div class="message-list" ref="messageListRef">
    <div v-if="messages.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z" fill="currentColor" opacity="0.3"/>
        </svg>
      </div>
      <h2>어떻게 도와드릴까요?</h2>
      <p>무엇이든 물어보세요. 코드 작성, 분석, 창작 등 다양한 작업을 도와드릴 수 있습니다.</p>
    </div>

    <div v-else class="messages">
      <ChatMessage
        v-for="message in messages"
        :key="message.id"
        :message="message"
        @retry="$emit('retry', message.id)"
        @copy="handleCopy"
      />

      <div v-if="loading" class="loading-message">
        <LoadingSpinner />
      </div>
    </div>

    <!-- 자동 스크롤을 위한 앵커 -->
    <div ref="scrollAnchor"></div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import ChatMessage from './ChatMessage.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['retry'])

const messageListRef = ref(null)
const scrollAnchor = ref(null)
const isUserScrolling = ref(false)
let scrollTimeout = null

// 자동 스크롤
const scrollToBottom = () => {
  if (!isUserScrolling.value && scrollAnchor.value) {
    scrollAnchor.value.scrollIntoView({ behavior: 'smooth' })
  }
}

// 사용자 스크롤 감지
const handleScroll = () => {
  if (!messageListRef.value) return

  const { scrollTop, scrollHeight, clientHeight } = messageListRef.value
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 100

  isUserScrolling.value = !isAtBottom

  // 스크롤 타임아웃 리셋
  clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    isUserScrolling.value = false
  }, 1000)
}

// 복사 처리
const handleCopy = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    // 복사 성공 알림 (토스트 메시지 등)
    console.log('복사되었습니다')
  }).catch(err => {
    console.error('복사 실패:', err)
  })
}

// 메시지 변경 감지
watch(() => props.messages.length, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

// 스트리밍 메시지 업데이트 감지
watch(() => props.messages[props.messages.length - 1]?.content, () => {
  if (!isUserScrolling.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}, { deep: true })

onMounted(() => {
  if (messageListRef.value) {
    messageListRef.value.addEventListener('scroll', handleScroll)
  }
  scrollToBottom()
})

onUnmounted(() => {
  if (messageListRef.value) {
    messageListRef.value.removeEventListener('scroll', handleScroll)
  }
  clearTimeout(scrollTimeout)
})
</script>

<style lang="scss" scoped>
.message-list {
  height: 100%;
  overflow-y: auto;
  padding: 20px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
  text-align: center;

  .empty-icon {
    margin-bottom: 24px;
    color: var(--text-tertiary);
  }

  h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-primary);
  }

  p {
    font-size: 16px;
    color: var(--text-secondary);
    max-width: 500px;
    line-height: 1.5;
  }
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 20px;
  max-width: 800px;
  margin: 0 auto;
}

.loading-message {
  display: flex;
  justify-content: center;
  padding: 20px;
}

@media (max-width: 768px) {
  .messages {
    padding: 0 16px;
  }

  .empty-state {
    h2 {
      font-size: 20px;
    }

    p {
      font-size: 14px;
    }
  }
}
</style>
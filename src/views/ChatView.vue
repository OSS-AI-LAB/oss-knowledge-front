<template>
  <div class="chat-view">
    <!-- 사이드바 -->
    <div class="sidebar" :class="{ collapsed: !sidebarOpen }">
      <SidebarHeader @toggle="toggleSidebar" />
      <ConversationList />
    </div>

    <!-- 메인 채팅 영역 -->
    <div class="chat-main">
      <div class="chat-header">
        <button class="menu-toggle" @click="toggleSidebar" v-if="!sidebarOpen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <h1 class="chat-title">{{ currentConversation?.title || 'New Chat' }}</h1>
        <ThemeToggle />
      </div>

      <div class="chat-content">
        <MessageList
          :messages="messages"
          :loading="isLoading"
          @retry="retryMessage"
        />
      </div>

      <div class="chat-input-wrapper">
        <ChatInput
          @send="sendMessage"
          @file-upload="handleFileUpload"
          :disabled="isLoading"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useConversationStore } from '@/stores/conversations'
import SidebarHeader from '@/components/sidebar/SidebarHeader.vue'
import ConversationList from '@/components/sidebar/ConversationList.vue'
import MessageList from '@/components/chat/MessageList.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const conversationStore = useConversationStore()

const sidebarOpen = ref(true)
const isLoading = computed(() => chatStore.isLoading)
const messages = computed(() => chatStore.messages)
const currentConversation = computed(() => conversationStore.currentConversation)

// 사이드바 토글
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// 메시지 전송
const sendMessage = async (content) => {
  if (!content.trim()) return

  const conversationId = route.params.id || await createNewConversation()

  try {
    await chatStore.sendMessage(content, conversationId)

    // 대화 제목이 없으면 첫 메시지로 제목 생성
    if (!currentConversation.value?.title || currentConversation.value.title === 'New Chat') {
      const title = content.substring(0, 30) + (content.length > 30 ? '...' : '')
      conversationStore.updateConversation(conversationId, {
        title,
        lastMessage: content.substring(0, 50) + (content.length > 50 ? '...' : '')
      })
    } else {
      // 마지막 메시지 업데이트
      conversationStore.updateConversation(conversationId, {
        lastMessage: content.substring(0, 50) + (content.length > 50 ? '...' : '')
      })
    }
  } catch (error) {
    console.error('메시지 전송 실패:', error)
  }
}

// 새 대화 생성
const createNewConversation = async () => {
  const conversation = await conversationStore.createConversation()
  router.push(`/chat/${conversation.id}`)
  return conversation.id
}

// 파일 업로드 처리
const handleFileUpload = async (files) => {
  for (const file of files) {
    await chatStore.addFileToMessage(file)
  }
}

// 메시지 재시도
const retryMessage = async (messageId) => {
  await chatStore.retryMessage(messageId)
}

// 대화 변경 감지
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await conversationStore.loadConversation(newId)
    await chatStore.loadMessages(newId)
  } else {
    chatStore.clearMessages()
    conversationStore.setCurrentConversation(null)
  }
}, { immediate: true })

// 반응형 처리
onMounted(() => {
  const handleResize = () => {
    if (window.innerWidth < 768) {
      sidebarOpen.value = false
    }
  }

  handleResize()
  window.addEventListener('resize', handleResize)

  return () => {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style lang="scss" scoped>
.chat-view {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: var(--sidebar-width);
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease, transform 0.3s ease;

  &.collapsed {
    width: 0;
    transform: translateX(-100%);
  }

  @media (max-width: 768px) {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 100;

    &:not(.collapsed) {
      width: 80%;
      max-width: 300px;
    }
  }
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-header {
  height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: var(--bg-primary);

  .menu-toggle {
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--hover-bg);
    }
  }

  .chat-title {
    flex: 1;
    font-size: 18px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  background-color: var(--bg-primary);
}

.chat-input-wrapper {
  padding: 20px;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
}
</style>
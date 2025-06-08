<template>
  <div class="sidebar-header">
    <button class="new-chat-button" @click="createNewChat">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
      </svg>
      <span>새 대화</span>
    </button>

    <button class="toggle-button" @click="$emit('toggle')" title="사이드바 닫기">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useConversationStore } from '@/stores/conversations'
import { useChatStore } from '@/stores/chat'

const emit = defineEmits(['toggle'])
const router = useRouter()
const conversationStore = useConversationStore()
const chatStore = useChatStore()

const createNewChat = async () => {
  // 현재 대화 저장
  if (conversationStore.currentConversation) {
    await conversationStore.saveConversations()
  }

  // 새 대화로 이동
  chatStore.clearMessages()
  conversationStore.setCurrentConversation(null)
  router.push('/')
}
</script>

<style lang="scss" scoped>
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.new-chat-button {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--hover-bg);
    border-color: var(--accent-color);
  }

  svg {
    flex-shrink: 0;
  }
}

.toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--hover-bg);
    color: var(--text-primary);
  }
}
</style>
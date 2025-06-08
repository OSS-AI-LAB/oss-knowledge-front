<template>
  <div class="conversation-list">
    <!-- 검색 입력 -->
    <div class="search-wrapper">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="search-icon">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="대화 검색..."
        class="search-input"
      />
    </div>

    <!-- 대화 목록 -->
    <div class="conversations-container">
      <div v-if="groupedConversations.today.length > 0" class="conversation-group">
        <h3 class="group-title">오늘</h3>
        <ConversationItem
          v-for="conversation in groupedConversations.today"
          :key="conversation.id"
          :conversation="conversation"
          :active="conversation.id === route.params.id"
          @click="selectConversation(conversation.id)"
          @delete="deleteConversation(conversation.id)"
          @rename="renameConversation(conversation.id)"
        />
      </div>

      <div v-if="groupedConversations.yesterday.length > 0" class="conversation-group">
        <h3 class="group-title">어제</h3>
        <ConversationItem
          v-for="conversation in groupedConversations.yesterday"
          :key="conversation.id"
          :conversation="conversation"
          :active="conversation.id === route.params.id"
          @click="selectConversation(conversation.id)"
          @delete="deleteConversation(conversation.id)"
          @rename="renameConversation(conversation.id)"
        />
      </div>

      <div v-if="groupedConversations.week.length > 0" class="conversation-group">
        <h3 class="group-title">지난 7일</h3>
        <ConversationItem
          v-for="conversation in groupedConversations.week"
          :key="conversation.id"
          :conversation="conversation"
          :active="conversation.id === route.params.id"
          @click="selectConversation(conversation.id)"
          @delete="deleteConversation(conversation.id)"
          @rename="renameConversation(conversation.id)"
        />
      </div>

      <div v-if="groupedConversations.month.length > 0" class="conversation-group">
        <h3 class="group-title">지난 30일</h3>
        <ConversationItem
          v-for="conversation in groupedConversations.month"
          :key="conversation.id"
          :conversation="conversation"
          :active="conversation.id === route.params.id"
          @click="selectConversation(conversation.id)"
          @delete="deleteConversation(conversation.id)"
          @rename="renameConversation(conversation.id)"
        />
      </div>

      <div v-if="groupedConversations.older.length > 0" class="conversation-group">
        <h3 class="group-title">이전</h3>
        <ConversationItem
          v-for="conversation in groupedConversations.older"
          :key="conversation.id"
          :conversation="conversation"
          :active="conversation.id === route.params.id"
          @click="selectConversation(conversation.id)"
          @delete="deleteConversation(conversation.id)"
          @rename="renameConversation(conversation.id)"
        />
      </div>

      <!-- 대화 없음 -->
      <div v-if="filteredConversations.length === 0" class="empty-conversations">
        <p>{{ searchQuery ? '검색 결과가 없습니다' : '대화가 없습니다' }}</p>
      </div>
    </div>

    <!-- 하단 액션 -->
    <div class="sidebar-footer">
      <button class="clear-button" @click="showClearConfirm = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
        </svg>
        <span>모든 대화 삭제</span>
      </button>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showClearConfirm" class="confirm-modal" @click.self="showClearConfirm = false">
      <div class="confirm-dialog">
        <h3>모든 대화를 삭제하시겠습니까?</h3>
        <p>이 작업은 취소할 수 없습니다.</p>
        <div class="confirm-actions">
          <button @click="showClearConfirm = false" class="cancel-btn">취소</button>
          <button @click="clearAllConversations" class="confirm-btn">삭제</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConversationStore } from '@/stores/conversations'
import ConversationItem from './ConversationItem.vue'

const router = useRouter()
const route = useRoute()
const conversationStore = useConversationStore()

const searchQuery = ref('')
const showClearConfirm = ref(false)

// 필터된 대화 목록
const filteredConversations = computed(() => {
  conversationStore.setSearchQuery(searchQuery.value)
  return conversationStore.filteredConversations
})

// 날짜별 그룹화
const groupedConversations = computed(() => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(today)
  monthAgo.setDate(monthAgo.getDate() - 30)

  const groups = {
    today: [],
    yesterday: [],
    week: [],
    month: [],
    older: []
  }

  filteredConversations.value.forEach(conv => {
    const date = new Date(conv.updatedAt || conv.createdAt)

    if (date >= today) {
      groups.today.push(conv)
    } else if (date >= yesterday) {
      groups.yesterday.push(conv)
    } else if (date >= weekAgo) {
      groups.week.push(conv)
    } else if (date >= monthAgo) {
      groups.month.push(conv)
    } else {
      groups.older.push(conv)
    }
  })

  return groups
})

// 대화 선택
const selectConversation = (id) => {
  router.push(`/chat/${id}`)
}

// 대화 삭제
const deleteConversation = async (id) => {
  await conversationStore.deleteConversation(id)

  if (route.params.id === id) {
    router.push('/')
  }
}

// 대화 이름 변경
const renameConversation = async (id) => {
  const conversation = conversationStore.conversations.find(c => c.id === id)
  if (!conversation) return

  const newTitle = prompt('새 이름을 입력하세요:', conversation.title)
  if (newTitle && newTitle.trim()) {
    await conversationStore.renameConversation(id, newTitle.trim())
  }
}

// 모든 대화 삭제
const clearAllConversations = async () => {
  await conversationStore.clearAllConversations()
  showClearConfirm.value = false
  router.push('/')
}
</script>

<style lang="scss" scoped>
.conversation-list {
  display: flex;
  flex-direction: column;
  height: calc(100% - 73px);
}

.search-wrapper {
  position: relative;
  padding: 12px 16px;

  .search-icon {
    position: absolute;
    left: 28px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: var(--accent-color);
    }

    &::placeholder {
      color: var(--text-tertiary);
    }
  }
}

.conversations-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

.conversation-group {
  margin-bottom: 16px;

  .group-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    padding: 8px;
    letter-spacing: 0.5px;
  }
}

.empty-conversations {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);

  .clear-button {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: var(--hover-bg);
      color: #ef4444;
    }
  }
}

.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-dialog {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;

  h3 {
    font-size: 18px;
    margin-bottom: 12px;
  }

  p {
    color: var(--text-secondary);
    margin-bottom: 24px;
  }

  .confirm-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    button {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cancel-btn {
      background: none;
      border: 1px solid var(--border-color);
      color: var(--text-primary);

      &:hover {
        background-color: var(--hover-bg);
      }
    }

    .confirm-btn {
      background-color: #ef4444;
      border: none;
      color: white;

      &:hover {
        background-color: #dc2626;
      }
    }
  }
}
</style>
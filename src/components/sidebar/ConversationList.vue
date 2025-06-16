<template>
  <div class="conversation-list">
    <div v-if="loading" class="loading-state">
      <LoadingSpinner />
    </div>

    <div v-else-if="sortedConversations.length === 0" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <p>No conversations yet</p>
      <p class="empty-hint">Start a new chat to begin</p>
    </div>

    <div v-else class="conversations">
      <!-- Today -->
      <div v-if="conversationsByDate.today.length > 0" class="conversation-group">
        <h3 class="group-title">Today</h3>
        <ConversationItem
          v-for="conversation in conversationsByDate.today"
          :key="conversation.id"
          :conversation="conversation"
          :is-active="conversation.id === currentConversationId"
          @select="selectConversation"
          @delete="deleteConversation"
          @rename="renameConversation"
        />
      </div>

      <!-- Yesterday -->
      <div v-if="conversationsByDate.yesterday.length > 0" class="conversation-group">
        <h3 class="group-title">Yesterday</h3>
        <ConversationItem
          v-for="conversation in conversationsByDate.yesterday"
          :key="conversation.id"
          :conversation="conversation"
          :is-active="conversation.id === currentConversationId"
          @select="selectConversation"
          @delete="deleteConversation"
          @rename="renameConversation"
        />
      </div>

      <!-- This Week -->
      <div v-if="conversationsByDate.thisWeek.length > 0" class="conversation-group">
        <h3 class="group-title">This Week</h3>
        <ConversationItem
          v-for="conversation in conversationsByDate.thisWeek"
          :key="conversation.id"
          :conversation="conversation"
          :is-active="conversation.id === currentConversationId"
          @select="selectConversation"
          @delete="deleteConversation"
          @rename="renameConversation"
        />
      </div>

      <!-- This Month -->
      <div v-if="conversationsByDate.thisMonth.length > 0" class="conversation-group">
        <h3 class="group-title">This Month</h3>
        <ConversationItem
          v-for="conversation in conversationsByDate.thisMonth"
          :key="conversation.id"
          :conversation="conversation"
          :is-active="conversation.id === currentConversationId"
          @select="selectConversation"
          @delete="deleteConversation"
          @rename="renameConversation"
        />
      </div>

      <!-- Older -->
      <div v-if="conversationsByDate.older.length > 0" class="conversation-group">
        <h3 class="group-title">Older</h3>
        <ConversationItem
          v-for="conversation in conversationsByDate.older"
          :key="conversation.id"
          :conversation="conversation"
          :is-active="conversation.id === currentConversationId"
          @select="selectConversation"
          @delete="deleteConversation"
          @rename="renameConversation"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useConversationStore } from '@/stores/conversation'
import { useUIStore } from '@/stores/ui'
import ConversationItem from './ConversationItem.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const conversationStore = useConversationStore()
const uiStore = useUIStore()

// State
const loading = ref(false)

// Computed
const sortedConversations = computed(() => conversationStore.sortedConversations)
const conversationsByDate = computed(() => conversationStore.conversationsByDate)
const currentConversationId = computed(() => conversationStore.currentConversationId)

// Methods
function selectConversation(conversationId) {
  conversationStore.selectConversation(conversationId)
  router.push(`/c/${conversationId}`)

  // Close sidebar on mobile
  if (uiStore.isMobile) {
    uiStore.hideSidebar()
  }
}

function deleteConversation(conversationId) {
  conversationStore.deleteConversation(conversationId)
}

function renameConversation(conversationId, newTitle) {
  conversationStore.renameConversation(conversationId, newTitle)
}
</script>

<style scoped>
.conversation-list {
  height: 100%;
  overflow-y: auto;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-2xl);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-text-secondary);

  .empty-icon {
    width: 48px;
    height: 48px;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: var(--font-size-sm);
  }

  .empty-hint {
    margin-top: var(--spacing-xs);
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }
}

.conversations {
  padding-bottom: var(--spacing-md);
}

.conversation-group {
  margin-bottom: var(--spacing-lg);

  &:last-child {
    margin-bottom: 0;
  }
}

.group-title {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-xs);
}
</style>
<template>
  <aside class="sidebar" :class="{ 'sidebar-visible': sidebarVisible }">
    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <button @click="handleNewChat" class="new-chat-button">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>New chat</span>
      </button>

      <button @click="toggleSidebar" class="close-button" v-if="isMobile">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Search -->
    <div class="search-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search conversations..."
        class="search-input"
      />
    </div>

    <!-- Conversations List -->
    <div class="conversations-container">
      <ConversationList />
    </div>

    <!-- Sidebar Footer -->
    <div class="sidebar-footer">
      <button @click="toggleSettings" class="footer-button">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Settings</span>
      </button>

      <button @click="toggleDarkMode" class="footer-button">
        <svg v-if="!isDarkMode" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span>{{ isDarkMode ? 'Light' : 'Dark' }} mode</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useConversationStore } from '@/stores/conversation'
import { useChatStore } from '@/stores/chat'
import ConversationList from './ConversationList.vue'

const router = useRouter()
const uiStore = useUIStore()
const conversationStore = useConversationStore()
const chatStore = useChatStore()

// Computed
const sidebarVisible = computed(() => uiStore.sidebarVisible)
const isMobile = computed(() => uiStore.isMobile)
const isDarkMode = computed(() => uiStore.isDarkMode)
const searchQuery = computed({
  get: () => conversationStore.searchQuery,
  set: (value) => conversationStore.setSearchQuery(value)
})

// Methods
function toggleSidebar() {
  uiStore.toggleSidebar()
}

function toggleSettings() {
  uiStore.toggleSettings()
}

function toggleDarkMode() {
  uiStore.toggleDarkMode()
}

function handleNewChat() {
  router.push('/')
  conversationStore.currentConversationId = null
  chatStore.clearMessages()

  // Close sidebar on mobile
  if (isMobile.value) {
    uiStore.hideSidebar()
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background-color: var(--color-sidebar);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform var(--transition-base);
  z-index: 1000;
}

.sidebar-visible {
  transform: translateX(0);
}

.sidebar-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.new-chat-button {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);

  &:hover {
    background-color: var(--color-primary-hover);
  }

  .icon {
    width: 18px;
    height: 18px;
  }
}

.close-button {
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

  &:hover {
    background-color: var(--color-background);
    color: var(--color-text-primary);
  }

  .icon {
    width: 20px;
    height: 20px;
  }
}

.search-container {
  padding: var(--spacing-md);
}

.search-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);

  &::placeholder {
    color: var(--color-text-tertiary);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(217, 119, 87, 0.1);
  }
}

.conversations-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.footer-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;

  &:hover {
    background-color: var(--color-background);
    color: var(--color-text-primary);
  }

  .icon {
    width: 18px;
    height: 18px;
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
  }
}
</style>
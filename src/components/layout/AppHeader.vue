<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Left section -->
      <div class="header-left">
        <button
          @click="toggleSidebar"
          class="menu-button"
          :class="{ 'is-active': sidebarVisible }"
          title="Toggle sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 class="app-title">Claude</h1>
      </div>

      <!-- Center section -->
      <div class="header-center">
        <div v-if="currentConversation" class="current-conversation">
          <span class="conversation-name">{{ currentConversation.title }}</span>
        </div>
      </div>

      <!-- Right section -->
      <div class="header-right">
        <button @click="toggleShortcuts" class="icon-button" title="Keyboard shortcuts">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>

        <button @click="shareConversation" class="icon-button" title="Share conversation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.632 4.268C18.114 15.938 18 16.482 18 17c0 .482.114.938.316 1.342m0-2.684a3 3 0 110 2.684M9.316 10.658C9.114 11.062 9 11.518 9 12c0 .482.114.938.316 1.342M15 10.5a3 3 0 110 3m-9.316-.658A3 3 0 013 12a3 3 0 012.684-2.342" />
          </svg>
        </button>

        <div class="user-menu">
          <button @click="toggleUserMenu" class="user-button">
            <div class="user-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </button>

          <!-- User dropdown menu -->
          <transition name="dropdown">
            <div v-if="showUserMenu" class="dropdown-menu">
              <div class="menu-header">
                <div class="user-info">
                  <span class="user-name">User</span>
                  <span class="user-email">user@example.com</span>
                </div>
              </div>

              <div class="menu-divider"></div>

              <button @click="openSettings" class="menu-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>

              <button @click="logout" class="menu-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log out
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Keyboard shortcuts modal -->
    <KeyboardShortcuts
      v-if="showShortcuts"
      @close="toggleShortcuts"
    />
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useConversationStore } from '@/stores/conversation'
import KeyboardShortcuts from '@/components/common/KeyboardShortcuts.vue'

const uiStore = useUIStore()
const conversationStore = useConversationStore()

// State
const showUserMenu = ref(false)
const showShortcuts = ref(false)

// Computed
const sidebarVisible = computed(() => uiStore.sidebarVisible)
const currentConversation = computed(() => conversationStore.currentConversation)

// Methods
function toggleSidebar() {
  uiStore.toggleSidebar()
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function toggleShortcuts() {
  showShortcuts.value = !showShortcuts.value
}

function shareConversation() {
  if (currentConversation.value) {
    // Implement share functionality
    const shareUrl = `${window.location.origin}/c/${currentConversation.value.id}`
    navigator.clipboard.writeText(shareUrl)
    alert('Conversation link copied to clipboard!')
  }
}

function openSettings() {
  showUserMenu.value = false
  uiStore.toggleSettings()
}

function logout() {
  // Implement logout
  showUserMenu.value = false
  localStorage.removeItem('authToken')
  window.location.href = '/login'
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
  const userMenu = document.querySelector('.user-menu')
  if (userMenu && !userMenu.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-header {
  height: var(--header-height);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-md);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--color-sidebar);
    color: var(--color-text-primary);
  }

  &.is-active {
    color: var(--color-primary);
  }

  svg {
    width: 24px;
    height: 24px;
  }
}

.app-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
}

.current-conversation {
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.conversation-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--color-sidebar);
    color: var(--color-text-primary);
  }

  svg {
    width: 20px;
    height: 20px;
  }
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: var(--radius-round);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--color-sidebar);
  }
}

.user-avatar {
  width: 32px;
  height: 32px;
  background-color: var(--color-primary);
  border-radius: var(--radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 18px;
    height: 18px;
  }
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  width: 240px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 1000;
}

.menu-header {
  padding: var(--spacing-md);
  background-color: var(--color-sidebar);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.user-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.user-email {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.menu-divider {
  height: 1px;
  background-color: var(--color-border);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;

  &:hover {
    background-color: var(--color-sidebar);
  }

  svg {
    width: 18px;
    height: 18px;
    color: var(--color-text-secondary);
  }
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition-fast);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .header-center {
    display: none;
  }

  .app-title {
    font-size: var(--font-size-base);
  }

  .icon-button:not(.user-button) {
    display: none;
  }
}
</style>
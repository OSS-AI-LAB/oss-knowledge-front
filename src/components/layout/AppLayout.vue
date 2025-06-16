<template>
  <div class="app-layout" :class="{ 'sidebar-open': sidebarVisible }">
    <!-- Sidebar -->
    <SideBar />

    <!-- Mobile overlay -->
    <div
      v-if="isMobile && sidebarVisible"
      class="mobile-overlay"
      @click="hideSidebar"
    />

    <!-- Main content -->
    <div class="main-content">
      <AppHeader />
      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import SideBar from '@/components/sidebar/SideBar.vue'
import AppHeader from './AppHeader.vue'

const uiStore = useUIStore()

const sidebarVisible = computed(() => uiStore.sidebarVisible)
const isMobile = computed(() => uiStore.isMobile)

function hideSidebar() {
  uiStore.hideSidebar()
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: margin-left var(--transition-base);
}

.sidebar-open .main-content {
  margin-left: var(--sidebar-width);
}

.content {
  flex: 1;
  overflow: hidden;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn var(--transition-fast);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .sidebar-open .main-content {
    margin-left: 0;
  }
}
</style>
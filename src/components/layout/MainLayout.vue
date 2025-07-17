<template>
  <div class="h-screen flex overflow-hidden">
    <!-- 사이드바 -->
    <Sidebar />

    <!-- 메인 컨텐츠 -->
    <div class="flex-1 flex flex-col min-w-0 min-h-0">
      <!-- 헤더 -->
      <div class="flex-shrink-0">
        <Header />
      </div>

      <!-- 메인 컨텐츠 영역 - 남은 공간 모두 사용 -->
      <main class="flex-1 min-h-0 overflow-hidden">
        <router-view />
      </main>
    </div>

    <!-- 에러 메시지 -->
    <ErrorMessage
      :show="uiStore.error"
      :message="uiStore.errorMessage"
      @close="uiStore.clearError()"
    />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import ChatContainer from '../chat/ChatContainer.vue'
import ErrorMessage from '../common/ErrorMessage.vue'

const uiStore = useUIStore()

// 화면 크기 변경 감지
const handleResize = () => {
  uiStore.checkScreenSize()
}

onMounted(() => {
  uiStore.initSidebar()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
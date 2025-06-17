<template>
  <header class="bg-white border-b border-gray-200 shadow-sm">
    <div class="px-6 py-3 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <!-- 사이드바 토글 버튼 (모바일에서만 표시) -->
        <button
          @click="uiStore.toggleSidebar()"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 md:hidden"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Claude 로고와 모델명 -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-xl text-gray-900">OSS Knowledge</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">

        <!-- 사용자 메뉴 -->
        <div class="relative">
          <button
            @click="isUserMenuOpen = !isUserMenuOpen"
            class="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-medium text-sm">
              NJ
            </div>
          </button>

          <!-- 사용자 드롭다운 메뉴 -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-1"
          >
            <div
              v-if="isUserMenuOpen"
              class="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
            >
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900">NJ</p>
                <p class="text-xs text-gray-500">nj@example.com</p>
              </div>

              <button class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                설정
              </button>
              <button class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                도움말
              </button>
              <hr class="my-1 border-gray-100">
              <button class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                로그아웃
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 오버레이 (드롭다운이 열려있을 때) -->
    <div
      v-if="isModelDropdownOpen || isUserMenuOpen"
      @click="closeAllDropdowns"
      class="fixed inset-0 z-40"
    ></div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()

const isModelDropdownOpen = ref(false)
const isUserMenuOpen = ref(false)

// 사용 가능한 모델들
const models = ref([
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    description: '균형잡힌 성능과 속도를 제공하는 일반적인 용도의 모델'
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    description: '최고 성능의 모델, 복잡한 작업에 최적화'
  },
  {
    id: 'claude-haiku-4',
    name: 'Claude Haiku 4',
    description: '빠른 응답 속도를 제공하는 경량 모델'
  }
])

const selectedModel = ref(models.value[0])

// 모델 선택
const selectModel = (model) => {
  selectedModel.value = model
  isModelDropdownOpen.value = false
  // TODO: 실제 모델 변경 로직 구현
  console.log('모델 변경:', model.name)
}

// 모든 드롭다운 닫기
const closeAllDropdowns = () => {
  isModelDropdownOpen.value = false
  isUserMenuOpen.value = false
}

// ESC 키로 드롭다운 닫기
const handleEscape = (event) => {
  if (event.key === 'Escape') {
    closeAllDropdowns()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>
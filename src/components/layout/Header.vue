<template>
  <header class="border-b shadow-sm header" style="border-color: var(--color-border-light); background-color: var(--color-bg-primary)">
    <div class="px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <!-- 사이드바 토글 버튼 (모바일에서만 표시) -->
        <button
          @click="uiStore.toggleSidebar()"
          class="p-2 rounded-lg transition-all duration-200 md:hidden"
          style="color: var(--color-gray-600)"
          onmouseover="this.style.backgroundColor='var(--color-gray-100)'"
          onmouseout="this.style.backgroundColor='transparent'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- 로고와 제목 -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span class="font-semibold text-lg" style="color: var(--color-gray-900)">OSS Knowledge</span>
          </div>
          
          <!-- 모드 토글 (데스크톱에서만 표시) -->
          <div class="hidden md:block">
            <ModeToggle />
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- 사용자 메뉴 -->
        <div class="relative">
          <button
            @click="isUserMenuOpen = !isUserMenuOpen"
            class="flex items-center gap-2 p-2 rounded-lg transition-all duration-200"
            style="color: var(--color-gray-600)"
            onmouseover="this.style.backgroundColor='var(--color-gray-100)'"
            onmouseout="this.style.backgroundColor='transparent'"
          >
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm" style="background-color: var(--color-gray-800); color: white">
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
              class="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg py-2 z-50"
              style="background-color: var(--color-bg-primary); border: 1px solid var(--color-border-light)"
            >
              <div class="px-4 py-3" style="border-bottom: 1px solid var(--color-border-light)">
                <p class="text-sm font-medium" style="color: var(--color-gray-900)">NJ</p>
                <p class="text-xs" style="color: var(--color-gray-500)">사용자</p>
              </div>

              <button class="w-full px-4 py-2 text-left text-sm transition-colors duration-200 flex items-center gap-2" style="color: var(--color-gray-700)" onmouseover="this.style.backgroundColor='var(--color-gray-50)'" onmouseout="this.style.backgroundColor='transparent'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                설정
              </button>
              <button class="w-full px-4 py-2 text-left text-sm transition-colors duration-200 flex items-center gap-2" style="color: var(--color-gray-700)" onmouseover="this.style.backgroundColor='var(--color-gray-50)'" onmouseout="this.style.backgroundColor='transparent'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                도움말
              </button>
              <hr class="my-1" style="border-color: var(--color-border-light)">
              <button class="w-full px-4 py-2 text-left text-sm transition-colors duration-200 flex items-center gap-2" style="color: var(--color-gray-700)" onmouseover="this.style.backgroundColor='var(--color-gray-50)'" onmouseout="this.style.backgroundColor='transparent'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                로그아웃
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 오버레이 (드롭다운이 열려있을 때) -->
    <div
      v-if="isUserMenuOpen"
      @click="closeAllDropdowns"
      class="fixed inset-0 z-40"
    ></div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import ModeToggle from '@/components/common/ModeToggle.vue'

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
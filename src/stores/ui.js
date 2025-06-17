import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // 사이드바 상태
  const isSidebarOpen = ref(window.innerWidth >= 768)
  const isMobile = ref(window.innerWidth < 768)

  // 로딩 상태
  const isLoading = ref(false)
  const loadingMessage = ref('')

  // 에러 상태
  const error = ref(null)
  const errorMessage = ref('')

  // 사이드바 토글
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
    // 세션 저장
    localStorage.setItem('sidebarOpen', isSidebarOpen.value)
  }

  // 사이드바 상태 초기화
  const initSidebar = () => {
    const saved = localStorage.getItem('sidebarOpen')
    if (saved !== null) {
      isSidebarOpen.value = saved === 'true'
    }
  }

  // 로딩 상태 설정
  const setLoading = (loading, message = '') => {
    isLoading.value = loading
    loadingMessage.value = message
  }

  // 에러 설정
  const setError = (errorMsg) => {
    error.value = true
    errorMessage.value = errorMsg

    // 5초 후 에러 메시지 자동 제거
    setTimeout(() => {
      error.value = false
      errorMessage.value = ''
    }, 5000)
  }

  // 에러 초기화
  const clearError = () => {
    error.value = false
    errorMessage.value = ''
  }

  // 화면 크기 체크
  const checkScreenSize = () => {
    isMobile.value = window.innerWidth < 768
    if (isMobile.value && isSidebarOpen.value) {
      isSidebarOpen.value = false
    }
  }

  return {
    isSidebarOpen,
    isMobile,
    isLoading,
    loadingMessage,
    error,
    errorMessage,
    toggleSidebar,
    initSidebar,
    setLoading,
    setError,
    clearError,
    checkScreenSize
  }
})
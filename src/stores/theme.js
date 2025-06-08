import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref('light')
  const isDark = ref(false)

  // 테마 초기화
  const initTheme = () => {
    // 저장된 테마 불러오기
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme) {
      theme.value = savedTheme
    } else {
      // 시스템 테마 감지
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }

    applyTheme()
  }

  // 테마 적용
  const applyTheme = () => {
    isDark.value = theme.value === 'dark'
    document.documentElement.setAttribute('data-theme', theme.value)

    // 메타 테마 색상 업데이트
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark.value ? '#212121' : '#ffffff')
    }
  }

  // 테마 토글
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme()
    localStorage.setItem('theme', theme.value)
  }

  // 테마 설정
  const setTheme = (newTheme) => {
    if (['light', 'dark', 'system'].includes(newTheme)) {
      if (newTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        theme.value = prefersDark ? 'dark' : 'light'
      } else {
        theme.value = newTheme
      }
      applyTheme()
      localStorage.setItem('theme', newTheme)
    }
  }

  // 시스템 테마 변경 감지
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'system' || !savedTheme) {
      theme.value = e.matches ? 'dark' : 'light'
      applyTheme()
    }
  })

  return {
    theme,
    isDark,
    initTheme,
    toggleTheme,
    setTheme
  }
})
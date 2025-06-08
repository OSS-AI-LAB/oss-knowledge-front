<template>
  <button
    class="theme-toggle"
    @click="toggleTheme"
    :title="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
  >
    <svg v-if="!isDark" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <!-- 해 아이콘 -->
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
      <!-- 달 아이콘 -->
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const isDark = computed(() => themeStore.isDark)

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<style lang="scss" scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--hover-bg);
    color: var(--text-primary);
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:active svg {
    transform: scale(0.95);
  }
}
</style>
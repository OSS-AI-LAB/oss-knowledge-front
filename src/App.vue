<template>
  <div id="app" class="app-container">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

onMounted(() => {
  // 초기 테마 설정
  themeStore.initTheme()
})
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f7f7f8;
  --bg-tertiary: #ececf1;
  --text-primary: #0e0e0e;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  --border-color: #e5e5e5;
  --accent-color: #0066ff;
  --hover-bg: #f0f0f0;
  --code-bg: #f4f4f4;
  --sidebar-width: 260px;
}

[data-theme="dark"] {
  --bg-primary: #212121;
  --bg-secondary: #2d2d2d;
  --bg-tertiary: #3d3d3d;
  --text-primary: #ffffff;
  --text-secondary: #c0c0c0;
  --text-tertiary: #888888;
  --border-color: #404040;
  --accent-color: #4a9eff;
  --hover-bg: #333333;
  --code-bg: #1e1e1e;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* 스크롤바 스타일 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}
</style>
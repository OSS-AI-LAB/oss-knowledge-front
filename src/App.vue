<template>
  <div id="app" :class="{ 'sidebar-collapsed': !sidebarVisible }">
    <AppLayout>
      <RouterView />
    </AppLayout>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import AppLayout from '@/components/layout/AppLayout.vue'

const uiStore = useUIStore()
const sidebarVisible = computed(() => uiStore.sidebarVisible)
</script>

<style>
/* CSS 변수 정의 - Claude 디자인 시스템 */
:root {
  /* Colors */
  --color-primary: #D97757;
  --color-primary-hover: #C86646;
  --color-background: #FEFDFB;
  --color-surface: #FFFFFF;
  --color-sidebar: #F9F6F1;
  --color-text-primary: #1F1F1F;
  --color-text-secondary: #6B6B6B;
  --color-text-tertiary: #999999;
  --color-border: #E5E5E5;
  --color-border-light: #F0F0F0;

  /* Dark mode colors */
  --color-dark-background: #1A1A1A;
  --color-dark-surface: #2D2D2D;
  --color-dark-sidebar: #242424;
  --color-dark-text-primary: #FFFFFF;
  --color-dark-text-secondary: #CCCCCC;
  --color-dark-border: #3A3A3A;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;

  /* Typography */
  --font-family-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;

  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;

  /* Borders & Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-round: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;

  /* Layout */
  --sidebar-width: 260px;
  --header-height: 56px;
  --chat-max-width: 768px;
}

/* Global styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-family-primary);
  color: var(--color-text-primary);
  background-color: var(--color-background);
  line-height: 1.5;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.25;
  margin-bottom: var(--spacing-md);
}

h1 { font-size: var(--font-size-2xl); }
h2 { font-size: var(--font-size-xl); }
h3 { font-size: var(--font-size-lg); }
h4 { font-size: var(--font-size-base); }
h5 { font-size: var(--font-size-sm); }
h6 { font-size: var(--font-size-xs); }

p {
  margin-bottom: var(--spacing-md);
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

/* Utility classes */
.container {
  max-width: var(--chat-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  width: 100%;
}

.text-secondary {
  color: var(--color-text-secondary);
}

.text-tertiary {
  color: var(--color-text-tertiary);
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-dark-background);
    --color-surface: var(--color-dark-surface);
    --color-sidebar: var(--color-dark-sidebar);
    --color-text-primary: var(--color-dark-text-primary);
    --color-text-secondary: var(--color-dark-text-secondary);
    --color-border: var(--color-dark-border);
  }
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-round);
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  :root {
    --sidebar-width: 100%;
  }

  .container {
    padding: 0 var(--spacing-sm);
  }
}
</style>
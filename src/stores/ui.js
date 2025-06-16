import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // State
  const sidebarVisible = ref(true)
  const isMobile = ref(false)
  const isDarkMode = ref(false)
  const showSettings = ref(false)
  const showKeyboardShortcuts = ref(false)

  // Initialize from localStorage
  const savedSidebarState = localStorage.getItem('sidebarVisible')
  if (savedSidebarState !== null) {
    sidebarVisible.value = savedSidebarState === 'true'
  }

  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true'
  } else {
    // Check system preference
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // Check if mobile
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
    // Auto-hide sidebar on mobile
    if (isMobile.value && sidebarVisible.value) {
      sidebarVisible.value = false
    }
  }

  checkMobile()
  window.addEventListener('resize', checkMobile)

  // Getters
  const sidebarWidth = computed(() => {
    if (!sidebarVisible.value) return '0px'
    if (isMobile.value) return '100%'
    return '260px'
  })

  // Actions
  function toggleSidebar() {
    sidebarVisible.value = !sidebarVisible.value
    localStorage.setItem('sidebarVisible', sidebarVisible.value.toString())
  }

  function showSidebar() {
    sidebarVisible.value = true
    localStorage.setItem('sidebarVisible', 'true')
  }

  function hideSidebar() {
    sidebarVisible.value = false
    localStorage.setItem('sidebarVisible', 'false')
  }

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('darkMode', isDarkMode.value.toString())
    updateDarkMode()
  }

  function setDarkMode(value) {
    isDarkMode.value = value
    localStorage.setItem('darkMode', value.toString())
    updateDarkMode()
  }

  function updateDarkMode() {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function toggleSettings() {
    showSettings.value = !showSettings.value
  }

  function toggleKeyboardShortcuts() {
    showKeyboardShortcuts.value = !showKeyboardShortcuts.value
  }

  // Initialize dark mode
  updateDarkMode()

  // Keyboard shortcuts
  function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K: New conversation
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        // Trigger new conversation
        window.dispatchEvent(new CustomEvent('new-conversation'))
      }

      // Cmd/Ctrl + Shift + S: Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        toggleSidebar()
      }

      // Cmd/Ctrl + Shift + D: Toggle dark mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        toggleDarkMode()
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        showSettings.value = false
        showKeyboardShortcuts.value = false
      }
    })
  }

  initKeyboardShortcuts()

  return {
    // State
    sidebarVisible,
    isMobile,
    isDarkMode,
    showSettings,
    showKeyboardShortcuts,

    // Getters
    sidebarWidth,

    // Actions
    toggleSidebar,
    showSidebar,
    hideSidebar,
    toggleDarkMode,
    setDarkMode,
    toggleSettings,
    toggleKeyboardShortcuts
  }
})
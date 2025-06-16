import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Global styles
import './assets/styles/main.css'
import './assets/styles/animations.css'

// Highlight.js styles for code blocks
import 'highlight.js/styles/github.css'

const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component:', instance)
  console.error('Error info:', info)
}

// Mount app
app.mount('#app')
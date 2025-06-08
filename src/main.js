import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 스타일 임포트
import './assets/main.css'
import 'highlight.js/styles/github-dark.css'

// 앱 생성
const app = createApp(App)

// Pinia 설정
const pinia = createPinia()

// 플러그인 사용
app.use(pinia)
app.use(router)

// 전역 에러 핸들러
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
}

// 전역 속성
app.config.globalProperties.$isDev = import.meta.env.DEV

// 앱 마운트
app.mount('#app')

// 서비스 워커 등록 (PWA)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration)
      })
      .catch(error => {
        console.log('SW registration failed:', error)
      })
  })
}
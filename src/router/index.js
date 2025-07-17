import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '@/views/ChatView.vue'
import DataUploadView from '@/views/DataUploadView.vue'

const routes = [
  {
    path: '/',
    name: 'chat',
    component: ChatView
  },
  {
    path: '/upload',
    name: 'upload',
    component: DataUploadView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
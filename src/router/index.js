import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '@/views/ChatView.vue'
import AgentView from '@/views/AgentView.vue'
import DataUploadView from '@/views/DataUploadView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/DynamicHomeView.vue')
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatView
  },
  {
    path: '/agent',
    name: 'agent',
    component: AgentView
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
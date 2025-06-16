import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '@/views/ChatView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'chat',
      component: ChatView
    },
    {
      path: '/c/:conversationId',
      name: 'conversation',
      component: ChatView
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Add authentication logic here if needed
  next()
})

export default router
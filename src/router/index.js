import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/Login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/UserProfile/:viewingUser',
      name: 'UserProfile',
      component: () => import('../views/UserProfile.vue'),
      props: true
    },
    {
      path: '/UserProfile/:email?',
      name: 'UserProfile',
      component: () => import('@/views/UserProfile.vue')
   },
  ],
})  

export default router

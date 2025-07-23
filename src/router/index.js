import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: '/',       
      name: 'home',     
      component: HomeView 
    },
    { 
      path: '/Login',  
      name: 'Login',    
      component: () => import('../views/LoginView.vue') 
    },
    {
      path: '/UserProfile/:email?',
      name: 'UserProfile',
      component: () => import('@/views/UserProfile.vue')
    },
    {
      path: '/Favorites',
      name: 'Favorites',
      component: () => import('@/views/FavoritesView.vue')
    },
    {
      path: '/Favorites/:email',
      name: 'UserFavorites',
      component: () => import('@/views/userFavorites.vue')
    }
  ]
})

export default router

// ============================================================
// router/index.js - Vue Router 路由配置
// 定义所有页面路由，包含权限元数据和导航守卫
// ============================================================

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home/HomeView.vue'
import NProgress from '../utils/nprogress'
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  scrollBehavior(to, from, savedPosition) {
    void to
    void from
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/auth/AuthView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('../views/auth/AuthView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('../views/auth/AuthView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../views/auth/AuthView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/auth/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/auth/reset-password',
      name: 'reset-password',
      component: () => import('../views/auth/ResetPasswordView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/reconstruction',
      name: 'reconstruction',
      component: () => import('../views/reconstruction/ReconstructionView.vue'),
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/chat/ChatView.vue'),
    },
    {
      path: '/chat/carbon-footprint',
      name: 'carbon-footprint',
      component: () => import('../views/chat/CarbonFootprintView.vue'),
    },
    {
      path: '/chat/waste-recognition',
      name: 'waste-recognition',
      component: () => import('../views/chat/WasteRecognitionView.vue'),
    },
    {
      path: '/achievements',
      name: 'achievements',
      component: () => import('../views/achievements/AchievementsView.vue'),
    },
    {
      path: '/community',
      name: 'community',
      component: () => import('../views/community/CommunityView.vue'),
    },
    {
      path: '/volunteer',
      name: 'volunteer',
      component: () => import('../views/volunteer/VolunteerView.vue'),
    },
    {
      path: '/weather',
      name: 'weather',
      component: () => import('../views/weather/WeatherView.vue'),
    },
    {
      path: '/license',
      name: 'license',
      component: () => import('../views/system/LicenseView.vue'),
    },
    {
      path: '/tech-stack',
      name: 'tech-stack',
      component: () => import('../views/system/TechStackView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/system/ProfileView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/system/SettingsView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/system/NotFound.vue'),
    },
  ],
})

router.beforeEach(async (_, __, next) => {
  NProgress.start()

  const userStore = useUserStore()
  if (!userStore.isReady) {
    await userStore.init()
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router

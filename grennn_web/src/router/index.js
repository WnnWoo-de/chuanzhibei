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

  /**
   * 路由切换后的滚动行为
   * 1. 浏览器前进/后退时恢复历史滚动位置
   * 2. 普通页面跳转时默认回到页面顶部
   */
  scrollBehavior(to, from, savedPosition) {
    void to
    void from
    if (savedPosition) {
      return { ...savedPosition, behavior: 'auto' }
    }
    return { top: 0, behavior: 'auto' }
  },

  routes: [
    // ---- 首页与认证模块 ----
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

    // ---- 核心功能页 ----
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
      path: '/quiz',
      name: 'quiz',
      component: () => import('../views/quiz/QuizView.vue'),
    },
    {
      path: '/store',
      name: 'store',
      component: () => import('../views/store/StoreView.vue'),
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

    // ---- 系统信息页 ----
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

// 全局前置守卫：启动顶部进度条，并确保用户状态已初始化
router.beforeEach(async (_, __, next) => {
  NProgress.start()

  const userStore = useUserStore()
  if (!userStore.isReady) {
    await userStore.init()
  }

  next()
})

// 全局后置守卫：路由完成后关闭顶部进度条
router.afterEach(() => {
  NProgress.done()
})

export default router

// ============================================================
// router/index.js - Vue Router 路由配置
// 定义所有页面路由，包含权限元数据和导航守卫
// ============================================================

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NProgress from '../utils/nprogress'      // 页面加载进度条
import { useUserStore } from '../stores/user'

// 创建路由实例，使用 HTML5 History 模式
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  /**
   * 滚动行为控制
   * - 有历史记录的后退/前进：恢复原来的滚动位置
   * - 其他情况：回到顶部
   */
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },

  routes: [
    // ---- 主页 ----
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

    // ---- 认证相关页面（仅游客可访问，已登录自动跳转） ----
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { guestOnly: true },  // 已登录用户不可访问
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      // OAuth 回调页面复用登录视图处理 Token
      component: () => import('../views/auth/LoginView.vue'),
      meta: { guestOnly: true },
    },

    // ---- 核心功能模块 ----
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

    // ---- 需要登录的功能页面 ----
    {
      path: '/achievements',
      name: 'achievements',
      component: () => import('../views/achievements/AchievementsView.vue'),
      meta: { requiresAuth: true }, // 必须登录才能访问
    },
    {
      path: '/community',
      name: 'community',
      component: () => import('../views/community/CommunityView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/volunteer',
      name: 'volunteer',
      component: () => import('../views/volunteer/VolunteerView.vue'),
      meta: { requiresAuth: true },
    },

    // ---- 工具类页面（无需登录） ----
    {
      path: '/weather',
      name: 'weather',
      component: () => import('../views/weather/WeatherQuery.vue'),
    },

    // ---- 个人中心（需要登录） ----
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },

    // ---- 404 兜底路由（匹配所有未定义路径） ----
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue'),
    },
  ],
})

// ============================================================
// 路由前置守卫：权限检查 + 进度条启动
// ============================================================
router.beforeEach(async (to, from, next) => {
  // 启动顶部进度条
  NProgress.start()

  // 确保用户状态已初始化
  const userStore = useUserStore()
  if (!userStore.isReady) {
    await userStore.init()
  }

  // 需要登录的路由：未登录则重定向到登录页，保存目标路径
  if (to.meta?.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // 仅限游客的路由：已登录则重定向到首页
  if (to.meta?.guestOnly && userStore.isLoggedIn) {
    next({ path: '/' })
    return
  }

  next()
})

// ============================================================
// 路由后置钩子：进度条完成
// ============================================================
router.afterEach(() => {
  NProgress.done()
})

export default router

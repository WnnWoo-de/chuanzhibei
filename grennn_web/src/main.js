// ============================================================
// main.js - 应用入口文件
// 负责创建 Vue 应用实例、注册全局插件、配置路由守卫及挂载应用
// ============================================================

// 导入全局样式
import './assets/main.css'
import './assets/nprogress.css'
// 导入和风天气图标字体
import 'qweather-icons/font/qweather-icons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'             // 状态管理库
import ElementPlus from 'element-plus'           // UI 组件库
import { ElMessage } from 'element-plus'         // 消息提示组件
import 'element-plus/dist/index.css'             // Element Plus 样式
import * as ElementPlusIconsVue from '@element-plus/icons-vue' // Element Plus 图标集

import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/user'

// 创建 Vue 应用实例
const app = createApp(App)

// 创建 Pinia 实例并注册为插件
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 批量全局注册 Element Plus 所有图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 在挂载前初始化用户状态（读取 localStorage 中的 token 并验证）
const userStore = useUserStore(pinia)
await userStore.init()

/**
 * 安全校验重定向路径，防止开放重定向攻击
 * @param {*} redirect - 路由查询参数中的 redirect 值
 * @returns {string} 合法路径或空字符串
 */
const getRedirectPath = (redirect) => {
  if (typeof redirect !== 'string') return ''
  if (!redirect.startsWith('/')) return ''    // 必须以 / 开头，禁止外链
  if (redirect.startsWith('//')) return ''   // 禁止 // 开头（协议相对 URL）
  return redirect
}

// ============================================================
// 全局路由前置守卫
// 处理登录态检查与页面访问权限控制
// ============================================================
router.beforeEach(async (to) => {
  // 如果用户状态尚未初始化，则重新初始化
  if (!userStore.isReady) await userStore.init()

  const isLoggedIn = userStore.isLoggedIn
  // 获取安全的重定向路径
  const redirect = getRedirectPath(to.query?.redirect)

  // 需要登录的页面，未登录则跳转到登录页，并携带当前路径作为 redirect 参数
  if (to.meta?.requiresAuth && !isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // 仅限游客的页面（如登录/注册），已登录则跳转回首页或指定重定向路径
  if (to.meta?.guestOnly && isLoggedIn) {
    return redirect || { name: 'home' }
  }
})

// ============================================================
// 监听 auth:logout 自定义事件
// 当 Token 过期时，自动提示用户并跳转到登录页
// ============================================================
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('auth:logout', (event) => {
    const reason = event?.detail?.reason
    // 只处理 Token 过期的情况，用户主动退出不触发
    if (reason !== 'expired') return
    const current = router.currentRoute.value
    // 仅在需要登录的页面才提示并跳转
    if (!current?.meta?.requiresAuth) return
    ElMessage.error('登录已过期，请重新登录')
    router.replace({ name: 'login', query: { redirect: current.fullPath } })
  })
}

// 将 Vue 应用挂载到 #app DOM 节点
app.mount('#app')

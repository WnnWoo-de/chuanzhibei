// ============================================================
// main.js - 应用入口文件
// 负责创建 Vue 应用实例、注册全局插件并挂载应用
// ============================================================

import './assets/main.css'
import './assets/nprogress.css'
import '../node_modules/qweather-icons/font/qweather-icons.css'
import './theme'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ElMessage } from 'element-plus'
import { registerSW } from 'virtual:pwa-register'

import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/user'
import { installPwaSync } from '@/utils/pwaSync'

const app = createApp(App)
const pinia = createPinia()

// 判断是否处于本地开发地址；本地开发时会主动关闭 Service Worker，避免缓存干扰调试
const isLocalDevHost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname)

/** 注销当前域名下的所有 Service Worker，主要用于开发阶段清缓存 */
const unregisterServiceWorkers = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  } catch (err) {
    void err
  }
}

app.use(pinia)
app.use(router)

// 初始化用户状态
const initApp = async () => {
  const userStore = useUserStore(pinia)
  await userStore.init() // 恢复 token、用户信息、聊天记录等本地状态
  installPwaSync()       // 安装离线请求同步能力

  // 监听全局“登录过期”事件：若当前页要求登录，则自动跳回登录页
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('auth:logout', (event) => {
      const reason = event?.detail?.reason
      if (reason !== 'expired') return

      const current = router.currentRoute.value
      if (!current?.meta?.requiresAuth) return

      ElMessage.error('登录已过期，请重新登录')
      router.replace({ name: 'login', query: { redirect: current.fullPath } })
    })
  }

  // 本地开发环境禁用 SW，避免旧缓存导致页面表现与源码不一致
  if (isLocalDevHost) {
    await unregisterServiceWorkers()
  }

  app.mount('#app')

  // 生产环境注册 PWA 更新逻辑，让离线资源和新版本提示可用
  if (!isLocalDevHost) {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        ElMessage.info('发现新版本，正在后台更新 GreenSight')
        updateSW(true)
      },
      onOfflineReady() {
        ElMessage.success('离线资源已就绪，可在无网络时继续访问')
      },
      onRegisterError(error) {
        console.warn('PWA service worker 注册失败：', error)
      },
    })
    updateSW()
  }
}

initApp()

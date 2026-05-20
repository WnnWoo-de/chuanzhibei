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

const isLocalDevHost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname)

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
  await userStore.init()
  installPwaSync()

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

  if (isLocalDevHost) {
    await unregisterServiceWorkers()
  }

  app.mount('#app')

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

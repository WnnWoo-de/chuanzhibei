// ============================================================
// main.js - 应用入口文件
// 负责创建 Vue 应用实例、注册全局插件并挂载应用
// ============================================================

import './assets/main.css'
import './assets/nprogress.css'
import 'qweather-icons/font/qweather-icons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ElMessage } from 'element-plus'

import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/user'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const userStore = useUserStore(pinia)
await userStore.init()

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

app.mount('#app')

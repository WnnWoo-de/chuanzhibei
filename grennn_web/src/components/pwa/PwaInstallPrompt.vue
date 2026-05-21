<script setup>
// ============================================================
// components/pwa/PwaInstallPrompt.vue - PWA 安装提示组件
// 提供应用安装引导、离线状态提示、离线操作同步状态展示
// ============================================================

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Connection, Download } from '@element-plus/icons-vue'

/** 浏览器 beforeinstallprompt 事件对象（用于触发安装弹窗） */
const deferredPrompt = ref(null)
/** 用户是否已关闭安装提示 */
const installDismissed = ref(localStorage.getItem('pwa_install_dismissed') === 'true')
/** 当前网络是否在线 */
const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
/** 应用是否已安装为 PWA */
const isInstalled = ref(false)
/** 离线同步状态：待处理数、是否正在同步、已同步数 */
const syncState = ref({ pending: 0, flushing: false, synced: 0 })

/** 检测当前是否以独立模式（PWA）运行 */
const isStandalone = () => {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

/** 是否可以显示安装按钮（有安装事件、未被关闭、未安装） */
const canInstall = computed(() => {
  return deferredPrompt.value && !installDismissed.value && !isInstalled.value
})

/** 是否显示同步状态信息 */
const showSyncStatus = computed(() => {
  return syncState.value.flushing || syncState.value.pending > 0 || syncState.value.synced > 0
})

/** 是否显示整个状态面板（可安装 / 离线 / 有同步操作） */
const showStatus = computed(() => canInstall.value || !isOnline.value || showSyncStatus.value)

/** 同步状态的提示文字 */
const syncText = computed(() => {
  if (syncState.value.flushing) return `正在同步 ${syncState.value.pending} 项离线操作`
  if (syncState.value.pending > 0) return `${syncState.value.pending} 项操作将在联网后自动同步`
  if (syncState.value.synced > 0) return '离线操作已同步完成'
  return ''
})

/** 拦截浏览器安装提示事件，保存到 deferredPrompt 供后续使用 */
const handleBeforeInstallPrompt = (event) => {
  event.preventDefault()
  deferredPrompt.value = event
}

/** 应用安装成功后的回调 */
const handleAppInstalled = () => {
  isInstalled.value = true
  deferredPrompt.value = null
  localStorage.setItem('pwa_install_dismissed', 'true')
  ElMessage.success('GreenSight 已安装到设备')
}

/** 网络恢复在线 */
const handleOnline = () => {
  isOnline.value = true
}

/** 网络断开离线 */
const handleOffline = () => {
  isOnline.value = false
}

/** 接收 Service Worker 发来的同步状态事件 */
const handleSyncStatus = (event) => {
  syncState.value = {
    pending: Number(event.detail?.pending || 0),
    flushing: Boolean(event.detail?.flushing),
    synced: Number(event.detail?.synced || 0),
  }

  if (syncState.value.synced > 0 && syncState.value.pending === 0) {
    window.setTimeout(() => {
      syncState.value = { pending: 0, flushing: false, synced: 0 }
    }, 2600)
  }
}

/** 触发 PWA 安装弹窗 */
const installApp = async () => {
  if (!deferredPrompt.value) return

  deferredPrompt.value.prompt()
  const choice = await deferredPrompt.value.userChoice
  deferredPrompt.value = null

  if (choice.outcome === 'accepted') {
    localStorage.setItem('pwa_install_dismissed', 'true')
    installDismissed.value = true
    return
  }

  ElMessage.info('稍后仍可从浏览器菜单安装应用')
}

/** 关闭安装提示并记住用户选择 */
const dismissInstall = () => {
  installDismissed.value = true
  localStorage.setItem('pwa_install_dismissed', 'true')
}

/** 挂载时检测安装状态，注册各类事件监听 */
onMounted(() => {
  isInstalled.value = isStandalone()
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  window.addEventListener('pwa:sync-status', handleSyncStatus)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  window.removeEventListener('pwa:sync-status', handleSyncStatus)
})
</script>

<template>
  <!-- PWA 状态面板：带滑入动画的过渡容器 -->
  <Transition name="pwa-panel">
    <div v-if="showStatus" class="pwa-status" role="status" aria-live="polite">
      <!-- 同步状态：显示离线操作同步进度 -->
      <template v-if="showSyncStatus">
        <el-icon class="pwa-status__icon"><Connection /></el-icon>
        <span>{{ syncText }}</span>
      </template>

      <!-- 离线状态：提示用户当前为离线模式 -->
      <template v-else-if="!isOnline">
        <el-icon class="pwa-status__icon pwa-status__icon--offline"><Connection /></el-icon>
        <span>当前处于离线模式，已缓存页面仍可访问</span>
      </template>

      <!-- 安装引导：显示安装按钮和关闭按钮 -->
      <template v-else-if="canInstall">
        <el-icon class="pwa-status__icon"><Download /></el-icon>
        <span>安装 GreenSight，获得桌面级访问体验</span>
        <button class="pwa-status__action" type="button" @click="installApp">安装</button>
        <button class="pwa-status__close" type="button" aria-label="关闭安装提示" @click="dismissInstall">
          <el-icon><Close /></el-icon>
        </button>
      </template>
    </div>
  </Transition>
</template>

<style scoped>
/* PWA 状态面板：固定在右下角，毛玻璃效果 */
.pwa-status {
  position: fixed;
  right: clamp(16px, 3vw, 32px);
  bottom: clamp(16px, 3vw, 32px);
  z-index: 80;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: min(420px, calc(100vw - 32px));
  padding: 12px 14px;
  border: 1px solid rgba(46, 125, 50, 0.22);
  border-radius: 8px;
  color: #173820;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 16px 42px rgba(22, 64, 36, 0.16);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  font-size: 14px;
  line-height: 1.45;
}

/* 状态图标 */
.pwa-status__icon {
  flex: 0 0 auto;
  color: #2e7d32;
  font-size: 18px;
}

/* 离线状态图标（橙色警示） */
.pwa-status__icon--offline {
  color: #b45309;
}

/* 操作按钮和关闭按钮基础样式 */
.pwa-status__action,
.pwa-status__close {
  flex: 0 0 auto;
  border: 0;
  cursor: pointer;
}

/* 安装按钮（绿色圆角胶囊形） */
.pwa-status__action {
  padding: 7px 12px;
  border-radius: 999px;
  color: #fff;
  background: #2e7d32;
  font-weight: 700;
}

/* 关闭按钮（圆形） */
.pwa-status__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  color: #42624a;
  background: rgba(46, 125, 50, 0.08);
}

/* 面板滑入/滑出过渡动画 */
.pwa-panel-enter-active,
.pwa-panel-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.pwa-panel-enter-from,
.pwa-panel-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* 暗色主题适配 */
:root[data-theme='dark'] .pwa-status {
  border-color: rgba(134, 239, 172, 0.18);
  color: #e7f7ea;
  background: rgba(31, 31, 31, 0.94);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.24);
}

:root[data-theme='dark'] .pwa-status__close {
  color: #c6f6d5;
  background: rgba(134, 239, 172, 0.12);
}

/* 移动端适配：面板占满宽度 */
@media (max-width: 640px) {
  .pwa-status {
    right: 12px;
    bottom: 12px;
    left: 12px;
    max-width: none;
  }
}
</style>

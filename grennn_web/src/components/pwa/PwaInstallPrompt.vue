<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Connection, Download } from '@element-plus/icons-vue'

const deferredPrompt = ref(null)
const installDismissed = ref(localStorage.getItem('pwa_install_dismissed') === 'true')
const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
const isInstalled = ref(false)
const syncState = ref({ pending: 0, flushing: false, synced: 0 })

const isStandalone = () => {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

const canInstall = computed(() => {
  return deferredPrompt.value && !installDismissed.value && !isInstalled.value
})

const showSyncStatus = computed(() => {
  return syncState.value.flushing || syncState.value.pending > 0 || syncState.value.synced > 0
})

const showStatus = computed(() => canInstall.value || !isOnline.value || showSyncStatus.value)

const syncText = computed(() => {
  if (syncState.value.flushing) return `正在同步 ${syncState.value.pending} 项离线操作`
  if (syncState.value.pending > 0) return `${syncState.value.pending} 项操作将在联网后自动同步`
  if (syncState.value.synced > 0) return '离线操作已同步完成'
  return ''
})

const handleBeforeInstallPrompt = (event) => {
  event.preventDefault()
  deferredPrompt.value = event
}

const handleAppInstalled = () => {
  isInstalled.value = true
  deferredPrompt.value = null
  localStorage.setItem('pwa_install_dismissed', 'true')
  ElMessage.success('GreenSight 已安装到设备')
}

const handleOnline = () => {
  isOnline.value = true
}

const handleOffline = () => {
  isOnline.value = false
}

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

const dismissInstall = () => {
  installDismissed.value = true
  localStorage.setItem('pwa_install_dismissed', 'true')
}

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
  <Transition name="pwa-panel">
    <div v-if="showStatus" class="pwa-status" role="status" aria-live="polite">
      <template v-if="showSyncStatus">
        <el-icon class="pwa-status__icon"><Connection /></el-icon>
        <span>{{ syncText }}</span>
      </template>

      <template v-else-if="!isOnline">
        <el-icon class="pwa-status__icon pwa-status__icon--offline"><Connection /></el-icon>
        <span>当前处于离线模式，已缓存页面仍可访问</span>
      </template>

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

.pwa-status__icon {
  flex: 0 0 auto;
  color: #2e7d32;
  font-size: 18px;
}

.pwa-status__icon--offline {
  color: #b45309;
}

.pwa-status__action,
.pwa-status__close {
  flex: 0 0 auto;
  border: 0;
  cursor: pointer;
}

.pwa-status__action {
  padding: 7px 12px;
  border-radius: 999px;
  color: #fff;
  background: #2e7d32;
  font-weight: 700;
}

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

.pwa-panel-enter-active,
.pwa-panel-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.pwa-panel-enter-from,
.pwa-panel-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

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

@media (max-width: 640px) {
  .pwa-status {
    right: 12px;
    bottom: 12px;
    left: 12px;
    max-width: none;
  }
}
</style>

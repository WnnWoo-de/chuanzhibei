<template>
  <div>
    <!-- 侧边栏主容器：固定在左侧，根据状态动态切换宽度 -->
    <div
      class="app-sidebar fixed left-0 top-0 h-screen bg-white border-r border-black/10 transition-all duration-300 z-[200] overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col"
      :class="sidebarClasses"
    >
      <!-- 侧边栏头部：Logo + 品牌名称，mini 模式下仅显示 Logo -->
      <div
        class="flex items-center border-b border-black/10 transition-all duration-300 flex-shrink-0"
        :class="isMiniMode ? 'justify-center px-2 py-3 h-16' : 'gap-3 px-6 py-4 h-16'"
      >
        <img
          src="@/assets/logo.png"
          alt="Logo"
          class="object-contain rounded-lg shadow-sm flex-shrink-0 transition-all duration-300"
          :class="isMiniMode ? 'w-8 h-8' : 'w-10 h-10'"
        />

        <div
          class="flex flex-col overflow-hidden transition-all duration-300"
          :class="isMiniMode ? 'w-0 opacity-0' : 'opacity-100 w-auto'"
        >
          <span class="font-bold text-lg leading-none whitespace-nowrap">GreenSight</span>
          <span class="text-[10px] text-primary font-mono uppercase tracking-tighter mt-1 whitespace-nowrap">{{ langText.nav.brandTagline }}</span>
        </div>
      </div>

      <!-- 导航菜单区域：可滚动，包含分类标题和菜单项 -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-3 pt-3">
        <nav class="space-y-1">
          <div v-for="(item, index) in sidebarItems" :key="index" class="group">
            <div
              v-if="item.category"
              class="transition-all duration-300 overflow-hidden"
              :class="isMiniMode ? 'h-0 opacity-0 py-0 my-0' : 'px-3 py-2 text-xs font-mono uppercase tracking-widest text-gray-400 mt-6 mb-2'"
            >
              <span v-if="!isMiniMode">{{ langText.nav[item.categoryKey] || item.category }}</span>
              <div v-else class="my-1 border-t border-black/8"></div>
            </div>

            <button
              v-else
              type="button"
              class="w-full flex items-center rounded-lg text-sm transition-all duration-200 hover:bg-gray-50 group/item relative overflow-hidden cursor-pointer"
              :class="[
                activeNav === item.link ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700',
                isMiniMode ? 'justify-center px-0 py-2.5 w-10 mx-auto' : 'gap-3 px-3 py-2.5'
              ]"
              :title="isMiniMode ? (langText.nav[item.labelKey] || langText.common[item.labelKey] || item.label) : ''"
              @click="handleNavClick(item.link)"
            >
              <span
                v-if="!isMiniMode"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full transition-all duration-200"
                :class="activeNav === item.link ? 'opacity-100' : 'opacity-0'"
              ></span>

              <svg
                v-if="item.icon"
                class="w-5 h-5 flex-shrink-0"
                :class="activeNav === item.link ? 'text-primary' : 'text-gray-400 group-hover/item:text-gray-700'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
              >
                <path :d="item.icon" stroke-linecap="round" stroke-linejoin="round" />
              </svg>

              <span v-if="!isMiniMode" class="flex-1 whitespace-nowrap text-left">{{ langText.nav[item.labelKey] || langText.common[item.labelKey] || item.label }}</span>

              <span
                v-if="item.badge && !isMiniMode"
                class="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-mono"
              >{{ langText.nav[item.badgeKey] || item.badge }}</span>

              <span v-if="!isMiniMode" class="opacity-0 group-hover/item:opacity-100 transition-all duration-200 text-gray-400 text-xs">→</span>
            </button>
          </div>
        </nav>
      </div>
    </div>

    <!-- 展开/收起切换按钮：固定定位，始终可见 -->
    <button
      type="button"
      @click="toggleSidebarState"
      class="sidebar-toggle fixed top-3 z-[210] flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white text-black shadow-sm transition-all duration-300 hover:bg-white hover:text-black"
      :class="toggleButtonClass"
      :aria-label="isSidebarExpanded ? langText.nav.collapseSidebar : langText.nav.expandSidebar"
    >
      <div class="relative h-5 w-5 overflow-hidden">
        <svg
          class="absolute inset-0 h-5 w-5 transition-all duration-300"
          :class="isSidebarExpanded ? 'scale-75 opacity-0 -rotate-90' : 'scale-100 opacity-100 rotate-0'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

        <svg
          class="absolute inset-0 h-5 w-5 transition-all duration-300"
          :class="isSidebarExpanded ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-90'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M4.75 5.75h14.5v12.5H4.75z" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M9 5.75v12.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M14.5 9.5 11 12l3.5 2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </button>

    <!-- 移动端遮罩层：侧边栏展开时显示，点击关闭侧边栏 -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[190] bg-black/30 backdrop-blur-sm md:hidden"
      @click="emit('close')"
    ></div>
  </div>
</template>

<script setup>
// ============================================================
// TheSidebar.vue - 左侧导航栏组件
// 支持 mini（仅图标）和 full（图标+文字）两种形态
// 移动端自动切换为抽屉模式，桌面端可手动切换展开/收起
// ============================================================

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { langText } from '@/language'  // 多语言文本资源

// 接收父组件传入的属性
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

// 向父组件抛出的事件：toggle（切换展开）、close（关闭）、expand-change（展开状态变化）
const emit = defineEmits(['toggle', 'close', 'expand-change'])

const route = useRoute()
const router = useRouter()

// 默认以 mini 形态收起侧边栏
const isMini = ref(true)

// 当前激活的导航路径，用于高亮当前页面对应的菜单项
const activeNav = ref(route.path)

// 响应式判断是否为移动端（宽度 < 768px）
const isMobile = ref(window.innerWidth < 768)

// 窗口大小变化时更新移动端状态，移动端自动关闭 mini 模式
const handleResize = () => {
  const isMobileNow = window.innerWidth < 768
  if (isMobileNow !== isMobile.value) {
    isMobile.value = isMobileNow
    if (isMobileNow) {
      isMini.value = false
    }
  }
}

// 监听路由变化，实时更新当前激活的导航项
watch(
  () => route.path,
  (newPath) => {
    activeNav.value = newPath
  },
  { immediate: true }
)

// 组件挂载时：监听窗口大小变化，通知父组件当前展开状态
onMounted(() => {
  window.addEventListener('resize', handleResize)
  emit('expand-change', !isMini.value)
})

// 组件卸载时：移除窗口大小监听，防止内存泄漏
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 侧边栏是否处于展开状态：移动端取决于 isOpen，桌面端取决于 isMini
const isSidebarExpanded = computed(() => {
  if (isMobile.value) {
    return props.isOpen
  }
  return !isMini.value
})

// 是否处于 mini 模式（仅显示图标）：移动端始终为 false
const isMiniMode = computed(() => {
  if (isMobile.value) return false
  return isMini.value
})

// 侧边栏容器样式类：根据移动端/桌面端和展开状态动态计算宽度和位移
const sidebarClasses = computed(() => {
  if (isMobile.value) {
    return props.isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'
  }
  return isMiniMode.value ? 'w-14 translate-x-0' : 'w-64 translate-x-0'
})

// 展开/收起按钮的定位样式：跟随侧边栏宽度变化
const toggleButtonClass = computed(() => {
  if (isMobile.value) {
    return props.isOpen ? 'left-[264px]' : 'left-3'
  }
  return isMini.value ? 'left-[64px]' : 'left-[264px]'
})

// 收起侧边栏为 mini 模式，并持久化到 localStorage
const collapseSidebar = () => {
  isMini.value = true
  localStorage.setItem('sidebar_mini', 'true')
  emit('expand-change', false)
}

// 展开侧边栏为 full 模式，并持久化到 localStorage
const expandSidebar = () => {
  isMini.value = false
  localStorage.setItem('sidebar_mini', 'false')
  emit('expand-change', true)
}

// 切换侧边栏状态：移动端通过 emit 通知父组件，桌面端切换 mini/full
const toggleSidebarState = () => {
  if (isMobile.value) {
    emit('toggle')
    return
  }

  if (isMini.value) {
    expandSidebar()
  } else {
    collapseSidebar()
  }
}

// 平滑滚动到页面内锚点位置
const scrollToAnchor = (link) => {
  requestAnimationFrame(() => {
    document.querySelector(link)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

// 导航点击处理：锚点链接先跳转首页再滚动，路由链接直接跳转，移动端自动关闭侧边栏
const handleNavClick = async (link) => {
  activeNav.value = link

  if (link.startsWith('#')) {
    if (route.path !== '/') {
      await router.push('/')
      setTimeout(() => scrollToAnchor(link), 250)
    } else {
      scrollToAnchor(link)
    }
  } else if (route.path !== link) {
    await router.push(link)
  }

  if (isMobile.value) {
    emit('close')
  }
}

// 侧边栏导航菜单配置：包含分类标题和各菜单项（路由路径、图标、标签等）
const sidebarItems = [
  { category: '导航菜单', categoryKey: 'navigationMenu' },
  {
    label: '首页',
    labelKey: 'home',
    link: '/',
    icon: 'M3 12.5 12 4l9 8.5M5 10.75V20h4.5v-5.5h5V20H19v-9.25',
  },
  {
    label: '核心功能',
    labelKey: 'coreFeatures',
    link: '#features',
    icon: 'M13 3 4 14h7v7l9-11h-7z',
  },
  {
    label: '动态资讯',
    labelKey: 'news',
    link: '#news',
    icon: 'M5 6.5h14M5 12h14M5 17.5h8',
  },

  { category: '功能模块', categoryKey: 'featureModules' },
  {
    label: '旧物重构',
    labelKey: 'reconstruction',
    link: '/reconstruction',
    icon: 'M12 3.5 4.5 7.75v8.5L12 20.5l7.5-4.25v-8.5L12 3.5z',
  },
  {
    label: 'GS AI 对话助手',
    labelKey: 'chat',
    link: '/chat',
    icon: 'M6 7.5h12a2.5 2.5 0 0 1 2.5 2.5v4A2.5 2.5 0 0 1 18 16.5h-6l-4.5 4v-4H6A2.5 2.5 0 0 1 3.5 14v-4A2.5 2.5 0 0 1 6 7.5Z M8 12h.01M12 12h.01M16 12h.01',
  },
  {
    label: '碳足迹计算',
    labelKey: 'carbon',
    link: '/chat/carbon-footprint',
    icon: 'M12 3.5c-2.4 2.1-4.75 5.32-4.75 8.44A4.75 4.75 0 0 0 12 16.69a4.75 4.75 0 0 0 4.75-4.75C16.75 8.82 14.4 5.6 12 3.5Zm0 0V20.5M8.5 12.5c1.2.75 2.35 1.1 3.5 1.1 1.15 0 2.3-.35 3.5-1.1',
  },
  {
    label: '识别分类',
    labelKey: 'waste',
    link: '/chat/waste-recognition',
    icon: 'M8 4.75h8M9 4.75v-1h6v1M7.25 7h9.5l-.8 11.1a1.5 1.5 0 0 1-1.5 1.4h-4.9a1.5 1.5 0 0 1-1.5-1.4L7.25 7Zm2.5 3.25v5.5m4-5.5v5.5',
  },
  {
    label: '成就系统',
    labelKey: 'achievements',
    link: '/achievements',
    icon: 'M12 4.25 13.894 8.356 18.25 8.83 15 11.914 15.9 16.25 12 14.07 8.1 16.25 9 11.914 5.75 8.83 10.106 8.356 12 4.25ZM6 3.75v3.5M4.25 5.5h3.5M18 16.75v3.5m-1.75-1.75h3.5',
  },
  {
    label: '绿色问答',
    labelKey: 'quiz',
    link: '/quiz',
    icon: 'M8.25 7.75a3.75 3.75 0 1 1 5.68 3.22c-1.1.64-1.93 1.39-1.93 2.78M12 17.75h.01M4.75 4.75h14.5v14.5H4.75z',
    badge: '赚积分',
    badgeKey: 'earnPoints',
  },
  {
    label: '兑换商城',
    labelKey: 'store',
    link: '/store',
    icon: 'M6.75 8.25h10.5l-.85 10.15a1.5 1.5 0 0 1-1.5 1.35H9.1a1.5 1.5 0 0 1-1.5-1.35L6.75 8.25ZM9 8.25a3 3 0 0 1 6 0M9.25 12.25h5.5',
  },
  {
    label: '活动社区',
    labelKey: 'community',
    link: '/community',
    icon: 'M8.5 11.25a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Zm7 0a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5ZM3.75 18.25a4.75 4.75 0 0 1 8.21-3.25M20.25 18.25a4.75 4.75 0 0 0-8.21-3.25M8.5 18.25a3.5 3.5 0 0 1 7 0',
  },
  {
    label: '志愿活动',
    labelKey: 'volunteer',
    link: '/volunteer',
    icon: 'M12 20s-6.5-4.35-8.5-8.15C1.6 8.96 3.1 5.75 6.5 5.75c2.05 0 3.14 1.08 4.03 2.3.63-.96 1.98-2.3 4.47-2.3 3.39 0 4.9 3.21 3 6.1C18.5 15.65 12 20 12 20Z',
  },
  {
    label: '天气查询',
    labelKey: 'weather',
    link: '/weather',
    icon: 'M7 18.25h9a4.25 4.25 0 1 0-.68-8.445A5.5 5.5 0 0 0 4.75 12a3.25 3.25 0 0 0 2.25 6.25Z',
  },

  { category: '用户', categoryKey: 'user' },
  {
    label: '个人中心',
    labelKey: 'profile',
    link: '/profile',
    icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  },
  {
    label: '设置',
    labelKey: 'settings',
    link: '/settings',
    icon: 'M12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Zm8 3.25-.92-.24a7.86 7.86 0 0 0-.52-1.27l.53-.8a.75.75 0 0 0-.09-.95l-1.74-1.74a.75.75 0 0 0-.95-.09l-.8.53c-.41-.21-.83-.39-1.27-.52L14 4a.75.75 0 0 0-.73-.57h-2.54A.75.75 0 0 0 10 4l-.24.92c-.44.13-.86.31-1.27.52l-.8-.53a.75.75 0 0 0-.95.09L5 6.74a.75.75 0 0 0-.09.95l.53.8c-.21.41-.39-.83-.52 1.27L4 10a.75.75 0 0 0-.57.73v2.54c0 .34.23.63.57.73l.92.24c.13.44.31.86.52 1.27l-.53.8a.75.75 0 0 0 .09.95L6.74 19a.75.75 0 0 0 .95.09l.8-.53c.41.21.83.39 1.27.52L10 20a.75.75 0 0 0 .73.57h2.54A.75.75 0 0 0 14 20l.24-.92c.44-.13.86-.31 1.27-.52l.8.53a.75.75 0 0 0 .95-.09L19 17.26a.75.75 0 0 0 .09-.95l-.53-.8c.21-.41.39-.83.52-1.27L20 14a.75.75 0 0 0 .57-.73v-2.54A.75.75 0 0 0 20 10Z',
  },
]

// 挂载时通知父组件当前侧边栏展开状态
onMounted(() => {
  emit('expand-change', !isMini.value)
})
</script>

<style scoped>
/* 隐藏滚动条：兼容 Webkit 和 Firefox */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 暗色主题下侧边栏样式适配 */
:global(:root[data-theme='dark']) .app-sidebar {
  border-color: rgba(255, 255, 255, 0.1) !important;
  background: #1f1f1f !important;
  color: #f7fff8 !important;
  box-shadow: none;
}

/* 暗色主题下侧边栏文字颜色 */
:global(:root[data-theme='dark']) .app-sidebar span,
:global(:root[data-theme='dark']) .app-sidebar .text-gray-400,
:global(:root[data-theme='dark']) .app-sidebar .text-gray-700 {
  color: #dff7e3 !important;
}

:global(:root[data-theme='dark']) .app-sidebar button {
  color: #dff7e3 !important;
}

:global(:root[data-theme='dark']) .app-sidebar button:hover {
  background: rgba(115, 242, 135, 0.12) !important;
  color: #ffffff !important;
}

:global(:root[data-theme='dark']) .app-sidebar .bg-primary\/10 {
  background: #333333 !important;
  color: #ffffff !important;
}

/* 暗色主题下展开/收起按钮样式 */
:global(:root[data-theme='dark']) .sidebar-toggle {
  border-color: rgba(255, 255, 255, 0.12) !important;
  background: #2b2b2b !important;
  color: #f7fff8 !important;
}
</style>

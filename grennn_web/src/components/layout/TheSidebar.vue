<template>
  <div>
    <div
      class="fixed left-0 top-0 h-screen bg-white border-r border-black/10 transition-all duration-300 z-[200] overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col"
      :class="sidebarClasses"
    >
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
          <span class="text-[10px] text-primary font-mono uppercase tracking-tighter mt-1 whitespace-nowrap">绿我同行</span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-3 pt-3">
        <nav class="space-y-1">
          <div v-for="(item, index) in sidebarItems" :key="index" class="group">
            <div
              v-if="item.category"
              class="transition-all duration-300 overflow-hidden"
              :class="isMiniMode ? 'h-0 opacity-0 py-0 my-0' : 'px-3 py-2 text-xs font-mono uppercase tracking-widest text-gray-400 mt-6 mb-2'"
            >
              <span v-if="!isMiniMode">{{ item.category }}</span>
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
              :title="isMiniMode ? item.label : ''"
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

              <span v-if="!isMiniMode" class="flex-1 whitespace-nowrap text-left">{{ item.label }}</span>

              <span
                v-if="item.badge && !isMiniMode"
                class="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-mono"
              >{{ item.badge }}</span>

              <span v-if="!isMiniMode" class="opacity-0 group-hover/item:opacity-100 transition-all duration-200 text-gray-400 text-xs">→</span>
            </button>
          </div>
        </nav>
      </div>
    </div>

    <button
      type="button"
      @click="toggleSidebarState"
      class="fixed top-3 z-[210] flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white text-black shadow-sm transition-all duration-300 hover:bg-white hover:text-black"
      :class="toggleButtonClass"
      :aria-label="isSidebarExpanded ? '收起侧边栏' : '展开侧边栏'"
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

    <div
      v-if="isOpen"
      class="fixed inset-0 z-[190] bg-black/30 backdrop-blur-sm md:hidden"
      @click="emit('close')"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle', 'close', 'expand-change'])

const route = useRoute()
const router = useRouter()

// 默认以 mini 形态收起侧边栏
const isMini = ref(true)
const activeNav = ref(route.path)

// 响应式判断移动端
const isMobile = ref(window.innerWidth < 768)

const handleResize = () => {
  const isMobileNow = window.innerWidth < 768
  if (isMobileNow !== isMobile.value) {
    isMobile.value = isMobileNow
    if (isMobileNow) {
      isMini.value = false
    }
  }
}

watch(
  () => route.path,
  (newPath) => {
    activeNav.value = newPath
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('resize', handleResize)
  emit('expand-change', !isMini.value)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const isSidebarExpanded = computed(() => {
  if (isMobile.value) {
    return props.isOpen
  }
  return !isMini.value
})

const isMiniMode = computed(() => {
  if (isMobile.value) return false
  return isMini.value
})

const sidebarClasses = computed(() => {
  if (isMobile.value) {
    return props.isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'
  }
  return isMiniMode.value ? 'w-14 translate-x-0' : 'w-64 translate-x-0'
})

const toggleButtonClass = computed(() => {
  if (isMobile.value) {
    return props.isOpen ? 'left-[264px]' : 'left-3'
  }
  return isMini.value ? 'left-[64px]' : 'left-[264px]'
})

const collapseSidebar = () => {
  isMini.value = true
  localStorage.setItem('sidebar_mini', 'true')
  emit('expand-change', false)
}

const expandSidebar = () => {
  isMini.value = false
  localStorage.setItem('sidebar_mini', 'false')
  emit('expand-change', true)
}

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

const scrollToAnchor = (link) => {
  requestAnimationFrame(() => {
    document.querySelector(link)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

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

const sidebarItems = [
  { category: '导航菜单' },
  {
    label: '首页',
    link: '/',
    icon: 'M3 12.5 12 4l9 8.5M5 10.75V20h4.5v-5.5h5V20H19v-9.25',
  },
  {
    label: '核心功能',
    link: '#features',
    icon: 'M13 3 4 14h7v7l9-11h-7z',
  },
  {
    label: '动态资讯',
    link: '#news',
    icon: 'M5 6.5h14M5 12h14M5 17.5h8',
  },

  { category: '功能模块' },
  {
    label: '旧物重构',
    link: '/reconstruction',
    icon: 'M12 3.5 4.5 7.75v8.5L12 20.5l7.5-4.25v-8.5L12 3.5z',
  },
  {
    label: 'GreenSight- AI助手',
    link: '/chat',
    icon: 'M6 7.5h12a2.5 2.5 0 0 1 2.5 2.5v4A2.5 2.5 0 0 1 18 16.5h-6l-4.5 4v-4H6A2.5 2.5 0 0 1 3.5 14v-4A2.5 2.5 0 0 1 6 7.5Z M8 12h.01M12 12h.01M16 12h.01',
  },
  {
    label: '碳足迹计算',
    link: '/chat/carbon-footprint',
    icon: 'M12 3.5c-2.4 2.1-4.75 5.32-4.75 8.44A4.75 4.75 0 0 0 12 16.69a4.75 4.75 0 0 0 4.75-4.75C16.75 8.82 14.4 5.6 12 3.5Zm0 0V20.5M8.5 12.5c1.2.75 2.35 1.1 3.5 1.1 1.15 0 2.3-.35 3.5-1.1',
  },
  {
    label: '识别分类',
    link: '/chat/waste-recognition',
    icon: 'M8 4.75h8M9 4.75v-1h6v1M7.25 7h9.5l-.8 11.1a1.5 1.5 0 0 1-1.5 1.4h-4.9a1.5 1.5 0 0 1-1.5-1.4L7.25 7Zm2.5 3.25v5.5m4-5.5v5.5',
  },
  {
    label: '成就系统',
    link: '/achievements',
    icon: 'M12 4.25 13.894 8.356 18.25 8.83 15 11.914 15.9 16.25 12 14.07 8.1 16.25 9 11.914 5.75 8.83 10.106 8.356 12 4.25ZM6 3.75v3.5M4.25 5.5h3.5M18 16.75v3.5m-1.75-1.75h3.5',
  },
  {
    label: '活动社区',
    link: '/community',
    icon: 'M8.5 11.25a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Zm7 0a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5ZM3.75 18.25a4.75 4.75 0 0 1 8.21-3.25M20.25 18.25a4.75 4.75 0 0 0-8.21-3.25M8.5 18.25a3.5 3.5 0 0 1 7 0',
  },
  {
    label: '志愿活动',
    link: '/volunteer',
    icon: 'M12 20s-6.5-4.35-8.5-8.15C1.6 8.96 3.1 5.75 6.5 5.75c2.05 0 3.14 1.08 4.03 2.3.63-.96 1.98-2.3 4.47-2.3 3.39 0 4.9 3.21 3 6.1C18.5 15.65 12 20 12 20Z',
  },
  {
    label: '天气查询',
    link: '/weather',
    icon: 'M7 18.25h9a4.25 4.25 0 1 0-.68-8.445A5.5 5.5 0 0 0 4.75 12a3.25 3.25 0 0 0 2.25 6.25Z',
  },

  { category: '用户' },
  {
    label: '个人中心',
    link: '/profile',
    icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  },
  {
    label: '设置',
    link: '/settings',
    icon: 'M12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Zm8 3.25-.92-.24a7.86 7.86 0 0 0-.52-1.27l.53-.8a.75.75 0 0 0-.09-.95l-1.74-1.74a.75.75 0 0 0-.95-.09l-.8.53c-.41-.21-.83-.39-1.27-.52L14 4a.75.75 0 0 0-.73-.57h-2.54A.75.75 0 0 0 10 4l-.24.92c-.44.13-.86.31-1.27.52l-.8-.53a.75.75 0 0 0-.95.09L5 6.74a.75.75 0 0 0-.09.95l.53.8c-.21.41-.39-.83-.52 1.27L4 10a.75.75 0 0 0-.57.73v2.54c0 .34.23.63.57.73l.92.24c.13.44.31.86.52 1.27l-.53.8a.75.75 0 0 0 .09.95L6.74 19a.75.75 0 0 0 .95.09l.8-.53c.41.21.83.39 1.27.52L10 20a.75.75 0 0 0 .73.57h2.54A.75.75 0 0 0 14 20l.24-.92c.44-.13.86-.31 1.27-.52l.8.53a.75.75 0 0 0 .95-.09L19 17.26a.75.75 0 0 0 .09-.95l-.53-.8c.21-.41.39-.83.52-1.27L20 14a.75.75 0 0 0 .57-.73v-2.54A.75.75 0 0 0 20 10Z',
  },
]

onMounted(() => {
  emit('expand-change', !isMini.value)
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

<template>
  <div>
    <!-- ============================================================
         固定顶部导航栏
         - z-[150] 保证在所有内容（含侧边栏 z-40、抽屉 z-999）之上
         - backdrop-blur-md + bg-white/90 实现半透明磨砂玻璃效果
         - h-16 与侧边栏 Logo 区域高度对齐
         ============================================================ -->
    <nav
      class="fixed top-0 left-0 w-full z-[150] bg-white/90 backdrop-blur-md border-b border-black/10 text-black px-3 md:px-6 h-14 md:h-16 flex justify-between items-center text-[10px] md:text-xs uppercase tracking-widest"
      style="font-family: var(--font-mono)"
    >
      <!-- 左侧占位区：为侧边栏汉堡按钮（固定定位 left=0）预留空间，避免遮挡 Logo -->
      <div class="w-9 md:w-10"></div>

      <!-- 中间：品牌 Logo + 站点名称（绝对居中） -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10">
        <router-link to="/" class="flex items-center gap-2">
          <img src="@/assets/logo.png" alt="Logo" class="w-7 h-7 md:w-8 md:h-8 object-contain" />
          <div class="hidden sm:flex flex-col items-center relative">
            <!-- 主标题：悬停时变为主色调 -->
            <span class="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">GreenSight-绿我同行</span>
            <!-- 版本号：悬停时从下方淡入 -->
            <span class="absolute top-full left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-1 group-hover:translate-y-0 text-gray-500 whitespace-nowrap">v2.0.5</span>
          </div>
        </router-link>
      </div>

      <!-- 右侧：用户登录状态 + 全局菜单按钮 -->
      <div class="flex items-center gap-2 md:gap-4 relative z-20">

        <!-- 已登录状态：显示用户名 + 退出按钮 -->
        <template v-if="userStore.isLoggedIn && !userStore.isGuest">
          <div class="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full border border-black/10 shadow-sm bg-neutral-50/50">
            <span class="text-sm font-medium normal-case">{{ userStore.user?.username }}</span>
            <div class="w-px h-3 bg-black/20"></div>
            <!-- 退出登录按钮 -->
            <button @click="userStore.logout()" class="text-xs hover:text-primary transition-colors">
              退出
            </button>
          </div>
        </template>

        <!-- 未登录状态：显示登录/注册入口 -->
        <template v-else>
          <div class="hidden sm:flex items-center gap-2">
            <router-link
              to="/auth/login"
              class="text-sm font-bold px-4 py-1.5 rounded-full border border-black/20 text-black bg-transparent hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32] transition-all duration-200 shadow-sm"
            >登录</router-link>
            <router-link
              to="/auth/register"
              class="text-sm font-bold px-4 py-1.5 rounded-full border border-black/20 text-black bg-transparent hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32] transition-all duration-200 shadow-sm"
            >注册</router-link>
          </div>
        </template>

        <!-- 全局菜单触发按钮：点击展开/收起全屏抽屉菜单 -->
        <button @click="toggleMenu" class="group flex items-center gap-1.5 md:gap-2 hover:text-[#2E7D32] transition-colors">
          <div class="border border-current px-2.5 py-1 md:px-3 md:py-1.5 transition-all duration-300 group-hover:bg-[#2E7D32] group-hover:text-white group-hover:border-[#2E7D32] flex items-center gap-1.5">
            <span>菜单</span>
            <!-- 开关状态指示符：展开时旋转 90° -->
            <span class="inline-block transition-transform duration-300 text-[10px]" :class="{ 'rotate-90': isOpen }">
              {{ isOpen ? '[ - ]' : '[ + ]' }}
            </span>
          </div>
        </button>
      </div>
    </nav>

    <!-- ============================================================
         使用 Teleport 将全屏抽屉菜单渲染到 body 根节点
         目的：彻底脱离父级 stacking context，避免 z-index 失效
         ============================================================ -->
    <Teleport to="body">
      <!-- 背景遮罩：点击关闭菜单，抽屉打开时半透明可见 -->
      <div
        class="drawer-overlay"
        :class="{ 'drawer-overlay--visible': isOpen }"
        @click="toggleMenu"
      ></div>

      <!-- 抽屉主面板：从顶部完整滑入，覆盖全屏 -->
      <div
        class="drawer-panel"
        :class="{ 'drawer-panel--open': isOpen }"
      >
        <!-- 抽屉头部：版权信息 + 关闭按钮 -->
        <div
          class="px-4 md:px-6 py-4 flex justify-between items-center text-xs uppercase tracking-widest border-b border-black/10 h-14 md:h-16 flex-shrink-0"
          style="font-family: var(--font-mono)"
        >
          <div><span class="font-bold">©GAW · GreenSight</span></div>
          <button @click="toggleMenu" class="hover:opacity-70 transition-opacity flex items-center gap-2 text-sm">
            关闭 <span class="text-lg leading-none">✕</span>
          </button>
        </div>

        <!-- 抽屉内容区：主菜单导航 + 用户信息 -->
        <div class="flex-1 px-4 md:px-6 py-8 md:py-10 relative overflow-y-auto">
          <!-- 背景网格装饰（纯视觉，不可交互） -->
          <div class="absolute inset-0 grid grid-cols-12 gap-4 px-6 pointer-events-none opacity-[0.04] h-full">
            <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
          </div>

          <!-- 主菜单导航链接列表 -->
          <div class="relative z-10 flex flex-col justify-center space-y-4 md:space-y-6 min-h-full">
            <!-- 逐项延迟动画：isOpen 时依次淡入上移 -->
            <div
              v-for="(item, i) in navItems"
              :key="item.path"
              class="menu-item"
              :style="isOpen ? `transition-delay: ${i * 60}ms` : 'transition-delay: 0ms'"
              :class="{ 'menu-item--visible': isOpen }"
            >
              <router-link
                :to="item.path"
                @click="toggleMenu"
                class="group/link flex items-center gap-3 md:gap-4 font-bold tracking-tighter transition-colors duration-200 text-2xl sm:text-3xl md:text-6xl"
                :class="isActive(item.path) ? 'text-[#2E7D32]' : 'text-black hover:text-[#2E7D32]'"
              >
                <!-- 菜单图标：悬停时从半透明变为完全可见 -->
                <NavIcons :name="item.iconName" size="48" class="w-9 h-9 md:w-16 md:h-16 opacity-50 group-hover/link:opacity-100 transition-opacity" />
                {{ item.label }}
                <!-- 当前页面标识 -->
                <span
                  v-if="isActive(item.path)"
                  class="text-xs align-middle opacity-50 ml-2"
                  style="font-family: var(--font-mono)"
                >← 当前</span>
              </router-link>
              <!-- 分割线：当前项完全不透明，其余半透明 -->
              <div
                class="h-px mt-3 bg-black/10 transition-all duration-500"
                :class="isActive(item.path) ? 'opacity-100' : 'opacity-50'"
              ></div>
            </div>

            <!-- 用户信息区域（菜单底部） -->
            <div
              class="menu-item pt-6"
              :style="isOpen ? `transition-delay: ${navItems.length * 60 + 60}ms` : 'transition-delay: 0ms'"
              :class="{ 'menu-item--visible': isOpen }"
            >
              <!-- 已登录：显示头像、用户名、积分和退出按钮 -->
              <div v-if="userStore.user" class="flex items-center gap-4">
                <img
                  :src="userAvatarUrl"
                  class="w-10 h-10 rounded-full border-2 border-black/10 object-cover"
                  :alt="userStore.user.username"
                />
                <div style="font-family: var(--font-mono)">
                  <p class="font-bold text-base">{{ userStore.user.username }}</p>
                  <p class="opacity-50 text-xs">积分: {{ userStore.user.points || 0 }}</p>
                </div>
                <button
                  @click="handleLogout"
                  class="ml-4 text-xs border border-black/20 px-4 py-2 hover:bg-black hover:text-white transition-colors"
                  style="font-family: var(--font-mono)"
                >
                  退出登录
                </button>
              </div>

              <!-- 未登录：显示登录/注册入口 -->
              <router-link
                v-else
                to="/auth/login"
                @click="toggleMenu"
                class="text-sm border border-black/20 px-6 py-3 hover:bg-black hover:text-white transition-colors inline-block"
                style="font-family: var(--font-mono)"
              >
                登录 / 注册 →
              </router-link>
            </div>
          </div>
        </div>

        <!-- 抽屉底部：版权信息 -->
        <div class="px-6 py-3 border-t border-black/10 flex justify-between items-center opacity-30 flex-shrink-0" style="font-family: var(--font-mono); font-size: 10px">
          <span>GreenSight AI WEB © 2026</span>
          <span>可持续未来倡议</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import { useUserStore } from '@/stores/user'
import NavIcons from '@/components/icons/NavIcons.vue'

// 控制全屏抽屉菜单的展开/收起状态
const isOpen = ref(false)
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

// 全局菜单导航项配置
const navItems = [
  { path: '/', label: '关于', iconName: 'about' },
  { path: '/reconstruction', label: '旧物重构', iconName: 'reconstruction' },
  { path: '/chat', label: 'AI 助手', iconName: 'chat' },
  { path: '/community', label: '社区活动', iconName: 'community' },
  { path: '/volunteer', label: '志愿活动', iconName: 'volunteer' },
  { path: '/weather', label: '天气查询', iconName: 'weather' },
  { path: '/achievements', label: '成就系统', iconName: 'achievements' },
]

/**
 * 判断给定路径是否为当前激活路由
 * 首页精确匹配，其他路由前缀匹配
 * @param {string} path - 路由路径
 */
const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

/**
 * 用户头像 URL
 * 优先使用用户上传的头像，否则使用 ui-avatars 服务动态生成
 */
const userAvatarUrl = computed(() => {
  if (userStore.user?.avatar) return userStore.user.avatar
  const name = encodeURIComponent(userStore.user?.username || 'U')
  return `https://ui-avatars.com/api/?name=${name}&background=2E7D32&color=fff&size=96&rounded=true&bold=true`
})

/**
 * 切换全屏抽屉菜单
 * 打开时禁止 body 滚动，关闭时恢复
 */
const toggleMenu = () => {
  isOpen.value = !isOpen.value
  document.body.style.overflow = isOpen.value ? 'hidden' : ''
}

/**
 * 退出登录并关闭菜单，跳转到首页
 */
const handleLogout = () => {
  userStore.logout()
  toggleMenu()
  router.push('/')
}

// 组件挂载时：使用 GSAP 对导航栏做从上方淡入的动画
onMounted(() => {
  gsap.from('nav', {
    y: -50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0.5,
  })
})

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
nav {
  font-family: var(--font-mono);
}

/* 背景遮罩：默认不可见、不可交互 */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  z-index: 998;
  pointer-events: none;
  transition: background 0.4s ease;
}
/* 遮罩可见状态：半透明并允许点击 */
.drawer-overlay--visible {
  background: rgba(0, 0, 0, 0.15);
  pointer-events: auto;
}

/* 抽屉主面板：初始位于屏幕上方，使用 cubic-bezier 实现流畅滑入 */
.drawer-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: #fff;
  color: #000;
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: translateY(-100%);
  transition: transform 0.65s cubic-bezier(0.76, 0, 0.24, 1);
  will-change: transform;
}
/* 抽屉打开状态：滑入到屏幕内 */
.drawer-panel--open {
  transform: translateY(0);
}

/* 菜单项：初始透明+下移，逐项延迟淡入上移 */
.menu-item {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.menu-item--visible {
  opacity: 1;
  transform: translateY(0);
}
</style>

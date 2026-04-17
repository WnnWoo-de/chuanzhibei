<script setup>
// ============================================================
// App.vue - 根组件
// 负责整体布局骨架：背景动画、侧边栏、导航栏、主内容区、页脚
// ============================================================

import { RouterView, useRoute } from 'vue-router'
import { defineAsyncComponent, ref, watch, onMounted, onUnmounted, computed } from 'vue'
import TheNavbar from './components/layout/TheNavbar.vue'
import TheFooter from './components/layout/TheFooter.vue'
import TheSidebar from './components/layout/TheSidebar.vue' // 左侧导航栏
import './styles/design-tokens.css'                          // 设计令牌系统

const TheIntro = defineAsyncComponent(() => import('./components/layout/TheIntro.vue'))
const Silk = defineAsyncComponent(() => import('./components/effects/Silk.vue'))

const INTRO_DONE_KEY = 'app_intro_done'

const hasCompletedIntro = () => {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(INTRO_DONE_KEY) === 'true'
    || document.documentElement.dataset.appIntroDone === 'true'
}

// 是否显示开场动画（仅首次进入应用时显示）
const showIntro = ref(!hasCompletedIntro())

// 控制侧边栏展开状态
const sidebarOpen = ref(false)

// 控制侧边栏是否全宽展开，默认为 mini 状态
const sidebarFull = ref(localStorage.getItem('sidebar_mini') === 'false')

const route = useRoute()
const isMobile = ref(window.innerWidth < 768)
const routeTransitionName = ref('page-flow')
const routeTransitionVariant = ref('editorial')
const useLightRouteTransition = ref(false)
const lastRouteDepth = ref(route.path.split('/').filter(Boolean).length)

const getRouteDepth = (path) => path.split('/').filter(Boolean).length

const getRouteTransitionVariant = (path) => {
  if (path === '/' || path === '/community' || path === '/volunteer') {
    return 'editorial'
  }

  if (path.startsWith('/chat') || path === '/weather' || path === '/achievements') {
    return 'swift'
  }

  if (path.startsWith('/auth') || path === '/profile' || path === '/settings') {
    return 'soft'
  }

  return 'balanced'
}

const handleRouteTransitionHint = (event) => {
  useLightRouteTransition.value = event.detail?.source === 'mini-sidebar'
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    sidebarFull.value = false
  }
}

const layoutOffsetClass = computed(() => {
  if (showIntro.value || isMobile.value) {
    return 'ml-0'
  }
  return sidebarFull.value ? 'ml-64' : 'ml-14'
})

/**
 * 开场动画播放完毕后的回调
 * 隐藏 Intro 组件，显示主体内容
 */
const handleIntroComplete = () => {
  showIntro.value = false
  document.documentElement.dataset.appIntroDone = 'true'
  sessionStorage.setItem(INTRO_DONE_KEY, 'true')
  window.dispatchEvent(new CustomEvent('app-intro-complete'))
}

/**
 * 键盘事件处理：按下 ESC 键时关闭侧边栏
 */
const handleKeydown = (e) => {
  if (e.key === 'Escape' && sidebarOpen.value) {
    sidebarOpen.value = false
  }
}

// 组件挂载时注册键盘监听
onMounted(() => {
  if (hasCompletedIntro()) {
    document.documentElement.dataset.appIntroDone = 'true'
    showIntro.value = false
  }

  handleResize()
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
  window.addEventListener('app-route-transition-hint', handleRouteTransitionHint)
})

// 组件卸载时移除键盘监听，防止内存泄漏
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('app-route-transition-hint', handleRouteTransitionHint)
})

// 监听路由变化：在移动端（宽度 < 768px）路由切换后自动关闭侧边栏，并为页面切换提供方向感
watch(() => route.path, (newPath, oldPath) => {
  const nextDepth = getRouteDepth(newPath)
  const prevDepth = oldPath ? getRouteDepth(oldPath) : lastRouteDepth.value
  const baseTransition = nextDepth >= prevDepth ? 'page-flow' : 'page-flow-reverse'
  const transitionVariant = getRouteTransitionVariant(newPath)
  const miniSuffix = useLightRouteTransition.value ? '-light' : ''

  routeTransitionVariant.value = transitionVariant
  routeTransitionName.value = `${baseTransition}-${transitionVariant}${miniSuffix}`
  useLightRouteTransition.value = false
  lastRouteDepth.value = nextDepth

  if (window.innerWidth < 768) {
    sidebarOpen.value = false
  }
}, { immediate: true })
</script>

<template>
  <!-- 全屏固定背景层：WebGL 丝绸动效（pointer-events-none 不阻挡交互） -->
  <div class="fixed inset-0 z-0 pointer-events-none">
    <Silk :speed="2" :scale="1" color="#ffffff" :noiseIntensity="1.5" />
  </div>

  <!-- 半透明磨砂玻璃遮罩层，叠在丝绸动效上方，柔化背景 -->
  <div class="fixed inset-0 bg-white/70 backdrop-blur-[20px] pointer-events-none z-0"></div>

  <!-- 开场动画：首次进入时显示，播放完成后隐藏 -->
  <TheIntro v-if="showIntro" @complete="handleIntroComplete" />

  <!-- 左侧导航栏组件 -->
  <Transition name="shell-fade">
    <TheSidebar
      v-if="!showIntro"
      :is-open="sidebarOpen"
      @toggle="sidebarOpen = !sidebarOpen"
      @close="sidebarOpen = false"
      @expand-change="(v) => { sidebarFull = v }"
    />
  </Transition>

  <!-- 主内容区：根据侧边栏状态动态调整左边距 -->
  <div
    class="min-h-screen flex flex-col bg-transparent relative z-10 selection:bg-primary selection:text-white transition-all duration-[900ms] ease-out"
    :class="layoutOffsetClass"
  >
    <!-- 顶部导航栏 -->
    <Transition name="shell-fade">
      <TheNavbar v-if="!showIntro" />
    </Transition>

    <!-- 路由视图主体：切换页面时提供柔和过渡与方向感 -->
    <main class="page-stage flex-grow pt-14 md:pt-16">
      <RouterView v-slot="{ Component, route: currentRoute }">
        <Transition :name="routeTransitionName" mode="out-in" appear>
          <div :key="currentRoute.fullPath" class="page-shell" :data-transition-variant="routeTransitionVariant">
            <component :is="Component" />
          </div>
        </Transition>
      </RouterView>
    </main>

    <!-- 底部页脚 -->
    <TheFooter />
  </div>
</template>

<style>
.shell-fade-enter-active,
.shell-fade-leave-active {
  transition: opacity 0.9s ease, transform 0.9s ease;
}

.shell-fade-enter-from,
.shell-fade-leave-to {
  opacity: 0;
  transform: translateY(-18px);
}

.page-stage {
  position: relative;
  isolation: isolate;
  overflow-x: clip;
}

.page-shell {
  width: 100%;
  will-change: opacity, transform, filter;
  transform-origin: 50% 12%;
  backface-visibility: hidden;
}

.page-shell[data-transition-variant='editorial'] {
  transform-origin: 50% 8%;
}

.page-shell[data-transition-variant='swift'] {
  transform-origin: 50% 18%;
}

.page-shell[data-transition-variant='soft'] {
  transform-origin: 50% 14%;
}

.page-shell[data-transition-variant='balanced'] {
  transform-origin: 50% 12%;
}

.page-flow-editorial-enter-active,
.page-flow-editorial-leave-active,
.page-flow-reverse-editorial-enter-active,
.page-flow-reverse-editorial-leave-active,
.page-flow-editorial-light-enter-active,
.page-flow-editorial-light-leave-active,
.page-flow-reverse-editorial-light-enter-active,
.page-flow-reverse-editorial-light-leave-active,
.page-flow-swift-enter-active,
.page-flow-swift-leave-active,
.page-flow-reverse-swift-enter-active,
.page-flow-reverse-swift-leave-active,
.page-flow-swift-light-enter-active,
.page-flow-swift-light-leave-active,
.page-flow-reverse-swift-light-enter-active,
.page-flow-reverse-swift-light-leave-active,
.page-flow-soft-enter-active,
.page-flow-soft-leave-active,
.page-flow-reverse-soft-enter-active,
.page-flow-reverse-soft-leave-active,
.page-flow-soft-light-enter-active,
.page-flow-soft-light-leave-active,
.page-flow-reverse-soft-light-enter-active,
.page-flow-reverse-soft-light-leave-active,
.page-flow-balanced-enter-active,
.page-flow-balanced-leave-active,
.page-flow-reverse-balanced-enter-active,
.page-flow-reverse-balanced-leave-active,
.page-flow-balanced-light-enter-active,
.page-flow-balanced-light-leave-active,
.page-flow-reverse-balanced-light-enter-active,
.page-flow-reverse-balanced-light-leave-active {
  transition-property: opacity, transform, filter;
  transition-timing-function: var(--ease-expo);
}

.page-flow-editorial-enter-active,
.page-flow-editorial-leave-active,
.page-flow-reverse-editorial-enter-active,
.page-flow-reverse-editorial-leave-active {
  transition-duration: 0.58s, 0.72s, 0.72s;
}

.page-flow-editorial-light-enter-active,
.page-flow-editorial-light-leave-active,
.page-flow-reverse-editorial-light-enter-active,
.page-flow-reverse-editorial-light-leave-active {
  transition-duration: 0.24s, 0.34s, 0.34s;
}

.page-flow-swift-enter-active,
.page-flow-swift-leave-active,
.page-flow-reverse-swift-enter-active,
.page-flow-reverse-swift-leave-active {
  transition-duration: 0.2s, 0.28s, 0.28s;
}

.page-flow-swift-light-enter-active,
.page-flow-swift-light-leave-active,
.page-flow-reverse-swift-light-enter-active,
.page-flow-reverse-swift-light-leave-active {
  transition-duration: 0.14s, 0.18s, 0.18s;
}

.page-flow-soft-enter-active,
.page-flow-soft-leave-active,
.page-flow-reverse-soft-enter-active,
.page-flow-reverse-soft-leave-active {
  transition-duration: 0.34s, 0.42s, 0.42s;
}

.page-flow-soft-light-enter-active,
.page-flow-soft-light-leave-active,
.page-flow-reverse-soft-light-enter-active,
.page-flow-reverse-soft-light-leave-active {
  transition-duration: 0.18s, 0.24s, 0.24s;
}

.page-flow-balanced-enter-active,
.page-flow-balanced-leave-active,
.page-flow-reverse-balanced-enter-active,
.page-flow-reverse-balanced-leave-active {
  transition-duration: 0.42s, 0.52s, 0.52s;
}

.page-flow-balanced-light-enter-active,
.page-flow-balanced-light-leave-active,
.page-flow-reverse-balanced-light-enter-active,
.page-flow-reverse-balanced-light-leave-active {
  transition-duration: 0.22s, 0.3s, 0.3s;
}

.page-flow-editorial-enter-from,
.page-flow-reverse-editorial-leave-to {
  opacity: 0;
  filter: blur(14px);
  transform: translate3d(0, 38px, 0) scale(0.982);
}

.page-flow-editorial-leave-to,
.page-flow-reverse-editorial-enter-from {
  opacity: 0;
  filter: blur(10px);
  transform: translate3d(0, -20px, 0) scale(0.992);
}

.page-flow-editorial-light-enter-from,
.page-flow-reverse-editorial-light-leave-to {
  opacity: 0;
  filter: blur(5px);
  transform: translate3d(0, 14px, 0) scale(0.995);
}

.page-flow-editorial-light-leave-to,
.page-flow-reverse-editorial-light-enter-from {
  opacity: 0;
  filter: blur(4px);
  transform: translate3d(0, -8px, 0) scale(0.998);
}

.page-flow-swift-enter-from,
.page-flow-reverse-swift-leave-to {
  opacity: 0;
  filter: blur(3px);
  transform: translate3d(0, 10px, 0) scale(0.998);
}

.page-flow-swift-leave-to,
.page-flow-reverse-swift-enter-from {
  opacity: 0;
  filter: blur(2px);
  transform: translate3d(0, -6px, 0) scale(0.999);
}

.page-flow-swift-light-enter-from,
.page-flow-reverse-swift-light-leave-to {
  opacity: 0;
  filter: blur(1px);
  transform: translate3d(0, 5px, 0) scale(0.9995);
}

.page-flow-swift-light-leave-to,
.page-flow-reverse-swift-light-enter-from {
  opacity: 0;
  filter: blur(1px);
  transform: translate3d(0, -4px, 0) scale(0.9995);
}

.page-flow-soft-enter-from,
.page-flow-reverse-soft-leave-to {
  opacity: 0;
  filter: blur(8px);
  transform: translate3d(0, 18px, 0) scale(0.992);
}

.page-flow-soft-leave-to,
.page-flow-reverse-soft-enter-from {
  opacity: 0;
  filter: blur(6px);
  transform: translate3d(0, -10px, 0) scale(0.996);
}

.page-flow-soft-light-enter-from,
.page-flow-reverse-soft-light-leave-to {
  opacity: 0;
  filter: blur(3px);
  transform: translate3d(0, 8px, 0) scale(0.998);
}

.page-flow-soft-light-leave-to,
.page-flow-reverse-soft-light-enter-from {
  opacity: 0;
  filter: blur(2px);
  transform: translate3d(0, -5px, 0) scale(0.999);
}

.page-flow-balanced-enter-from,
.page-flow-reverse-balanced-leave-to {
  opacity: 0;
  filter: blur(10px);
  transform: translate3d(0, 24px, 0) scale(0.988);
}

.page-flow-balanced-leave-to,
.page-flow-reverse-balanced-enter-from {
  opacity: 0;
  filter: blur(7px);
  transform: translate3d(0, -14px, 0) scale(0.995);
}

.page-flow-balanced-light-enter-from,
.page-flow-reverse-balanced-light-leave-to {
  opacity: 0;
  filter: blur(4px);
  transform: translate3d(0, 12px, 0) scale(0.996);
}

.page-flow-balanced-light-leave-to,
.page-flow-reverse-balanced-light-enter-from {
  opacity: 0;
  filter: blur(3px);
  transform: translate3d(0, -7px, 0) scale(0.998);
}

.page-flow-editorial-enter-to,
.page-flow-editorial-leave-from,
.page-flow-reverse-editorial-enter-to,
.page-flow-reverse-editorial-leave-from,
.page-flow-editorial-light-enter-to,
.page-flow-editorial-light-leave-from,
.page-flow-reverse-editorial-light-enter-to,
.page-flow-reverse-editorial-light-leave-from,
.page-flow-swift-enter-to,
.page-flow-swift-leave-from,
.page-flow-reverse-swift-enter-to,
.page-flow-reverse-swift-leave-from,
.page-flow-swift-light-enter-to,
.page-flow-swift-light-leave-from,
.page-flow-reverse-swift-light-enter-to,
.page-flow-reverse-swift-light-leave-from,
.page-flow-soft-enter-to,
.page-flow-soft-leave-from,
.page-flow-reverse-soft-enter-to,
.page-flow-reverse-soft-leave-from,
.page-flow-soft-light-enter-to,
.page-flow-soft-light-leave-from,
.page-flow-reverse-soft-light-enter-to,
.page-flow-reverse-soft-light-leave-from,
.page-flow-balanced-enter-to,
.page-flow-balanced-leave-from,
.page-flow-reverse-balanced-enter-to,
.page-flow-reverse-balanced-leave-from,
.page-flow-balanced-light-enter-to,
.page-flow-balanced-light-leave-from,
.page-flow-reverse-balanced-light-enter-to,
.page-flow-reverse-balanced-light-leave-from {
  opacity: 1;
  filter: blur(0);
  transform: translate3d(0, 0, 0) scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .shell-fade-enter-active,
  .shell-fade-leave-active,
  .page-flow-editorial-enter-active,
  .page-flow-editorial-leave-active,
  .page-flow-reverse-editorial-enter-active,
  .page-flow-reverse-editorial-leave-active,
  .page-flow-editorial-light-enter-active,
  .page-flow-editorial-light-leave-active,
  .page-flow-reverse-editorial-light-enter-active,
  .page-flow-reverse-editorial-light-leave-active,
  .page-flow-swift-enter-active,
  .page-flow-swift-leave-active,
  .page-flow-reverse-swift-enter-active,
  .page-flow-reverse-swift-leave-active,
  .page-flow-swift-light-enter-active,
  .page-flow-swift-light-leave-active,
  .page-flow-reverse-swift-light-enter-active,
  .page-flow-reverse-swift-light-leave-active,
  .page-flow-soft-enter-active,
  .page-flow-soft-leave-active,
  .page-flow-reverse-soft-enter-active,
  .page-flow-reverse-soft-leave-active,
  .page-flow-soft-light-enter-active,
  .page-flow-soft-light-leave-active,
  .page-flow-reverse-soft-light-enter-active,
  .page-flow-reverse-soft-light-leave-active,
  .page-flow-balanced-enter-active,
  .page-flow-balanced-leave-active,
  .page-flow-reverse-balanced-enter-active,
  .page-flow-reverse-balanced-leave-active,
  .page-flow-balanced-light-enter-active,
  .page-flow-balanced-light-leave-active,
  .page-flow-reverse-balanced-light-enter-active,
  .page-flow-reverse-balanced-light-leave-active {
    transition-duration: 0.01ms !important;
  }

  .shell-fade-enter-from,
  .shell-fade-leave-to,
  .page-flow-editorial-enter-from,
  .page-flow-editorial-leave-to,
  .page-flow-reverse-editorial-enter-from,
  .page-flow-reverse-editorial-leave-to,
  .page-flow-editorial-light-enter-from,
  .page-flow-editorial-light-leave-to,
  .page-flow-reverse-editorial-light-enter-from,
  .page-flow-reverse-editorial-light-leave-to,
  .page-flow-swift-enter-from,
  .page-flow-swift-leave-to,
  .page-flow-reverse-swift-enter-from,
  .page-flow-reverse-swift-leave-to,
  .page-flow-swift-light-enter-from,
  .page-flow-swift-light-leave-to,
  .page-flow-reverse-swift-light-enter-from,
  .page-flow-reverse-swift-light-leave-to,
  .page-flow-soft-enter-from,
  .page-flow-soft-leave-to,
  .page-flow-reverse-soft-enter-from,
  .page-flow-reverse-soft-leave-to,
  .page-flow-soft-light-enter-from,
  .page-flow-soft-light-leave-to,
  .page-flow-reverse-soft-light-enter-from,
  .page-flow-reverse-soft-light-leave-to,
  .page-flow-balanced-enter-from,
  .page-flow-balanced-leave-to,
  .page-flow-reverse-balanced-enter-from,
  .page-flow-reverse-balanced-leave-to,
  .page-flow-balanced-light-enter-from,
  .page-flow-balanced-light-leave-to,
  .page-flow-reverse-balanced-light-enter-from,
  .page-flow-reverse-balanced-light-leave-to {
    opacity: 1;
    filter: none;
    transform: none;
  }
}
</style>

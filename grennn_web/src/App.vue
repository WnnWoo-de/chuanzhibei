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
import { isDarkTheme } from './theme'

const TheIntro = defineAsyncComponent(() => import('./components/layout/TheIntro.vue'))
const Silk = defineAsyncComponent(() => import('./components/effects/Silk.vue'))

// 是否显示开场动画（首次进入页面时显示）
const showIntro = ref(true)

// 控制侧边栏展开状态
const sidebarOpen = ref(false)

// 控制侧边栏是否全宽展开，默认为 mini 状态
const sidebarFull = ref(localStorage.getItem('sidebar_mini') === 'false')

const route = useRoute()
const isMobile = ref(window.innerWidth < 768)

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
  handleResize()
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
})

// 组件卸载时移除键盘监听，防止内存泄漏
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
})

// 监听路由变化：在移动端（宽度 < 768px）路由切换后自动关闭侧边栏
watch(() => route.path, () => {
  if (window.innerWidth < 768) {
    sidebarOpen.value = false
  }
})
</script>

<template>
  <!-- 全屏固定背景层：WebGL 丝绸动效（pointer-events-none 不阻挡交互） -->
  <div class="app-silk-layer fixed inset-0 z-0 pointer-events-none">
    <Silk
      :speed="isDarkTheme ? 2.8 : 2"
      :scale="isDarkTheme ? 1.25 : 1"
      :color="isDarkTheme ? '#1f1f1f' : '#ffffff'"
      :noiseIntensity="isDarkTheme ? 1.25 : 1.5"
    />
  </div>

  <div class="dark-motion-layer fixed inset-0 z-0 pointer-events-none"></div>

  <!-- 半透明磨砂玻璃遮罩层，叠在丝绸动效上方，柔化背景 -->
  <div class="app-background-overlay fixed inset-0 backdrop-blur-[20px] pointer-events-none z-0"></div>

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
    class="app-shell min-h-screen flex flex-col bg-transparent relative z-10 selection:bg-primary selection:text-white transition-all duration-[900ms] ease-out"
    :class="layoutOffsetClass"
  >
    <!-- 顶部导航栏 -->
    <Transition name="shell-fade">
      <TheNavbar v-if="!showIntro" />
    </Transition>

    <!-- 路由视图主体：切换页面时直接渲染，避免重复触发进场动画 -->
    <main class="flex-grow pt-14 md:pt-16">
      <RouterView v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </main>

    <!-- 底部页脚 -->
    <TheFooter />
  </div>
</template>

<style>
.app-background-overlay {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(245, 245, 240, 0.7)),
    rgba(255, 255, 255, 0.62);
}

:root[data-theme='dark'] .app-background-overlay {
  background: #1f1f1f;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

:root[data-theme='dark'] .app-silk-layer {
  opacity: 0;
}

.dark-motion-layer {
  opacity: 0;
  background:
    linear-gradient(115deg, transparent 0%, rgba(110, 231, 123, 0.09) 18%, transparent 36%),
    linear-gradient(245deg, transparent 0%, rgba(46, 125, 50, 0.12) 32%, transparent 58%),
    repeating-linear-gradient(90deg, rgba(208, 255, 221, 0.035) 0 1px, transparent 1px 88px),
    repeating-linear-gradient(0deg, rgba(208, 255, 221, 0.026) 0 1px, transparent 1px 88px);
  background-size: 180% 180%, 220% 220%, 88px 88px, 88px 88px;
  background-position: 0% 0%, 100% 50%, 0 0, 0 0;
  mix-blend-mode: screen;
  transition: opacity 0.35s ease;
}

.dark-motion-layer::before {
  content: '';
  position: absolute;
  inset: -20%;
  background:
    linear-gradient(100deg, transparent 10%, rgba(134, 239, 172, 0.09) 42%, transparent 70%),
    linear-gradient(18deg, transparent 18%, rgba(34, 197, 94, 0.08) 48%, transparent 82%);
  filter: blur(18px);
  transform: translate3d(-6%, 0, 0);
}

:root[data-theme='dark'] .dark-motion-layer {
  opacity: 0;
  animation: none;
}

:root[data-theme='dark'] .dark-motion-layer::before {
  animation: none;
}

:root[data-theme='dark'] .app-shell {
  color: var(--color-text);
  background: #1f1f1f !important;
}

@keyframes darkGridFlow {
  0% {
    background-position: 0% 0%, 100% 50%, 0 0, 0 0;
  }
  100% {
    background-position: 120% 80%, 0% 20%, 88px 0, 0 88px;
  }
}

@keyframes darkBandDrift {
  0% {
    transform: translate3d(-8%, -2%, 0) skewX(-4deg);
    opacity: 0.65;
  }
  100% {
    transform: translate3d(8%, 3%, 0) skewX(4deg);
    opacity: 1;
  }
}

.shell-fade-enter-active,
.shell-fade-leave-active {
  transition: opacity 0.9s ease, transform 0.9s ease;
}

.shell-fade-enter-from,
.shell-fade-leave-to {
  opacity: 0;
  transform: translateY(-18px);
}
</style>

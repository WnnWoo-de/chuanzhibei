<script setup>
// ============================================================
// App.vue - 根组件
// 负责整体布局骨架：背景动画、侧边栏、导航栏、主内容区、页脚
// ============================================================

import { RouterView, useRoute } from 'vue-router'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import TheNavbar from './components/layout/TheNavbar.vue'
import TheFooter from './components/layout/TheFooter.vue'
import TheIntro from './components/layout/TheIntro.vue'     // 首次进入的开场动画
import TheSidebar from './components/layout/TheSidebar.vue' // 左侧导航栏
import Silk from './component/Silk/Silk.vue'                 // WebGL 丝绸背景动画

// 是否显示开场动画（首次进入页面时显示）
const showIntro = ref(true)

// 控制侧边栏展开状态
const sidebarOpen = ref(false)

// 控制侧边栏是否全宽展开（true 时侧栏为展开状态，影响主内容区左边距）
const sidebarFull = ref(false)

const route = useRoute()

/**
 * 开场动画播放完毕后的回调
 * 隐藏 Intro 组件，显示主体内容
 */
const handleIntroComplete = () => {
  showIntro.value = false
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
  window.addEventListener('keydown', handleKeydown)
})

// 组件卸载时移除键盘监听，防止内存泄漏
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
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
  <div class="fixed inset-0 z-0 pointer-events-none">
    <Silk :speed="2" :scale="1" color="#ffffff" :noiseIntensity="1.5" />
  </div>

  <!-- 半透明磨砂玻璃遮罩层，叠在丝绸动效上方，柔化背景 -->
  <div class="fixed inset-0 bg-white/70 backdrop-blur-[20px] pointer-events-none z-0"></div>

  <!-- 开场动画：首次进入时显示，播放完成后隐藏 -->
  <TheIntro v-if="showIntro" @complete="handleIntroComplete" />

  <!-- 左侧导航栏组件 -->
  <TheSidebar 
    :is-open="sidebarOpen" 
    @toggle="sidebarOpen = !sidebarOpen"
    @close="sidebarOpen = false"
    @expand-change="(v) => { sidebarFull = v }"
  />

  <!-- 主内容区：根据侧边栏状态动态调整左边距 -->
  <div 
    class="min-h-screen flex flex-col bg-transparent relative z-10 selection:bg-primary selection:text-white transition-all duration-300"
    :class="sidebarOpen || sidebarFull ? 'ml-64' : 'ml-14'"
  >
    <!-- 顶部导航栏 -->
    <TheNavbar />

    <!-- 路由视图主体，包含页面切换淡入淡出动画 -->
    <main class="flex-grow">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <!-- 底部页脚 -->
    <TheFooter />
  </div>
</template>

<style>
/* 路由切换淡入淡出过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

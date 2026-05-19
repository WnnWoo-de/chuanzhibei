<template>
  <div
    class="min-h-screen bg-transparent flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
  >
    <!-- Grid Background -->
    <div
      class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-[0.06] z-0 px-6"
    >
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
    </div>

    <!-- 装饰大字 -->
    <div class="absolute select-none pointer-events-none" aria-hidden="true">
      <span
        class="text-[22vw] font-bold text-black/[0.04] leading-none tracking-tighter"
        style="font-family: var(--font-display)"
        >404</span
      >
    </div>

    <div class="relative z-10 max-w-lg animate-fade-in-up">
      <!-- 图标区域 -->
      <div class="mb-10 flex justify-center">
        <div class="relative">
          <!-- 外环脉冲 -->
          <div
            class="absolute inset-0 rounded-full bg-green-100 animate-ping"
            style="animation-duration: 3s"
          ></div>
          <div
            class="relative w-24 h-24 rounded-full bg-white border-2 border-black/10 flex items-center justify-center shadow-xl"
          >
            <svg
              class="w-10 h-10 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- 文字区域 -->
      <div class="mb-3">
        <span class="font-mono text-xs uppercase tracking-[0.3em] opacity-40">Error 404</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{{ langText.notFound.title }}</h2>
      <p class="text-gray-500 mb-10 leading-relaxed text-base md:text-lg max-w-sm mx-auto">
        {{ langText.notFound.description }}<br class="hidden md:block" />
        {{ langText.notFound.descriptionLine2 }}
      </p>

      <!-- 操作按钮 -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center mb-12">
        <router-link
          to="/"
          class="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-3.5 font-mono text-xs uppercase tracking-widest hover:bg-green-700 transition-colors duration-300 group"
        >
          <svg
            class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          {{ langText.notFound.backHome }}
        </router-link>

        <button
          @click="$router.go(-1)"
          class="inline-flex items-center justify-center gap-2 border border-black px-8 py-3.5 font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-300 group"
        >
          <svg
            class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {{ langText.notFound.backPrev }}
        </button>
      </div>

      <!-- 快速导航 -->
      <div class="border-t border-black/10 pt-8">
        <p class="font-mono text-[10px] uppercase tracking-widest opacity-40 mb-4">{{ langText.notFound.quickNav }}</p>
        <div class="flex flex-wrap gap-2 justify-center">
          <router-link
            v-for="link in quickLinks"
            :key="link.path"
            :to="link.path"
            class="px-4 py-2 text-xs font-mono border border-black/10 bg-white hover:border-black hover:bg-black hover:text-white transition-all duration-200"
          >
            {{ link.label }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- 装饰角标 -->
    <div class="fixed bottom-8 left-8 font-mono text-[10px] opacity-20 hidden md:block">
      <span>GREEN AI WEB</span>
    </div>
    <div class="fixed bottom-8 right-8 font-mono text-[10px] opacity-20 hidden md:block">
      <span>{{ langText.notFound.slogan }}</span>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// views/NotFound.vue - 404 页面
// 匹配所有未定义路由时展示，提供快速导航链接辅助用户回到正常流程
// ============================================================
import { computed } from 'vue'
import { langText } from '@/language'

// 快速导航链接列表，帮助迷失用户快速找到常用页面
const quickLinks = computed(() => [
  { path: '/', label: langText.value.notFound.home },
  { path: '/reconstruction', label: langText.value.notFound.reconstruction },
  { path: '/chat', label: langText.value.notFound.aiAssistant },
  { path: '/community', label: langText.value.notFound.community },
  { path: '/weather', label: langText.value.notFound.weather },
  { path: '/achievements', label: langText.value.notFound.achievements },
])
</script>

<style scoped>
.text-primary {
  color: var(--color-primary, #2e7d32);
}

.hover\:bg-green-700:hover {
  background-color: #15803d;
}
</style>

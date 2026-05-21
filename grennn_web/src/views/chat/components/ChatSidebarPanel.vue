<template>
  <!-- 聊天页左侧说明区：展示标题、功能入口和模型状态 -->
  <div class="col-span-12 md:col-span-3 flex flex-col md:h-full">
    <div class="sticky top-24">
      <!-- 页面标题和简介 -->
      <h1 class="text-3xl md:text-5xl font-bold mt-2 mb-4 md:mb-6 whitespace-pre-line">{{ langText.chat.title }}</h1>
      <p class="text-xs md:text-sm opacity-60 max-w-[220px] mb-4 md:mb-8 hidden md:block whitespace-pre-line">
        {{ langText.chat.intro }}
      </p>

      <!-- 移动端压缩版状态栏 -->
      <div class="flex md:hidden items-center justify-between mb-4 text-xs font-mono opacity-60 border-b border-black/10 pb-2">
        <span>{{ langText.chat.model }}: Qwen-2.5</span>
        <span class="text-green-600 font-bold">● {{ langText.chat.online }}</span>
      </div>

      <!-- 功能跳转按钮：快速进入碳足迹分析和垃圾识别页 -->
      <div class="mb-4 md:mb-8 flex gap-2">
        <router-link
          to="/chat/carbon-footprint"
          class="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-black text-white text-[10px] md:text-xs font-mono uppercase tracking-wider rounded hover:bg-green-600 transition-colors shadow-sm whitespace-nowrap"
        >
          <el-icon><DataLine /></el-icon>
          <span>{{ langText.chat.carbon }}</span>
        </router-link>

        <router-link
          to="/chat/waste-recognition"
          class="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white text-black text-[10px] md:text-xs font-mono uppercase tracking-wider rounded border border-black hover:bg-black hover:text-white transition-colors shadow-sm whitespace-nowrap"
        >
          <el-icon><Camera /></el-icon>
          <span>{{ langText.chat.waste }}</span>
        </router-link>

        <!-- 移动端把清空按钮放到侧栏操作区，避免顶部区域过挤 -->
        <button
          class="md:hidden inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-[10px] font-mono uppercase tracking-wider rounded hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm whitespace-nowrap"
          @click="$emit('clear-chat')"
        >
          <el-icon><Delete /></el-icon>
          <span>{{ langText.chat.clear }}</span>
        </button>
      </div>

      <!-- 桌面端详细模型状态信息 -->
      <div class="hidden md:block text-xs font-mono opacity-40 space-y-2">
        <p>{{ langText.chat.status }}: <span class="text-green-600 font-bold">{{ langText.chat.online }}</span></p>
        <p>{{ langText.chat.model }}: Qwen-2.5-72B</p>
        <p>{{ langText.chat.latency }}: <span id="latency">--</span>ms</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// ChatSidebarPanel.vue - 聊天页侧边信息面板
// 展示功能入口、模型信息和移动端清空操作
// ============================================================
import { Camera, DataLine, Delete } from '@element-plus/icons-vue'
import { langText } from '@/language'

defineEmits(['clear-chat'])
</script>

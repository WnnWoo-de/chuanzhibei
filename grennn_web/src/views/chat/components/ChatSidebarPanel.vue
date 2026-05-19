<template>
  <div class="col-span-12 md:col-span-3 flex flex-col md:h-full">
    <div class="sticky top-24">
      <h1 class="text-3xl md:text-5xl font-bold mt-2 mb-4 md:mb-6">GS AI<br />对话助手</h1>
      <p class="text-xs md:text-sm opacity-60 max-w-[200px] mb-4 md:mb-8 hidden md:block">
        GreenSight 环保问答中枢<br />
        帮你快速获得垃圾分类、旧物改造、碳足迹与可持续生活建议。
      </p>

      <div class="flex md:hidden items-center justify-between mb-4 text-xs font-mono opacity-60 border-b border-black/10 pb-2">
        <span>模型: Qwen-2.5</span>
        <span class="text-green-600 font-bold">● 在线</span>
      </div>

      <div class="mb-4 md:mb-8 flex gap-2">
        <router-link
          to="/chat/carbon-footprint"
          class="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-black text-white text-[10px] md:text-xs font-mono uppercase tracking-wider rounded hover:bg-green-600 transition-colors shadow-sm whitespace-nowrap"
        >
          <el-icon><DataLine /></el-icon>
          <span>碳足迹分析</span>
        </router-link>

        <router-link
          to="/chat/waste-recognition"
          class="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white text-black text-[10px] md:text-xs font-mono uppercase tracking-wider rounded border border-black hover:bg-black hover:text-white transition-colors shadow-sm whitespace-nowrap"
        >
          <el-icon><Camera /></el-icon>
          <span>分类识别</span>
        </router-link>

        <button
          class="md:hidden inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-[10px] font-mono uppercase tracking-wider rounded hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm whitespace-nowrap"
          @click="$emit('clear-chat')"
        >
          <el-icon><Delete /></el-icon>
          <span>清空</span>
        </button>
      </div>

      <div class="hidden md:block text-xs font-mono opacity-40 space-y-2">
        <p>状态：<span class="text-green-600 font-bold">在线</span></p>
        <p>模型：Qwen-2.5-72B</p>
        <p>延迟：<span id="latency">--</span>ms</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Camera, DataLine, Delete } from '@element-plus/icons-vue'

defineEmits(['clear-chat'])
</script>

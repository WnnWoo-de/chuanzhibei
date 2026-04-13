<template>
  <div class="px-4 md:px-6 py-3 border-b border-black/5 flex justify-between items-center bg-white/50 backdrop-blur-sm z-20">
    <div class="flex items-center gap-3">
      <button
        class="hidden md:flex items-center gap-1 px-2 py-1 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
        title="清空对话"
        @click="$emit('clear-chat')"
      >
        <el-icon><Delete /></el-icon>
        <span>清空对话</span>
      </button>
      <span class="md:hidden text-xs font-bold text-gray-500">GreenSight-绿我同行 AI 助手</span>
    </div>
    <div class="font-mono text-[10px] opacity-40 uppercase tracking-widest font-bold">安全连接 // 已加密</div>
  </div>
</template>

<script setup>
import { Delete } from '@element-plus/icons-vue'

defineEmits(['clear-chat'])
</script>

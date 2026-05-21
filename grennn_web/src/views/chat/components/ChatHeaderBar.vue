<template>
  <!-- 聊天顶部工具栏：显示清空会话入口和当前安全状态 -->
  <div class="px-4 md:px-6 py-3 border-b border-black/5 flex justify-between items-center bg-white/50 backdrop-blur-sm z-20">
    <div class="flex items-center gap-3">
      <!-- 桌面端显示“清空聊天”按钮 -->
      <button
        class="hidden md:flex items-center gap-1 px-2 py-1 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
        :title="langText.chat.clearChat"
        @click="$emit('clear-chat')"
      >
        <el-icon><Delete /></el-icon>
        <span>{{ langText.chat.clearChat }}</span>
      </button>
      <!-- 移动端空间有限，仅保留助手名称 -->
      <span class="md:hidden text-xs font-bold text-gray-500">{{ langText.chat.assistant }}</span>
    </div>
    <!-- 右侧状态文案：用于强调会话环境信息 -->
    <div class="font-mono text-[10px] opacity-40 uppercase tracking-widest font-bold">{{ langText.chat.secure }}</div>
  </div>
</template>

<script setup>
// ============================================================
// ChatHeaderBar.vue - 聊天头部操作栏
// 提供清空聊天入口，并展示当前会话状态文本
// ============================================================
import { Delete } from '@element-plus/icons-vue'
import { langText } from '@/language'

defineEmits(['clear-chat'])
</script>

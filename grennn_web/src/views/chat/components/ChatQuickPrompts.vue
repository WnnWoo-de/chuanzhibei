<template>
  <!-- 快捷提问区域：横向滚动展示预设问题 -->
  <div class="px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar border-t border-black/5 bg-gray-50/30 backdrop-blur-sm items-center">
    <!-- 换一换按钮：刷新快捷提问列表 -->
    <button
      class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-primary hover:border-primary hover:bg-green-50 transition-all duration-300 shadow-sm"
      :class="{ 'animate-spin': isShuffling }"
      title="换一换"
      aria-label="换一换"
      @click="$emit('shuffle')"
    >
      <el-icon><Refresh /></el-icon>
    </button>

    <!-- 快捷提问按钮列表 -->
    <div class="flex gap-3">
      <transition-group name="list">
        <button
          v-for="prompt in quickPrompts"
          :key="prompt"
          class="flex-shrink-0 px-4 py-2 text-xs font-medium bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-full text-gray-700 hover:text-white hover:border-green-500 hover:bg-gradient-to-br hover:from-green-500 hover:to-green-600 hover:-translate-y-1 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 group whitespace-nowrap"
          @click="$emit('quick-prompt', prompt)"
        >
          <el-icon class="text-green-500 group-hover:text-white transition-colors"><Promotion /></el-icon>
          {{ prompt }}
        </button>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// ChatQuickPrompts.vue - 快捷提问组件
// 展示预设问题列表，点击可快速发送，支持换一换刷新
// ============================================================
import { Promotion, Refresh } from '@element-plus/icons-vue'

defineProps({
  isShuffling: {
    type: Boolean,
    default: false,       // 是否正在刷新动画中
  },
  quickPrompts: {
    type: Array,
    default: () => [],    // 快捷提问列表
  },
})

defineEmits(['quick-prompt', 'shuffle'])
</script>

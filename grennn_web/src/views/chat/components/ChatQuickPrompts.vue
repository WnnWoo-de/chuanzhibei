<template>
  <div class="px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar border-t border-black/5 bg-gray-50/30 backdrop-blur-sm items-center">
    <button
      class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-primary hover:border-primary hover:bg-green-50 transition-all duration-300 shadow-sm"
      :class="{ 'animate-spin': isShuffling }"
      title="换一换"
      aria-label="换一换"
      @click="$emit('shuffle')"
    >
      <el-icon><Refresh /></el-icon>
    </button>

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
import { Promotion, Refresh } from '@element-plus/icons-vue'

defineProps({
  isShuffling: {
    type: Boolean,
    default: false,
  },
  quickPrompts: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['quick-prompt', 'shuffle'])
</script>

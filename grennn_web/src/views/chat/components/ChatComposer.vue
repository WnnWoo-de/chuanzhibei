<template>
  <div class="p-6 border-t border-black/10 bg-white relative z-20 sticky bottom-0">
    <transition name="fade">
      <div v-if="isWriting || isTyping" class="absolute -top-12 left-1/2 -translate-x-1/2">
        <button
          class="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-500 rounded-full shadow-lg hover:bg-red-50 transition-all text-xs font-medium"
          @click="$emit('stop')"
        >
          <el-icon><VideoPause /></el-icon>
          <span>停止生成</span>
        </button>
      </div>
    </transition>

    <transition name="fade">
      <div
        v-if="!isWriting && !isTyping && messages.length > 1 && messages[messages.length - 1].role === 'assistant'"
        class="absolute -top-12 right-6"
      >
        <button
          class="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-500 rounded-full shadow-sm hover:text-primary hover:border-primary transition-all text-xs"
          @click="$emit('regenerate')"
        >
          <el-icon><RefreshRight /></el-icon>
          <span>重新生成</span>
        </button>
      </div>
    </transition>

    <form class="flex gap-4 relative items-stretch" @submit.prevent="handleSend">
      <div class="flex-1 relative">
        <textarea
          ref="textareaEl"
          v-model="localNewMessage"
          rows="1"
          placeholder="请输入您的问题… (Shift+Enter 换行)"
          class="w-full bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl px-4 py-3 pl-10 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-mono text-sm transition-all shadow-sm hover:border-gray-300 resize-none overflow-hidden max-h-32 leading-6"
          :disabled="isTyping || isWriting"
          @input="handleInput"
          @keydown.enter.exact.prevent="handleSend"
        ></textarea>
        <div class="absolute left-3 top-3 text-gray-400 font-bold">
          <span class="text-xs">▶</span>
        </div>
      </div>
      <button
        type="submit"
        :disabled="!localNewMessage.trim() || isTyping || isWriting"
        class="px-8 bg-gradient-to-br from-black to-gray-800 text-white text-xs font-mono uppercase tracking-wider rounded-2xl hover:from-green-600 hover:to-green-700 hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:hover:from-black disabled:hover:to-gray-800 disabled:hover:shadow-none shadow-md flex items-center gap-2 h-full min-h-[46px] font-bold"
      >
        <span>发送</span>
        <el-icon v-if="isTyping || isWriting" class="animate-spin"><Loading /></el-icon>
        <span v-else>→</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { Loading, RefreshRight, VideoPause } from '@element-plus/icons-vue'

const props = defineProps({
  isTyping: {
    type: Boolean,
    default: false,
  },
  isWriting: {
    type: Boolean,
    default: false,
  },
  messages: {
    type: Array,
    default: () => [],
  },
  newMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['adjust-height', 'regenerate', 'send', 'stop', 'update:newMessage'])
const textareaEl = ref(null)
const localNewMessage = ref('')

const syncHeight = async () => {
  await nextTick()
  if (!textareaEl.value) return
  textareaEl.value.style.height = 'auto'
  textareaEl.value.style.height = `${textareaEl.value.scrollHeight}px`
}

const handleInput = (event) => {
  emit('update:newMessage', localNewMessage.value)
  emit('adjust-height')
}

const handleSend = () => {
  emit('update:newMessage', localNewMessage.value)
  emit('send')
  // 发送后立即清空本地输入框，确保发送完成时不显示文字
  localNewMessage.value = ''
  syncHeight()
}

// 监听父组件的 newMessage 变化，同步到本地状态
watch(
  () => props.newMessage,
  (newVal) => {
    if (newVal !== localNewMessage.value) {
      localNewMessage.value = newVal
    }
    syncHeight()
  },
  { immediate: true },
)
</script>

<template>
  <!-- 输入框容器：固定在聊天区域底部 -->
  <div class="p-6 border-t border-black/10 bg-white relative z-20 sticky bottom-0">
    <!-- 停止生成按钮（AI 输出时显示） -->
    <transition name="fade">
      <div v-if="isWriting || isTyping" class="absolute -top-12 left-1/2 -translate-x-1/2">
        <button
          class="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-500 rounded-full shadow-lg hover:bg-red-50 transition-all text-xs font-medium"
          @click="$emit('stop')"
        >
          <el-icon><VideoPause /></el-icon>
          <span>{{ langText.chatComposer.stopGeneration }}</span>
        </button>
      </div>
    </transition>

    <!-- 重新生成按钮（AI 完成回复后显示） -->
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
          <span>{{ langText.chatComposer.regenerate }}</span>
        </button>
      </div>
    </transition>

    <!-- 消息输入表单 -->
    <form class="flex gap-4 relative items-stretch" @submit.prevent="handleSend">
      <!-- 文本输入区域 -->
      <div class="flex-1 relative">
        <textarea
          ref="textareaEl"
          v-model="localNewMessage"
          rows="1"
          :placeholder="langText.chatComposer.placeholder"
          class="w-full bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl px-4 py-3 pl-10 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-mono text-sm transition-all shadow-sm hover:border-gray-300 resize-none overflow-hidden max-h-32 leading-6"
          :disabled="isTyping || isWriting"
          @input="handleInput"
          @keydown.enter.exact.prevent="handleSend"
        ></textarea>
        <!-- 输入框左侧图标 -->
        <div class="absolute left-3 top-3 text-gray-400 font-bold">
          <span class="text-xs">▶</span>
        </div>
      </div>
      <!-- 发送按钮 -->
      <button
        type="submit"
        :disabled="!localNewMessage.trim() || isTyping || isWriting"
        class="px-8 bg-gradient-to-br from-black to-gray-800 text-white text-xs font-mono uppercase tracking-wider rounded-2xl hover:from-green-600 hover:to-green-700 hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:hover:from-black disabled:hover:to-gray-800 disabled:hover:shadow-none shadow-md flex items-center gap-2 h-full min-h-[46px] font-bold"
      >
        <span>{{ langText.chatComposer.send }}</span>
        <el-icon v-if="isTyping || isWriting" class="animate-spin"><Loading /></el-icon>
        <span v-else>→</span>
      </button>
    </form>
  </div>
</template>

<script setup>
// ============================================================
// ChatComposer.vue - 聊天消息输入组件
// 包含文本输入框、发送按钮、停止/重新生成按钮
// 支持自适应高度、Enter 发送、v-model 双向绑定
// ============================================================
import { nextTick, ref, watch } from 'vue'
import { Loading, RefreshRight, VideoPause } from '@element-plus/icons-vue'
import { langText } from '@/language'

// ---- Props 定义 ----
const props = defineProps({
  isTyping: { type: Boolean, default: false },    // AI 正在思考
  isWriting: { type: Boolean, default: false },   // AI 正在输出
  messages: { type: Array, default: () => [] },   // 消息列表
  newMessage: { type: String, default: '' },      // 输入框内容（v-model）
})

const emit = defineEmits(['adjust-height', 'regenerate', 'send', 'stop', 'update:newMessage'])
const textareaEl = ref(null)           // textarea DOM 引用
const localNewMessage = ref('')        // 本地输入框状态（与父组件双向同步）

/** 自动调整 textarea 高度以适应内容 */
const syncHeight = async () => {
  await nextTick()
  if (!textareaEl.value) return
  textareaEl.value.style.height = 'auto'
  textareaEl.value.style.height = `${textareaEl.value.scrollHeight}px`
}

/** 处理输入事件：同步值到父组件并调整高度 */
const handleInput = (event) => {
  emit('update:newMessage', localNewMessage.value)
  emit('adjust-height')
}

/** 处理发送：触发 send 事件并清空输入框 */
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

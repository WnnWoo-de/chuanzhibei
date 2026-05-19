<template>
  <div class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" ref="containerRef">
    <transition-group name="message-fade">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="flex flex-col max-w-[85%] md:max-w-[75%]"
        :class="msg.role === 'user' ? 'ml-auto items-end' : 'items-start'"
      >
        <div class="flex items-center gap-2 mb-2 opacity-50">
          <el-icon v-if="msg.role === 'assistant'" :size="12"><Cpu /></el-icon>
          <el-icon v-else :size="12"><User /></el-icon>
          <span class="font-mono text-[10px] uppercase tracking-wider">
            {{ msg.role === 'user' ? langText.chat.you : langText.chat.assistant }} // {{ msg.time }}
          </span>
        </div>

        <div
          class="p-4 text-sm leading-relaxed relative group transition-all duration-300"
          :class="[
            msg.role === 'user'
              ? 'bg-gradient-to-br from-black to-gray-800 text-white rounded-3xl rounded-tr-sm shadow-lg hover:shadow-xl hover:scale-105 whitespace-pre-wrap'
              : 'bg-gradient-to-br from-gray-50 to-white text-gray-800 border-2 border-gray-200 rounded-3xl rounded-tl-sm shadow-sm hover:shadow-lg hover:border-green-300 hover:bg-green-50/30',
          ]"
        >
          <div
            v-if="msg.role === 'assistant'"
            class="markdown-body"
            :class="{ 'typing-active': isWriting && index === messages.length - 1 }"
            v-html="renderMarkdown(msg.content)"
          ></div>
          <div v-else class="whitespace-pre-wrap break-words">{{ msg.content }}</div>

          <button
            v-if="!isCurrentStreamingMessage(msg, index)"
            class="absolute top-2 right-2 inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all px-2.5 py-1.5 rounded-full text-[11px] font-medium z-10"
            :class="
              msg.role === 'user'
                ? 'bg-white/12 text-white hover:bg-white/20'
                : 'bg-white/80 text-gray-500 hover:bg-white hover:text-gray-700 border border-black/5 shadow-sm'
            "
            :title="copiedIndex === index ? langText.chat.copied : langText.chat.copyContent"
            @click="$emit('copy-message', { content: msg.content, index })"
          >
            <el-icon>
              <Select v-if="copiedIndex === index" />
              <CopyDocument v-else />
            </el-icon>
            <span>{{ copiedIndex === index ? langText.chat.copied : langText.chat.copy }}</span>
          </button>

          <div
            v-if="msg.role === 'user'"
            class="absolute w-2 h-2 bg-current opacity-10 rounded-full top-2 right-2"
          ></div>
        </div>
      </div>
    </transition-group>

    <transition name="fade">
      <div v-if="messages.length === 1 && !isTyping" class="mt-12 px-2 md:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            v-for="(prompt, idx) in allPrompts.slice(0, 4)"
            :key="idx"
            class="text-left p-4 bg-white border border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-green-50/30 hover:shadow-sm transition-all group"
            @click="$emit('quick-prompt', prompt)"
          >
            <div class="flex items-start gap-3">
              <div class="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:text-primary transition-colors">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div>
                <h4 class="font-medium text-sm text-gray-800 mb-1">{{ langText.chat.example }} {{ idx + 1 }}</h4>
                <p class="text-xs text-gray-500 line-clamp-2">{{ prompt }}</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="isTyping" class="flex flex-col items-start max-w-[75%]">
        <div class="flex items-center gap-2 mb-2 opacity-50">
          <el-icon :size="12"><Cpu /></el-icon>
          <span class="font-mono text-[10px] uppercase tracking-wider">{{ langText.chat.thinking }}</span>
        </div>
        <div class="p-4 bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1 h-[54px]">
          <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
          <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
          <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { ChatDotRound, CopyDocument, Cpu, Select, User } from '@element-plus/icons-vue'
import { langText } from '@/language'

const containerRef = ref(null)

const props = defineProps({
  allPrompts: {
    type: Array,
    default: () => [],
  },
  copiedIndex: {
    type: Number,
    default: -1,
  },
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
  renderMarkdown: {
    type: Function,
    required: true,
  },
})

defineEmits(['copy-message', 'quick-prompt'])

const isCurrentStreamingMessage = (msg, index) => {
  return props.isWriting && msg.role === 'assistant' && index === props.messages.length - 1
}

const scrollToBottom = async () => {
  await nextTick()
  if (!containerRef.value) return
  containerRef.value.scrollTo({
    top: containerRef.value.scrollHeight,
    behavior: 'smooth',
  })
}

// 监听消息变化，自动滚动到底部
watch(
  () => props.messages,
  async () => {
    await scrollToBottom()
  },
  { deep: true }
)

// 监听 isTyping 和 isWriting 状态变化，自动滚动到底部
watch(
  () => [props.isTyping, props.isWriting],
  async ([isTyping, isWriting]) => {
    // 当开始生成或停止生成时，滚动到底部
    if (isTyping || isWriting) {
      await scrollToBottom()
    }
  }
)

defineExpose({
  scrollToBottom,
})
</script>

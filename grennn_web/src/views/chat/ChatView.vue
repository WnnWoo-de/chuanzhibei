<template>
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans pt-24 px-6 pb-12 flex flex-col">
    <!-- 网格背景 -->
    <div
      class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6"
    >
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
      <!-- Mobile grid -->
      <div v-for="n in 4" :key="`m-${n}`" class="border-r border-black h-full block md:hidden col-span-3"></div>
    </div>

    <div class="relative z-10 grid grid-cols-12 gap-6 flex-1 h-[calc(100vh-8rem)]">
      <ChatSidebarPanel @clear-chat="clearChat" />

      <!-- 聊天界面 -->
      <div class="col-span-12 md:col-span-9 flex flex-col h-full overflow-hidden pb-4">
        <div
          class="bg-white/90 backdrop-blur-md border border-black/10 flex-1 flex flex-col relative overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl rounded-2xl h-full"
        >
          <ChatHeaderBar @clear-chat="clearChat" />

          <ChatMessageList
            ref="chatMessageListRef"
            :all-prompts="allPrompts"
            :is-typing="isTyping"
            :is-writing="isWriting"
            :messages="messages"
            :render-markdown="renderChatMarkdown"
            @copy-message="copyMessage"
            @quick-prompt="useQuickPrompt"
          />

          <ChatQuickPrompts
            :is-shuffling="isShuffling"
            :quick-prompts="quickPrompts"
            @quick-prompt="useQuickPrompt"
            @shuffle="shufflePrompts"
          />

          <ChatComposer
            v-model:new-message="newMessage"
            :is-typing="isTyping"
            :is-writing="isWriting"
            :messages="messages"
            @regenerate="regenerate"
            @send="sendMessage"
            @stop="stopGeneration"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { renderChatMarkdown } from './chatMarkdown'
import { useChatSession } from './useChatSession'
import ChatComposer from './components/ChatComposer.vue'
import ChatHeaderBar from './components/ChatHeaderBar.vue'
import ChatMessageList from './components/ChatMessageList.vue'
import ChatQuickPrompts from './components/ChatQuickPrompts.vue'
import ChatSidebarPanel from './components/ChatSidebarPanel.vue'
import { useChatPrompts } from './useChatPrompts'

const userStore = useUserStore()
const chatMessageListRef = ref(null)
const { allPrompts, quickPrompts, isShuffling, shufflePrompts } = useChatPrompts()

// AI 助手的欢迎消息（固定为对话第一条）
const initialMessage = {
  role: 'assistant',
  content:
    '你好！我是 **GreenSight-绿我同行 AI 助手** 🌱，您的专属 AI 环保助手。无论是垃圾分类查询、旧物改造建议，还是碳足迹分析，我都可以帮您！有什么想聊的吗？',
  time: new Date().toLocaleTimeString('en-GB'),
}

const scrollToBottom = () => {
  chatMessageListRef.value?.scrollToBottom()
}

const {
  abortController,
  clearChat,
  isTyping,
  isWriting,
  loadChatHistory,
  messages,
  newMessage,
  regenerate,
  sendMessage,
  stopGeneration,
} = useChatSession({
  initialMessage,
  scrollToBottom,
  userStore,
})

/** 点击快捷提问直接发送 */
const useQuickPrompt = (prompt) => {
  newMessage.value = prompt
  sendMessage()
}

/**
 * 复制消息内容到剪贴板
 * @param content - 要复制的纯文本内容
 */
const copyMessage = async (content) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('复制成功')
  } catch (err) {
    console.error('Copy failed:', err)
    ElMessage.error('复制失败')
  }
}

// ---- 生命周期 ----
/**
 * 挂载时：
 *   1. 初始化用户状态（读取 token / 徽章 / 聊天记录）
 *   2. 尝试从后端加载历史消息
 *   3. 若接口无数据则从 userStore 本地缓存恢复
 *   4. 若仍无消息则显示欢迎语
 *   5. 滚动到底部，并随机生成快捷提问
 */
onMounted(async () => {
  await userStore.init()
  await loadChatHistory()
  if (messages.value.length === 0 && userStore.chatHistory.length > 0) {
    messages.value = userStore.chatHistory
  }
  if (messages.value.length === 0) {
    messages.value = [initialMessage]
  }
  scrollToBottom()
  shufflePrompts()
})

/**
 * 卸载时：中断正在进行的 AI 请求，防止内存泄漏
 * 及已卸载组件上的状态更新
 */
onUnmounted(() => {
  if (abortController.value) {
    abortController.value.abort()
  }
})
</script>

<style scoped>
/* ---- 滚动条美化（webkit 内核浏览器） ---- */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* 快捷提问横向滚动条隐藏工具类 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* ---- 消息气泡出现/消失动画 ---- */
.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.message-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95); /* 新消息从下方淡入 */
}
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px); /* 消息消失时向上淡出 */
}

/* ---- 通用淡入淡出过渡（停止按钮、重新生成按钮等） ---- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ---- 快捷提问列表项切换动画 ---- */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px); /* 新项从右侧滑入，移除项向右滑出 */
}
.list-leave-active {
  position: absolute; /* 移除时脱离文档流，防止其他项跳动 */
}

/* ---- Markdown 渲染样式（:deep 穿透 scoped 作用域） ---- */
:deep(.markdown-body p) {
  margin-bottom: 0.5em;
}
:deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}
:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  padding-left: 1.5em;
  list-style-type: disc;
  margin-bottom: 0.5em;
}
:deep(.markdown-body ol) {
  list-style-type: decimal;
}
:deep(.markdown-body li) {
  margin-bottom: 0.25em;
}
:deep(.markdown-body strong) {
  font-weight: 600;
}
:deep(.markdown-body pre) {
  background-color: #f3f4f6;
  padding: 0.75rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  margin: 0.5rem 0;
  font-family: monospace;
  font-size: 0.9em;
}
:deep(.markdown-body code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.9em;
}
:deep(.markdown-body blockquote) {
  border-left: 3px solid #e5e7eb;
  padding-left: 1rem;
  color: #6b7280;
  margin: 0.5rem 0;
  font-family: monospace;
}

/* Cursor Effect - 流式输出时末尾显示闪烁光标 ▋ */
.typing-active > div::after {
  content: '▋';
  display: inline-block;
  vertical-align: baseline;
  animation: blink 1s step-end infinite;
  color: #000;
  margin-left: 4px;
  font-size: 0.9em;
}

/* 光标闪烁关键帧：0% 和 100% 不透明，50% 完全透明 */
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>

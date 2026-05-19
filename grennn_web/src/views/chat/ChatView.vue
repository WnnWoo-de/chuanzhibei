<template>
  <div class="chat-page bg-transparent h-screen text-[#1a1a1a] font-sans flex flex-col overflow-hidden">
    <!-- 网格背景 -->
    <div
      class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6"
    >
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
      <!-- Mobile grid -->
      <div v-for="n in 4" :key="`m-${n}`" class="border-r border-black h-full block md:hidden col-span-3"></div>
    </div>

    <div class="relative z-10 grid grid-cols-12 gap-6 flex-1 h-full pt-24 px-6 pb-12">
      <ChatSidebarPanel @clear-chat="clearChat" />

      <!-- 聊天界面 -->
      <div class="col-span-12 md:col-span-9 flex flex-col h-full overflow-hidden">
        <div
          class="chat-shell bg-white/90 backdrop-blur-md border border-black/10 flex-1 flex flex-col relative overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl rounded-2xl h-full"
        >
          <ChatHeaderBar @clear-chat="clearChat" />

          <!-- 消息列表区域 - 可滚动 -->
          <div class="flex-1 overflow-hidden flex flex-col">
            <ChatMessageList
              ref="chatMessageListRef"
              :all-prompts="allPrompts"
              :copied-index="copiedMessageIndex"
              :is-typing="isTyping"
              :is-writing="isWriting"
              :messages="messages"
              :render-markdown="renderChatMarkdown"
              @copy-message="copyMessage"
              @quick-prompt="useQuickPrompt"
            />
          </div>

          <ChatQuickPrompts
            :is-shuffling="isShuffling"
            :quick-prompts="quickPrompts"
            @quick-prompt="useQuickPrompt"
            @shuffle="shufflePrompts"
          />

          <!-- 输入框 - 固定在底部 -->
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
const copiedMessageIndex = ref(-1)
let copiedMessageTimer = null
const { allPrompts, quickPrompts, isShuffling, shufflePrompts } = useChatPrompts()

// AI 助手的欢迎消息（固定为对话第一条）
const initialMessage = {
  role: 'assistant',
  content:
    '你好！我是 **GS AI 对话助手** 🌱，来自 GreenSight-绿我同行。无论是垃圾分类查询、旧物改造建议、低碳出行，还是碳足迹分析，我都可以帮你整理成可执行的绿色生活方案。今天想从哪个问题开始？',
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
 * @param {{ content: string, index: number } | string} payload - 要复制的消息内容
 */
const copyMessage = async (payload) => {
  const content = typeof payload === 'string' ? payload : payload?.content || ''
  const index = typeof payload === 'string' ? -1 : Number(payload?.index)

  if (!content.trim()) {
    ElMessage.warning('暂无可复制内容')
    return
  }

  try {
    await navigator.clipboard.writeText(content)
    copiedMessageIndex.value = Number.isInteger(index) ? index : -1

    if (copiedMessageTimer) {
      clearTimeout(copiedMessageTimer)
    }

    copiedMessageTimer = setTimeout(() => {
      copiedMessageIndex.value = -1
      copiedMessageTimer = null
    }, 1600)

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
  if (copiedMessageTimer) {
    clearTimeout(copiedMessageTimer)
    copiedMessageTimer = null
  }
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

:global(:root[data-theme='dark'] .chat-page) {
  color: var(--color-text);
}

:global(:root[data-theme='dark'] .chat-page .border-r) {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

:global(:root[data-theme='dark'] .chat-shell) {
  background:
    linear-gradient(145deg, rgba(6, 18, 11, 0.94), rgba(15, 30, 20, 0.9)),
    radial-gradient(circle at 18% 0%, rgba(110, 231, 123, 0.14), transparent 30rem) !important;
  border-color: rgba(232, 255, 238, 0.2) !important;
  box-shadow: 0 30px 110px rgba(0, 0, 0, 0.58) !important;
  backdrop-filter: blur(28px) saturate(130%);
  -webkit-backdrop-filter: blur(28px) saturate(130%);
}

:global(:root[data-theme='dark'] .chat-shell::before) {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.06), transparent),
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 220% 100%, 100% 34px;
  opacity: 0.28;
  animation: chatGlassDrift 12s linear infinite;
}

:global(:root[data-theme='dark'] .chat-shell > *) {
  position: relative;
  z-index: 1;
}

:global(:root[data-theme='dark'] .chat-shell .markdown-body),
:global(:root[data-theme='dark'] .chat-shell .markdown-body p),
:global(:root[data-theme='dark'] .chat-shell .markdown-body li) {
  color: rgba(244, 247, 244, 0.9);
}

:global(:root[data-theme='dark'] .chat-shell .markdown-body strong),
:global(:root[data-theme='dark'] .chat-shell .markdown-body h1),
:global(:root[data-theme='dark'] .chat-shell .markdown-body h2),
:global(:root[data-theme='dark'] .chat-shell .markdown-body h3),
:global(:root[data-theme='dark'] .chat-shell .markdown-body h4) {
  color: #ffffff;
}

@keyframes chatGlassDrift {
  from {
    background-position: 0 0, 0 0;
  }
  to {
    background-position: 220% 0, 0 34px;
  }
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
:deep(.markdown-body) {
  color: inherit;
  line-height: 1.8;
  word-break: break-word;
}
:deep(.markdown-body > *:first-child) {
  margin-top: 0;
}
:deep(.markdown-body > *:last-child) {
  margin-bottom: 0;
}
:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3),
:deep(.markdown-body h4) {
  margin: 0.9em 0 0.45em;
  font-weight: 700;
  line-height: 1.35;
  color: #111827;
}
:deep(.markdown-body h1) {
  font-size: 1.35rem;
}
:deep(.markdown-body h2) {
  font-size: 1.15rem;
}
:deep(.markdown-body h3) {
  font-size: 1rem;
}
:deep(.markdown-body p) {
  margin-bottom: 0.7em;
}
:deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}
:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  padding-left: 1.4em;
  margin: 0.65em 0;
}
:deep(.markdown-body ul) {
  list-style-type: disc;
}
:deep(.markdown-body ol) {
  list-style-type: decimal;
}
:deep(.markdown-body li) {
  margin-bottom: 0.35em;
}
:deep(.markdown-body li > p) {
  margin-bottom: 0.35em;
}
:deep(.markdown-body strong) {
  font-weight: 700;
  color: #111827;
}
:deep(.markdown-body em) {
  font-style: italic;
}
:deep(.markdown-body a) {
  color: #0f766e;
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 2px;
}
:deep(.markdown-body a:hover) {
  color: #047857;
}
:deep(.markdown-body pre) {
  background: #111827;
  color: #f9fafb;
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  overflow-x: auto;
  margin: 0.75rem 0;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.88em;
  line-height: 1.7;
}
:deep(.markdown-body pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}
:deep(.markdown-body code) {
  background: rgba(15, 23, 42, 0.06);
  padding: 0.15rem 0.4rem;
  border-radius: 0.4rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.88em;
  color: #0f172a;
}
:deep(.markdown-body blockquote) {
  margin: 0.75rem 0;
  padding: 0.75rem 1rem;
  border-left: 3px solid #10b981;
  background: rgba(16, 185, 129, 0.08);
  color: #374151;
  border-radius: 0 0.75rem 0.75rem 0;
}
:deep(.markdown-body hr) {
  border: none;
  border-top: 1px solid rgba(15, 23, 42, 0.12);
  margin: 1rem 0;
}
:deep(.markdown-body table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.8rem 0;
  overflow: hidden;
  border-radius: 0.85rem;
  font-size: 0.92em;
}
:deep(.markdown-body th),
:deep(.markdown-body td) {
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 0.6rem 0.75rem;
  text-align: left;
  vertical-align: top;
}
:deep(.markdown-body th) {
  background: rgba(15, 23, 42, 0.05);
  font-weight: 700;
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

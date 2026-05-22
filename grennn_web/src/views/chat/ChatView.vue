<template>
  <!-- 聊天页面主容器：全屏布局，包含网格背景和聊天界面 -->
  <div class="chat-page bg-transparent h-screen text-[#1a1a1a] font-sans flex flex-col overflow-hidden">
    <!-- 网格背景装饰层 -->
    <div
      class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6"
    >
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
      <!-- 移动端网格（4列） -->
      <div v-for="n in 4" :key="`m-${n}`" class="border-r border-black h-full block md:hidden col-span-3"></div>
    </div>

    <!-- 主内容区域：12列网格布局 -->
    <div class="relative z-10 grid grid-cols-12 gap-6 flex-1 h-full pt-24 px-6 pb-12">
      <!-- 左侧边栏：显示标题、快捷功能入口等 -->
      <ChatSidebarPanel @clear-chat="clearChat" />

      <!-- 聊天界面主体（占9列） -->
      <div class="col-span-12 md:col-span-9 flex flex-col h-full overflow-hidden">
        <!-- 聊天主容器：毛玻璃背景，包含头部、消息列表、快捷提问、输入框 -->
        <div
          class="chat-shell bg-white/90 backdrop-blur-md border border-black/10 flex-1 flex flex-col relative overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl rounded-2xl h-full"
        >
          <!-- 顶部操作栏：清除聊天等操作按钮 -->
          <ChatHeaderBar @clear-chat="clearChat" />

          <!-- 消息列表区域 - 可滚动 -->
          <div class="flex-1 overflow-hidden flex flex-col">
            <!-- 聊天消息列表组件：展示所有对话消息 -->
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

          <!-- 快捷提问区域：提供预设问题快速发送 -->
          <ChatQuickPrompts
            :is-shuffling="isShuffling"
            :quick-prompts="quickPrompts"
            @quick-prompt="useQuickPrompt"
            @shuffle="shufflePrompts"
          />

          <!-- 输入框 - 固定在底部 -->
          <!-- 消息输入组件：文本输入、发送、停止生成、重新生成 -->
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
// ============================================================
// ChatView.vue - AI 聊天主页面
// 组合聊天会话管理、消息展示、快捷提问等功能
// ============================================================
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { langText } from '@/language'
import { renderChatMarkdown } from './chatMarkdown'
import { useChatSession } from './useChatSession'
import ChatComposer from './components/ChatComposer.vue'
import ChatHeaderBar from './components/ChatHeaderBar.vue'
import ChatMessageList from './components/ChatMessageList.vue'
import ChatQuickPrompts from './components/ChatQuickPrompts.vue'
import ChatSidebarPanel from './components/ChatSidebarPanel.vue'
import { useChatPrompts } from './useChatPrompts'

const userStore = useUserStore()                // 用户状态管理
const chatMessageListRef = ref(null)            // 消息列表组件引用，用于调用滚动方法
const copiedMessageIndex = ref(-1)              // 当前已复制消息的索引（用于显示复制成功状态）
let copiedMessageTimer = null                   // 复制状态重置定时器
const { allPrompts, quickPrompts, isShuffling, shufflePrompts } = useChatPrompts() // 快捷提问相关状态

// AI 助手的欢迎消息（固定为对话第一条）
const initialMessage = {
  role: 'assistant',
  content: langText.value.chat.greeting,
  time: new Date().toLocaleTimeString('en-GB'),
}

/** 滚动消息列表到底部 */
const scrollToBottom = () => {
  chatMessageListRef.value?.scrollToBottom()
}

// 使用聊天会话 composable 管理消息收发状态
const {
  abortController,    // 请求中断控制器
  clearChat,          // 清空聊天记录
  isTyping,           // AI 正在思考（等待首个 token）
  isWriting,          // AI 正在输出（流式写入中）
  loadChatHistory,    // 从后端加载历史消息
  messages,           // 消息列表
  newMessage,         // 当前输入框内容
  regenerate,         // 重新生成最后一条回复
  sendMessage,        // 发送消息
  stopGeneration,     // 停止 AI 生成
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
    ElMessage.warning(langText.value.chat.emptyCopy)
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

    ElMessage.success(langText.value.chat.copySuccess)
  } catch (err) {
    console.error('Copy failed:', err)
    ElMessage.error(langText.value.chat.copyFail)
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

:global(html.theme-dark) .chat-page :deep(.markdown-body h1),
:global(html.theme-dark) .chat-page :deep(.markdown-body h2),
:global(html.theme-dark) .chat-page :deep(.markdown-body h3),
:global(html.theme-dark) .chat-page :deep(.markdown-body h4),
:global(html.theme-dark) .chat-page :deep(.markdown-body strong) {
  color: var(--color-text);
}

:global(html.theme-dark) .chat-page :deep(.markdown-body code) {
  background: rgba(110, 231, 164, 0.12);
  color: #b8f7d0;
}

:global(html.theme-dark) .chat-page :deep(.markdown-body blockquote) {
  background: rgba(110, 231, 164, 0.1);
  color: var(--color-text-muted);
}

:global(html.theme-dark) .chat-page :deep(.markdown-body th) {
  background: rgba(110, 231, 164, 0.1);
}

:global(html.theme-dark) .typing-active > div::after {
  color: var(--color-primary);
}
</style>

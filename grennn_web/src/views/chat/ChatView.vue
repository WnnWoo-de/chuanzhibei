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
      <!-- 侧栏 / 头部信息 -->
      <div class="col-span-12 md:col-span-3 flex flex-col md:h-full">
        <div class="sticky top-24">
          <h1 class="text-3xl md:text-5xl font-bold mt-2 mb-4 md:mb-6">GreenSight- AI 助手</h1>
          <p class="text-xs md:text-sm opacity-60 max-w-[200px] mb-4 md:mb-8 hidden md:block">
            AI 环保助手<br />
            您的专属绿色生活顾问，提供可持续生活建议。
          </p>

          <!-- Mobile Status Bar -->
          <div class="flex md:hidden items-center justify-between mb-4 text-xs font-mono opacity-60 border-b border-black/10 pb-2">
             <span>模型: Qwen-2.5</span>
             <span class="text-green-600 font-bold">● 在线</span>
          </div>

          <div class="mb-4 md:mb-8 flex gap-2">
            <router-link
              to="/chat/carbon-footprint"
              class="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-black text-white text-[10px] md:text-xs font-mono uppercase tracking-wider rounded hover:bg-green-600 transition-colors shadow-sm whitespace-nowrap"
            >
              <el-icon><DataLine /></el-icon>
              <span>碳足迹分析</span>
            </router-link>

            <router-link
              to="/chat/waste-recognition"
              class="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white text-black text-[10px] md:text-xs font-mono uppercase tracking-wider rounded border border-black hover:bg-black hover:text-white transition-colors shadow-sm whitespace-nowrap"
            >
              <el-icon><Camera /></el-icon>
              <span>分类识别</span>
            </router-link>

            <button
               @click="clearChat"
               class="md:hidden inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-[10px] font-mono uppercase tracking-wider rounded hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm whitespace-nowrap"
            >
               <el-icon><Delete /></el-icon>
               <span>清空</span>
            </button>
          </div>

          <div class="hidden md:block text-xs font-mono opacity-40 space-y-2">
            <p>状态：<span class="text-green-600 font-bold">在线</span></p>
            <p>模型：Qwen-2.5-72B</p>
            <p>延迟：<span id="latency">--</span>ms</p>
          </div>
        </div>
      </div>

      <!-- 聊天界面 -->
      <div class="col-span-12 md:col-span-9 flex flex-col h-full overflow-hidden pb-4">
        <div
          class="bg-white/90 backdrop-blur-md border border-black/10 flex-1 flex flex-col relative overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl rounded-2xl h-full"
        >
          <!-- 聊天头部栏 -->
          <div
            class="px-4 md:px-6 py-3 border-b border-black/5 flex justify-between items-center bg-white/50 backdrop-blur-sm z-20"
          >
            <div class="flex items-center gap-3">
              <button
                @click="clearChat"
                class="hidden md:flex items-center gap-1 px-2 py-1 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="清空对话"
              >
                <el-icon><Delete /></el-icon>
                <span>清空对话</span>
              </button>
              <span class="md:hidden text-xs font-bold text-gray-500">GreenSight-绿我同行 AI 助手</span>
            </div>
            <div class="font-mono text-[10px] opacity-40 uppercase tracking-widest font-bold">安全连接 // 已加密</div>
          </div>

          <!-- 聊天记录 -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" ref="chatContainer">
            <transition-group name="message-fade">
              <div
                v-for="(msg, index) in messages"
                :key="index"
                class="flex flex-col max-w-[85%] md:max-w-[75%]"
                :class="msg.role === 'user' ? 'ml-auto items-end' : 'items-start'"
              >
                <!-- 消息信息 -->
                <div class="flex items-center gap-2 mb-2 opacity-50">
                  <el-icon v-if="msg.role === 'assistant'" :size="12"><Cpu /></el-icon>
                  <el-icon v-else :size="12"><User /></el-icon>
                  <span class="font-mono text-[10px] uppercase tracking-wider">
                    {{ msg.role === 'user' ? 'You' : 'GreenSight-绿我同行 AI 助手' }} // {{ msg.time }}
                  </span>
                </div>

                <!-- 消息气泡 -->
                <div
                  class="p-4 text-sm leading-relaxed relative group transition-all duration-300"
                  :class="[
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-black to-gray-800 text-white rounded-3xl rounded-tr-sm shadow-lg hover:shadow-xl hover:scale-105'
                      : 'bg-gradient-to-br from-gray-50 to-white text-gray-800 border-2 border-gray-200 rounded-3xl rounded-tl-sm shadow-sm hover:shadow-lg hover:border-green-300 hover:bg-green-50/30',
                  ]"
                >
                  <!-- Markdown 渲染 -->
                  <div
                    v-if="msg.role === 'assistant'"
                    class="markdown-body"
                    :class="{ 'typing-active': isWriting && index === messages.length - 1 }"
                    v-html="renderMarkdown(msg.content)"
                  ></div>
                  <div v-else>{{ msg.content }}</div>

                  <!-- Copy Button -->
                  <button
                    v-if="msg.role === 'assistant' && !isWriting"
                    @click="copyMessage(msg.content)"
                    class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 z-10"
                    title="复制内容"
                  >
                    <el-icon><CopyDocument /></el-icon>
                  </button>

                  <!-- Decorative element for bubble -->
                  <div
                    v-if="msg.role === 'user'"
                    class="absolute w-2 h-2 bg-current opacity-10 rounded-full top-2 right-2"
                  ></div>
                </div>
              </div>
            </transition-group>

            <!-- Empty State / Welcome Suggestions -->
            <transition name="fade">
              <div v-if="messages.length === 1 && !isTyping" class="mt-12 px-2 md:px-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button
                     v-for="(prompt, idx) in allPrompts.slice(0, 4)"
                     :key="idx"
                     @click="useQuickPrompt(prompt)"
                     class="text-left p-4 bg-white border border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-green-50/30 hover:shadow-sm transition-all group"
                   >
                     <div class="flex items-start gap-3">
                       <div class="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:text-primary transition-colors">
                         <el-icon><ChatDotRound /></el-icon>
                       </div>
                       <div>
                         <h4 class="font-medium text-sm text-gray-800 mb-1">示例提问 {{ idx + 1 }}</h4>
                         <p class="text-xs text-gray-500 line-clamp-2">{{ prompt }}</p>
                       </div>
                     </div>
                   </button>
                </div>
              </div>
            </transition>

            <!-- 输入指示 -->
            <transition name="fade">
              <div v-if="isTyping" class="flex flex-col items-start max-w-[75%]">
                <div class="flex items-center gap-2 mb-2 opacity-50">
                  <el-icon :size="12"><Cpu /></el-icon>
                  <span class="font-mono text-[10px] uppercase tracking-wider"
                    >GreenSight-绿我同行 AI 助手 正在思考...</span
                  >
                </div>
                <div
                  class="p-4 bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1 h-[54px]"
                >
                  <div
                    class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style="animation-delay: 0ms"
                  ></div>
                  <div
                    class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style="animation-delay: 150ms"
                  ></div>
                  <div
                    class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style="animation-delay: 300ms"
                  ></div>
                </div>
              </div>
            </transition>
          </div>

          <!-- 快捷问题提示 -->
          <div
            class="px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar border-t border-black/5 bg-gray-50/30 backdrop-blur-sm items-center"
          >
            <button
              @click="shufflePrompts"
              class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-primary hover:border-primary hover:bg-green-50 transition-all duration-300 shadow-sm"
              :class="{ 'animate-spin': isShuffling }"
              title="换一换"
              aria-label="换一换"
            >
              <el-icon><Refresh /></el-icon>
            </button>

            <div class="flex gap-3">
              <transition-group name="list">
                <button
                  v-for="prompt in quickPrompts"
                  :key="prompt"
                  @click="useQuickPrompt(prompt)"
                  class="flex-shrink-0 px-4 py-2 text-xs font-medium bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-full text-gray-700 hover:text-white hover:border-green-500 hover:bg-gradient-to-br hover:from-green-500 hover:to-green-600 hover:-translate-y-1 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 group whitespace-nowrap"
                >
                  <el-icon class="text-green-500 group-hover:text-white transition-colors"
                    ><Promotion
                  /></el-icon>
                  {{ prompt }}
                </button>
              </transition-group>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="p-6 border-t border-black/10 bg-white relative z-20">
            <!-- Stop Generation Button -->
            <transition name="fade">
              <div v-if="isWriting || isTyping" class="absolute -top-12 left-1/2 -translate-x-1/2">
                <button
                  @click="stopGeneration"
                  class="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-500 rounded-full shadow-lg hover:bg-red-50 transition-all text-xs font-medium"
                >
                  <el-icon><VideoPause /></el-icon>
                  <span>停止生成</span>
                </button>
              </div>
            </transition>

            <!-- Regenerate Button -->
            <transition name="fade">
              <div
                v-if="
                  !isWriting &&
                  !isTyping &&
                  messages.length > 1 &&
                  messages[messages.length - 1].role === 'assistant'
                "
                class="absolute -top-12 right-6"
              >
                <button
                  @click="regenerate"
                  class="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-500 rounded-full shadow-sm hover:text-primary hover:border-primary transition-all text-xs"
                >
                  <el-icon><RefreshRight /></el-icon>
                  <span>重新生成</span>
                </button>
              </div>
            </transition>

            <form @submit.prevent="sendMessage" class="flex gap-4 relative items-stretch">
              <div class="flex-1 relative">
                <textarea
                  ref="textareaRef"
                  v-model="newMessage"
                  rows="1"
                  placeholder="请输入您的问题… (Shift+Enter 换行)"
                  class="w-full bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl px-4 py-3 pl-10 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-mono text-sm transition-all shadow-sm hover:border-gray-300 resize-none overflow-hidden max-h-32 leading-6"
                  :disabled="isTyping || isWriting"
                  @input="adjustHeight"
                  @keydown.enter.exact.prevent="sendMessage"
                ></textarea>
                <div class="absolute left-3 top-3 text-gray-400 font-bold">
                  <span class="text-xs">▶</span>
                </div>
              </div>
              <button
                type="submit"
                :disabled="!newMessage.trim() || isTyping || isWriting"
                class="px-8 bg-gradient-to-br from-black to-gray-800 text-white text-xs font-mono uppercase tracking-wider rounded-2xl hover:from-green-600 hover:to-green-700 hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:hover:from-black disabled:hover:to-gray-800 disabled:hover:shadow-none shadow-md flex items-center gap-2 h-full min-h-[46px] font-bold"
              >
                <span>发送</span>
                <el-icon v-if="isTyping || isWriting" class="animate-spin"><Loading /></el-icon>
                <span v-else>→</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import {
  User,
  Cpu,
  Promotion,
  Loading,
  Delete,
  Refresh,
  DataLine,
  CopyDocument,
  VideoPause,
  RefreshRight,
  ChatDotRound
} from '@element-plus/icons-vue'
import { marked } from 'marked'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { consumeChatCompletionsStream, getResponseErrorMessage } from '@/utils/api'

const userStore = useUserStore()
const newMessage = ref('')
const chatContainer = ref(null)
const textareaRef = ref(null)
const isTyping = ref(false)
const isWriting = ref(false)
const isShuffling = ref(false)
const abortController = ref(null)

// AI 助手的欢迎消息（固定为对话第一条）
const initialMessage = {
  role: 'assistant',
  content:
    '你好！我是 **GreenSight-绿我同行 AI 助手** 🌱，您的专属 AI 环保助手。无论是垃圾分类查询、旧物改造建议，还是碳足迹分析，我都可以帮您！有什么想聊的吗？',
  time: new Date().toLocaleTimeString('en-GB'),
}

// 聊天消息列表（响应式数组，初始包含欢迎消息）
const messages = ref([initialMessage])

// ---- Markdown 渲染配置 ----
// 禁用原始 HTML 输出（防止 XSS），启用换行符转 <br>
const markdownRenderer = new marked.Renderer()
markdownRenderer.html = () => ''
marked.setOptions({
  renderer: markdownRenderer,
  breaks: true,
  mangle: false,
  headerIds: false,
})

// ---- 快捷提问池 ----
// 全量提示词，随机从中抽取 4 条显示在底部快捷栏
const allPrompts = [
  '如何回收废旧电池？',
  '旧牛仔裤可以改造成什么？',
  '什么是碳足迹？',
  '推荐一些环保生活习惯',
  '玻璃瓶的创意改造方案',
  '怎么制作环保酵素？',
  '家用电器如何节能？',
  '快递纸箱怎么回收利用？',
  '什么是“零废弃”生活？',
  '如何减少塑料使用？',
  '旧衣物如何回收？',
  '什么是绿色建筑？',
]

// 当前展示的 4 条快捷提问（随机从 allPrompts 中选取）
const quickPrompts = ref([])

/**
 * 随机打乱快捷提问池，取前 4 条展示
 * 点击「换一换」按钮或初始化时调用
 */
const shufflePrompts = async () => {
  isShuffling.value = true
  await new Promise((resolve) => setTimeout(resolve, 300))
  quickPrompts.value = [...allPrompts].sort(() => 0.5 - Math.random()).slice(0, 4)
  isShuffling.value = false
}

/** 点击快捷提问直接发送 */
const useQuickPrompt = (prompt) => {
  newMessage.value = prompt
  sendMessage()
}

/**
 * 清空聊天记录
 * 同时通知后端删除历史并更新本地 store
 */
const clearChat = async () => {
  stopGeneration()
  messages.value = [initialMessage]
  try {
    await axios.delete('/api/v1/chat/history')
    userStore.saveChat(messages.value)
  } catch (err) {
    console.error('Clear chat history failed:', err)
  }
}

/**
 * 将 Markdown 文本渲染为 HTML 字符串
 * 异常时返回空字符串，防止渲染崩溃
 */
const renderMarkdown = (text) => {
  try {
    return marked.parse(String(text || ''))
  } catch (err) {
    void err
    return ''
  }
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

/**
 * 停止当前 AI 生成
 * 调用 AbortController 中断 fetch，重置 isTyping/isWriting 状态
 */
const stopGeneration = () => {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
  isTyping.value = false
  isWriting.value = false
}

/**
 * 重新生成最后一条 AI 回复
 * 移除最后一条 AI 消息和对应的用户消息，重新发送
 */
const regenerate = async () => {
  if (messages.value.length < 2) return

  const lastMsg = messages.value[messages.value.length - 1]
  if (lastMsg.role === 'assistant') {
    messages.value.pop() // Remove assistant message
    const lastUserMsg = messages.value[messages.value.length - 1]
    if (lastUserMsg && lastUserMsg.role === 'user') {
      // Remove last user message to re-send it via sendMessage which adds it back
      messages.value.pop()
      newMessage.value = lastUserMsg.content
      await sendMessage()
    }
  }
}

/**
 * 后端 API 不可用时的降级模拟回复
 * 根据用户消息关键词匹配预设的环保主题回复
 * 通过 typeWriter 逐字输出，模拟流式效果
 */
const simulateAIResponse = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1200))
  if (!isTyping.value) return '' // Stopped

  const lastUserMsg = messages.value[messages.value.length - 1].content.toLowerCase()

  if (lastUserMsg.includes('牛仔裤')) {
    return '旧牛仔裤是非常棒的改造材料！\n\n**推荐方案：**\n1. **时尚托特包**：剪下裤腿，缝合底部，用腰带做提手。\n2. **收纳挂袋**：利用后口袋制作墙面收纳。\n3. **拼接抱枕**：将不同颜色的牛仔布拼接成独特的抱枕套。\n\n您想了解具体的制作步骤吗？'
  } else if (lastUserMsg.includes('电池')) {
    return '废旧电池属于**有害垃圾**，请勿随意丢弃。\n\n**处理建议：**\n- 请投放到专门的红色有害垃圾回收桶。\n- 部分超市或便利店设有电池回收箱。\n- 充电电池建议循环使用以减少污染。\n\n保护土壤和水源，从正确投放电池开始！🌱'
  } else if (lastUserMsg.includes('玻璃瓶')) {
    return '玻璃瓶是绝佳的装饰材料！✨\n\n**创意灵感：**\n- **氛围灯**：放入LED灯串，瞬间变身浪漫夜灯。\n- **水培花瓶**：清洗干净后直接用于水培绿萝等植物。\n- **彩绘装饰**：用丙烯颜料绘制图案，作为独一无二的摆件。'
  } else if (lastUserMsg.includes('塑料')) {
    return '**减少塑料使用小贴士：**\n1. 购物自带布袋。\n2. 拒绝使用一次性吸管，改用不锈钢或纸吸管。\n3. 购买散装蔬菜，减少塑料包装。\n4. 使用可重复使用的水杯，减少购买瓶装水。\n\n每一个小小的改变，都能为地球减负！'
  } else if (lastUserMsg.includes('酵素')) {
    return '**环保酵素制作方法：**\n\n**材料比例**：黑糖 1 : 果皮 3 : 水 10\n\n1. 将切碎的果皮放入容器。\n2. 加入黑糖和水，搅拌均匀。\n3. 密封发酵3个月，第一个月每天开盖放气。\n\n**用途**：清洁剂、肥料、除臭剂。非常有用的变废为宝技巧！'
  } else if (lastUserMsg.includes('碳足迹')) {
    return '**碳足迹**是指个人或组织在日常生活中直接或间接产生的温室气体排放总量。\n\n您可以使用我们侧边栏的 **“碳足迹分析”** 工具来计算您的个人碳足迹，并获取针对性的减排建议。'
  } else if (lastUserMsg.includes('你好') || lastUserMsg.includes('hello')) {
    return '你好！很高兴见到你 🌱 我是 GreenSight-绿我同行 AI 助手，您的专属 AI 环保助手。我们可以聊聊如何让生活更环保，或者您有具体的旧物想要改造吗？'
  } else {
    return '这是一个很好的环保问题！\n\n作为 GreenSight-绿我同行 AI 助手，我建议您：\n1. **减少浪费** (Reduce)：优先选择耐用品。\n2. **重复使用** (Reuse)：寻找物品的第二次生命。\n3. **回收利用** (Recycle)：正确分类回收。\n\n如果您有具体的旧物想要改造，欢迎拍照上传到“旧物重构”板块，我会为您提供专属方案！'
  }
}

/**
 * 逐字打字机效果（fallback 模式下使用）
 * 每 20ms 追加一个字符，模拟流式输出
 * @param text - 要展示的完整文本
 * @param messageRef - 响应式消息对象（直接修改 content 属性）
 */
const typeWriter = async (text, messageRef) => {
  isWriting.value = true
  const speed = 20 // Faster typing
  let currentText = ''

  for (let i = 0; i < text.length; i++) {
    if (!isWriting.value) break // Allow stopping
    currentText += text[i]
    messageRef.content = currentText
    // 每输出 10 个字符滚动一次，避免频繁触发重排
    if (i % 10 === 0) scrollToBottom()
    await new Promise((resolve) => setTimeout(resolve, speed))
  }
  isWriting.value = false
  scrollToBottom()
  // 打字机效果结束后持久化聊天记录
  userStore.saveChat(messages.value)
}

/**
 * 发送用户消息并获取 AI 回复
 * 流程：
 *   1. 将用户消息追加到 messages
 *   2. 调用后端 /api/v1/chat/completions（SSE 流式）
 *   3. 逐步将 delta.content 追加到 AI 消息
 *   4. 失败时降级到本地模拟回复
 */
const sendMessage = async () => {
  if (!newMessage.value.trim() || isTyping.value) return

  const time = new Date().toLocaleTimeString('en-GB')
  const userMsg = newMessage.value

  // 将用户消息追加到消息列表
  messages.value.push({
    role: 'user',
    content: userMsg,
    time: time,
  })

  newMessage.value = ''
  // Reset textarea height
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }

  isTyping.value = true

  await nextTick()
  scrollToBottom()

  // 预先构造 AI 消息占位对象，流式内容将逐步追加到 content
  const assistantMsg = {
    role: 'assistant',
    content: '',
    time: new Date().toLocaleTimeString('en-GB'),
  }

  let timeoutId

  try {
    // 构造发送给后端的消息历史（包含 system prompt + 完整对话记录）
    const apiMessages = [
      {
        role: 'system',
        // System prompt：限定 AI 的角色、语气和领域范围
        content:
          '你是GreenSight-绿我同行 AI助手，一个专注于环保和可持续生活的智能 AI 助手。你的名字叫"GreenSight-绿我同行"，象征着绿色生命的开始。请用友善、专业、亲切的语气回答用户关于环保、回收、节能减排、旧物改造等方面的问题。每次回答时尽量提供实用的建议和具体的操作步骤。',
      },
      // 将本地消息格式转换为 OpenAI 兼容的 { role, content } 格式
      ...messages.value.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    // 若有上一次未完成的请求，先中止它，再创建新的 AbortController
    if (abortController.value) abortController.value.abort()
    abortController.value = new AbortController()

    // 60 秒超时保护：防止后端无响应时页面一直 loading
    timeoutId = setTimeout(() => {
        if (abortController.value) abortController.value.abort()
    }, 60_000)

    // 发起 SSE 流式请求
    const response = await fetch('/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token || ''}` // Add token if available
      },
      body: JSON.stringify({
        messages: apiMessages,
        stream: true,
        // model: 'Qwen/Qwen2.5-72B-Instruct', // Optional: Let backend decide default
      }),
      signal: abortController.value.signal,
    })

    // HTTP 层面的错误处理（4xx / 5xx）
    if (!response.ok) {
      const msg = await getResponseErrorMessage(response, `请求失败 (${response.status})`)
      const err = new Error(msg)
      err.status = response.status
      throw err
    }
    if (!response.body) throw new Error('Missing response body')

    // 将 AI 占位消息加入列表，获取响应式引用用于流式追加
    messages.value.push(assistantMsg)
    const reactiveAssistantMsg = messages.value[messages.value.length - 1]
    isTyping.value = false   // 停止「思考中」动画
    isWriting.value = true   // 开始「输出中」动画

    // 消费 SSE 流，每收到一段 delta.content 就追加到消息并滚动
    await consumeChatCompletionsStream(response.body, {
      signal: abortController.value.signal,
      shouldStop: () => !isWriting.value, // 用户点击「停止」时 isWriting 变为 false
      onDeltaContent: (content) => {
        reactiveAssistantMsg.content += content
        scrollToBottom()
      },
    })

    isWriting.value = false
    // 流结束后持久化到 userStore / localStorage
    userStore.saveChat(messages.value)
  } catch (error) {
    // Token 过期：提示重新登录并静默登出
    if (error?.status === 401) {
      ElMessage.warning('登录已过期，请重新登录后继续聊天')
      userStore.logout({ silent: true })
      return
    }
    // 用户主动中止：不做任何提示
    if (error.name === 'AbortError') {
      console.log('Generation stopped by user')
      return
    }
    console.error('AI Call failed:', error)

    // 若 AI 消息占位对象已加入但内容为空，则移除（避免显示空气泡）
    if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === 'assistant' && messages.value[messages.value.length - 1].content === '') {
        messages.value.pop()
    }

    ElMessage.error('AI 服务暂时不可用，已切换到模拟模式')
    // 降级到本地关键词匹配回复
    await fallbackToSimulation()
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
    // 确保无论成功还是失败都重置 loading 状态
    if (!isWriting.value) {
        isTyping.value = false
    }
    abortController.value = null
  }
}

/**
 * 降级到本地模拟模式
 * API 调用失败时调用，生成预设回复并用打字机效果展示
 */
const fallbackToSimulation = async () => {
  const simulatedContent = await simulateAIResponse()

  const assistantMsg = {
    role: 'assistant',
    content: '',
    time: new Date().toLocaleTimeString('en-GB'),
  }
  messages.value.push(assistantMsg)
  const reactiveAssistantMsg = messages.value[messages.value.length - 1]
  isTyping.value = false

  await typeWriter(simulatedContent, reactiveAssistantMsg)
}

/** 平滑滚动聊天记录到最底部 */
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTo({
      top: chatContainer.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}

/** 动态调整 textarea 高度（随内容自动扩展，最高 8rem） */
const adjustHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

/**
 * 从后端加载历史聊天记录（仅登录用户）
 * 格式化为本地 message 结构后替换 messages 数组
 */
const loadChatHistory = async () => {
  try {
    if (!userStore.isLoggedIn) return
    const response = await axios.get('/api/v1/chat/history')
    const items = Array.isArray(response.data) ? response.data : []
    if (!items.length) return
    messages.value = items.map((item) => ({
      role: item.role,
      content: item.content,
      time: new Date(item.createdAt || Date.now()).toLocaleTimeString('en-GB'),
    }))
  } catch (err) {
    console.error('Load chat history failed:', err)
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

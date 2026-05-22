import { nextTick, ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { consumeChatCompletionsStream, getResponseErrorMessage } from '@/utils/api'
import { getSimulatedChatResponse } from './chatFallbacks'

// 聊天请求的超时时间：超过该时间仍未返回则主动中断，避免界面长期卡在加载状态
const CHAT_REQUEST_TIMEOUT = 90_000
// 打字机动画的节奏控制：每隔 18ms 追加一次文本
const TYPEWRITER_DELAY = 18
// 每次从缓冲区取出的字符数，数值越小打字机效果越明显
const TYPEWRITER_CHUNK_SIZE = 2

export const useChatSession = ({ initialMessage, scrollToBottom, userStore }) => {
  const newMessage = ref('')                  // 当前输入框内容
  const isTyping = ref(false)                 // AI 是否处于“思考中”状态
  const isWriting = ref(false)                // AI 是否正在把流式内容写入界面
  const abortController = ref(null)           // 当前请求的中断控制器
  const messages = ref([initialMessage])      // 当前聊天消息列表，默认带欢迎语

  let activeTypewriterState = null            // 当前打字机任务的状态对象，用于取消旧任务

  /** 终止当前打字机动画，避免重新请求时多个写入循环同时运行 */
  const clearTypewriterTimer = () => {
    if (activeTypewriterState) {
      activeTypewriterState.cancelled = true
      activeTypewriterState = null
    }
  }

  /** 简单延时工具，供打字机动画节流使用 */
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  /**
   * 将流式返回的分片按“打字机”节奏逐步写入消息气泡
   * @param {{ content: string }} messageRef - 当前正在生成的助手消息
   * @param {{ value: string[] }} pendingChunksRef - 等待写入的文本分片队列
   */
  const playTypewriter = async (messageRef, pendingChunksRef) => {
    clearTypewriterTimer()
    const state = { cancelled: false }
    activeTypewriterState = state

    // 只要仍处于输出阶段，或者缓冲区里还有未写完的内容，就继续刷到界面上
    while ((isWriting.value || pendingChunksRef.value.length > 0) && !state.cancelled) {
      if (pendingChunksRef.value.length === 0) {
        await wait(TYPEWRITER_DELAY)
        continue
      }

      const nextChunk = pendingChunksRef.value[0]
      const output = nextChunk.slice(0, TYPEWRITER_CHUNK_SIZE)
      messageRef.content += output
      scrollToBottom()

      // 当前分片写完后移除，否则保留剩余内容等待下一轮写入
      if (output.length >= nextChunk.length) {
        pendingChunksRef.value.shift()
      } else {
        pendingChunksRef.value[0] = nextChunk.slice(output.length)
      }

      await wait(TYPEWRITER_DELAY)
    }

    if (activeTypewriterState === state) {
      activeTypewriterState = null
    }
  }

  /**
   * 当真实 AI 服务不可用时，使用本地模拟回复兜底
   * 这样可以保证聊天页面仍然有完整交互体验
   */
  const fallbackToSimulation = async (userMessage) => {
    const simulatedContent = await getSimulatedChatResponse({
      isTyping: () => isTyping.value,
      userMessage: userMessage || '',
    })

    const assistantMsg = {
      role: 'assistant',
      content: simulatedContent,
      time: new Date().toLocaleTimeString('en-GB'),
    }
    messages.value.push(assistantMsg)
    isTyping.value = false
    isWriting.value = false
    scrollToBottom()
    userStore.saveChat(messages.value)
  }

  /** 用户主动停止生成时，中断请求并保留当前已经生成出的内容 */
  const stopGeneration = () => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
    clearTypewriterTimer()
    isTyping.value = false
    isWriting.value = false
    userStore.saveChat(messages.value)
  }

  /** 清空会话：重置前端消息，同时尝试删除服务端保存的历史记录 */
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

  /** 发送用户消息并处理 AI 的流式回复 */
  const sendMessage = async () => {
    if (!newMessage.value.trim() || isTyping.value) return

    const time = new Date().toLocaleTimeString('en-GB')
    const userMsg = newMessage.value.trim()

    messages.value.push({
      role: 'user',
      content: userMsg,
      time,
    })

    newMessage.value = ''
    isTyping.value = true
    isWriting.value = false

    // 等用户消息渲染到 DOM 后再滚动，避免滚动位置晚一拍
    await nextTick()
    scrollToBottom()

    const assistantMsg = {
      role: 'assistant',
      content: '',
      time: new Date().toLocaleTimeString('en-GB'),
    }

    let timeoutId

    try {
      // 将当前前端消息列表转换为后端接口需要的 OpenAI-style messages 结构
      const apiMessages = [
        {
          role: 'system',
          content:
            '你是 GS AI 对话助手-绿芽，来自 GreenSight-绿我同行，一个专注于环保和可持续生活的智能 AI 助手。你擅长回答垃圾分类、环保回收、节能减排、低碳出行、旧物改造、社区绿色行动等问题。请用友善、专业、亲切的语气回答，优先输出可执行的建议。回答时使用清晰的 Markdown 结构，例如标题、列表、加粗、引用、表格或代码块（在确实合适时使用），确保内容层次清楚、可读性高。',
        },
        ...messages.value.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ]

      // 新请求开始前先取消上一次未结束的请求，避免响应串线
      if (abortController.value) abortController.value.abort()
      abortController.value = new AbortController()

      // 设置总超时保护，避免服务端异常时一直等待
      timeoutId = setTimeout(() => {
        if (abortController.value) abortController.value.abort()
      }, CHAT_REQUEST_TIMEOUT)

      const response = await fetch('/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userStore.token || ''}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          stream: true,
        }),
        signal: abortController.value.signal,
      })

      if (!response.ok) {
        const msg = await getResponseErrorMessage(response, `请求失败 (${response.status})`)
        const err = new Error(msg)
        err.status = response.status
        throw err
      }
      if (!response.body) throw new Error('Missing response body')

      // 先插入一个空的 assistant 消息，后续流式内容直接写到这条消息上
      messages.value.push(assistantMsg)
      const reactiveAssistantMsg = messages.value[messages.value.length - 1]
      const pendingChunksRef = { value: [] } // 流式分片缓冲区，供打字机动画逐步消费
      isTyping.value = false
      isWriting.value = true
      scrollToBottom()

      // 打字机任务和流式读取并行执行：一个负责接收，一个负责展示
      const typewriterTask = playTypewriter(reactiveAssistantMsg, pendingChunksRef)

      await consumeChatCompletionsStream(response.body, {
        signal: abortController.value.signal,
        onDeltaContent: (content) => {
          pendingChunksRef.value.push(content)
        },
      })

      isWriting.value = false
      await typewriterTask

      if (!reactiveAssistantMsg.content.trim()) {
        throw new Error('AI 未返回有效内容')
      }

      // 成功完成后将完整消息同步到本地缓存
      userStore.saveChat(messages.value)
    } catch (error) {
      // 认证过期时直接退出登录，避免用户一直看到失败重试
      if (error?.status === 401) {
        ElMessage.warning('登录已过期，请重新登录后继续聊天')
        userStore.logout({ silent: true })
        return
      }

      // 用户主动中断时不视为错误，只保留已生成内容即可
      if (error.name === 'AbortError') {
        const lastMessage = messages.value[messages.value.length - 1]
        if (lastMessage?.role === 'assistant' && lastMessage.content.trim()) {
          userStore.saveChat(messages.value)
          ElMessage.info('已停止生成，已保留当前内容')
        }
        return
      }

      console.error('AI Call failed:', error)

      // 如果失败时最后一条助手消息还是空的，先移除，避免界面留下空气泡
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage?.role === 'assistant' && !lastMessage.content.trim()) {
        messages.value.pop()
      }

      ElMessage.error('AI 服务暂时不可用，已切换到模拟模式')
      await fallbackToSimulation(userMsg)
    } finally {
      // 无论成功或失败，都要回收计时器并重置状态
      if (timeoutId) clearTimeout(timeoutId)
      clearTypewriterTimer()
      isTyping.value = false
      isWriting.value = false
      abortController.value = null
    }
  }

  /** 重新生成上一条回复：删除上一轮问答后，以同一条用户消息重新发送 */
  const regenerate = async () => {
    if (messages.value.length < 2) return

    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg.role === 'assistant') {
      messages.value.pop()
      const lastUserMsg = messages.value[messages.value.length - 1]
      if (lastUserMsg && lastUserMsg.role === 'user') {
        messages.value.pop()
        newMessage.value = lastUserMsg.content
        await sendMessage()
      }
    }
  }

  /** 从后端加载历史聊天记录，恢复到当前会话列表 */
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

  return {
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
  }
}

import { nextTick, ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { consumeChatCompletionsStream, getResponseErrorMessage } from '@/utils/api'
import { getSimulatedChatResponse } from './chatFallbacks'

const CHAT_REQUEST_TIMEOUT = 90_000
const TYPEWRITER_DELAY = 18
const TYPEWRITER_CHUNK_SIZE = 2

export const useChatSession = ({ initialMessage, scrollToBottom, userStore }) => {
  const newMessage = ref('')
  const isTyping = ref(false)
  const isWriting = ref(false)
  const abortController = ref(null)
  const messages = ref([initialMessage])

  let activeTypewriterState = null

  const clearTypewriterTimer = () => {
    if (activeTypewriterState) {
      activeTypewriterState.cancelled = true
      activeTypewriterState = null
    }
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const playTypewriter = async (messageRef, pendingChunksRef) => {
    clearTypewriterTimer()
    const state = { cancelled: false }
    activeTypewriterState = state

    while ((isWriting.value || pendingChunksRef.value.length > 0) && !state.cancelled) {
      if (pendingChunksRef.value.length === 0) {
        await wait(TYPEWRITER_DELAY)
        continue
      }

      const nextChunk = pendingChunksRef.value[0]
      const output = nextChunk.slice(0, TYPEWRITER_CHUNK_SIZE)
      messageRef.content += output
      scrollToBottom()

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

    await nextTick()
    scrollToBottom()

    const assistantMsg = {
      role: 'assistant',
      content: '',
      time: new Date().toLocaleTimeString('en-GB'),
    }

    let timeoutId

    try {
      const apiMessages = [
        {
          role: 'system',
          content:
            '你是GreenSight-绿我同行 AI助手，一个专注于环保和可持续生活的智能 AI 助手。你的名字叫"GreenSight-绿我同行"，象征着绿色生命的开始。请用友善、专业、亲切的语气回答用户关于环保、回收、节能减排、旧物改造等方面的问题。回答时优先使用清晰的 Markdown 结构来组织内容，例如标题、列表、加粗、引用、表格或代码块（在确实合适时使用），确保内容层次清楚、可读性高，并尽量提供实用建议和具体操作步骤。',
        },
        ...messages.value.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ]

      if (abortController.value) abortController.value.abort()
      abortController.value = new AbortController()

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

      messages.value.push(assistantMsg)
      const reactiveAssistantMsg = messages.value[messages.value.length - 1]
      const pendingChunksRef = { value: [] }
      isTyping.value = false
      isWriting.value = true
      scrollToBottom()

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

      userStore.saveChat(messages.value)
    } catch (error) {
      if (error?.status === 401) {
        ElMessage.warning('登录已过期，请重新登录后继续聊天')
        userStore.logout({ silent: true })
        return
      }

      if (error.name === 'AbortError') {
        const lastMessage = messages.value[messages.value.length - 1]
        if (lastMessage?.role === 'assistant' && lastMessage.content.trim()) {
          userStore.saveChat(messages.value)
          ElMessage.info('已停止生成，已保留当前内容')
        }
        return
      }

      console.error('AI Call failed:', error)

      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage?.role === 'assistant' && !lastMessage.content.trim()) {
        messages.value.pop()
      }

      ElMessage.error('AI 服务暂时不可用，已切换到模拟模式')
      await fallbackToSimulation(userMsg)
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
      clearTypewriterTimer()
      isTyping.value = false
      isWriting.value = false
      abortController.value = null
    }
  }

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

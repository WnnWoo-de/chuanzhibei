import { nextTick, ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { consumeChatCompletionsStream, getResponseErrorMessage } from '@/utils/api'
import { getSimulatedChatResponse } from './chatFallbacks'

export const useChatSession = ({ initialMessage, scrollToBottom, userStore }) => {
  const newMessage = ref('')
  const isTyping = ref(false)
  const isWriting = ref(false)
  const abortController = ref(null)
  const messages = ref([initialMessage])

  const typeWriter = async (text, messageRef) => {
    isWriting.value = true
    const speed = 20
    let currentText = ''

    for (let i = 0; i < text.length; i++) {
      if (!isWriting.value) break
      currentText += text[i]
      messageRef.content = currentText
      if (i % 10 === 0) scrollToBottom()
      await new Promise((resolve) => setTimeout(resolve, speed))
    }

    isWriting.value = false
    scrollToBottom()
    userStore.saveChat(messages.value)
  }

  const fallbackToSimulation = async () => {
    const lastUserMessage = messages.value[messages.value.length - 1]?.content || ''
    const simulatedContent = await getSimulatedChatResponse({
      isTyping: () => isTyping.value,
      userMessage: lastUserMessage,
    })

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

  const stopGeneration = () => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
    isTyping.value = false
    isWriting.value = false
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
    const userMsg = newMessage.value

    messages.value.push({
      role: 'user',
      content: userMsg,
      time,
    })

    newMessage.value = ''
    isTyping.value = true

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
            '你是GreenSight-绿我同行 AI助手，一个专注于环保和可持续生活的智能 AI 助手。你的名字叫"GreenSight-绿我同行"，象征着绿色生命的开始。请用友善、专业、亲切的语气回答用户关于环保、回收、节能减排、旧物改造等方面的问题。每次回答时尽量提供实用的建议和具体的操作步骤。',
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
      }, 60_000)

      const response = await fetch('/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userStore.token || ''}`,
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
      isTyping.value = false
      isWriting.value = true

      await consumeChatCompletionsStream(response.body, {
        signal: abortController.value.signal,
        shouldStop: () => !isWriting.value,
        onDeltaContent: (content) => {
          reactiveAssistantMsg.content += content
          scrollToBottom()
        },
      })

      isWriting.value = false
      userStore.saveChat(messages.value)
    } catch (error) {
      if (error?.status === 401) {
        ElMessage.warning('登录已过期，请重新登录后继续聊天')
        userStore.logout({ silent: true })
        return
      }
      if (error.name === 'AbortError') {
        console.log('Generation stopped by user')
        return
      }

      console.error('AI Call failed:', error)

      if (
        messages.value.length > 0 &&
        messages.value[messages.value.length - 1].role === 'assistant' &&
        messages.value[messages.value.length - 1].content === ''
      ) {
        messages.value.pop()
      }

      ElMessage.error('AI 服务暂时不可用，已切换到模拟模式')
      await fallbackToSimulation()
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
      if (!isWriting.value) {
        isTyping.value = false
      }
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

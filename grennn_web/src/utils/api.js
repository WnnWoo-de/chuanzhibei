// ============================================================
// utils/api.js - API 通用工具函数集
// 封装 HTTP 请求、错误处理、SSE 流式读取等底层能力
// ============================================================

/**
 * 规范化认证字段名
 * 将后端返回的字段名统一映射为前端使用的标准名
 * 例如 'name' -> 'username'
 * @param {string} field - 原始字段名
 * @returns {string} 规范化后的字段名
 */
export const normalizeAuthField = (field) => {
  if (!field) return ''
  const key = String(field).trim()
  if (!key) return ''
  if (key === 'name') return 'username' // 后端用 name，前端统一用 username
  return key
}

/**
 * 规范化后端返回的字段级错误信息
 * 兼容多种后端错误格式：{ errors: {} } / { field_errors: {} } / 数组格式
 * @param {object} data - 后端响应数据
 * @returns {{ [fieldName]: string }} 字段名 -> 错误消息 的映射
 */
export const normalizeAuthFieldErrors = (data) => {
  const out = {}
  if (!data || typeof data !== 'object') return out

  // 尝试从不同字段名中提取错误信息
  const rawErrors = data.errors || data.field_errors || data.fieldErrors

  // 对象格式：{ email: ['错误1'], password: '错误2' }
  if (rawErrors && typeof rawErrors === 'object' && !Array.isArray(rawErrors)) {
    for (const [field, value] of Object.entries(rawErrors)) {
      const key = normalizeAuthField(field)
      if (!key) continue
      // 数组格式：取第一条非空错误信息
      if (Array.isArray(value)) {
        const msg = value.find((v) => typeof v === 'string' && v.trim())?.trim()
        if (msg) out[key] = msg
        continue
      }
      // 字符串格式：直接使用
      if (typeof value === 'string' && value.trim()) {
        out[key] = value.trim()
      }
    }
    return out
  }

  // 数组格式：[{ field: 'email', message: '错误' }]
  if (Array.isArray(rawErrors)) {
    for (const item of rawErrors) {
      const key = normalizeAuthField(item?.field || item?.name || item?.key)
      const msg = typeof item?.message === 'string' ? item.message.trim() : ''
      if (key && msg) out[key] = msg
    }
  }

  return out
}

/**
 * 从 Axios 错误对象中提取可读的错误消息
 * 按优先级依次尝试不同字段
 * @param {Error} err - Axios 错误对象
 * @param {string} fallback - 提取失败时的兜底消息
 * @returns {string} 错误消息
 */
export const getApiErrorMessage = (err, fallback) => {
  const msgCandidates = [
    err?.response?.data?.error,    // 自定义 error 字段
    err?.response?.data?.message,  // message 字段
    err?.response?.data?.detail,   // detail 字段（FastAPI 等常用）
    err?.message,                  // Axios 自身错误消息
  ]
  const msg = msgCandidates.find((v) => typeof v === 'string' && v.trim())?.trim()
  return msg || fallback
}

/**
 * 封装 Axios 请求，统一处理成功/失败响应格式
 * 调用方只需关注 result.ok 即可，无需 try/catch
 * @param {Function} promiseFactory - 返回 Axios Promise 的工厂函数
 * @param {object} options - { fallbackMessage: 失败时的默认提示 }
 * @returns {{ ok: boolean, data: any, status: number, message: string, fieldErrors: object }}
 */
export const requestAxios = async (promiseFactory, { fallbackMessage } = {}) => {
  try {
    const res = await promiseFactory()
    return { ok: true, data: res?.data, status: res?.status, message: '', fieldErrors: {} }
  } catch (err) {
    const status = err?.response?.status
    const message = getApiErrorMessage(err, fallbackMessage || '请求失败')
    const fieldErrors = normalizeAuthFieldErrors(err?.response?.data)
    return { ok: false, data: null, status, message, fieldErrors }
  }
}

/**
 * 从 fetch Response 对象中提取错误消息
 * 优先尝试解析 JSON，其次读取纯文本
 * @param {Response} response - fetch 响应对象
 * @param {string} fallback - 兜底消息
 * @returns {Promise<string>} 错误消息
 */
export const getResponseErrorMessage = async (response, fallback) => {
  if (!response) return fallback
  let msg = fallback
  try {
    const data = await response.json()
    const maybe = data?.error || data?.message || data?.detail
    if (typeof maybe === 'string' && maybe.trim()) return maybe.trim()
  } catch (err) {
    void err
    // JSON 解析失败，尝试读取纯文本
    try {
      const text = await response.text()
      if (typeof text === 'string' && text.trim()) msg = text.trim()
    } catch (err2) {
      void err2
    }
  }
  return msg
}

/**
 * 派发全局用户登出事件
 * 供 main.js 等全局监听器捕获，处理过期跳转等逻辑
 * @param {object} options - { reason: 'expired' | 'user' }
 */
export const dispatchAuthLogout = ({ reason } = {}) => {
  if (typeof window === 'undefined') return
  if (typeof window.dispatchEvent !== 'function') return
  try {
    window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: reason || '' } }))
  } catch (err) {
    void err
  }
}

/**
 * 消费 SSE（Server-Sent Events）流
 * 逐行解析 "data: ..." 格式的流式响应
 * @param {ReadableStream} stream - 响应体流
 * @param {object} options
 * @param {AbortSignal} options.signal - 用于中断读取的信号
 * @param {Function} options.shouldStop - 返回 true 时停止读取
 * @param {Function} options.onData - 每次收到一条 data 时的回调
 */
export const consumeSseStream = async (stream, { signal, shouldStop, onData } = {}) => {
  if (!stream) return
  const reader = stream.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  // 安全取消读取器
  const cancelReader = async () => {
    try {
      await reader.cancel()
    } catch (err) {
      void err
    }
  }

  try {
    while (true) {
      // 检查外部停止信号
      if (typeof shouldStop === 'function' && shouldStop()) {
        await cancelReader()
        return
      }
      // 检查 AbortController 信号
      if (signal?.aborted) {
        await cancelReader()
        const err = new Error('Aborted')
        err.name = 'AbortError'
        throw err
      }

      const { done, value } = await reader.read()
      if (done) break

      // 解码字节流并追加到缓冲区
      buffer += decoder.decode(value, { stream: true })

      // 按换行符分割，最后一段可能不完整，保留到下次拼接
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        if (!trimmed.startsWith('data:')) continue // 只处理 data 行
        const payload = trimmed.slice(5).trim()
        if (!payload || payload === '[DONE]') continue // 跳过结束标志
        if (typeof onData === 'function') onData(payload)
      }
    }
  } finally {
    // 无论如何都释放读取器锁
    try {
      reader.releaseLock()
    } catch (err) {
      void err
    }
  }
}

/**
 * 消费 OpenAI Chat Completions 格式的 SSE 流
 * 自动解析 delta.content 并回调给调用方
 * @param {ReadableStream} stream - 响应体流
 * @param {object} options
 * @param {AbortSignal} options.signal - 中断信号
 * @param {Function} options.shouldStop - 停止条件函数
 * @param {Function} options.onDeltaContent - 每次收到增量文本时的回调
 */
export const consumeChatCompletionsStream = async (
  stream,
  { signal, shouldStop, onDeltaContent } = {},
) => {
  await consumeSseStream(stream, {
    signal,
    shouldStop,
    onData: (payload) => {
      try {
        const json = JSON.parse(payload)
        const delta = json?.choices?.[0]?.delta || {}
        // 兼容普通内容和 reasoning_content（思维链内容）
        const content = delta.content || delta.reasoning_content || ''
        if (content && typeof onDeltaContent === 'function') onDeltaContent(content)
      } catch (err) {
        void err // 忽略 JSON 解析失败的行
      }
    },
  })
}

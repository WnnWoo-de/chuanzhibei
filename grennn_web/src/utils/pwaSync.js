import axios from 'axios'

const QUEUE_KEY = 'greensight_pwa_sync_queue'
const MAX_QUEUE_SIZE = 50
const SYNCABLE_METHODS = new Set(['post', 'put', 'patch', 'delete'])
const EXCLUDED_PATHS = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/reset-password']

let installed = false
let flushing = false

const emitSyncStatus = (detail = {}) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('pwa:sync-status', { detail: getPwaSyncState(detail) }))
}

const readQueue = () => {
  if (typeof localStorage === 'undefined') return []
  try {
    const parsed = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    void err
    return []
  }
}

const writeQueue = (queue) => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE_SIZE)))
  } catch (err) {
    void err
  }
}

const isNetworkError = (error) => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true
  return !error?.response && ['ERR_NETWORK', 'ECONNABORTED'].includes(error?.code)
}

const getUrlPath = (url = '') => {
  try {
    return new URL(url, window.location.origin).pathname
  } catch (err) {
    void err
    return String(url).split('?')[0]
  }
}

const canSerializeData = (data) => {
  if (!data) return true
  if (typeof FormData !== 'undefined' && data instanceof FormData) return false
  if (typeof Blob !== 'undefined' && data instanceof Blob) return false
  if (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer) return false
  return ['string', 'number', 'boolean', 'object'].includes(typeof data)
}

const normalizeHeaders = (headers = {}) => {
  const normalized = typeof headers.toJSON === 'function' ? headers.toJSON() : { ...headers }
  delete normalized.Authorization
  delete normalized.authorization
  return normalized
}

const shouldQueueRequest = (config = {}, error) => {
  if (!isNetworkError(error)) return false
  if (config.__pwaSyncReplay || config.__skipPwaSync) return false

  const method = String(config.method || 'get').toLowerCase()
  if (!SYNCABLE_METHODS.has(method)) return false
  if (!canSerializeData(config.data)) return false

  const path = getUrlPath(config.url)
  return path.startsWith('/api/') && !EXCLUDED_PATHS.includes(path)
}

const buildQueueItem = (config = {}) => {
  const method = String(config.method || 'get').toLowerCase()
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
    method,
    url: config.url,
    baseURL: config.baseURL || '',
    params: config.params || null,
    data: config.data || null,
    headers: normalizeHeaders(config.headers),
    timeout: config.timeout || 0,
    withCredentials: Boolean(config.withCredentials),
  }
}

const enqueueRequest = (config) => {
  const queue = readQueue()
  const item = buildQueueItem(config)
  queue.push(item)
  writeQueue(queue)
  emitSyncStatus({ pending: queue.length, lastQueuedAt: item.createdAt })
  return item
}

const replayItem = async (item) => {
  await axios.request({
    method: item.method,
    url: item.url,
    baseURL: item.baseURL || undefined,
    params: item.params || undefined,
    data: item.data || undefined,
    headers: item.headers || undefined,
    timeout: item.timeout || undefined,
    withCredentials: item.withCredentials,
    __pwaSyncReplay: true,
  })
}

export const getPwaSyncState = (extra = {}) => {
  const queue = readQueue()
  return {
    pending: queue.length,
    flushing,
    lastQueuedAt: queue.at(-1)?.createdAt || null,
    ...extra,
  }
}

export const flushPwaSyncQueue = async () => {
  if (flushing) return getPwaSyncState()
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return getPwaSyncState()

  const queue = readQueue()
  if (queue.length === 0) {
    emitSyncStatus({ pending: 0 })
    return getPwaSyncState()
  }

  flushing = true
  emitSyncStatus({ flushing: true, pending: queue.length })

  const failed = []
  let synced = 0

  for (const [index, item] of queue.entries()) {
    try {
      await replayItem(item)
      synced += 1
    } catch (err) {
      failed.push(item)
      if (isNetworkError(err)) {
        failed.push(...queue.slice(index + 1))
        break
      }
    }
  }

  writeQueue(failed)
  flushing = false
  emitSyncStatus({ flushing: false, pending: failed.length, synced })

  return getPwaSyncState({ synced })
}

export const installPwaSync = () => {
  if (installed || typeof window === 'undefined') return
  installed = true

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const config = error?.config || {}
      if (shouldQueueRequest(config, error)) {
        enqueueRequest(config)
        const queuedError = new Error('当前网络不可用，操作已加入同步队列')
        queuedError.name = 'PwaSyncQueuedError'
        queuedError.isPwaSyncQueued = true
        queuedError.config = config
        return Promise.reject(queuedError)
      }
      return Promise.reject(error)
    },
  )

  window.addEventListener('online', () => {
    void flushPwaSyncQueue()
  })

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void flushPwaSyncQueue()
  })

  void flushPwaSyncQueue()
}

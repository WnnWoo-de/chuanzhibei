// ============================================================
// stores/user.js - 用户状态管理 Store
// 管理用户登录态、Token、个人信息、积分、成就徽章及聊天记录
// ============================================================

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { dispatchAuthLogout, requestAxios } from '@/utils/api'

// 标记 Axios 拦截器是否已安装（防止重复安装）
let axiosInterceptorsInstalled = false

export const useUserStore = defineStore('user', () => {
  // ---- 响应式状态 ----
  const user = ref(null)                                          // 当前登录用户信息
  const token = ref(localStorage.getItem('green_token') || '')   // 从 localStorage 恢复 Token

  const badges = ref([])       // 成就徽章列表
  const chatHistory = ref([])  // 聊天历史记录
  const isReady = ref(false)   // 用户状态是否已初始化完成

  // ---- 计算属性 ----
  const isLoggedIn = computed(() => Boolean(token.value)) // 是否已登录
  const isGuest = computed(() => !token.value)            // 是否为游客

  /**
   * 规范化后端返回的用户数据结构
   * 统一 username / name / points 字段
   * @param {object} rawUser - 后端原始用户数据
   * @returns {object|null} 规范化后的用户对象
   */
  const normalizeUser = (rawUser) => {
    if (!rawUser || typeof rawUser !== 'object') return null

    const username = rawUser.username || rawUser.name || rawUser.email || ''
    const points = Number.isFinite(Number(rawUser.points)) ? Number(rawUser.points) : 0

    return {
      ...rawUser,
      username,
      name: rawUser.name || username,
      points,
    }
  }

  /**
   * 持久化 Token 到 localStorage
   * 传入空值时清除 Token
   * @param {string} newToken - 新 Token
   */
  const setToken = (newToken) => {
    token.value = newToken || ''
    if (token.value) {
      try {
        localStorage.setItem('green_token', token.value)
      } catch (err) {
        void err
      }
    } else {
      try {
        localStorage.removeItem('green_token')
      } catch (err) {
        void err
      }
    }
  }

  /**
   * 规范化并设置用户信息
   * @param {object} rawUser - 后端原始用户数据
   */
  const setUser = (rawUser) => {
    user.value = normalizeUser(rawUser)
  }

  /**
   * 安装 Axios 请求/响应拦截器（只安装一次）
   * - 请求拦截：自动在请求头附加 Bearer Token
   * - 响应拦截：401 时自动触发静默登出
   */
  const installAxiosInterceptors = () => {
    if (axiosInterceptorsInstalled) return
    axiosInterceptorsInstalled = true

    // 请求拦截：自动注入 Authorization 头
    axios.interceptors.request.use((config) => {
      const cfg = config || {}
      const headers = cfg.headers || {}
      if (token.value && !headers.Authorization) {
        headers.Authorization = `Bearer ${token.value}`
      }
      cfg.headers = headers
      return cfg
    })

    // 响应拦截：Token 失效（401）时自动登出
    axios.interceptors.response.use(
      (res) => res,
      (err) => {
        const status = err?.response?.status
        if (status === 401 && token.value) {
          logout({ silent: true }) // 静默登出，触发过期事件
        }
        return Promise.reject(err)
      },
    )
  }

  /**
   * 请求并更新用户个人信息
   * @returns {object} 规范化后的用户信息
   */
  const fetchUserProfile = async () => {
    const result = await requestAxios(() => axios.get('/api/v1/users/me'), {
      fallbackMessage: '获取用户信息失败',
    })
    if (!result.ok) throw new Error(result.message)
    setUser(result.data)
    return user.value
  }

  /**
   * 更新当前用户资料
   * @param {{ username: string, avatar?: string, bio?: string }} payload
   * @returns {{ ok: boolean, message: string, fieldErrors: object }}
   */
  const updateProfile = async (payload = {}) => {
    const result = await requestAxios(() => axios.put('/api/v1/users/me', payload), {
      fallbackMessage: '更新资料失败',
    })
    if (!result.ok) {
      if (Object.keys(result.fieldErrors).length === 0) ElMessage.error(result.message)
      return { ok: false, message: result.message, fieldErrors: result.fieldErrors }
    }

    setUser(result.data?.user || result.data)
    ElMessage.success('资料已更新')
    return { ok: true, message: '' }
  }

  /**
   * 应用认证信息（Token + 用户数据）
   * 如果传入了 Token 则更新；如果传入了用户数据则更新；
   * 如果有 Token 但无用户数据，则从接口获取
   */
  const applyAuth = async ({ accessToken, rawUser } = {}) => {
    if (accessToken) setToken(accessToken)
    if (rawUser) setUser(rawUser)
    if (token.value && !user.value) {
      await fetchUserProfile()
    }
  }

  /**
   * 接受外部 Token（如 OAuth 回调）并尝试登录
   * @param {string} accessToken - 外部传入的 Token
   * @returns {boolean} 是否成功
   */
  const acceptToken = async (accessToken) => {
    try {
      await applyAuth({ accessToken })
      return true
    } catch (err) {
      void err
      logout({ silent: true })
      return false
    }
  }

  /**
   * 初始化用户状态（只执行一次）
   * - 安装 Axios 拦截器
   * - 尝试用已存储的 Token 获取用户信息
   * - 从 localStorage 恢复徽章和聊天记录
   */
  const init = async () => {
    if (isReady.value) return // 已初始化则跳过
    installAxiosInterceptors()

    // 有 Token 时，验证 Token 有效性并获取用户信息
    if (token.value) {
      try {
        await fetchUserProfile()
      } catch (err) {
        void err
        logout({ silent: true }) // Token 无效，静默清除
      }
    }

    // 从 localStorage 恢复成就徽章数据
    const storedBadges = localStorage.getItem('green_badges')
    if (storedBadges) {
      try {
        const parsed = JSON.parse(storedBadges)
        if (Array.isArray(parsed)) badges.value = parsed
      } catch (err) {
        void err
      }
    }

    // 从 localStorage 恢复聊天历史
    const storedChat = localStorage.getItem('green_chat')
    if (storedChat) {
      try {
        const parsed = JSON.parse(storedChat)
        if (Array.isArray(parsed)) chatHistory.value = parsed
      } catch (err) {
        void err
      }
    }

    isReady.value = true
  }

  /**
   * 用户登录
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @param {object} options - { silent: 是否静默（不弹提示） }
   * @returns {{ ok: boolean, message: string, fieldErrors: object }}
   */
  const login = async (email, password, { silent } = {}) => {
    const result = await requestAxios(() => axios.post('/api/v1/auth/login', { email, password }), {
      fallbackMessage: '登录失败',
    })
    if (!result.ok) {
      // 非字段级错误才显示全局提示
      if (!silent && Object.keys(result.fieldErrors).length === 0) ElMessage.error(result.message)
      return { ok: false, message: result.message, fieldErrors: result.fieldErrors }
    }

    // 提取 Token（兼容不同字段名）
    const accessToken = result.data?.access_token || result.data?.token || ''
    if (!accessToken) {
      const message = '登录失败'
      if (!silent) ElMessage.error(message)
      return { ok: false, message, fieldErrors: {} }
    }

    await applyAuth({ accessToken, rawUser: result.data?.user })
    if (!silent) ElMessage.success('登录成功')
    return { ok: true, message: '' }
  }

  /**
   * 用户注册
   * 注册成功后自动尝试登录
   * @param {string} username - 用户名
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @param {object} options - { silent: 是否静默 }
   */
  const register = async (username, email, password, { silent } = {}) => {
    const result = await requestAxios(
      () => axios.post('/api/v1/auth/register', { username, email, password }),
      { fallbackMessage: '注册失败' },
    )
    if (!result.ok) {
      if (!silent && Object.keys(result.fieldErrors).length === 0) ElMessage.error(result.message)
      return { ok: false, message: result.message, fieldErrors: result.fieldErrors }
    }

    const accessToken = result.data?.access_token || result.data?.token || ''
    const rawUser = result.data?.user

    if (accessToken) {
      // 后端直接返回 Token，直接登录
      await applyAuth({ accessToken, rawUser })
    } else {
      // 后端未返回 Token，手动发起登录请求
      const loginResult = await login(email, password, { silent: true })
      if (!loginResult.ok) {
        const message = loginResult.message || '注册失败'
        if (!silent) ElMessage.error(message)
        return { ok: false, message, fieldErrors: loginResult.fieldErrors || {} }
      }
    }

    if (!silent) ElMessage.success('注册成功')
    return { ok: true, message: '' }
  }

  /**
   * 验证邮箱是否存在（用于密码重置）
   * @param {string} email - 邮箱
   * @param {object} options - { silent: 是否静默（不弹提示） }
   * @returns {{ ok: boolean, message: string, fieldErrors: object, resetToken?: string }}
   */
  const verifyEmail = async (email, { silent } = {}) => {
    const result = await requestAxios(() => axios.post('/api/v1/auth/verify-email', { email }), {
      fallbackMessage: '验证邮箱失败',
    })
    if (!result.ok) {
      if (!silent && Object.keys(result.fieldErrors).length === 0) ElMessage.error(result.message)
      return { ok: false, message: result.message, fieldErrors: result.fieldErrors }
    }

    if (!silent) ElMessage.success('邮箱验证成功，可继续重置密码')
    return {
      ok: true,
      message: '',
      resetToken: result.data?.reset_token || 'temp-token' // 临时 token，实际项目中应该由后端生成
    }
  }

  /**
   * 重置密码
   * @param {string} email - 邮箱
   * @param {string} newPassword - 新密码
   * @param {object} options - { silent: 是否静默（不弹提示） }
   * @returns {{ ok: boolean, message: string, fieldErrors: object }}
   */
  const resetPassword = async (email, newPassword, { silent } = {}) => {
    const result = await requestAxios(() => axios.post('/api/v1/auth/reset-password', { email, password: newPassword }), {
      fallbackMessage: '重置密码失败',
    })
    if (!result.ok) {
      if (!silent && Object.keys(result.fieldErrors).length === 0) ElMessage.error(result.message)
      return { ok: false, message: result.message, fieldErrors: result.fieldErrors }
    }

    if (!silent) ElMessage.success('密码已重置成功，请重新登录')
    return { ok: true, message: '' }
  }

  /**
   * 用户登出
   * 清空 Token 和用户信息，触发全局登出事件
   * @param {object} options - { silent: true 为静默登出（Token 过期场景） }
   */
  const logout = ({ silent } = {}) => {
    setToken('')
    user.value = null
    if (!silent) ElMessage.info('已退出登录')
    // 触发全局 auth:logout 事件，通知其他监听者（如 main.js）
    dispatchAuthLogout({ reason: silent ? 'expired' : 'user' })
  }

  /**
   * 增加用户积分（本地先更新，再同步到后端）
   * 若后端同步失败，回滚本地积分
   * @param {number} amount - 增加的积分数量
   */
  const addPoints = async (amount) => {
    if (!user.value) return
    const inc = Number(amount)
    if (!Number.isFinite(inc)) return

    const prev = Number(user.value.points || 0)
    user.value.points = prev + inc

    // 积分更新后，检查是否解锁新成就
    checkAndUnlockBadges()

    const result = await requestAxios(() => axios.post('/api/v1/users/me/points', { amount: inc }), {
      fallbackMessage: '同步积分失败',
    })
    // 后端同步失败时回滚积分
    if (!result.ok) user.value.points = prev
  }

  /**
   * 解锁指定徽章
   * @param {number} badgeId - 徽章 ID
   * @returns {boolean} 是否成功解锁（已解锁或不存在返回 false）
   */
  const unlockBadge = (badgeId) => {
    const badge = badges.value.find(b => b.id === badgeId)
    if (!badge || badge.unlocked) return false
    badge.unlocked = true
    badge.unlockedDate = new Date().toISOString().split('T')[0]
    save()
    // 触发全局徽章解锁事件，供成就页面监听并展示庆祝动画
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('badge:unlocked', { detail: { badge } }))
    }
    return true
  }

  /**
   * 根据积分自动检查并解锁成就
   * 积分达到阈值时自动解锁对应徽章
   */
  const checkAndUnlockBadges = () => {
    if (badges.value.length === 0) return
    const points = Number(user.value?.points || 0)
    // 初芽：有积分即视为完成首次重构
    if (points >= 50) unlockBadge(1)
    // 黄金成就：累计 5000 积分
    if (points >= 5000) unlockBadge(12)
    // 可持续冠军：积分达到最高等级阈值
    if (points >= 4000) unlockBadge(15)
  }

  /**
   * 保存聊天记录到内存和 localStorage
   * @param {Array} messages - 聊天消息数组
   */
  const saveChat = (messages) => {
    chatHistory.value = messages
    try {
      localStorage.setItem('green_chat', JSON.stringify(messages))
    } catch (err) {
      void err
    }
  }

  /**
   * 持久化徽章和聊天记录到 localStorage
   */
  const save = () => {
    try {
      localStorage.setItem('green_badges', JSON.stringify(badges.value))
    } catch (err) {
      void err
    }
    try {
      localStorage.setItem('green_chat', JSON.stringify(chatHistory.value))
    } catch (err) {
      void err
    }
  }

  // 暴露状态和方法供组件使用
  return {
    user,
    token,
    isLoggedIn,
    isGuest,
    isReady,
    badges,
    chatHistory,
    init,
    acceptToken,
    fetchUserProfile,
    updateProfile,
    login,
    register,
    verifyEmail,
    resetPassword,
    logout,
    addPoints,
    unlockBadge,
    checkAndUnlockBadges,
    saveChat,
    save,
  }
})

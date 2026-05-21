<template>
  <!-- 登录页面主容器：全屏居中布局 -->
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans flex items-center justify-center px-6 relative overflow-hidden">
    <!-- 背景网格装饰（固定定位，纯视觉） -->
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-black h-full"></div>
    </div>

    <!-- 主内容区域 -->
    <div class="relative z-10 w-full max-w-md">
      <!-- 登录卡片容器 -->
      <div class="bg-white/95 border border-black/10 p-8 md:p-12 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] relative overflow-hidden group">
        <!-- 顶部绿色渐变装饰条 -->
        <div class="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>

        <!-- 卡片头部：Logo + 标题 -->
        <div class="text-center mb-8 pt-8">
          <div class="mb-6 flex justify-center">
            <img src="@/assets/logo.png" alt="GreenSight Logo" class="w-20 h-20 object-contain rounded-3xl shadow-lg border border-black/10" />
          </div>
          <p class="font-mono text-xs uppercase tracking-widest opacity-50 mb-2">{{ langText.auth.verification }}</p>
          <h2 class="text-3xl font-bold">{{ langText.auth.login }}</h2>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- 邮箱/用户名输入框 -->
          <BaseInput
            id="email"
            v-model="email"
            type="text"
            :label="langText.auth.emailOrUsername"
            :placeholder="langText.auth.enterEmailOrUsername"
            autocomplete="username"
            inputmode="text"
            :error="errors.email"
            :success="touched.email && Boolean(email) && !errors.email"
            required
            @blur="validateEmail"
          />

          <!-- 密码输入框 -->
          <div class="space-y-4">
            <BaseInput
              id="password"
              v-model="password"
              type="password"
              :label="langText.auth.password"
              placeholder="••••••••"
              autocomplete="current-password"
              :error="errors.password"
              required
              @blur="validatePassword"
            />
            <!-- 忘记密码链接 -->
            <div class="text-right">
              <router-link
                :to="{ name: 'forgot-password' }"
                class="text-xs text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                {{ langText.auth.forgotPassword }}
              </router-link>
            </div>
          </div>

          <!-- 提交按钮：加载中显示 spinner -->
          <div>
            <BaseButton type="submit" class="w-full" :is-loading="isLoading">
              {{ langText.auth.login }}
            </BaseButton>
          </div>
        </form>

        <!-- 登录方式补充 -->
        <div class="mt-6 space-y-4 border-t border-black/10 pt-6">
          <!-- 注册入口 -->
          <div class="text-center pt-2">
            <p class="text-xs opacity-60 mb-2">{{ langText.auth.noAccount }}</p>
            <router-link
              :to="{ name: 'register', query: { redirect: route.query?.redirect } }"
              class="inline-flex items-center justify-center gap-1 px-4 py-2 bg-black text-white text-xs font-mono uppercase tracking-wider rounded hover:bg-green-600 transition-colors"
            >
              <span>{{ langText.auth.registerNow }}</span><span>→</span>
            </router-link>
          </div>

          <!-- 游客模式入口（无需登录体验部分功能） -->
          <div class="text-center pt-2 border-t border-black/10">
            <p class="text-xs opacity-60 mb-2">{{ langText.auth.tryFirst }}</p>
            <router-link
              to="/chat"
              class="inline-flex items-center justify-center gap-1 px-4 py-2 bg-green-50 text-green-700 text-xs font-mono uppercase tracking-wider rounded border border-green-200 hover:bg-green-100 transition-colors"
            >
              <span>{{ langText.auth.guestMode }}</span><span>→</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// views/auth/LoginView.vue - 登录页面
// 包含邮箱/用户名 + 密码表单，支持字段级实时校验
// 支持 Token 自动登录（OAuth 回调）
// ============================================================
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useUserStore } from '@/stores/user'
import { langText } from '@/language'

// 表单字段响应式变量
const email = ref('')
const password = ref('')
// 提交状态（控制 loading 动画）
const isLoading = ref(false)

// 字段级错误信息
const errors = reactive({ email: '', password: '' })
// 字段是否已被用户交互过（用于控制成功状态显示）
const touched = reactive({ email: false, password: false })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

/**
 * 安全校验重定向路径
 * - 必须以 / 开头（禁止外链）
 * - 禁止 // 开头（协议相对 URL，防止开放重定向攻击）
 * @param {*} redirect - 路由查询参数中的 redirect 值
 */
const getRedirectPath = (redirect) => {
  if (typeof redirect !== 'string') return ''
  if (!redirect.startsWith('/')) return ''
  if (redirect.startsWith('//')) return ''
  return redirect
}

/**
 * 校验邮箱/用户名字段
 * - 支持 trim 操作（表单提交前去除首尾空格）
 * - 若看起来像邮箱格式则校验 email 正则
 * @param {object} options - { shouldTrim: boolean }
 */
const validateEmail = (options) => {
  const shouldTrim = Boolean(options?.shouldTrim) || Boolean(options?.target)
  touched.email = true
  if (shouldTrim) email.value = email.value.trim()
  if (!email.value) {
    errors.email = langText.value.auth.enterEmailOrUsernameErr
    return false
  }
  const value = email.value.trim()
  if (value.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      errors.email = langText.value.auth.invalidEmailFormat
      return false
    }
  }
  errors.email = ''
  return true
}

/**
 * 校验密码字段
 * - 不能为空
 * - 长度至少 6 位
 */
const validatePassword = () => {
  touched.password = true
  if (!password.value) {
    errors.password = langText.value.auth.enterPassword
    return false
  }
  if (password.value.length < 6) {
    errors.password = langText.value.auth.passwordMinLength
    return false
  }
  errors.password = ''
  return true
}

/**
 * 自动聚焦第一个有错误的输入框（提升无障碍体验）
 */
const focusFirstInvalid = () => {
  if (errors.email) { document.getElementById('email')?.focus?.(); return }
  if (errors.password) { document.getElementById('password')?.focus?.() }
}

/**
 * 处理登录表单提交
 * 1. 校验所有字段
 * 2. 调用 userStore.login
 * 3. 成功后跳转到 redirect 目标或首页
 */
const handleLogin = async () => {
  if (isLoading.value) return
  const isEmailValid = validateEmail({ shouldTrim: true })
  const isPasswordValid = validatePassword()
  if (!isEmailValid || !isPasswordValid) { focusFirstInvalid(); return }

  isLoading.value = true
  const result = await userStore.login(email.value.trim(), password.value)
  isLoading.value = false

  if (!result.ok) {
    // 将后端字段级错误回填到对应输入框
    const fieldErrors = result.fieldErrors || {}
    if (fieldErrors.email) errors.email = fieldErrors.email
    if (fieldErrors.password) errors.password = fieldErrors.password
    focusFirstInvalid()
    return
  }

  // 登录成功：跳转到 redirect 目标或首页
  const redirect = getRedirectPath(route.query?.redirect)
  router.replace(redirect || '/')
}

// 实时校验：字段被 touch 后，每次输入都触发校验（实时提示）
watch(email, () => { if (touched.email) validateEmail() })
watch(password, () => { if (touched.password) validatePassword() })

// 页面挂载时：检查 URL 中是否有 Token（OAuth 回调自动登录）
onMounted(async () => {
  const queryToken = route.query?.token || route.query?.access_token
  if (typeof queryToken !== 'string' || !queryToken) return
  // 有 OAuth Token：尝试自动登录
  isLoading.value = true
  const success = await userStore.acceptToken(queryToken)
  isLoading.value = false
  if (success) {
    const redirect = getRedirectPath(route.query?.redirect)
    router.replace(redirect || '/')
  }
})
</script>

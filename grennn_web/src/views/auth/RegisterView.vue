<template>
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans flex items-center justify-center px-6 relative overflow-hidden">
    <!-- 背景网格装饰 -->
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-black h-full"></div>
    </div>

    <div class="relative z-10 w-full max-w-md">
      <div class="bg-white/95 border border-black/10 p-8 md:p-12 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] relative overflow-hidden group">
        <!-- 顶部绿色渐变装饰条 -->
        <div class="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>

        <!-- 卡片头部 -->
        <div class="text-center mb-8 pt-8">
          <div class="mb-6 flex justify-center">
            <img src="@/assets/logo.png" alt="GreenSight Logo" class="w-20 h-20 object-contain rounded-3xl shadow-lg border border-black/10" />
          </div>
          <p class="font-mono text-xs uppercase tracking-widest opacity-50 mb-2">{{ langText.auth.register }}</p>
          <h2 class="text-3xl font-bold">{{ langText.auth.createAccount }}</h2>
        </div>

        <!-- 注册表单 -->
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- 用户名 -->
          <BaseInput
            id="username"
            v-model="username"
            type="text"
            :label="langText.auth.username"
            :placeholder="langText.auth.enterUsername"
            autocomplete="username"
            :error="errors.username"
            :success="touched.username && Boolean(username) && !errors.username"
            required
            @blur="validateName"
          />
          <!-- 邮箱 -->
          <BaseInput
            id="email"
            v-model="email"
            type="email"
            :label="langText.auth.email"
            placeholder="user@example.com"
            autocomplete="email"
            inputmode="email"
            :error="errors.email"
            :success="touched.email && Boolean(email) && !errors.email"
            required
            @blur="validateEmail"
          />
          <!-- 密码 -->
          <BaseInput
            id="password"
            v-model="password"
            type="password"
            :label="langText.auth.password"
            placeholder="••••••••"
            autocomplete="new-password"
            :error="errors.password"
            required
            @blur="validatePassword"
          />
          <!-- 确认密码 -->
          <BaseInput
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            :label="langText.auth.confirmPassword"
            placeholder="••••••••"
            autocomplete="new-password"
            :error="errors.confirmPassword"
            required
            @blur="validateConfirmPassword"
          />

          <div>
            <BaseButton type="submit" class="w-full" :is-loading="isLoading">{{ langText.auth.register }}</BaseButton>
          </div>
        </form>

        <!-- 其他操作入口 -->
        <div class="mt-6 space-y-4 border-t border-black/10 pt-6">
          <!-- 已有账号：跳转登录 -->
          <div class="text-center">
            <p class="text-xs opacity-60 mb-2">{{ langText.auth.hasAccount }}</p>
            <router-link
              :to="{ name: 'login', query: { redirect: route.query?.redirect } }"
              class="inline-flex items-center justify-center gap-1 px-4 py-2 bg-black text-white text-xs font-mono uppercase tracking-wider rounded hover:bg-green-600 transition-colors"
            ><span>{{ langText.auth.loginNow }}</span><span>→</span></router-link>
          </div>
          <!-- 游客模式 -->
          <div class="text-center border-t border-black/10 pt-4">
            <p class="text-xs opacity-60 mb-2">{{ langText.auth.tryFirst }}</p>
            <router-link to="/chat" class="inline-flex items-center justify-center gap-1 px-4 py-2 bg-green-50 text-green-700 text-xs font-mono uppercase tracking-wider rounded border border-green-200 hover:bg-green-100 transition-colors">
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
// views/auth/RegisterView.vue - 注册页面
// 包含用户名、邮箱、密码、确认密码四个字段
// 注册成功后后端若返回 Token 则直接登录，否则自动调用 login 接口
// ============================================================
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { langText } from '@/language'

// 表单字段
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

// 字段错误信息
const errors = reactive({ username: '', email: '', password: '', confirmPassword: '' })
// 字段交互状态（触发过 blur 才显示 success 状态）
const touched = reactive({ username: false, email: false, password: false, confirmPassword: false })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

/** 安全校验重定向路径（防止开放重定向攻击） */
const getRedirectPath = (redirect) => {
  if (typeof redirect !== 'string') return ''
  if (!redirect.startsWith('/')) return ''
  if (redirect.startsWith('//')) return ''
  return redirect
}

/** 校验用户名：2~20 个字符 */
const validateName = (options) => {
  const shouldTrim = Boolean(options?.shouldTrim) || Boolean(options?.target)
  touched.username = true
  if (shouldTrim) username.value = username.value.trim()
  if (!username.value) { errors.username = langText.value.auth.enterUsernameErr; return false }
  if (username.value.length < 2) { errors.username = langText.value.auth.usernameMinLength; return false }
  if (username.value.length > 20) { errors.username = langText.value.auth.usernameMaxLength; return false }
  errors.username = ''
  return true
}

/** 校验邮箱格式 */
const validateEmail = (options) => {
  const shouldTrim = Boolean(options?.shouldTrim) || Boolean(options?.target)
  touched.email = true
  if (shouldTrim) email.value = email.value.trim()
  if (!email.value) { errors.email = langText.value.auth.enterEmailErr; return false }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) { errors.email = langText.value.auth.invalidEmailFormat; return false }
  errors.email = ''
  return true
}

/** 校验密码：至少 6 位，并联动校验确认密码 */
const validatePassword = () => {
  touched.password = true
  if (!password.value) { errors.password = langText.value.auth.enterPassword; return false }
  if (password.value.length < 6) { errors.password = langText.value.auth.passwordMinLength; return false }
  errors.password = ''
  // 如果确认密码已填写，联动重新校验
  if (confirmPassword.value) validateConfirmPassword()
  return true
}

/** 校验两次密码一致性 */
const validateConfirmPassword = () => {
  touched.confirmPassword = true
  if (!confirmPassword.value) { errors.confirmPassword = langText.value.auth.enterPasswordAgain; return false }
  if (confirmPassword.value !== password.value) { errors.confirmPassword = langText.value.auth.passwordMismatch; return false }
  errors.confirmPassword = ''
  return true
}

/** 清除所有服务端返回的错误（重新提交前调用） */
const clearServerErrors = () => {
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
}

/** 自动聚焦第一个有错误的输入框 */
const focusFirstInvalid = () => {
  const order = ['username', 'email', 'password', 'confirmPassword']
  for (const id of order) {
    if (errors[id]) { document.getElementById(id)?.focus?.(); return }
  }
}

/**
 * 处理注册表单提交
 * 1. 前端全量校验
 * 2. 调用 userStore.register
 * 3. 成功后跳转
 */
const handleRegister = async () => {
  if (isLoading.value) return
  clearServerErrors()

  const okName = validateName({ shouldTrim: true })
  const okEmail = validateEmail({ shouldTrim: true })
  const okPassword = validatePassword()
  const okConfirm = validateConfirmPassword()
  if (!okName || !okEmail || !okPassword || !okConfirm) {
    ElMessage.warning(langText.value.auth.formErrorWarning)
    focusFirstInvalid()
    return
  }

  isLoading.value = true
  const result = await userStore.register(username.value, email.value, password.value)
  isLoading.value = false

  if (!result.ok) {
    // 将后端字段级错误回填
    const fieldErrors = result.fieldErrors || {}
    if (fieldErrors.username) errors.username = fieldErrors.username
    if (fieldErrors.email) errors.email = fieldErrors.email
    if (fieldErrors.password) errors.password = fieldErrors.password
    if (fieldErrors.confirmPassword) errors.confirmPassword = fieldErrors.confirmPassword
    focusFirstInvalid()
    return
  }

  const redirect = getRedirectPath(route.query?.redirect)
  router.replace(redirect || '/')
}

// 实时校验（字段被 touch 后才触发）
watch(username, () => { if (touched.username) validateName() })
watch(email, () => { if (touched.email) validateEmail() })
watch(password, () => { if (touched.password) validatePassword() })
watch(confirmPassword, () => { if (touched.confirmPassword) validateConfirmPassword() })
</script>

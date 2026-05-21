<template>
  <!-- 认证页面主容器：全屏居中布局 -->
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans flex flex-col items-center justify-center px-4 md:px-6 relative overflow-hidden pt-16 md:pt-20">
    <!-- 背景网格装饰（固定定位，纯视觉效果） -->
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
      <div v-for="n in 4" :key="`m-${n}`" class="border-r border-black h-full block md:hidden col-span-3"></div>
    </div>

    <!-- 主内容区域：限制最大宽度并居中 -->
    <div class="relative z-10 w-full max-w-5xl flex-1 flex items-center justify-center">
      <!-- 认证卡片容器：白色半透明背景 + 圆角 + 阴影 -->
      <div class="w-full bg-white/95 border border-black/10 rounded-2xl md:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] relative overflow-hidden transition-all duration-700 hover:shadow-[0_25px_50px_rgba(0,0,0,0.2)]">
        <!-- 顶部绿色渐变装饰条 -->
        <div class="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>

        <!-- 双栏布局：表单区域 + 动画区域 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <!-- 表单区域：登录/注册切换动画 -->
          <transition name="form-slide" mode="out-in">
            <div :key="`form-${isLogin}`" class="p-5 sm:p-6 md:p-12 transition-all duration-700" :class="isLogin ? 'lg:order-1' : 'lg:order-2'">
              <!-- 卡片头部：Logo + 标题 -->
              <div class="text-center mb-8">
                <div class="mb-6 flex justify-center">
                  <img src="@/assets/logo.png" alt="Logo" class="w-16 h-16 object-contain rounded-2xl shadow-lg border border-black/10" />
                </div>
                <p class="font-mono text-xs uppercase tracking-widest opacity-50 mb-2">{{ isLogin ? langText.auth.verification : langText.auth.register }}</p>
                <h2 class="text-2xl md:text-3xl font-bold">{{ isLogin ? langText.auth.login : langText.auth.createAccount }}</h2>
              </div>

              <!-- 登录表单 -->
              <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-6">
                <BaseInput id="email" v-model="email" type="text" :label="langText.auth.emailOrUsername" :placeholder="langText.auth.enterEmailOrUsername" autocomplete="username" inputmode="text" :error="errors.email" required @blur="validateEmail" />
                <div class="space-y-4">
                  <BaseInput id="password" v-model="password" type="password" :label="langText.auth.password" placeholder="••••••••" :error="errors.password" required @blur="validatePassword" />
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
                <BaseButton type="submit" class="w-full" :is-loading="isLoading">{{ langText.auth.login }}</BaseButton>
              </form>

              <!-- 注册表单 -->
              <form v-else @submit.prevent="handleRegister" class="space-y-6">
                <BaseInput id="username" v-model="username" type="text" :label="langText.auth.username" :placeholder="langText.auth.enterUsername" :error="errors.username" required @blur="validateName" />
                <BaseInput id="email" v-model="email" type="email" :label="langText.auth.email" placeholder="user@example.com" :error="errors.email" required @blur="validateEmail" />
                <BaseInput id="password" v-model="password" type="password" :label="langText.auth.password" placeholder="••••••••" :error="errors.password" required @blur="validatePassword" />
                <BaseInput id="confirmPassword" v-model="confirmPassword" type="password" :label="langText.auth.confirmPassword" placeholder="••••••••" :error="errors.confirmPassword" required @blur="validateConfirmPassword" />
                <BaseButton type="submit" class="w-full" :is-loading="isLoading">{{ langText.auth.register }}</BaseButton>
              </form>

              <!-- 底部操作区域：切换登录/注册 + 游客模式 -->
              <div class="mt-6 space-y-4 border-t border-black/10 pt-6">
                <!-- 切换登录/注册模式按钮 -->
                <div class="text-center">
                  <p class="text-xs opacity-60 mb-2">{{ isLogin ? langText.auth.noAccount : langText.auth.hasAccount }}</p>
                  <button type="button" @click="toggleMode" class="inline-flex items-center justify-center gap-1 px-4 py-2 bg-black text-white text-xs font-mono uppercase rounded-lg hover:bg-green-600 transition-all duration-300">
                    <span>{{ isLogin ? langText.auth.registerNow : langText.auth.loginNow }}</span><span>→</span>
                  </button>
                </div>

                <!-- 游客模式入口（无需登录即可体验） -->
                <div class="text-center border-t border-black/10 pt-4">
                  <p class="text-xs opacity-60 mb-2">{{ langText.auth.tryFirst }}</p>
                  <router-link to="/chat" class="inline-flex items-center justify-center gap-1 px-4 py-2 bg-green-50 text-green-700 text-xs font-mono uppercase rounded-lg border border-green-200 hover:bg-green-100 transition-all duration-300">
                    <span>{{ langText.auth.guestMode }}</span><span>→</span>
                  </router-link>
                </div>
              </div>
            </div>
          </transition>

          <!-- 动画区域：角色动画展示（桌面端可见） -->
          <transition name="animation-slide" mode="out-in">
            <div :key="`animation-${isLogin}`" class="hidden lg:flex items-center justify-center p-8 md:p-12 transition-all duration-700 min-h-[420px]" :class="isLogin ? 'lg:order-2' : 'lg:order-1'">
              <AuthAnimation :is-login="isLogin" />
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import AuthAnimation from '@/components/auth/AuthAnimation.vue'
import { useUserStore } from '@/stores/user'
import { langText } from '@/language'

// 当前模式：true 为登录，false 为注册
const isLogin = ref(true)
// 表单字段
const email = ref('')
const password = ref('')
const username = ref('')
const confirmPassword = ref('')
// 提交加载状态
const isLoading = ref(false)

// 字段级错误信息
const errors = reactive({ email: '', password: '', username: '', confirmPassword: '' })
// 字段是否已被用户交互过（用于实时校验判断）
const touched = reactive({ email: false, password: false, username: false, confirmPassword: false })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 根据路由路径设置登录/注册模式
const updateModeFromRoute = () => {
  const path = route.path
  if (path.includes('/register')) {
    isLogin.value = false
  } else {
    isLogin.value = true
  }
}

// 切换登录/注册模式，清空表单和错误状态
const toggleMode = () => {
  isLogin.value = !isLogin.value
  email.value = ''
  password.value = ''
  username.value = ''
  confirmPassword.value = ''
  Object.keys(errors).forEach(key => { errors[key] = '' })
  Object.keys(touched).forEach(key => { touched[key] = false })
}

// 安全校验重定向路径（防止开放重定向攻击）
const getRedirectPath = (redirect) => {
  if (typeof redirect !== 'string') return ''
  if (!redirect.startsWith('/')) return ''
  if (redirect.startsWith('//')) return ''
  return redirect
}

// 校验邮箱/用户名字段
const validateEmail = (options) => {
  const shouldTrim = Boolean(options?.shouldTrim) || Boolean(options?.target)
  touched.email = true
  if (shouldTrim) email.value = email.value.trim()
  if (!email.value) { errors.email = langText.value.auth.enterEmailOrUsernameErr; return false }
  const value = email.value.trim()
  if (value.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) { errors.email = langText.value.auth.invalidEmailFormat; return false }
  }
  errors.email = ''
  return true
}

// 校验密码字段（至少 6 位）
const validatePassword = () => {
  touched.password = true
  if (!password.value) { errors.password = langText.value.auth.enterPassword; return false }
  if (password.value.length < 6) { errors.password = langText.value.auth.passwordMinLength; return false }
  errors.password = ''
  return true
}

// 校验用户名字段（2~20 个字符）
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

// 校验确认密码（与密码一致）
const validateConfirmPassword = () => {
  touched.confirmPassword = true
  if (!confirmPassword.value) { errors.confirmPassword = langText.value.auth.enterPasswordAgain; return false }
  if (confirmPassword.value !== password.value) { errors.confirmPassword = langText.value.auth.passwordMismatch; return false }
  errors.confirmPassword = ''
  return true
}

// 自动聚焦第一个有错误的输入框（提升无障碍体验）
const focusFirstInvalid = () => {
  if (errors.email) { document.getElementById('email')?.focus?.(); return }
  if (errors.password) { document.getElementById('password')?.focus?.(); return }
  if (errors.username) { document.getElementById('username')?.focus?.(); return }
  if (errors.confirmPassword) { document.getElementById('confirmPassword')?.focus?.() }
}

// 处理登录表单提交
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

// 处理注册表单提交
const handleRegister = async () => {
  if (isLoading.value) return
  const okName = validateName({ shouldTrim: true })
  const okEmail = validateEmail({ shouldTrim: true })
  const okPassword = validatePassword()
  const okConfirm = validateConfirmPassword()
  if (!okName || !okEmail || !okPassword || !okConfirm) { focusFirstInvalid(); return }

  isLoading.value = true
  const result = await userStore.register(username.value, email.value, password.value)
  isLoading.value = false

  if (!result.ok) {
    // 将后端字段级错误回填
    const fieldErrors = result.fieldErrors || {}
    if (fieldErrors.username) errors.username = fieldErrors.username
    if (fieldErrors.email) errors.email = fieldErrors.email
    if (fieldErrors.password) errors.password = fieldErrors.password
    focusFirstInvalid()
    return
  }

  // 注册成功：跳转到 redirect 目标或首页
  const redirect = getRedirectPath(route.query?.redirect)
  router.replace(redirect || '/')
}

// 实时校验：字段被 touch 后，每次输入都触发校验
watch(email, () => { if (touched.email) validateEmail() })
watch(password, () => { if (touched.password) validatePassword() })
watch(username, () => { if (touched.username) validateName() })
watch(confirmPassword, () => { if (touched.confirmPassword) validateConfirmPassword() })

// 页面挂载时：根据路由设置模式 + 检查 URL 中的 Token
onMounted(async () => {
  updateModeFromRoute()

  // 检查是否有 OAuth Token（第三方登录回调）
  const queryToken = route.query?.token || route.query?.access_token
  if (typeof queryToken !== 'string' || !queryToken) return
  isLoading.value = true
  const success = await userStore.acceptToken(queryToken)
  isLoading.value = false
  if (success) {
    const redirect = getRedirectPath(route.query?.redirect)
    router.replace(redirect || '/')
  }
})

// 监听路由变化，实时更新登录/注册模式
watch(
  () => route.path,
  () => {
    updateModeFromRoute()
  }
)
</script>

<style scoped>
/* 表单区域滑入/滑出过渡动画 */
.form-slide-enter-active,
.form-slide-leave-active,
.animation-slide-enter-active,
.animation-slide-leave-active {
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-slide-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.form-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 动画区域滑入/滑出过渡动画（与表单方向相反） */
.animation-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.animation-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>

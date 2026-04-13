<template>
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans flex flex-col items-center justify-center px-4 md:px-6 relative overflow-hidden pt-16 md:pt-20">
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
      <div v-for="n in 4" :key="`m-${n}`" class="border-r border-black h-full block md:hidden col-span-3"></div>
    </div>

    <div class="relative z-10 w-full max-w-5xl flex-1 flex items-center justify-center">
      <div class="w-full bg-white/95 border border-black/10 rounded-2xl md:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] relative overflow-hidden transition-all duration-700 hover:shadow-[0_25px_50px_rgba(0,0,0,0.2)]">
        <div class="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <transition name="form-slide" mode="out-in">
            <div :key="`form-${isLogin}`" class="p-5 sm:p-6 md:p-12 transition-all duration-700" :class="isLogin ? 'lg:order-1' : 'lg:order-2'">
              <div class="text-center mb-8">
                <div class="mb-6 flex justify-center">
                  <img src="@/assets/logo.png" alt="Logo" class="w-16 h-16 object-contain rounded-2xl shadow-lg border border-black/10" />
                </div>
                <p class="font-mono text-xs uppercase tracking-widest opacity-50 mb-2">{{ isLogin ? '身份验证' : '注册' }}</p>
                <h2 class="text-2xl md:text-3xl font-bold">{{ isLogin ? '系统登录' : '创建账号' }}</h2>
              </div>

              <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-6">
                <BaseInput id="email" v-model="email" type="text" label="邮箱或用户名" placeholder="请输入邮箱或用户名" autocomplete="username" inputmode="text" :error="errors.email" required @blur="validateEmail" />
                <BaseInput id="password" v-model="password" type="password" label="密码" placeholder="••••••••" :error="errors.password" required @blur="validatePassword" />
                <BaseButton type="submit" class="w-full" :is-loading="isLoading">登录</BaseButton>
              </form>

              <form v-else @submit.prevent="handleRegister" class="space-y-6">
                <BaseInput id="username" v-model="username" type="text" label="用户名" placeholder="请输入用户名" :error="errors.username" required @blur="validateName" />
                <BaseInput id="email" v-model="email" type="email" label="邮箱" placeholder="user@example.com" :error="errors.email" required @blur="validateEmail" />
                <BaseInput id="password" v-model="password" type="password" label="密码" placeholder="••••••••" :error="errors.password" required @blur="validatePassword" />
                <BaseInput id="confirmPassword" v-model="confirmPassword" type="password" label="确认密码" placeholder="••••••••" :error="errors.confirmPassword" required @blur="validateConfirmPassword" />
                <BaseButton type="submit" class="w-full" :is-loading="isLoading">注册</BaseButton>
              </form>

              <div class="mt-6 space-y-4 border-t border-black/10 pt-6">
                <div class="text-center">
                  <p class="text-xs opacity-60 mb-2">{{ isLogin ? '还没有账号？' : '已有账号？' }}</p>
                  <button type="button" @click="toggleMode" class="inline-flex items-center justify-center gap-1 px-4 py-2 bg-black text-white text-xs font-mono uppercase rounded-lg hover:bg-green-600 transition-all duration-300">
                    <span>{{ isLogin ? '立即注册' : '立即登录' }}</span><span>→</span>
                  </button>
                </div>

                <div class="text-center border-t border-black/10 pt-4">
                  <p class="text-xs opacity-60 mb-2">想先体验一下？</p>
                  <router-link to="/chat" class="inline-flex items-center justify-center gap-1 px-4 py-2 bg-green-50 text-green-700 text-xs font-mono uppercase rounded-lg border border-green-200 hover:bg-green-100 transition-all duration-300">
                    <span>游客模式</span><span>→</span>
                  </router-link>
                </div>
              </div>
            </div>
          </transition>

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

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const username = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

const errors = reactive({ email: '', password: '', username: '', confirmPassword: '' })
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

const toggleMode = () => {
  isLogin.value = !isLogin.value
  email.value = ''
  password.value = ''
  username.value = ''
  confirmPassword.value = ''
  Object.keys(errors).forEach(key => { errors[key] = '' })
  Object.keys(touched).forEach(key => { touched[key] = false })
}

const getRedirectPath = (redirect) => {
  if (typeof redirect !== 'string') return ''
  if (!redirect.startsWith('/')) return ''
  if (redirect.startsWith('//')) return ''
  return redirect
}

const validateEmail = (options) => {
  const shouldTrim = Boolean(options?.shouldTrim) || Boolean(options?.target)
  touched.email = true
  if (shouldTrim) email.value = email.value.trim()
  if (!email.value) { errors.email = '请输入邮箱或用户名'; return false }
  const value = email.value.trim()
  if (value.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) { errors.email = '请输入有效的邮箱格式'; return false }
  }
  errors.email = ''
  return true
}

const validatePassword = () => {
  touched.password = true
  if (!password.value) { errors.password = '请输入密码'; return false }
  if (password.value.length < 6) { errors.password = '密码长度至少为6位'; return false }
  errors.password = ''
  return true
}

const validateName = (options) => {
  const shouldTrim = Boolean(options?.shouldTrim) || Boolean(options?.target)
  touched.username = true
  if (shouldTrim) username.value = username.value.trim()
  if (!username.value) { errors.username = '请输入用户名'; return false }
  if (username.value.length < 2) { errors.username = '用户名至少 2 个字符'; return false }
  if (username.value.length > 20) { errors.username = '用户名最多 20 个字符'; return false }
  errors.username = ''
  return true
}

const validateConfirmPassword = () => {
  touched.confirmPassword = true
  if (!confirmPassword.value) { errors.confirmPassword = '请再次输入密码'; return false }
  if (confirmPassword.value !== password.value) { errors.confirmPassword = '两次输入的密码不一致'; return false }
  errors.confirmPassword = ''
  return true
}

const focusFirstInvalid = () => {
  if (errors.email) { document.getElementById('email')?.focus?.(); return }
  if (errors.password) { document.getElementById('password')?.focus?.(); return }
  if (errors.username) { document.getElementById('username')?.focus?.(); return }
  if (errors.confirmPassword) { document.getElementById('confirmPassword')?.focus?.() }
}

const handleLogin = async () => {
  if (isLoading.value) return
  const isEmailValid = validateEmail({ shouldTrim: true })
  const isPasswordValid = validatePassword()
  if (!isEmailValid || !isPasswordValid) { focusFirstInvalid(); return }

  isLoading.value = true
  const result = await userStore.login(email.value.trim(), password.value)
  isLoading.value = false

  if (!result.ok) {
    const fieldErrors = result.fieldErrors || {}
    if (fieldErrors.email) errors.email = fieldErrors.email
    if (fieldErrors.password) errors.password = fieldErrors.password
    focusFirstInvalid()
    return
  }

  const redirect = getRedirectPath(route.query?.redirect)
  router.replace(redirect || '/')
}

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
    const fieldErrors = result.fieldErrors || {}
    if (fieldErrors.username) errors.username = fieldErrors.username
    if (fieldErrors.email) errors.email = fieldErrors.email
    if (fieldErrors.password) errors.password = fieldErrors.password
    focusFirstInvalid()
    return
  }

  const redirect = getRedirectPath(route.query?.redirect)
  router.replace(redirect || '/')
}

watch(email, () => { if (touched.email) validateEmail() })
watch(password, () => { if (touched.password) validatePassword() })
watch(username, () => { if (touched.username) validateName() })
watch(confirmPassword, () => { if (touched.confirmPassword) validateConfirmPassword() })

onMounted(async () => {
  updateModeFromRoute()

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

.animation-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.animation-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>

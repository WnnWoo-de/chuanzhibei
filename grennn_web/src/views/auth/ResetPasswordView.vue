<template>
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans flex flex-col items-center justify-center px-4 md:px-6 relative overflow-hidden pt-16 md:pt-20">
    <!-- 背景网格装饰 -->
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
      <div v-for="n in 4" :key="`m-${n}`" class="border-r border-black h-full block md:hidden col-span-3"></div>
    </div>

    <div class="relative z-10 w-full max-w-5xl flex-1 flex items-center justify-center">
      <div class="w-full bg-white/95 border border-black/10 rounded-2xl md:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] relative overflow-hidden transition-all duration-700 hover:shadow-[0_25px_50px_rgba(0,0,0,0.2)]">
        <div class="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <!-- 表单区域 -->
          <div class="p-5 sm:p-6 md:p-12 transition-all duration-700 lg:order-1">
            <div class="text-center mb-8">
              <div class="mb-6 flex justify-center">
                <img src="@/assets/logo.png" alt="Logo" class="w-16 h-16 object-contain rounded-2xl shadow-lg border border-black/10" />
              </div>
              <p class="font-mono text-xs uppercase tracking-widest opacity-50 mb-2">{{ langText.auth.setNewPassword }}</p>
              <h2 class="text-2xl md:text-3xl font-bold">{{ langText.auth.resetPassword }}</h2>
              <p class="text-sm text-gray-500 mt-2">
                {{ langText.auth.setPasswordFor }} <span class="font-medium text-green-600">{{ userEmail }}</span> {{ langText.auth.setNewPasswordSuffix }}
              </p>
            </div>

            <!-- 重置密码表单 -->
            <form v-if="!isPasswordReset" @submit.prevent="handleResetPassword" class="space-y-6">
              <BaseInput
                id="password"
                v-model="password"
                type="password"
                :label="langText.auth.newPassword"
                placeholder="••••••••"
                autocomplete="new-password"
                :error="errors.password"
                required
                @blur="validatePassword"
              />
              <BaseInput
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                :label="langText.auth.confirmNewPassword"
                placeholder="••••••••"
                autocomplete="new-password"
                :error="errors.confirmPassword"
                required
                @blur="validateConfirmPassword"
              />
              <BaseButton type="submit" class="w-full" :is-loading="isLoading">
                {{ langText.auth.resetPassword }}
              </BaseButton>
              <div class="text-center">
                <router-link
                  :to="{ name: 'login' }"
                  class="text-xs text-gray-500 hover:text-gray-700 hover:underline transition-colors"
                >
                  {{ langText.auth.backToLogin }}
                </router-link>
              </div>
            </form>

            <!-- 密码重置成功提示 -->
            <div v-else class="space-y-6 text-center">
              <div class="p-6 bg-green-50 rounded-lg">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-green-900">{{ langText.auth.passwordResetSuccess }}</h3>
                <p class="text-green-700 text-sm mt-2">
                  {{ langText.auth.passwordResetSuccessMsg }}
                </p>
              </div>
              <router-link :to="{ name: 'login' }">
                <BaseButton type="button" class="w-full" variant="secondary">
                  {{ langText.auth.loginNow }}
                </BaseButton>
              </router-link>
            </div>
          </div>

          <!-- 动画区域 -->
          <div class="hidden lg:flex items-center justify-center p-8 md:p-12 transition-all duration-700 lg:order-2">
            <div class="w-full max-w-md">
              <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
                <div class="text-center">
                  <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ langText.auth.securityAdvice }}</h3>
                  <p class="text-gray-600 text-sm leading-relaxed mb-4">
                    {{ langText.auth.securityAdviceDesc }}
                  </p>
                  <div class="space-y-3 text-left">
                    <div class="flex items-start gap-3">
                      <div class="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <p class="text-gray-600 text-sm">{{ langText.auth.minChars }}</p>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <p class="text-gray-600 text-sm">{{ langText.auth.upperLowerCase }}</p>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <p class="text-gray-600 text-sm">{{ langText.auth.numbersAndSpecial }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
import { useUserStore } from '@/stores/user'
import { langText } from '@/language'

const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const isPasswordReset = ref(false)
const userEmail = ref('')

const errors = reactive({ password: '', confirmPassword: '' })
const touched = reactive({ password: false, confirmPassword: false })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  // 从 URL 中获取邮箱
  const queryEmail = route.query?.email
  if (typeof queryEmail !== 'string' || !queryEmail) {
    // 如果没有邮箱，跳转到忘记密码页面
    router.push('/auth/forgot-password')
    return
  }
  userEmail.value = queryEmail
})

const validatePassword = () => {
  touched.password = true
  if (!password.value) {
    errors.password = langText.value.auth.enterNewPassword
    return false
  }
  if (password.value.length < 8) {
    errors.password = langText.value.auth.passwordMinLength8
    return false
  }
  // 可选：添加更复杂的密码强度校验
  errors.password = ''
  return true
}

const validateConfirmPassword = () => {
  touched.confirmPassword = true
  if (!confirmPassword.value) {
    errors.confirmPassword = langText.value.auth.enterNewPasswordAgain
    return false
  }
  if (confirmPassword.value !== password.value) {
    errors.confirmPassword = langText.value.auth.passwordMismatch
    return false
  }
  errors.confirmPassword = ''
  return true
}

const focusFirstInvalid = () => {
  if (errors.password) {
    document.getElementById('password')?.focus?.()
    return
  }
  if (errors.confirmPassword) {
    document.getElementById('confirmPassword')?.focus?.()
  }
}

const handleResetPassword = async () => {
  if (isLoading.value) return

  const isPasswordValid = validatePassword()
  const isConfirmValid = validateConfirmPassword()
  if (!isPasswordValid || !isConfirmValid) {
    focusFirstInvalid()
    return
  }

  isLoading.value = true
  const result = await userStore.resetPassword(userEmail.value, password.value)
  isLoading.value = false

  if (!result.ok) {
    const fieldErrors = result.fieldErrors || {}
    if (fieldErrors.password) errors.password = fieldErrors.password
    if (fieldErrors.confirmPassword) errors.confirmPassword = fieldErrors.confirmPassword
    focusFirstInvalid()
    return
  }

  isPasswordReset.value = true
}

watch(password, () => {
  if (touched.password) validatePassword()
})

watch(confirmPassword, () => {
  if (touched.confirmPassword) validateConfirmPassword()
})
</script>

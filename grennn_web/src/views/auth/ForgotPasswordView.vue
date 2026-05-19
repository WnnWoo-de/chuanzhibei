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
              <p class="font-mono text-xs uppercase tracking-widest opacity-50 mb-2">{{ langText.auth.passwordReset }}</p>
              <h2 class="text-2xl md:text-3xl font-bold">{{ langText.auth.forgotPassword }}</h2>
              <p class="text-sm text-gray-500 mt-2">{{ langText.auth.enterEmailToVerify }}</p>
            </div>

            <!-- 邮箱验证表单 -->
            <form @submit.prevent="handleVerifyEmail" class="space-y-6">
              <BaseInput
                id="email"
                v-model="email"
                type="email"
                :label="langText.auth.email"
                placeholder="user@example.com"
                autocomplete="email"
                :error="errors.email"
                :success="touched.email && Boolean(email) && !errors.email"
                required
                @blur="validateEmail"
              />
              <BaseButton type="submit" class="w-full" :is-loading="isLoading">
                {{ langText.auth.verifyEmail }}
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
          </div>

          <!-- 动画区域 -->
          <div class="hidden lg:flex items-center justify-center p-8 md:p-12 transition-all duration-700 lg:order-2">
            <div class="w-full max-w-md">
              <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
                <div class="text-center">
                  <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ langText.auth.identityVerify }}</h3>
                  <p class="text-gray-600 text-sm leading-relaxed">
                    {{ langText.auth.enterRegisteredEmail }}
                  </p>
                  <div class="mt-6 space-y-3 text-left">
                    <div class="flex items-start gap-3">
                      <div class="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <p class="text-gray-600 text-sm">{{ langText.auth.verifyEmailCorrectness }}</p>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <p class="text-gray-600 text-sm">{{ langText.auth.noWaitEmail }}</p>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <p class="text-gray-600 text-sm">{{ langText.auth.setNewPasswordDirectly }}</p>
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
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useUserStore } from '@/stores/user'
import { langText } from '@/language'

const email = ref('')
const isLoading = ref(false)

const errors = reactive({ email: '' })
const touched = reactive({ email: false })

const router = useRouter()
const userStore = useUserStore()

const validateEmail = (options) => {
  const shouldTrim = Boolean(options?.shouldTrim) || Boolean(options?.target)
  touched.email = true
  if (shouldTrim) email.value = email.value.trim()
  if (!email.value) {
    errors.email = langText.value.auth.enterEmail
    return false
  }
  const value = email.value.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    errors.email = langText.value.auth.invalidEmailFormat
    return false
  }
  errors.email = ''
  return true
}

const focusFirstInvalid = () => {
  if (errors.email) {
    document.getElementById('email')?.focus?.()
  }
}

const handleVerifyEmail = async () => {
  if (isLoading.value) return

  const isEmailValid = validateEmail({ shouldTrim: true })
  if (!isEmailValid) {
    focusFirstInvalid()
    return
  }

  isLoading.value = true
  const result = await userStore.verifyEmail(email.value.trim())
  isLoading.value = false

  if (!result.ok) {
    const fieldErrors = result.fieldErrors || {}
    if (fieldErrors.email) errors.email = fieldErrors.email
    focusFirstInvalid()
    return
  }

  // 验证成功，跳转到重置密码页面，传递邮箱和临时 token
  router.push({
    name: 'reset-password',
    query: {
      email: email.value.trim(),
      token: result.resetToken
    }
  })
}

watch(email, () => {
  if (touched.email) validateEmail()
})
</script>

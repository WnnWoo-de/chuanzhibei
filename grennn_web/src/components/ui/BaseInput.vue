<template>
  <div class="w-full">
    <div class="relative group">
      <!-- 标签文字（可选） -->
      <label
        v-if="label"
        :for="id"
        class="block text-xs font-mono uppercase mb-2 transition-colors duration-200"
        :class="[error ? 'text-red-500' : 'text-black opacity-60 group-focus-within:opacity-100 group-focus-within:text-primary']"
      >
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>

      <div class="relative">
        <input
          :id="id"
          v-bind="$attrs"
          :type="inputType"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          @blur="$emit('blur', $event)"
          class="w-full bg-gray-50 border-b px-4 py-3 text-sm font-mono transition-all duration-200 focus:outline-none focus:bg-white"
          :class="[
            error
              ? 'border-red-500 focus:border-red-600 text-red-900 placeholder-red-300 pr-10'
              : 'border-black/20 focus:border-primary text-gray-900',
             type === 'password' ? 'pr-10' : ''
          ]"
        >

        <!-- 密码显示/隐藏切换按钮 -->
        <button
          v-if="type === 'password'"
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
          tabindex="-1"
        >
          <el-icon v-if="showPassword"><View /></el-icon>
          <el-icon v-else><Hide /></el-icon>
        </button>

        <!-- 状态图标（非密码输入框才显示） -->
        <div
          v-if="!type || type !== 'password'"
          class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <transition name="scale">
            <!-- 错误状态：红色感叹号 -->
            <svg v-if="error" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <!-- 成功状态：绿色对勾 -->
            <svg v-else-if="success" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </transition>
        </div>
      </div>

      <!-- 错误信息提示 -->
      <transition name="slide-fade">
        <p v-if="error" class="mt-1 text-xs text-red-500 font-mono">
          {{ error }}
        </p>
      </transition>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// components/ui/BaseInput.vue - 全站通用输入框组件
// 支持标签、错误/成功状态图标、密码可见切换
// 使用方式：<BaseInput v-model="email" label="邮箱" type="email" :error="errors.email" />
// ============================================================

/**
 * BaseInput - 基础输入框组件
 * 统一处理标签、错误提示、成功状态、密码切换等交互
 */
const props = defineProps({
  /** 输入框 id（同时作为 label 的 for 属性），默认自动生成唯一 id */
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substr(2, 9)}`
  },
  /** 标签文字 */
  label: { type: String, default: '' },
  /** 输入框类型（text / email / password 等） */
  type: { type: String, default: 'text' },
  /** v-model 绑定值 */
  modelValue: { type: [String, Number], default: '' },
  /** 错误消息（非空时显示红色错误样式和错误文字） */
  error: { type: String, default: '' },
  /** 是否显示成功状态（绿色对勾图标） */
  success: { type: Boolean, default: false },
  /** 是否为必填项（显示红色星号） */
  required: { type: Boolean, default: false }
})

defineEmits(['update:modelValue', 'blur'])

import { ref, computed } from 'vue'
import { View, Hide } from '@element-plus/icons-vue'

/** 控制密码是否以明文显示 */
const showPassword = ref(false)

/** 实际使用的 input type：密码框根据 showPassword 切换 text/password */
const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})
</script>

<style scoped>
/* 错误信息滑入动画 */
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from,
.slide-fade-leave-to { transform: translateY(-5px); opacity: 0; }

/* 状态图标缩放动画 */
.scale-enter-active,
.scale-leave-active { transition: all 0.2s ease; }
.scale-enter-from,
.scale-leave-to { transform: scale(0); opacity: 0; }
</style>

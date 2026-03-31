<template>
  <button
    :class="[
      'relative inline-flex items-center justify-center px-6 py-3 text-xs font-mono uppercase tracking-widest transition-all duration-200 ease-out overflow-hidden',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      variantClasses,
      // 禁用或加载中时降低透明度，禁止用户交互
      { 'opacity-75 cursor-not-allowed': disabled || isLoading },
      // 非禁用状态下点击有轻微缩小反馈
      { 'active:scale-95': !disabled && !isLoading }
    ]"
    :disabled="disabled || isLoading"
    @click="$emit('click', $event)"
  >
    <!-- 加载状态：显示旋转 Spinner，同时保持按钮宽度不变 -->
    <span
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center"
    >
      <svg
        class="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <!-- Spinner 背景圆弧（低透明度） -->
        <circle
          class="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor" stroke-width="4"
        ></circle>
        <!-- Spinner 前景弧（高透明度，旋转时可见） -->
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </span>

    <!-- 按钮内容插槽：加载中时透明（占位保持宽度），正常时可见 -->
    <span :class="{ 'opacity-0': isLoading }">
      <slot></slot>
    </span>

    <!-- primary 变体专属悬停高亮叠加层（白色半透明遮罩） -->
    <div
      v-if="variant === 'primary'"
      class="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-200 pointer-events-none"
    ></div>
  </button>
</template>

<script setup>
// ============================================================
// components/ui/BaseButton.vue - 全站通用按钮组件
// 支持 5 种视觉变体、加载中状态（spinner）和禁用状态
// 使用方式：<BaseButton variant="primary" :is-loading="loading">提交</BaseButton>
// ============================================================
import { computed } from 'vue'

/**
 * BaseButton - 基础按钮组件
 * 统一管理全站按钮的样式变体、加载状态和禁用状态
 * 通过 variant prop 选择视觉风格，通过 isLoading/disabled 控制交互状态
 */
const props = defineProps({
  /**
   * 按钮样式变体
   * - primary：黑色实心（主要操作，如提交、确认）
   * - secondary：灰色背景（次要操作，如取消）
   * - outline：黑色描边（中等强调，如编辑）
   * - ghost：透明背景（低调操作，如辅助功能）
   * - danger：红色（危险/破坏性操作，如删除）
   */
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'ghost', 'danger'].includes(value)
  },
  /** 是否显示加载状态（true 时显示 spinner，且不可点击） */
  isLoading: {
    type: Boolean,
    default: false
  },
  /** 是否禁用按钮（true 时不可点击，视觉降低透明度） */
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

/**
 * 根据 variant prop 返回对应的 Tailwind 样式类字符串
 * 使用 computed 缓存，避免每次渲染重新计算
 */
const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      // 黑色实心按钮，悬停变深灰
      return 'bg-black text-white hover:bg-gray-900 focus:ring-black border border-transparent'
    case 'secondary':
      // 浅灰背景按钮，悬停变灰
      return 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border border-transparent'
    case 'outline':
      // 描边按钮：悬停时反色（黑底白字）
      return 'bg-transparent text-black border border-black hover:bg-black hover:text-white focus:ring-black'
    case 'ghost':
      // 透明背景：悬停时轻微灰色背景
      return 'bg-transparent text-black hover:bg-gray-100 focus:ring-gray-500 border border-transparent'
    case 'danger':
      // 红色危险按钮，悬停变深红
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent'
    default:
      return 'bg-black text-white hover:bg-gray-900 focus:ring-black border border-transparent'
  }
})
</script>

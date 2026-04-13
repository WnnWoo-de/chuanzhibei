<template>
  <!-- ============================================================
       SkeletonLoader - 骨架屏加载占位组件
       在数据请求期间显示灰色动画占位块，避免页面白屏
       - animate-pulse：Tailwind 内置的脉冲动画（透明度循环）
       - bg-gray-200：占位色，视觉上接近真实内容区域
       ============================================================ -->
  <div
    class="animate-pulse bg-gray-200"
    :class="[
      // 形状：圆形（头像场景）或圆角矩形（文本/卡片场景）
      type === 'circle' ? 'rounded-full' : 'rounded-md',
      className
    ]"
    :style="{
      width: width,    // 宽度由父组件按需传入
      height: height   // 高度由父组件按需传入
    }"
  ></div>
</template>

<script setup>
// ============================================================
// components/ui/SkeletonLoader.vue - 骨架屏占位组件
// 在异步数据加载期间显示灰色动画占位，减少用户等待焦虑
// 使用方式：<SkeletonLoader width="100%" height="1rem" type="rectangle" />
// ============================================================

/**
 * SkeletonLoader Props 说明
 */
defineProps({
  /**
   * 宽度，支持任意 CSS 宽度值
   * 示例：'100%'、'200px'、'8rem'
   */
  width: {
    type: String,
    default: '100%'
  },
  /**
   * 高度，支持任意 CSS 高度值
   * 示例：'1rem'（单行文本）、'48px'（头像）、'200px'（卡片图片区）
   */
  height: {
    type: String,
    default: '1rem'
  },
  /**
   * 形状类型
   * - 'rectangle'：圆角矩形（默认，适合文本行、卡片块、图片区域）
   * - 'circle'：圆形（适合用户头像占位）
   */
  type: {
    type: String,
    default: 'rectangle',
    validator: (val) => ['rectangle', 'circle'].includes(val)
  },
  /**
   * 额外的 CSS 类名（用于覆盖默认样式或追加自定义样式）
   * 示例：'mb-2'（添加下边距）
   */
  className: {
    type: String,
    default: ''
  }
})
</script>

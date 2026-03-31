<template>
  <div class="weather-icon-wrapper">
    <!-- 天气图标图片：仅在 iconPath 计算有效时显示 -->
    <img
      v-if="iconPath"
      :src="iconPath"
      :alt="alt"
      :class="['weather-icon', `size-${size}`]"
      :style="{ width: `${size}px`, height: `${size}px` }"
    />
    <!-- 图标不存在时的灰色占位块（带脉冲动画） -->
    <div
      v-else
      class="weather-icon-placeholder"
      :style="{ width: `${size}px`, height: `${size}px` }"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * WeatherIcon - 和风天气图标组件
 *
 * 根据和风天气的天气代码（weatherCode）动态渲染对应 SVG 图标。
 * 图标来自 qweather-icons npm 包，通过 Vite import.meta.glob 预导入。
 */
const props = defineProps({
  /** 和风天气代码，如 100（晴）、305（小雨）、404（冻雨） */
  code: {
    type: [String, Number],
    required: true
  },
  /** 图标尺寸（像素），同时设置 width 和 height */
  size: {
    type: Number,
    default: 48
  },
  /**
   * 是否使用填充版图标（文件名带 -fill 后缀）
   * false：线条版（默认，视觉轻盈）
   * true：填充版（视觉更醒目）
   */
  fill: {
    type: Boolean,
    default: false
  },
  /** 图片 alt 属性（无障碍访问） */
  alt: {
    type: String,
    default: '天气图标'
  }
})

/**
 * 使用 Vite 的 import.meta.glob 预导入 qweather-icons 中所有 SVG 图标
 * - eager: true  => 构建时同步导入，打包到产物中
 * - query '?url' => 获取资源的最终 URL（而非 SVG 内容）
 * - import 'default' => 取模块的默认导出（即 URL 字符串）
 */
const iconModules = import.meta.glob(
  '/node_modules/qweather-icons/icons/*.svg',
  { eager: true, query: '?url', import: 'default' }
)

/**
 * 根据天气代码和 fill 属性计算图标 URL
 * - fill=false => /icons/{code}.svg
 * - fill=true  => /icons/{code}-fill.svg
 * 若找不到对应图标则返回 null，模板中显示占位块
 */
const iconPath = computed(() => {
  if (!props.code) return null
  const code = String(props.code)
  const suffix = props.fill ? '-fill' : ''
  const key = `/node_modules/qweather-icons/icons/${code}${suffix}.svg`
  return iconModules[key] ?? null
})
</script>

<style scoped>
/* 包裹容器：行内弹性布局，居中对齐图标 */
.weather-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.weather-icon {
  display: block;
  object-fit: contain;
  transition: transform 0.3s ease;
}

/* 图标不存在时的灰色渐变占位块 */
.weather-icon-placeholder {
  background: linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%);
  border-radius: 4px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 悬停时图标轻微放大，增加交互感 */
.weather-icon:hover {
  transform: scale(1.1);
}
</style>

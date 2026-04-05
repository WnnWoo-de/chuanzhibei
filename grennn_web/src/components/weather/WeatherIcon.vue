<template>
  <div class="weather-icon-wrapper" :style="wrapperStyle">
    <span
      v-if="iconClass"
      :class="['weather-icon', iconClass]"
      :style="iconStyle"
      :aria-label="alt"
      role="img"
    ></span>
    <div
      v-else
      class="weather-icon-placeholder"
      :style="{ width: `${size}px`, height: `${size}px` }"
      :aria-label="alt"
      role="img"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  code: {
    type: [String, Number],
    required: true,
  },
  size: {
    type: Number,
    default: 48,
  },
  fill: {
    type: Boolean,
    default: false,
  },
  alt: {
    type: String,
    default: '天气图标',
  },
})

const normalizedCode = computed(() => {
  if (props.code === null || props.code === undefined || props.code === '') return null
  return String(props.code).trim()
})

const iconClass = computed(() => {
  if (!normalizedCode.value) return null
  return `qi-${normalizedCode.value}`
})

const wrapperStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))

const iconStyle = computed(() => ({
  fontSize: `${props.size}px`,
}))
</script>

<style scoped>
.weather-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.weather-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  line-height: 1;
  transition: transform 0.3s ease;
}

.weather-icon:hover {
  transform: scale(1.08);
}

.weather-icon-placeholder {
  background: linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%);
  border-radius: 4px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>

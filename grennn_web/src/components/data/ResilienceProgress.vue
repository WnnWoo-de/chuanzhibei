<template>
  <div class="resilience-progress" :class="{ 'resilience-progress--visible': isVisible }">
    <!-- 进度条背景 -->
    <div class="resilience-progress__track">
      <!-- 主进度条 -->
      <div
        class="resilience-progress__bar"
        :style="{
          width: `${progress}%`,
          animation: isVisible ? 'none' : 'resilience-breathing var(--duration-loop) var(--ease-smooth) infinite',
        }"
      ></div>

      <!-- 呼吸光晕 -->
      <div
        v-if="isVisible"
        class="resilience-progress__glow"
        :style="{ left: `${progress}%` }"
      ></div>
    </div>

    <!-- 进度文字 -->
    <div class="resilience-progress__label">
      <span class="resilience-progress__text">{{ label }}</span>
      <span class="resilience-progress__value">{{ progress }}%</span>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// components/data/ResilienceProgress.vue - 韧性进度条组件
// 带呼吸光晕动画的进度条，滚动进入视口时显示动画效果
// ============================================================

import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  /** 进度百分比（0-100） */
  progress: {
    type: Number,
    default: 65,
    validator: (v) => v >= 0 && v <= 100,
  },
  /** 进度条左侧标签文字 */
  label: {
    type: String,
    default: 'Resilience First',
  },
})

/** 控制进度条是否进入可视区域（触发动画） */
const isVisible = ref(false)

/** IntersectionObserver 实例 */
let observer = null

/** 挂载时创建 IntersectionObserver，当进度条进入视口 25% 时触发 */
onMounted(() => {
  const element = document.querySelector('.resilience-progress')
  if (!element) return

  observer = new IntersectionObserver(
    ([entry]) => {
      isVisible.value = entry.isIntersecting
    },
    { threshold: 0.25 }
  )

  observer.observe(element)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.resilience-progress {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: 1rem;
  backdrop-filter: blur(var(--glass-blur-subtle));
  -webkit-backdrop-filter: blur(var(--glass-blur-subtle));
}

/* 进度条轨道 */
.resilience-progress__track {
  position: relative;
  width: 100%;
  height: 8px;
  background: var(--color-surface-tertiary);
  border-radius: 9999px;
  overflow: hidden;
  box-shadow: var(--shadow-inset-light);
}

/* 主进度条 */
.resilience-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-radius: 9999px;
  transition: width 0.6s var(--ease-out);
  box-shadow: 0 0 12px rgba(124, 196, 134, 0.4);
}

/* 呼吸光晕 */
.resilience-progress__glow {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 196, 134, 0.6) 0%, transparent 70%);
  animation: resilience-glow-pulse 2s var(--ease-smooth) infinite;
  pointer-events: none;
}

@keyframes resilience-glow-pulse {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(124, 196, 134, 0.3);
  }
  50% {
    box-shadow: 0 0 16px rgba(124, 196, 134, 0.6);
  }
}

/* 进度条呼吸动画（未进入时） */
@keyframes resilience-breathing {
  0%,
  100% {
    opacity: 0.7;
    box-shadow: 0 0 8px rgba(124, 196, 134, 0.2);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 16px rgba(124, 196, 134, 0.4);
  }
}

/* 标签区 */
.resilience-progress__label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.resilience-progress__text {
  color: var(--color-text-primary);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.resilience-progress__value {
  color: var(--color-primary);
  font-weight: 700;
  font-family: ui-monospace, monospace;
  font-size: 1rem;
}

/* 减动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .resilience-progress__bar,
  .resilience-progress__glow {
    animation: none;
    opacity: 0.8;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .resilience-progress {
    padding: 1rem;
    gap: 0.75rem;
  }

  .resilience-progress__track {
    height: 6px;
  }

  .resilience-progress__label {
    font-size: 0.8rem;
  }
}
</style>

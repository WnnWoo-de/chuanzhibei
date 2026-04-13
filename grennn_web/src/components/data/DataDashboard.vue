<template>
  <div class="data-dashboard" :class="{ 'data-dashboard--visible': isVisible }">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="data-card"
        :style="{ animationDelay: `${index * 60}ms` }"
      >
        <!-- 背景装饰 -->
        <div class="data-card__glow"></div>

        <!-- 卡片内容 -->
        <div class="data-card__content">
          <!-- 图标 -->
          <div class="data-card__icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path :d="stat.icon" />
            </svg>
          </div>

          <!-- 数值 -->
          <div class="data-card__value">
            <span class="data-card__number" :data-value="stat.value">{{ displayValue(stat.value) }}</span>
            <span class="data-card__unit">{{ stat.unit }}</span>
          </div>

          <!-- 标签 -->
          <p class="data-card__label">{{ stat.label }}</p>

          <!-- 趋势 -->
          <div class="data-card__trend" :class="{ 'data-card__trend--positive': stat.trend > 0 }">
            <svg
              v-if="stat.trend > 0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            <span>{{ Math.abs(stat.trend) }}%</span>
          </div>
        </div>

        <!-- 脉冲光晕 -->
        <div v-if="isVisible" class="data-card__pulse"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isVisible = ref(false)
const displayedValues = ref({})

const stats = [
  {
    label: '用户总数',
    value: 125000,
    unit: '人',
    trend: 12.5,
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    label: '碳减排量',
    value: 5280,
    unit: '吨',
    trend: 28.3,
    icon: 'M12 2v20 M2 12h20 M4.22 4.22l14.14 14.14 M19.78 4.22L5.64 18.36',
  },
  {
    label: '旧物重构',
    value: 8450,
    unit: '件',
    trend: 15.7,
    icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  },
  {
    label: '社区活动',
    value: 342,
    unit: '场',
    trend: 8.2,
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  },
]

const displayValue = (value) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return value.toString()
}

let observer = null
let animationFrameId = null

const animateNumbers = () => {
  stats.forEach((stat, index) => {
    const startValue = 0
    const endValue = stat.value
    const duration = 600 // ms
    const startTime = Date.now() + index * 60

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // cubic-bezier(0.2, 0.8, 0.2, 1)
      const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress

      const currentValue = Math.floor(startValue + (endValue - startValue) * easeProgress)
      displayedValues.value[index] = currentValue

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animate()
  })
}

onMounted(() => {
  const element = document.querySelector('.data-dashboard')
  if (!element) return

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !isVisible.value) {
        isVisible.value = true
        animateNumbers()
      }
    },
    { threshold: 0.2 }
  )

  observer.observe(element)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})
</script>

<style scoped>
.data-dashboard {
  display: grid;
  gap: 1.5rem;
}

/* 数据卡片 */
.data-card {
  position: relative;
  padding: 1.5rem;
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-light);
  border-radius: 1.25rem;
  backdrop-filter: blur(var(--glass-blur-subtle));
  -webkit-backdrop-filter: blur(var(--glass-blur-subtle));
  box-shadow: var(--shadow-sm);
  transition: all 0.3s var(--ease-out);
  animation: data-card-enter var(--duration-enter) var(--ease-out) forwards;
  opacity: 0;
  transform: translateY(12px);
}

@keyframes data-card-enter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.data-card:hover {
  border-color: var(--color-border-medium);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* 背景装饰 */
.data-card__glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, var(--glow-primary-light) 0%, transparent 70%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.6s var(--ease-out);
}

.data-card:hover .data-card__glow {
  opacity: 0.1;
}

/* 卡片内容 */
.data-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 图标 */
.data-card__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: 0.75rem;
  color: var(--color-primary);
  transition: all 0.3s var(--ease-out);
}

.data-card:hover .data-card__icon {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.data-card__icon svg {
  width: 24px;
  height: 24px;
}

/* 数值区 */
.data-card__value {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.data-card__number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  font-family: ui-monospace, monospace;
  letter-spacing: -0.02em;
}

.data-card__unit {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* 标签 */
.data-card__label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  margin: 0;
}

/* 趋势 */
.data-card__trend {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  width: fit-content;
  padding: 0.375rem 0.75rem;
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.3s var(--ease-out);
}

.data-card__trend--positive {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.data-card__trend svg {
  width: 14px;
  height: 14px;
}

/* 脉冲光晕 */
.data-card__pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 1.25rem;
  border: 2px solid var(--color-primary);
  opacity: 0;
  animation: data-pulse 2s var(--ease-out) infinite;
  pointer-events: none;
}

@keyframes data-pulse {
  0% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(0.95);
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

/* 减动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .data-card,
  .data-card__pulse {
    animation: none;
  }

  .data-card {
    opacity: 1;
    transform: translateY(0);
  }

  .data-card__pulse {
    display: none;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .data-card {
    padding: 1.25rem;
  }

  .data-card__number {
    font-size: 1.5rem;
  }

  .data-card__icon {
    width: 40px;
    height: 40px;
  }

  .data-card__icon svg {
    width: 20px;
    height: 20px;
  }
}
</style>

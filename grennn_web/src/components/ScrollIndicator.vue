<template>
  <div
    class="scroll-indicator"
    :class="{ 'scroll-indicator--hidden': isHidden }"
    :aria-hidden="isHidden"
    role="img"
    :aria-label="ariaLabel"
  >
    <!-- 呼吸灯效果背景 -->
    <div class="scroll-indicator__glow"></div>

    <!-- 鼠标 SVG -->
    <svg
      class="scroll-indicator__mouse"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 鼠标外壳 -->
      <path d="M12 2c-3.314 0-6 2.686-6 6v8c0 3.314 2.686 6 6 6s6-2.686 6-6v-8c0-3.314-2.686-6-6-6z" />
      <!-- 滚轮 -->
      <line x1="12" y1="6" x2="12" y2="10" />
    </svg>

    <!-- 向下箭头动画 -->
    <div class="scroll-indicator__arrow">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>

    <!-- 文字提示 -->
    <div class="scroll-indicator__text">{{ text }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  text: {
    type: String,
    default: '向下滑动',
  },
  ariaLabel: {
    type: String,
    default: '向下滑动以查看更多内容',
  },
})

const isHidden = ref(false)

let scrollListener = null

onMounted(() => {
  // 首屏滚动后淡出
  scrollListener = () => {
    const scrolled = window.scrollY > 100
    isHidden.value = scrolled
  }

  window.addEventListener('scroll', scrollListener, { passive: true })
})

onUnmounted(() => {
  if (scrollListener) {
    window.removeEventListener('scroll', scrollListener)
  }
})
</script>

<style scoped>
.scroll-indicator {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-fixed);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-primary);
  opacity: 1;
  transition: opacity var(--duration-exit) var(--ease-out);
  pointer-events: none;
}

.scroll-indicator--hidden {
  opacity: 0;
  pointer-events: none;
}

/* 呼吸灯背景 */
.scroll-indicator__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--glow-primary-light) 0%, transparent 70%);
  animation: breathingGlow var(--duration-loop) var(--ease-smooth) infinite;
  z-index: -1;
}

@keyframes breathingGlow {
  0% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(0.8);
  }
}

/* 鼠标 SVG */
.scroll-indicator__mouse {
  width: 24px;
  height: 32px;
  animation: mouseBreathe var(--duration-loop) var(--ease-smooth) infinite;
}

@keyframes mouseBreathe {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

/* 向下箭头 */
.scroll-indicator__arrow {
  width: 24px;
  height: 24px;
  animation: arrowBounce var(--duration-loop-fast) var(--ease-smooth) infinite;
}

.scroll-indicator__arrow svg {
  width: 100%;
  height: 100%;
  color: var(--color-primary);
}

@keyframes arrowBounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(8px);
    opacity: 1;
  }
}

/* 文字提示 */
.scroll-indicator__text {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.7;
  animation: textFade var(--duration-loop) var(--ease-smooth) infinite;
}

@keyframes textFade {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.9;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .scroll-indicator {
    bottom: 1.5rem;
    gap: 0.5rem;
  }

  .scroll-indicator__mouse {
    width: 20px;
    height: 28px;
  }

  .scroll-indicator__arrow {
    width: 20px;
    height: 20px;
  }

  .scroll-indicator__text {
    font-size: 0.65rem;
  }
}

/* 减动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .scroll-indicator__glow,
  .scroll-indicator__mouse,
  .scroll-indicator__arrow,
  .scroll-indicator__text {
    animation: none;
    opacity: 0.6;
  }
}
</style>

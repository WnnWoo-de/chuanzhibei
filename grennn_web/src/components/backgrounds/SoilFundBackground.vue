<template>
  <div class="soil-fund-background" :class="{ 'soil-fund-background--reduced': prefersReducedMotion }">
    <!-- 有机形态背景层 -->
    <svg
      class="soil-fund-background__svg"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- 噪声纹理 -->
        <filter id="soil-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" />
        </filter>

        <!-- 柔光渐变 -->
        <radialGradient id="soil-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color: #c8e6c9; stop-opacity: 0.15" />
          <stop offset="100%" style="stop-color: #e8f5e9; stop-opacity: 0.05" />
        </radialGradient>

        <!-- 有机形态渐变 -->
        <linearGradient id="soil-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color: #e8f5e9; stop-opacity: 0.08" />
          <stop offset="50%" style="stop-color: #c8e6c9; stop-opacity: 0.06" />
          <stop offset="100%" style="stop-color: #a5d6a7; stop-opacity: 0.04" />
        </linearGradient>
      </defs>

      <!-- 背景基础层 -->
      <rect width="1200" height="800" fill="url(#soil-gradient)" />

      <!-- 有机形态 1 -->
      <path
        class="soil-fund-background__shape soil-fund-background__shape--1"
        d="M 100,200 Q 300,100 500,150 T 900,200 Q 1000,250 1100,300 L 1200,400 Q 1100,500 900,550 T 500,600 Q 300,650 100,600 Z"
        fill="url(#soil-glow)"
        filter="url(#soil-noise)"
      />

      <!-- 有机形态 2 -->
      <path
        class="soil-fund-background__shape soil-fund-background__shape--2"
        d="M 0,400 Q 200,350 400,380 T 800,420 Q 1000,450 1200,400 L 1200,800 Q 1000,750 800,780 T 400,750 Q 200,720 0,750 Z"
        fill="url(#soil-glow)"
        filter="url(#soil-noise)"
        opacity="0.7"
      />

      <!-- 有机形态 3 -->
      <path
        class="soil-fund-background__shape soil-fund-background__shape--3"
        d="M 200,100 Q 400,50 600,100 T 1000,150 Q 1100,200 1200,250 L 1200,0 L 0,0 Q 100,50 200,100 Z"
        fill="url(#soil-glow)"
        filter="url(#soil-noise)"
        opacity="0.5"
      />

      <!-- 柔光点缀 -->
      <circle
        class="soil-fund-background__accent soil-fund-background__accent--1"
        cx="300"
        cy="300"
        r="150"
        fill="url(#soil-glow)"
        opacity="0.3"
      />
      <circle
        class="soil-fund-background__accent soil-fund-background__accent--2"
        cx="900"
        cy="500"
        r="200"
        fill="url(#soil-glow)"
        opacity="0.2"
      />
    </svg>

    <!-- 内容插槽 -->
    <div class="soil-fund-background__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// components/backgrounds/SoilFundBackground.vue - 土壤基金背景组件
// 使用 SVG 滤镜和噪声纹理生成有机形态的流动背景
// 支持减少动效偏好设置（prefers-reduced-motion）
// ============================================================

import { ref, onMounted } from 'vue'

/** 是否启用减少动效模式（跟随系统偏好） */
const prefersReducedMotion = ref(false)

/** 挂载时检测系统动效偏好，并监听变化 */
onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = mediaQuery.matches

  const handleChange = (e) => {
    prefersReducedMotion.value = e.matches
  }

  mediaQuery.addEventListener('change', handleChange)

  return () => {
    mediaQuery.removeEventListener('change', handleChange)
  }
})
</script>

<style scoped>
.soil-fund-background {
  position: relative;
  width: 100%;
  overflow: hidden;
}

/* SVG 背景 */
.soil-fund-background__svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

/* 有机形态动画 */
.soil-fund-background__shape {
  animation: soil-drift var(--duration-loop-slow) var(--ease-smooth) infinite;
  transform-origin: center;
}

.soil-fund-background__shape--1 {
  animation-delay: 0s;
}

.soil-fund-background__shape--2 {
  animation-delay: 1s;
}

.soil-fund-background__shape--3 {
  animation-delay: 2s;
}

@keyframes soil-drift {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) scale(1.02);
    opacity: 0.8;
  }
}

/* 柔光点缀动画 */
.soil-fund-background__accent {
  animation: soil-glow-pulse var(--duration-loop) var(--ease-smooth) infinite;
}

.soil-fund-background__accent--1 {
  animation-delay: 0.5s;
}

.soil-fund-background__accent--2 {
  animation-delay: 1.5s;
}

@keyframes soil-glow-pulse {
  0%,
  100% {
    opacity: 0.2;
    r: 150px;
  }
  50% {
    opacity: 0.4;
    r: 180px;
  }
}

/* 内容层 */
.soil-fund-background__content {
  position: relative;
  z-index: 1;
}

/* 减动效偏好 */
.soil-fund-background--reduced .soil-fund-background__shape,
.soil-fund-background--reduced .soil-fund-background__accent {
  animation: none;
  opacity: 0.5;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .soil-fund-background__svg {
    filter: blur(0.5px);
  }
}
</style>

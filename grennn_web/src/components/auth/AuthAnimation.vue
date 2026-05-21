<template>
  <!-- 认证动画组件容器 -->
  <div ref="containerRef" class="relative w-full h-96 flex items-center justify-center">
    <!-- 四个角色 SVG 动画（登录和注册都显示） -->
    <div class="relative w-full h-full flex items-center justify-center animate-fade-in">
      <svg
        viewBox="0 0 400 400"
        class="w-full h-full max-w-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- 背景圆形（浅绿色底色） -->
        <circle cx="200" cy="200" r="180" fill="#f0f5f0" opacity="0.3" />

        <!-- 橙色圆形角色（带眼睛跟随效果） -->
        <g class="character-orange">
          <circle cx="140" cy="240" r="60" fill="#ff9500" />
          <!-- 左眼 -->
          <circle cx="125" cy="220" r="8" fill="#fff" />
          <circle
            cx="125"
            cy="220"
            r="5"
            fill="#000"
            :style="{
              transform: `translate(${eyePositions.orangeLeft.x}px, ${eyePositions.orangeLeft.y}px)`
            }"
          />
          <!-- 右眼 -->
          <circle cx="155" cy="220" r="8" fill="#fff" />
          <circle
            cx="155"
            cy="220"
            r="5"
            fill="#000"
            :style="{
              transform: `translate(${eyePositions.orangeRight.x}px, ${eyePositions.orangeRight.y}px)`
            }"
          />
          <!-- 嘴巴 -->
          <path d="M 140 250 Q 135 260 145 265" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round" />
        </g>

        <!-- 紫色矩形角色 -->
        <g class="character-purple">
          <rect x="200" y="120" width="80" height="120" rx="10" fill="#7c3aed" />
          <!-- 左眼 -->
          <circle cx="215" cy="145" r="8" fill="#fff" />
          <circle
            cx="215"
            cy="145"
            r="5"
            fill="#000"
            :style="{
              transform: `translate(${eyePositions.purpleLeft.x}px, ${eyePositions.purpleLeft.y}px)`
            }"
          />
          <!-- 右眼 -->
          <circle cx="255" cy="145" r="8" fill="#fff" />
          <circle
            cx="255"
            cy="145"
            r="5"
            fill="#000"
            :style="{
              transform: `translate(${eyePositions.purpleRight.x}px, ${eyePositions.purpleRight.y}px)`
            }"
          />
        </g>

        <!-- 黑色矩形角色 -->
        <g class="character-black">
          <rect x="240" y="200" width="70" height="100" rx="8" fill="#1a1a1a" />
          <!-- 左眼 -->
          <circle cx="252" cy="220" r="7" fill="#fff" />
          <circle
            cx="252"
            cy="220"
            r="4"
            fill="#000"
            :style="{
              transform: `translate(${eyePositions.blackLeft.x}px, ${eyePositions.blackLeft.y}px)`
            }"
          />
          <!-- 右眼 -->
          <circle cx="288" cy="220" r="7" fill="#fff" />
          <circle
            cx="288"
            cy="220"
            r="4"
            fill="#000"
            :style="{
              transform: `translate(${eyePositions.blackRight.x}px, ${eyePositions.blackRight.y}px)`
            }"
          />
        </g>

        <!-- 黄色圆形角色 -->
        <g class="character-yellow">
          <circle cx="280" cy="280" r="50" fill="#ffd700" />
          <!-- 左眼（反色设计：黑底白瞳） -->
          <circle cx="270" cy="270" r="6" fill="#000" />
          <circle
            cx="270"
            cy="270"
            r="3"
            fill="#fff"
            :style="{
              transform: `translate(${eyePositions.yellowLeft.x}px, ${eyePositions.yellowLeft.y}px)`
            }"
          />
          <!-- 右眼 -->
          <circle cx="290" cy="270" r="6" fill="#000" />
          <circle
            cx="290"
            cy="270"
            r="3"
            fill="#fff"
            :style="{
              transform: `translate(${eyePositions.yellowRight.x}px, ${eyePositions.yellowRight.y}px)`
            }"
          />
          <!-- 嘴巴（三角形） -->
          <path d="M 280 285 L 275 295 L 285 295 Z" fill="#000" />
        </g>

        <!-- 浮动光晕效果 -->
        <g class="glow-effect">
          <circle cx="200" cy="200" r="200" fill="none" stroke="#2e7d32" stroke-width="2" opacity="0.2" />
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// components/auth/AuthAnimation.vue - 认证页面动画组件
// 四个可爱角色的 SVG 动画，眼睛会跟随鼠标移动
// ============================================================
import { ref, onMounted, onUnmounted } from 'vue'

// 组件属性：isLogin 控制动画风格（当前未区分，预留扩展）
defineProps({
  isLogin: {
    type: Boolean,
    default: true
  }
})

// 所有角色的眼睛位置偏移量（跟随鼠标计算得出）
const eyePositions = ref({
  orangeLeft: { x: 0, y: 0 },
  orangeRight: { x: 0, y: 0 },
  purpleLeft: { x: 0, y: 0 },
  purpleRight: { x: 0, y: 0 },
  blackLeft: { x: 0, y: 0 },
  blackRight: { x: 0, y: 0 },
  yellowLeft: { x: 0, y: 0 },
  yellowRight: { x: 0, y: 0 }
})

// 组件容器 DOM 引用（用于计算鼠标相对位置）
const containerRef = ref(null)

/**
 * 计算眼球相对于鼠标的偏移位置
 * @param {number} eyeCenterX - 眼睛中心 X 坐标（SVG 坐标系）
 * @param {number} eyeCenterY - 眼睛中心 Y 坐标（SVG 坐标系）
 * @param {number} mouseX - 鼠标相对容器的 X 坐标
 * @param {number} mouseY - 鼠标相对容器的 Y 坐标
 * @param {number} maxDistance - 眼球最大移动距离（像素）
 */
const calculateEyePosition = (eyeCenterX, eyeCenterY, mouseX, mouseY, maxDistance = 3) => {
  const angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX)
  return {
    x: Math.cos(angle) * maxDistance,
    y: Math.sin(angle) * maxDistance
  }
}

/** 鼠标移动事件处理：更新所有角色的眼睛位置 */
const handleMouseMove = (e) => {
  if (!containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  // 橙色圆形角色的眼睛
  eyePositions.value.orangeLeft = calculateEyePosition(125, 220, mouseX, mouseY)
  eyePositions.value.orangeRight = calculateEyePosition(155, 220, mouseX, mouseY)

  // 紫色矩形角色的眼睛
  eyePositions.value.purpleLeft = calculateEyePosition(215, 145, mouseX, mouseY)
  eyePositions.value.purpleRight = calculateEyePosition(255, 145, mouseX, mouseY)

  // 黑色矩形角色的眼睛
  eyePositions.value.blackLeft = calculateEyePosition(252, 220, mouseX, mouseY)
  eyePositions.value.blackRight = calculateEyePosition(288, 220, mouseX, mouseY)

  // 黄色圆形角色的眼睛
  eyePositions.value.yellowLeft = calculateEyePosition(270, 270, mouseX, mouseY)
  eyePositions.value.yellowRight = calculateEyePosition(290, 270, mouseX, mouseY)
}

// 挂载时绑定全局鼠标移动事件
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

// 卸载时移除事件监听（防止内存泄漏）
onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped>
/* 整体淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

/* 各角色浮动动画（上下缓慢漂浮） */
.character-orange {
  animation: float 3s ease-in-out infinite;
  transform-origin: 140px 240px;
}

.character-purple {
  animation: float 3.5s ease-in-out infinite;
  transform-origin: 240px 180px;
  animation-delay: 0.3s;
}

.character-black {
  animation: float 3.2s ease-in-out infinite;
  transform-origin: 275px 250px;
  animation-delay: 0.6s;
}

.character-yellow {
  animation: float 3.8s ease-in-out infinite;
  transform-origin: 280px 280px;
  animation-delay: 0.9s;
}

/* 浮动关键帧 */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

/* 光晕脉冲动画 */
.glow-effect {
  animation: glow-pulse 2.5s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.5;
  }
}

/* 树叶生长动画（注册模式使用） */
.tree-leaves-1 {
  animation: grow 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
  transform-origin: 200px 240px;
}

.tree-leaves-2 {
  animation: grow 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
  transform-origin: 200px 240px;
  animation-delay: 0.3s;
}

.tree-leaves-3 {
  animation: grow 3s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
  transform-origin: 200px 240px;
  animation-delay: 0.6s;
}

/* 生长关键帧 */
@keyframes grow {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

/* 星星闪烁动画（注册模式使用） */
.sparkles {
  animation: sparkle 1.5s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

/* 树干保持静止 */
.tree-trunk {
  animation: none;
}

/* 无障碍：减少动效偏好时禁用所有动画 */
@media (prefers-reduced-motion: reduce) {
  .character-orange,
  .character-purple,
  .character-black,
  .character-yellow,
  .glow-effect,
  .tree-leaves-1,
  .tree-leaves-2,
  .tree-leaves-3,
  .sparkles {
    animation: none;
  }

  .animate-fade-in {
    animation: none;
    opacity: 1;
    transform: scale(1);
  }
}
</style>

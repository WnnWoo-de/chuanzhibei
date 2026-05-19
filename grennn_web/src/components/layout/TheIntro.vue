<template>
  <!-- ============================================================
       开场动画全屏遮罩层
       - fixed inset-0：覆盖全屏
       - z-[100]：高于所有页面内容
       - font-mono：等宽字体风格，强调科技感
       ============================================================ -->
  <div class="fixed inset-0 z-[100] bg-white text-black flex items-center justify-center overflow-hidden font-mono" ref="introContainer">
    <div class="relative w-full h-full flex items-center justify-center">

      <!-- 右下角数字计数器（0% → 100%）-->
      <div class="absolute bottom-10 right-10 text-9xl font-bold tracking-tighter opacity-0 counter">
        <span ref="counterRef">0</span>%
      </div>

      <!-- 中央 Logo + 文字区域 -->
      <div class="flex flex-col items-center z-10">
        <!-- Logo 图片：初始透明，动画时淡入 -->
        <div class="mb-8 p-4">
          <img src="@/assets/logo.png" alt="Logo" class="w-32 h-32 md:w-48 md:h-48 object-contain opacity-0 intro-logo" />
        </div>

        <!-- 主标题第一行：translateY(100%) 初始在容器外，动画时上移 -->
        <div class="overflow-hidden mb-4">
          <h1 class="text-6xl md:text-8xl font-bold tracking-tighter translate-y-full main-title font-display text-black">
            GreenSight
          </h1>
        </div>

        <!-- 主标题第二行 -->
        <div class="overflow-hidden">
          <h1 class="text-5xl md:text-7xl font-bold tracking-tighter translate-y-full main-title text-black">
            {{ langText.intro.brandTagline }}
          </h1>
        </div>

        <!-- 副标题 -->
        <div class="mt-8 overflow-hidden">
          <p class="text-sm md:text-base tracking-[0.5em] uppercase translate-y-full subtitle opacity-70">
            {{ langText.intro.slogan }}
          </p>
        </div>
      </div>

      <!-- 背景网格线动画（12条竖线，随机顺序展开） -->
      <div class="absolute inset-0 grid grid-cols-12 gap-4 px-6 pointer-events-none opacity-15">
        <div v-for="n in 12" :key="n" class="border-r border-black/20 h-full scale-y-0 origin-top grid-line"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { langText } from '@/language'

// 声明向父组件抛出的事件：动画完成后触发 complete
const emit = defineEmits(['complete'])

// 整个开场动画容器的 DOM 引用（用于最后整体上移退场）
const introContainer = ref(null)
// 计数器数字元素的 DOM 引用（用于 GSAP 数字递增动画）
const counterRef = ref(null)
const fallbackTimer = ref(null)

const finishIntro = () => {
  if (fallbackTimer.value) {
    window.clearTimeout(fallbackTimer.value)
    fallbackTimer.value = null
  }
  document.body.style.overflow = ''
  emit('complete')
}

onMounted(async () => {
  // 兜底：仅在动画库加载失败或异常卡住时结束，避免正常播放中途提前跳过
  fallbackTimer.value = window.setTimeout(() => {
    finishIntro()
  }, 6000)

  try {
    const { default: gsap } = await import('gsap')

    if (fallbackTimer.value) {
      window.clearTimeout(fallbackTimer.value)
      fallbackTimer.value = null
    }

    // 锁定 body 滚动，防止动画播放期间页面被滚动
    document.body.style.overflow = 'hidden'

    // 创建 GSAP 时间轴，动画播放完毕后触发 complete 回调
    const tl = gsap.timeline({
      onComplete: () => {
        // 通知父组件（App.vue）开场动画已完成，隐藏 TheIntro
        finishIntro()
      }
    })

    // 初始化各元素状态
    gsap.set('.grid-line', { scaleY: 0 })
    gsap.set('.main-title', { y: '100%' })
    gsap.set('.subtitle', { y: '100%' })
    gsap.set('.counter', { opacity: 0 })

    // ---- 动画序列 ----

    // 1. 计数器淡入
    tl.to('.counter', { opacity: 1, duration: 0.5 })

    // 2. 数字从 0 递增到 100（与计数器同步开始）
      .to(counterRef.value, {
        innerHTML: 100,
        duration: 2,
        ease: 'power2.inOut',
        snap: { innerHTML: 1 },      // 保证只显示整数
        onUpdate: function() {
          counterRef.value.innerHTML = Math.round(this.targets()[0].innerHTML)
        }
      }, '<')

    // 3. 背景网格线随机顺序展开（与数字递增同步）
      .to('.grid-line', {
        scaleY: 1,
        duration: 1.5,
        stagger: { amount: 0.5, from: 'random' },
        ease: 'power3.inOut'
      }, '-=1.5')

    // 4. 主标题文字从底部上移显示（遮片效果）
      .to('.main-title', {
        y: '0%',
        duration: 1,
        stagger: 0.2,
        ease: 'power4.out'
      }, '-=0.5')

    // 5. 副标题同步上移
      .to('.subtitle', {
        y: '0%',
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.8')

    // 6. Logo 淡入并上移
      .to('.intro-logo', {
        opacity: 1,
        y: -20,
        duration: 1.2,
        ease: 'power3.out'
      }, '-=1.2')

    // 7. 停顿片刻
      .to({}, { duration: 0.5 })

    // 8. 退场：文字/计数器/Logo 向上淡出
      .to('.main-title, .subtitle, .counter, .intro-logo', {
        y: '-100%',
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.in'
      })

    // 9. 网格线同步收缩（从底部收起）
      .to('.grid-line', {
        scaleY: 0,
        transformOrigin: 'bottom',
        duration: 0.8,
        stagger: { amount: 0.3, from: 'random' },
        ease: 'power3.in'
      }, '<')

    // 10. 整个容器向上滑出屏幕（最终退场）
      .to(introContainer.value, {
        y: '-100%',
        duration: 1,
        ease: 'power4.inOut'
      }, '-=0.2')
  } catch (error) {
    document.body.style.overflow = ''
    finishIntro()
    void error
  }
})

onUnmounted(() => {
  if (fallbackTimer.value) {
    window.clearTimeout(fallbackTimer.value)
    fallbackTimer.value = null
  }
  document.body.style.overflow = ''
})
</script>

<style scoped>
.text-primary {
  color: var(--color-accent, #4ADE80);
}
</style>

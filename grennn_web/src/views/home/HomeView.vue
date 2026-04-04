<template>
  <div
    class="bg-transparent min-h-screen text-[#1a1a1a] font-sans selection:bg-primary selection:text-white overflow-x-hidden"
  >
    <!-- Welcome Modal -->
    <transition name="modal-fade">
      <div
        v-if="showWelcomeModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="closeWelcomeModal"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-modal-enter overflow-hidden"
        >
          <!-- Close Button -->
          <button
            @click="closeWelcomeModal"
            class="absolute top-6 right-6 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Content -->
          <div class="p-8 pt-12">
            <!-- Title -->
            <h2 class="text-2xl font-bold text-center mb-2">
              欢迎使用<span class="text-green-500">绿我同行</span>
            </h2>
            <h3 class="text-lg text-center text-gray-600 mb-4">GreenSight AI</h3>

            <!-- Welcome Text -->
            <p class="text-center text-gray-600 text-sm mb-8">感谢您访问我们的项目</p>

            <!-- Info Sections -->
            <div class="space-y-5 mb-8">
              <!-- Project Statement -->
              <div class="flex gap-4 p-4 bg-gradient-to-br from-pink-50 to-transparent rounded-lg border border-pink-100">
                <div class="flex-shrink-0">
                  <svg class="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-sm mb-1">项目声明</p>
                  <p class="text-xs text-gray-600">
                    本项目由 wnnw 开发，用于参加"传智杯"AI-Web 网页开发挑战赛
                  </p>
                </div>
              </div>

              <!-- Project Vision -->
              <div class="flex gap-4 p-4 bg-gradient-to-br from-green-50 to-transparent rounded-lg border border-green-100">
                <div class="flex-shrink-0">
                  <svg class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-sm mb-1">项目愿景</p>
                  <p class="text-xs text-gray-600">
                    致力于为用户提供全面的健康管理解决方案，关注心脑血管健康，促进健康生活方式
                  </p>
                </div>
              </div>

              <!-- Contribute -->
              <div class="flex gap-4 p-4 bg-gradient-to-br from-blue-50 to-transparent rounded-lg border border-blue-100">
                <div class="flex-shrink-0">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-sm mb-1">参与贡献</p>
                  <p class="text-xs text-gray-600">
                    欢迎通过参与项目改进、共同成长。联系我们或提交建议
                  </p>
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3">
              <button
                @click="openLicense"
                class="flex-1 px-4 py-2.5 border-2 border-green-500 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors text-sm"
              >
                查看许可协议
              </button>
              <button
                @click="closeWelcomeModal"
                class="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors text-sm"
              >
                了解并继续
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Hero Section (Carousel) -->
    <section class="h-[100dvh] relative flex flex-col justify-center px-6 pt-20 overflow-hidden">
      <!-- Background Grid -->
      <div
        class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6"
      >
        <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
        <!-- Mobile grid lines (fewer) -->
        <div v-for="n in 4" :key="`m-${n}`" class="border-r border-black h-full block md:hidden col-span-3"></div>
      </div>

      <!-- Hero 装饰背景图形 -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <!-- 右上角大圆环 -->
        <svg class="absolute -right-24 -top-24 w-96 h-96 opacity-[0.04]" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="currentColor" stroke-width="1"/>
          <circle cx="100" cy="100" r="60" stroke="currentColor" stroke-width="0.5"/>
          <circle cx="100" cy="100" r="40" stroke="currentColor" stroke-width="0.5"/>
        </svg>
        <!-- 左下角装饰点阵 -->
        <svg class="absolute left-0 bottom-24 w-48 h-48 opacity-[0.06]" viewBox="0 0 100 100">
          <g fill="currentColor">
            <circle v-for="(dot, i) in Array(25)" :key="i" :cx="(i % 5) * 20 + 10" :cy="Math.floor(i / 5) * 20 + 10" r="1.5"/>
          </g>
        </svg>
        <!-- 动态绿色光晕 -->
        <div
          class="absolute right-1/4 top-1/3 w-64 h-64 rounded-full opacity-[0.06] blur-3xl transition-all duration-1000"
          :style="{ backgroundColor: '#2E7D32', transform: `translate(${currentSlide * 20}px, ${currentSlide * -10}px)` }"
        ></div>
        <!-- slide 编号装饰 -->
        <div class="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 opacity-20">
          <span class="font-mono text-xs writing-vertical">0{{ currentSlide + 1 }} / 0{{ slides.length }}</span>
          <div class="w-px h-16 bg-current"></div>
        </div>
      </div>

      <!-- Carousel Content -->
      <div class="relative z-10 h-full flex flex-col justify-center">
        <transition name="slide-fade" mode="out-in">
          <div :key="currentSlide" class="grid grid-cols-12 gap-4 w-full">
            <div class="col-span-12 md:col-span-8">
              <div class="overflow-hidden mb-4">
                <h2
                  class="text-xs md:text-base font-mono uppercase tracking-widest hero-subtitle text-primary"
                >
                  01. {{ slides[currentSlide].subtitle }}
                </h2>
              </div>

              <div class="overflow-hidden min-h-[30vw] md:min-h-[12vw]">
                <h1
                  class="text-[12vw] md:text-[10vw] leading-[0.9] font-bold tracking-tighter hero-title uppercase break-words"
                >
                  {{ slides[currentSlide].title }}
                </h1>
              </div>

              <div class="mt-6 md:mt-12 max-w-2xl">
                <p class="text-lg md:text-2xl leading-relaxed hero-text">
                  {{ slides[currentSlide].description }}
                </p>
                <div class="mt-8 hero-text">
                  <a
                    v-if="slides[currentSlide].link.startsWith('#')"
                    :href="slides[currentSlide].link"
                    @click.prevent="scrollToSection(slides[currentSlide].link)"
                    class="inline-flex items-center gap-2 border-b border-black pb-1 hover:text-primary hover:border-primary transition-colors group cursor-pointer text-sm md:text-base"
                  >
                    {{ slides[currentSlide].cta }}
                    <span class="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                  <router-link
                    v-else
                    :to="slides[currentSlide].link"
                    class="inline-flex items-center gap-2 border-b border-black pb-1 hover:text-primary hover:border-primary transition-colors group text-sm md:text-base"
                  >
                    {{ slides[currentSlide].cta }}
                    <span class="group-hover:translate-x-1 transition-transform">→</span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- Carousel Controls -->
        <div class="absolute bottom-8 md:bottom-12 left-6 right-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div class="flex gap-2">
            <button
              v-for="(slide, index) in slides"
              :key="index"
              @click="setSlide(index)"
              class="h-1 transition-all duration-300"
              :class="
                currentSlide === index ? 'w-8 md:w-12 bg-black' : 'w-3 md:w-4 bg-black/20 hover:bg-black/40'
              "
            ></button>
          </div>
          <div class="flex gap-3 w-full md:w-auto justify-between md:justify-end items-center">
            <!-- Prev Button -->
            <button
              @click="prevSlide"
              class="relative group h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-full border border-black/20 bg-white/60 hover:bg-white backdrop-blur-sm transition-all duration-300 hover:border-black/40 hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg class="w-5 h-5 md:w-6 md:h-6 stroke-current text-black group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <div class="absolute inset-0 rounded-full bg-green-400/0 group-hover:bg-green-400/5 transition-colors duration-300"></div>
            </button>

            <!-- Play/Pause Button -->
            <button
              @click="toggleAutoPlay"
              class="relative group h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-full border border-black/20 bg-white/60 hover:bg-white backdrop-blur-sm transition-all duration-300 hover:border-black/40 hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg v-if="!isAutoPlaying" class="w-5 h-5 md:w-6 md:h-6 fill-current text-black group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <svg v-else class="w-5 h-5 md:w-6 md:h-6 stroke-current text-black group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              <div class="absolute inset-0 rounded-full bg-green-400/0 group-hover:bg-green-400/5 transition-colors duration-300"></div>
            </button>

            <!-- Next Button -->
            <button
              @click="nextSlide"
              class="relative group h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-full border border-black/20 bg-white/60 hover:bg-white backdrop-blur-sm transition-all duration-300 hover:border-black/40 hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg class="w-5 h-5 md:w-6 md:h-6 stroke-current text-black group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <div class="absolute inset-0 rounded-full bg-green-400/0 group-hover:bg-green-400/5 transition-colors duration-300"></div>
            </button>
          </div>
        </div>

        <!-- Scroll Down Indicator -->
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 scroll-indicator opacity-100 transition-opacity duration-1000">
          <svg class="w-6 h-6 text-black animate-breathe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </div>
    </section>

    <!-- Chapter 2: Quick Access (Core Features) -->
    <section class="py-24 px-6 border-t border-black/10 relative" id="features">
      <div class="grid grid-cols-12 gap-4">
        <!-- Sticky Sidebar -->
        <div class="col-span-12 md:col-span-3 mb-12 md:mb-0">
          <div class="sticky top-24">
            <h2 class="text-4xl md:text-5xl font-bold mt-2 mb-6 animate-on-scroll">核心功能</h2>
            <p class="text-sm opacity-60 max-w-[200px] animate-on-scroll">
              核心功能入口<br />
              探索 Green AI Web 的主要功能模块。
            </p>
          </div>
        </div>

        <!-- Grid Content -->
        <div class="col-span-12 md:col-span-9">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div
              v-for="(feature, index) in features"
              :key="index"
              class="group relative bg-white aspect-[4/5] md:aspect-square p-8 flex flex-col justify-between border border-black/5 tech-border rounded-3xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden animate-on-scroll"
              :class="{ 'md:mt-24': index % 2 !== 0 }"
            >
              <!-- 背景装饰 -->
              <div
                class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-700"
                :class="feature.gradient"
              ></div>
              <div
                class="absolute -right-8 -bottom-8 w-48 h-48 opacity-[0.02] group-hover:opacity-10 transition-all duration-700 transform group-hover:scale-110 group-hover:-rotate-12 pointer-events-none"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="0.5"
                  class="w-full h-full"
                >
                  <path :d="feature.icon" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>

              <!-- 顶部元数据 -->
              <div class="flex justify-between items-start relative z-10">
                <div
                  class="font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity"
                >
                  02.{{ index + 1 }}
                </div>
                <div
                  class="w-2 h-2 rounded-full bg-black/10 group-hover:bg-green-500 transition-colors duration-300"
                ></div>
              </div>

              <!-- 核心内容区 -->
              <div class="relative z-10 mt-auto mb-8">
                <div
                  class="mb-6 w-12 h-12 rounded-xl bg-gray-50 border border-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300 shadow-sm"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.2"
                    class="w-6 h-6"
                  >
                    <path :d="feature.icon" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
                <h3
                  class="text-2xl font-bold mb-2 tracking-tight group-hover:translate-x-1 transition-transform duration-300"
                >
                  {{ feature.title }}
                </h3>
                <p class="font-mono text-[10px] opacity-50 uppercase tracking-wider mb-4">
                  {{ feature.subtitle }}
                </p>
                <p
                  class="text-sm leading-relaxed text-gray-600 opacity-80 group-hover:opacity-100 transition-opacity border-l-2 border-transparent group-hover:border-primary pl-0 group-hover:pl-3 transition-all duration-300"
                >
                  {{ feature.description }}
                </p>
              </div>

              <!-- 底部操作栏 -->
              <div
                class="relative z-10 pt-4 border-t border-black/5 group-hover:border-black/10 transition-colors flex justify-between items-center"
              >
                <router-link
                  :to="feature.link"
                  class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:gap-3 transition-all group/btn"
                >
                  {{ feature.cta }}
                  <span
                    class="text-lg leading-none transform group-hover/btn:translate-x-1 transition-transform"
                    >→</span
                  >
                </router-link>
                <span
                  class="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-[10px] font-mono text-gray-400"
                  >ACCESS GRANTED</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Chapter 4: Dynamic News (Updates) -->
    <section class="py-24 px-6 border-t border-black/10 relative" id="news">
      <div class="grid grid-cols-12 gap-4">
        <!-- Sticky Sidebar -->
        <div class="col-span-12 md:col-span-3 mb-12 md:mb-0">
          <div class="sticky top-24">
            <h2 class="text-4xl md:text-5xl font-bold mt-2 mb-6">动态资讯</h2>
            <div class="flex gap-2 mt-8">
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="w-10 h-10 border border-black/20 flex items-center justify-center hover:bg-black hover:text-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-current transition-colors"
              >
                ←
              </button>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="w-10 h-10 border border-black/20 flex items-center justify-center hover:bg-black hover:text-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-current transition-colors"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <!-- News List -->
        <div class="col-span-12 md:col-span-9">
          <div class="flex flex-col">
            <div
              v-for="(news, index) in paginatedNews"
              :key="index"
              class="group border-b border-black/10 py-6 hover:bg-white transition-colors cursor-pointer px-4 -mx-4"
            >
              <div class="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-2">
                    <span class="text-xs font-mono px-2 py-1 bg-black/5 rounded">{{
                      news.tag
                    }}</span>
                    <span class="text-xs text-gray-400 font-mono">{{ news.date }}</span>
                  </div>
                  <h3 class="text-xl font-bold group-hover:text-primary transition-colors">
                    {{ news.title }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-2 max-w-2xl">{{ news.excerpt }}</p>
                </div>
                <div
                  class="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0"
                >
                  <span class="text-2xl">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Marquee -->
    <div class="py-12 border-t border-black/10 overflow-hidden bg-white text-black/80">
      <div class="flex whitespace-nowrap animate-marquee">
        <!-- 第一组内容 -->
        <div class="flex items-center shrink-0">
          <span class="text-[4vw] font-bold mx-8">绿色 AI WEB</span>
          <span class="text-[4vw] font-bold mx-8 text-gray-500">可持续</span>
          <span class="text-[4vw] font-bold mx-8">重构</span>
          <span class="text-[4vw] font-bold mx-8 text-gray-500">社区</span>
          <span class="text-[4vw] font-bold mx-8">绿色 AI WEB</span>
          <span class="text-[4vw] font-bold mx-8 text-gray-500">可持续</span>
          <span class="text-[4vw] font-bold mx-8">重构</span>
          <span class="text-[4vw] font-bold mx-8 text-gray-500">社区</span>
        </div>
        <!-- 第二组内容 (用于无缝循环) -->
        <div class="flex items-center shrink-0">
          <span class="text-[4vw] font-bold mx-8">绿色 AI WEB</span>
          <span class="text-[4vw] font-bold mx-8 text-gray-500">可持续</span>
          <span class="text-[4vw] font-bold mx-8">重构</span>
          <span class="text-[4vw] font-bold mx-8 text-gray-500">社区</span>
          <span class="text-[4vw] font-bold mx-8">绿色 AI WEB</span>
          <span class="text-[4vw] font-bold mx-8 text-gray-500">可持续</span>
          <span class="text-[4vw] font-bold mx-8">重构</span>
          <span class="text-[4vw] font-bold mx-8 text-gray-500">社区</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const router = useRouter()

// --- Welcome Modal Logic ---
const showWelcomeModal = ref(false)

const checkFirstVisit = () => {
  const hasVisited = localStorage.getItem('greenSightVisited')
  if (!hasVisited) {
    // 第一次访问，2秒后显示弹窗
    setTimeout(() => {
      showWelcomeModal.value = true
    }, 2000)
    localStorage.setItem('greenSightVisited', 'true')
  }
}

const closeWelcomeModal = () => {
  showWelcomeModal.value = false
}

const openLicense = () => {
  closeWelcomeModal()
  router.push('/license')
}

// --- Carousel Logic ---
const currentSlide = ref(0)
const isAutoPlaying = ref(true)
let autoPlayInterval = null

const slides = [
  {
    title: '绿色 AI Web',
    subtitle: '关于我们',
    description:
      'Green AI Web 是一个旨在通过 AI 技术促进环保行为的全栈平台。我们结合前端 Vue.js、后端 Node.js，为用户提供了一个记录、分享和激励环保活动的数字生态。',
    cta: '开始探索',
    link: '#features',
  },
  {
    title: 'AI 创意重构',
    subtitle: '最新活动',
    description:
      '参与我们的夏季旧物重构挑战赛！上传你的创意作品，赢取环保积分与独家徽章。AI 助手将全程提供灵感支持。',
    cta: '立即参与',
    link: '/community',
  },
  {
    title: '智能助手 2.0',
    subtitle: '功能更新',
    description:
      '全新的 AI 环保助手现已上线。更精准的物品识别，更个性化的改造建议，助您轻松开启绿色生活。',
    cta: '体验新版',
    link: '/chat',
  },
]

const scrollToSection = (hash) => {
  const target = document.querySelector(hash)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
}

const setSlide = (index) => {
  currentSlide.value = index
  resetAutoPlay()
}

const toggleAutoPlay = () => {
  isAutoPlaying.value = !isAutoPlaying.value
  if (isAutoPlaying.value) {
    startAutoPlay()
  } else {
    stopAutoPlay()
  }
}

const startAutoPlay = () => {
  stopAutoPlay()
  autoPlayInterval = setInterval(nextSlide, 5000)
}

const stopAutoPlay = () => {
  if (autoPlayInterval) clearInterval(autoPlayInterval)
}

const resetAutoPlay = () => {
  if (isAutoPlaying.value) startAutoPlay()
}

// --- Features Data ---
const features = [
  {
    title: '旧物重构',
    subtitle: 'RECONSTRUCTION',
    description: '通过 AI 技术将闲置物品重新设计改造，激发创意，延长物品生命周期。上传照片，获取改造建议。',
    link: '/reconstruction',
    cta: '开始创意重构',
    icon: 'M12 3.5 4.5 7.75v8.5L12 20.5l7.5-4.25v-8.5L12 3.5z',
    gradient: 'from-orange-400 to-pink-400',
  },
  {
    title: 'AI 智能助手',
    subtitle: 'GREENSIGHT AI',
    description: '使用 Qwen2.5 AI 模型识别物品、提供改造建议、计算碳足迹。智能化、个性化的绿色生活指导。',
    link: '/chat',
    cta: '开启对话',
    icon: 'M6 7.5h12a2.5 2.5 0 0 1 2.5 2.5v4A2.5 2.5 0 0 1 18 16.5h-6l-4.5 4v-4H6A2.5 2.5 0 0 1 3.5 14v-4A2.5 2.5 0 0 1 6 7.5Z M8 12h.01M12 12h.01M16 12h.01',
    gradient: 'from-blue-400 to-cyan-400',
  },
  {
    title: '成就系统',
    subtitle: 'ACHIEVEMENTS',
    description: '完成环保任务，收集独家徽章与成就。展示你的绿色足迹，激励更多人加入生态保护行动。',
    link: '/achievements',
    cta: '查看成就',
    icon: 'M12 4.25 13.894 8.356 18.25 8.83 15 11.914 15.9 16.25 12 14.07 8.1 16.25 9 11.914 5.75 8.83 10.106 8.356 12 4.25ZM6 3.75v3.5M4.25 5.5h3.5M18 16.75v3.5m-1.75-1.75h3.5',
    gradient: 'from-yellow-400 to-amber-400',
  },
  {
    title: '活动社区',
    subtitle: 'COMMUNITY',
    description: '分享你的环保故事，参与社区讨论与挑战赛。与志同道合的伙伴互动，共同建设绿色社区。',
    link: '/community',
    cta: '进入社区',
    icon: 'M8.5 11.25a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Zm7 0a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5ZM3.75 18.25a4.75 4.75 0 0 1 8.21-3.25M20.25 18.25a4.75 4.75 0 0 0-8.21-3.25M8.5 18.25a3.5 3.5 0 0 1 7 0',
    gradient: 'from-green-400 to-teal-400',
  },
  {
    title: '志愿活动',
    subtitle: 'VOLUNTEER',
    description: '参加线上线下志愿活动，为环保事业贡献力量。积累志愿时数，获得认可与奖励。',
    link: '/volunteer',
    cta: '参加志愿',
    icon: 'M12 20s-6.5-4.35-8.5-8.15C1.6 8.96 3.1 5.75 6.5 5.75c2.05 0 3.14 1.08 4.03 2.3.63-.96 1.98-2.3 4.47-2.3 3.39 0 4.9 3.21 3 6.1C18.5 15.65 12 20 12 20Z',
    gradient: 'from-red-400 to-rose-400',
  },
  {
    title: '天气查询',
    subtitle: 'WEATHER',
    description: '实时查看天气数据与环保指数。了解空气质量，规划户外环保活动。',
    link: '/weather',
    cta: '查看天气',
    icon: 'M7 18.25h9a4.25 4.25 0 1 0-.68-8.445A5.5 5.5 0 0 0 4.75 12a3.25 3.25 0 0 0 2.25 6.25Z',
    gradient: 'from-violet-400 to-purple-400',
  },
]

// --- News Data & Pagination ---
const newsItems = [
  {
    title: 'Green AI Web 2.0 正式发布：全新 AI 识别引擎上线',
    date: '2025.03.18',
    tag: '系统公告',
    excerpt: '全新 UI 设计、更强大的 Qwen2.5 AI 识别引擎以及社区功能全面升级，带来更流畅的绿色生活体验。',
  },
  {
    title: '「春日旧物重构」挑战赛正式启动',
    date: '2025.03.15',
    tag: '社区活动',
    excerpt: '上传你的创意重构作品，赢取环保积分与独家徽章，AI 助手全程提供灵感支持。',
  },
  {
    title: '本周环保达人榜单公布',
    date: '2025.03.12',
    tag: '排行榜',
    excerpt: '恭喜 EcoWarrior 获得本周「碳中和先锋」称号，累计减排超过 500kg CO₂e！',
    tag: '排行榜',
    excerpt: '恭喜 User888 获得本周“碳中和先锋”称号！',
  },
  {
    title: '如何正确进行垃圾分类？AI 助手来教你',
    date: '2025.03.10',
    tag: '环保知识',
    excerpt: '详细解析各类垃圾的分类标准与回收利用价值，让环保成为日常习惯。',
  },
  {
    title: '碳足迹分析功能重大升级：接入实时 AI 建议',
    date: '2025.03.07',
    tag: '功能更新',
    excerpt: '全新碳足迹计算器现已接入 Qwen2.5，根据你的数据生成个性化减排方案。',
  },
  {
    title: '社区「闲置物品交换」板块正式上线',
    date: '2025.03.05',
    tag: '功能更新',
    excerpt: '让闲置物品流动起来，减少资源浪费，每一次交换都是对地球的贡献。',
  },
]

const currentPage = ref(1)
const itemsPerPage = 4

const totalPages = computed(() => Math.ceil(newsItems.length / itemsPerPage))
const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return newsItems.slice(start, start + itemsPerPage)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// --- Lifecycle ---
onMounted(() => {
  checkFirstVisit()
  startAutoPlay()

  // 延迟执行 GSAP 动画，确保 DOM 完全渲染
  nextTick(() => {
    // GSAP Animations for Scroll
    const sections = gsap.utils.toArray('section')
    if (sections && sections.length > 0) {
      sections.forEach((section) => {
        const elements = section.querySelectorAll('.animate-on-scroll')
        if (elements && elements.length > 0) {
          gsap.fromTo(
            elements,
            {
              y: 30,
              opacity: 0,
            },
            {
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.1,
              ease: 'power2.out',
              clearProps: 'all',
            },
          )
        }
      })
    }

    // Features Cards Stagger Animation
    const featuresSection = document.querySelector('#features')
    if (featuresSection) {
      const cards = featuresSection.querySelectorAll('.group.relative')
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          {
            y: 24,
            opacity: 0,
          },
          {
            scrollTrigger: {
              trigger: featuresSection,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power2.out',
            clearProps: 'all',
          },
        )
      }
    }

    // Scroll Down Indicator Fade Out
    const scrollIndicator = document.querySelector('.scroll-indicator')
    if (scrollIndicator) {
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top -100px',
        onEnter: () => gsap.to(scrollIndicator, { opacity: 0, duration: 0.5 }),
        onLeaveBack: () => gsap.to(scrollIndicator, { opacity: 1, duration: 0.5 }),
      })
    }
  })
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style scoped>
/* Modal Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.animate-modal-enter {
  animation: modal-slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Slide Fade Transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.hero-title {
  /* Ensure big text doesn't break layout on small screens */
  word-break: break-word;
}

.animate-marquee {
  animation: marquee 30s linear infinite;
}

.animate-marquee:hover {
  animation-play-state: paused;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    /* 父容器含两组完全相同的内容，总宽度 = 2x 单组宽度。
       移动 -50% 恰好到达第二组开头，视觉上与第一组起点相同，实现无缝循环。 */
    transform: translateX(-50%);
  }
}

/* Breathing Light for Buttons */
.breathing-light {
  position: relative;
  background: transparent;
  border: none;
  color: inherit;
  transition: color 0.3s ease;
}

.breathing-light::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: rgba(46, 125, 50, 0.1); /* 浅色主题下的绿色 */
  border-radius: 4px;
  opacity: 0;
  animation: breathe 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes breathe {
  0%, 100% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.05);
  }
}

/* Scroll Indicator Breathe */
.animate-breathe {
  animation: breathe-icon 1.8s ease-in-out infinite;
}

@keyframes breathe-icon {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}
</style>



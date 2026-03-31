<template>
  <div
    class="bg-transparent min-h-screen text-[#1a1a1a] font-sans selection:bg-primary selection:text-white overflow-x-hidden relative"
  >
    <!-- Content wrapper (removed margin since it's now in App.vue) -->
    <div class="transition-all duration-300 relative">
      <!-- Hero Section (Carousel) -->
      <section class="h-[100dvh] relative flex flex-col justify-center px-6 pt-20 overflow-hidden">
        <!-- Background Grid -->
        <div
          class="absolute top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10"
        >
          <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
          <!-- Mobile grid lines (fewer) -->
          <div
            v-for="n in 4"
            :key="`m-${n}`"
            class="border-r border-black h-full block md:hidden col-span-3"
          ></div>
        </div>

        <!-- Hero 装饰背景图形 -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <!-- 右上角大圆环 -->
          <svg
            class="absolute -right-24 -top-24 w-96 h-96 opacity-[0.04]"
            viewBox="0 0 200 200"
            fill="none"
          >
            <circle cx="100" cy="100" r="80" stroke="currentColor" stroke-width="1" />
            <circle cx="100" cy="100" r="60" stroke="currentColor" stroke-width="0.5" />
            <circle cx="100" cy="100" r="40" stroke="currentColor" stroke-width="0.5" />
          </svg>
          <!-- 左下角装饰点阵 -->
          <svg class="absolute left-0 bottom-24 w-48 h-48 opacity-[0.06]" viewBox="0 0 100 100">
            <g fill="currentColor">
              <circle
                v-for="(_, i) in Array(25)"
                :key="i"
                :cx="(i % 5) * 20 + 10"
                :cy="Math.floor(i / 5) * 20 + 10"
                r="1.5"
              />
            </g>
          </svg>
          <!-- 动态绿色光晕 -->
          <div
            class="absolute right-1/4 top-1/3 w-64 h-64 rounded-full opacity-[0.06] blur-3xl transition-all duration-1000"
            :style="{
              backgroundColor: '#2E7D32',
              transform: `translate(${currentSlide * 20}px, ${currentSlide * -10}px)`,
            }"
          ></div>
          <!-- slide 编号装饰 -->
          <div
            class="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 opacity-20"
          >
            <span class="font-mono text-xs writing-vertical"
              >0{{ currentSlide + 1 }} / 0{{ slides.length }}</span
            >
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
          <div
            class="absolute bottom-8 md:bottom-12 left-6 right-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
          >
            <div class="flex gap-2">
              <button
                v-for="(_, index) in slides"
                :key="index"
                @click="setSlide(index)"
                class="h-1 transition-all duration-300"
                :class="
                  currentSlide === index
                    ? 'w-8 md:w-12 bg-black'
                    : 'w-3 md:w-4 bg-black/20 hover:bg-black/40'
                "
              ></button>
            </div>
            <div
              class="hero-carousel-controls w-full md:w-auto flex justify-between md:justify-end items-center gap-2 md:gap-3"
            >
              <button
                @click="prevSlide"
                class="hero-control-btn hero-control-btn--soft text-left md:text-center"
                aria-label="上一张"
              >
                <span class="hero-control-icon">‹</span>
                <span>上一张</span>
              </button>
              <button
                @click="toggleAutoPlay"
                class="hero-control-btn hero-control-btn--active"
                :aria-label="isAutoPlaying ? '暂停轮播' : '开始轮播'"
              >
                <span class="hero-control-dot" :class="{ 'is-paused': !isAutoPlaying }"></span>
                <span>{{ isAutoPlaying ? '暂停轮播' : '开始轮播' }}</span>
              </button>
              <button
                @click="nextSlide"
                class="hero-control-btn hero-control-btn--soft text-right md:text-center"
                aria-label="下一张"
              >
                <span>下一张</span>
                <span class="hero-control-icon">›</span>
              </button>
            </div>
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
                class="group relative bg-white/90 backdrop-blur-md aspect-[4/5] md:aspect-square p-8 flex flex-col justify-between border border-black/10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden animate-on-scroll rounded-2xl shadow-xl"
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

      <!-- Chapter 3: Featured Content (Recommendations) -->
      <section class="py-24 px-6 border-t border-black/10 bg-white relative" id="recommendations">
        <div class="grid grid-cols-12 gap-4">
          <!-- Sticky Sidebar -->
          <div class="col-span-12 md:col-span-3 mb-12 md:mb-0">
            <div class="sticky top-24">
              <h2 class="text-4xl md:text-5xl font-bold mt-2 mb-6">精选推荐</h2>
              <p class="text-sm opacity-60 max-w-[200px]">
                灵感与创意<br />
                来自社区的优秀重构案例与环保创意。
              </p>
            </div>
          </div>

          <!-- Recommendations Grid -->
          <div class="col-span-12 md:col-span-9">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="(item, index) in featuredItems" :key="index" class="group cursor-pointer">
                <div class="aspect-[3/4] bg-gray-100 mb-4 overflow-hidden relative">
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end p-4"
                  >
                    <span class="text-white text-sm font-bold">查看详情 →</span>
                  </div>
                  <img
                    v-if="item.image"
                    :src="item.image"
                    :alt="item.title"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    @error="item.image = ''"
                  />
                  <div
                    v-else
                    class="w-full h-full bg-neutral-200 group-hover:scale-110 transition-transform duration-700"
                    :style="`background-color: hsl(${index * 60}, 20%, 90%)`"
                  ></div>
                </div>
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-bold group-hover:text-primary transition-colors">
                      {{ item.title }}
                    </h4>
                    <p class="text-xs text-gray-500 uppercase tracking-wider mt-1">
                      {{ item.category }}
                    </p>
                  </div>
                  <span class="text-xs font-mono opacity-50">★ {{ item.likes }}</span>
                </div>
              </div>
            </div>

            <div class="mt-12 text-center">
              <button
                class="inline-block border border-black px-8 py-3 text-sm hover:bg-black hover:text-white transition-colors uppercase tracking-widest"
              >
                查看更多推荐
              </button>
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
                class="group border-b border-black/10 py-6 hover:bg-white/80 hover:backdrop-blur-sm transition-colors cursor-pointer px-4 -mx-4 rounded-xl"
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
      <div class="py-12 border-t border-white/10 overflow-hidden bg-white
       text-black">
        <div class="flex whitespace-nowrap animate-marquee">
          <!-- 第一组内容 -->
          <div class="flex items-center shrink-0">
            <span class="text-[4vw] font-bold mx-8">GreenSight AI WEB</span>
            <span class="text-[4vw] font-bold mx-8 text-gray-500">可持续</span>
            <span class="text-[4vw] font-bold mx-8">旧物重构</span>
            <span class="text-[4vw] font-bold mx-8 text-gray-500">社区活动</span>
            <span class="text-[4vw] font-bold mx-8">GreenSight AI WEB</span>
            <span class="text-[4vw] font-bold mx-8 text-gray-500">可持续发展</span>
            <span class="text-[4vw] font-bold mx-8">旧物重构</span>
            <span class="text-[4vw] font-bold mx-8 text-gray-500">社区清洁活动</span>
          </div>
          <!-- 第二组内容 (用于无缝循环) -->
          <div class="flex items-center shrink-0">
            <span class="text-[4vw] font-bold mx-8">GreenSight AI WEB</span>
            <span class="text-[4vw] font-bold mx-8 text-gray-500">可持续</span>
            <span class="text-[4vw] font-bold mx-8">旧物重构</span>
            <span class="text-[4vw] font-bold mx-8 text-gray-500">社区活动</span>
            <span class="text-[4vw] font-bold mx-8">GreenSight AI WEB</span>
            <span class="text-[4vw] font-bold mx-8 text-gray-500">可持续</span>
            <span class="text-[4vw] font-bold mx-8">旧物重构</span>
            <span class="text-[4vw] font-bold mx-8 text-gray-500">社区清洁活动</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// views/HomeView.vue - 首页
// 包含：英雄区轮播、核心功能卡片、精选推荐、动态资讯、跑马灯底栏
// 使用 GSAP + ScrollTrigger 实现滚动进场动画
// ============================================================
import { ref, computed, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 注册 GSAP 滚动触发插件
gsap.registerPlugin(ScrollTrigger)

// ---- 轮播逻辑 ----
const currentSlide = ref(0) // 当前显示的幻灯片索引
const isAutoPlaying = ref(true) // 是否正在自动播放
let autoPlayInterval = null // 自动播放计时器引用

// 轮播幻灯片数据（标题、副标题、描述、CTA 文字和跳转链接）
const slides = [
  {
    title: 'GreenSight AI Web',
    subtitle: '关于我们',
    description:
      'GreenSight AI Web 是一个旨在通过 AI 技术促进环保行为的全栈平台。我们结合前端 Vue.js、后端 Node.js，为用户提供了一个记录、分享和激励环保活动的数字生态。',
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

/**
 * 平滑滚动到页内锚点区域
 * @param hash - CSS 选择器，如 '#features'
 */
const scrollToSection = (hash) => {
  const target = document.querySelector(hash)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

/** 切换到下一张幻灯片（循环） */
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

/** 切换到上一张幻灯片（循环） */
const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
}

/** 直接跳转到指定幻灯片并重置自动播放计时器 */
const setSlide = (index) => {
  currentSlide.value = index
  resetAutoPlay()
}

/** 切换自动播放状态 */
const toggleAutoPlay = () => {
  isAutoPlaying.value = !isAutoPlaying.value
  if (isAutoPlaying.value) {
    startAutoPlay()
  } else {
    stopAutoPlay()
  }
}

/** 启动自动播放（每 5 秒切换一次） */
const startAutoPlay = () => {
  stopAutoPlay()
  autoPlayInterval = setInterval(nextSlide, 5000)
}

/** 停止自动播放 */
const stopAutoPlay = () => {
  if (autoPlayInterval) clearInterval(autoPlayInterval)
}

/** 重置自动播放计时器（手动切换后调用） */
const resetAutoPlay = () => {
  if (isAutoPlaying.value) startAutoPlay()
}

// ---- 核心功能卡片数据 ----
// 每项包含标题、副标题、描述、跳转链接、渐变色类名和 SVG 路径
const features = [
  {
    title: '旧物重构',
    subtitle: '智能回收 / Smart Recycling',
    description: '用户上传旧物品，系统分析物品价值，推荐重构方案。',
    cta: '立即体验',
    link: '/reconstruction',
    gradient: 'from-green-50 to-green-100',
    icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96 12 12.01l8.73-5.05 M12 22.08V12',
  },
  {
    title: 'AI 助手',
    subtitle: '智能助手 / Assistant',
    description: '接入 AI，基于用户活动数据，提供个性化的环保建议。',
    cta: '开始对话',
    link: '/chat',
    gradient: 'from-blue-50 to-blue-100',
    icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  },
  {
    title: '成就系统',
    subtitle: '游戏化激励 / Gamification',
    description: '通过完成环保任务解锁成就，激励用户持续参与。',
    cta: '查看徽章',
    link: '/achievements',
    gradient: 'from-yellow-50 to-yellow-100',
    icon: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M2 22h20 M6 9h12v4c0 4-3 8-6 8s-6-4-6-8V9z',
  },
  {
    title: '活动社区',
    subtitle: '社区与排行 / Community & Ranking',
    description: '志愿服务分享感受，展示顶尖用户的环保贡献。',
    cta: '加入我们',
    link: '/community',
    gradient: 'from-purple-50 to-purple-100',
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    title: '天气查询',
    subtitle: '环境感知 / Weather Intelligence',
    description: '实时天气预报与空气质量监测，为环保出行提供数据支撑。',
    cta: '查看天气',
    link: '/weather',
    gradient: 'from-sky-50 to-sky-100',
    icon: 'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 6a6 6 0 0 0 0 12 6 6 0 0 0 0-12z',
  },
]

// ---- 精选推荐数据 ----
const featuredItems = [
  {
    title: '复古植物架',
    category: '家具重构',
    likes: 128,
    image: new URL('../assets/images/case_1.png', import.meta.url).href,
  },
  {
    title: '牛仔托特包',
    category: '时尚改造',
    likes: 245,
    image: new URL('../assets/images/case_2.png', import.meta.url).href,
  },
  {
    title: '玻璃瓶氛围灯',
    category: '创意装饰',
    likes: 312,
    image: new URL('../assets/images/case_3.png', import.meta.url).href,
  },
  {
    title: '自行车轮时钟',
    category: '艺术创作',
    likes: 189,
    image: new URL('../assets/images/case_4.png', import.meta.url).href,
  },
  {
    title: '社区清洁活动',
    category: '志愿服务',
    likes: 96,
    image: new URL('../assets/images/community_1.png', import.meta.url).href,
  },
  {
    title: '旧物交换市集',
    category: '社区活动',
    likes: 156,
    image: new URL('../assets/images/community_2.png', import.meta.url).href,
  },
  {
    title: '环保创意工作坊',
    category: '社区共创',
    likes: 208,
    image: new URL('../assets/images/community_3.png', import.meta.url).href,
  },
]

// ---- 动态资讯数据 & 分页逻辑 ----
// 新闻数据列表（静态配置，可后续替换为接口数据）
const newsItems = [
  {
    title: 'Green AI Web 2.0 正式发布：全新 AI 识别引擎上线',
    date: '2025.03.18',
    tag: '系统公告',
    excerpt:
      '全新 UI 设计、更强大的 Qwen2.5 AI 识别引擎以及社区功能全面升级，带来更流畅的绿色生活体验。',
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
    excerpt:
      '恭喜 EcoWarrior 获得本周「碳中和先锋」称号，累计减排超过 500kg CO₂e！另外，恭喜 User888 也获得本周“碳中和先锋”称号！',
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

// 当前页码（从 1 开始）
const currentPage = ref(1)
// 每页显示条数
const itemsPerPage = 4

// 总页数（根据新闻总数自动计算）
const totalPages = computed(() => Math.ceil(newsItems.length / itemsPerPage))
// 当前页的新闻切片
const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return newsItems.slice(start, start + itemsPerPage)
})

/** 切换到下一页 */
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

/** 切换到上一页 */
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// ---- 生命周期 ----
onMounted(() => {
  startAutoPlay()

  // GSAP 滚动进场动画：为每个 section 内带 .animate-on-scroll 类的元素添加淡入上移效果
  gsap.utils.toArray('section').forEach((section) => {
    const elements = section.querySelectorAll('.animate-on-scroll')
    if (elements.length) {
      gsap.fromTo(
        elements,
        {
          y: 30,
          opacity: 0,
        },
        {
          scrollTrigger: {
            trigger: section,
            start: 'top 85%', // 稍微提前触发
            toggleActions: 'play none none none', // 只播放一次，不反转
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
          clearProps: 'all', // 动画结束后清除内联样式，防止干扰 CSS hover 效果
        },
      )
    }
  })
})

// 组件卸载时停止轮播计时器，防止内存泄漏
onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style scoped>
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

.hero-carousel-controls {
  padding: 0.4rem;
  border: 1px solid rgba(46, 125, 50, 0.08);
  border-radius: 9999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(249, 252, 249, 0.72) 100%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 12px 28px rgba(42, 61, 45, 0.08);
}

.hero-control-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-height: 2.9rem;
  padding: 0 1rem;
  border: 1px solid transparent;
  border-radius: 9999px;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #304335;
  transition:
    transform 0.25s ease,
    background-color 0.25s ease,
    color 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.hero-control-btn:hover {
  transform: translateY(-1px);
}

.hero-control-btn--soft {
  background: rgba(255, 255, 255, 0.72);
  border-color: rgba(46, 125, 50, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.hero-control-btn--soft:hover {
  color: var(--color-primary, #2e7d32);
  background: rgba(246, 251, 246, 0.98);
  border-color: rgba(46, 125, 50, 0.16);
  box-shadow: 0 8px 18px rgba(46, 125, 50, 0.08);
}

.hero-control-btn--active {
  color: var(--color-primary, #2e7d32);
  background: linear-gradient(180deg, rgba(237, 247, 237, 0.98) 0%, rgba(228, 244, 229, 0.92) 100%);
  border-color: rgba(46, 125, 50, 0.16);
  box-shadow: 0 10px 22px rgba(46, 125, 50, 0.1);
}

.hero-control-btn--active:hover {
  background: linear-gradient(180deg, rgba(242, 250, 242, 1) 0%, rgba(232, 247, 233, 0.96) 100%);
  box-shadow: 0 12px 26px rgba(46, 125, 50, 0.14);
}

.hero-control-icon {
  font-size: 1rem;
  line-height: 1;
  opacity: 0.6;
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.hero-control-btn:hover .hero-control-icon {
  opacity: 0.95;
}

.hero-control-btn:first-child:hover .hero-control-icon {
  transform: translateX(-2px);
}

.hero-control-btn:last-child:hover .hero-control-icon {
  transform: translateX(2px);
}

.hero-control-dot {
  width: 0.52rem;
  height: 0.52rem;
  border-radius: 9999px;
  background: #7cc486;
  box-shadow: 0 0 0 0 rgba(124, 196, 134, 0.38);
  animation: heroSoftPulse 1.8s ease-out infinite;
}

.hero-control-dot.is-paused {
  animation: none;
  background: #b8c8ba;
  box-shadow: none;
}

@keyframes heroSoftPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(124, 196, 134, 0.38);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(124, 196, 134, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(124, 196, 134, 0);
  }
}

@media (max-width: 768px) {
  .hero-carousel-controls {
    width: 100%;
    padding: 0.3rem;
  }

  .hero-control-btn {
    flex: 1;
    min-width: 0;
    min-height: 2.75rem;
    padding: 0 0.7rem;
    font-size: 0.66rem;
    letter-spacing: 0.1em;
  }

  .hero-control-btn span:last-child,
  .hero-control-btn span:first-child {
    white-space: nowrap;
  }
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

/* Hide scrollbar for sidebar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>

<template>
  <div
    ref="homeRootRef"
    class="home-view bg-transparent min-h-screen text-[#1a1a1a] font-sans selection:bg-primary selection:text-white overflow-x-hidden"
  >
    <!-- 首次访问欢迎弹窗 -->
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
              {{ langText.home.welcomeTitlePrefix }}<span class="text-green-500">{{ langText.home.welcomeBrand }}</span>
            </h2>
            <h3 class="text-lg text-center text-gray-600 mb-4">GreenSight AI</h3>

            <!-- Welcome Text -->
            <p class="text-center text-gray-600 text-sm mb-8">{{ langText.home.welcomeThanks }}</p>

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
                  <p class="font-semibold text-sm mb-1">{{ langText.home.statementTitle }}</p>
                  <p class="text-xs text-gray-600">
                    {{ langText.home.statementText }}
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
                  <p class="font-semibold text-sm mb-1">{{ langText.home.visionTitle }}</p>
                  <p class="text-xs text-gray-600">
                    {{ langText.home.visionText }}
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
                  <p class="font-semibold text-sm mb-1">{{ langText.home.contributeTitle }}</p>
                  <p class="text-xs text-gray-600">
                    {{ langText.home.contributeText }}
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
                {{ langText.home.license }}
              </button>
              <button
                @click="closeWelcomeModal"
                class="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors text-sm"
              >
                {{ langText.home.continue }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 首屏英雄区域（轮播展示） -->
    <section class="hero-section min-h-[100dvh] md:min-h-screen relative flex flex-col justify-center overflow-hidden bg-[#fcfffc] px-4 md:px-6 pt-10 md:pt-20 text-[#1d3a2d]">
      <div class="hero-silk-layer absolute inset-0 z-0 overflow-hidden opacity-55 pointer-events-none">
        <Silk
          :speed="1.8"
          :scale="0.85"
          color="#ffffff"
          :noiseIntensity="0.5"
          :rotation="0.12"
          class-name="h-full w-full"
        />
      </div>
      <div class="hero-tint-layer absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98),transparent_42%),radial-gradient(circle_at_78%_20%,rgba(220,252,231,0.34),transparent_26%),linear-gradient(135deg,rgba(252,255,252,0.96),rgba(248,252,248,0.84))] pointer-events-none"></div>
      <!-- 背景网格装饰线 -->
      <div
        class="hero-grid-layer fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-[0.07] z-0 px-6"
      >
        <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
        <!-- Mobile grid lines (fewer) -->
        <div v-for="n in 4" :key="`m-${n}`" class="border-r border-black h-full block md:hidden col-span-3"></div>
      </div>

      <!-- Hero 装饰背景图形 -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <!-- 右上角大圆环 -->
        <svg class="absolute -right-24 -top-24 w-96 h-96 opacity-[0.025]" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="currentColor" stroke-width="1"/>
          <circle cx="100" cy="100" r="60" stroke="currentColor" stroke-width="0.5"/>
          <circle cx="100" cy="100" r="40" stroke="currentColor" stroke-width="0.5"/>
        </svg>
        <!-- 左下角装饰点阵 -->
        <svg class="absolute left-0 bottom-24 w-48 h-48 opacity-[0.035]" viewBox="0 0 100 100">
          <g fill="currentColor">
            <circle v-for="(dot, i) in Array(25)" :key="i" :cx="(i % 5) * 20 + 10" :cy="Math.floor(i / 5) * 20 + 10" r="1.5"/>
          </g>
        </svg>
        <!-- 动态绿色光晕 -->
        <div
          class="absolute right-1/4 top-1/3 w-72 h-72 rounded-full opacity-[0.09] blur-3xl transition-all duration-1000"
          :style="{ backgroundColor: '#86efac', transform: `translate(${currentSlide * 20}px, ${currentSlide * -10}px)` }"
        ></div>
        <!-- slide 编号装饰 -->
        <div class="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 opacity-15">
          <span class="font-mono text-xs">0{{ currentSlide + 1 }} / 0{{ slides.length }}</span>
          <div class="w-px h-16 bg-current"></div>
        </div>
      </div>

      <!-- Hero Badge -->
      <div class="hero-badge absolute left-3 sm:left-4 top-6 sm:top-8 z-20 inline-flex items-center gap-1.5 sm:gap-2 md:gap-3 rounded-full border border-white/85 bg-white/98 px-2 py-1 sm:px-2.5 sm:py-1.5 md:px-3 md:py-2 shadow-[0_20px_50px_rgba(171,190,176,0.16)] backdrop-blur-md scale-75 sm:scale-90 md:scale-100 origin-top-left">
        <img
          src="/logo.png"
          alt="GreenSight logo"
          class="h-9 sm:h-12 w-9 sm:w-12 rounded-xl sm:rounded-2xl bg-white p-0.5 sm:p-1 object-contain shadow-sm"
        />
        <div>
          <p class="text-[9px] sm:text-[11px] font-mono uppercase tracking-[0.3em] sm:tracking-[0.35em] text-emerald-700/60">{{ langText.home.platform }}</p>
          <p class="text-xs sm:text-sm font-semibold text-[#163126]">{{ langText.nav.brand }}</p>
        </div>
      </div>

      <!-- 轮播内容区：品牌标语 + 轮播卡片 -->
      <div class="relative z-10 flex h-full flex-col justify-center pt-20 sm:pt-20 lg:pt-0 hero-orbit" :style="heroParallaxStyle">
        <div class="hero-layout-grid grid grid-cols-1 items-center gap-5 sm:gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-end md:gap-8 lg:items-stretch lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:pl-1">
          <div class="hero-brand-block flex flex-col min-h-[280px] sm:min-h-[320px] md:min-h-[420px] md:justify-between lg:h-full lg:min-h-[420px] lg:pr-6">
            <div class="hero-brand-glow" aria-hidden="true"></div>
            <div class="mt-4 sm:mt-2 overflow-hidden flex-1 flex flex-col md:justify-end">
              <div class="flex flex-col justify-center flex-1">
                <p class="hero-line hero-line--eyebrow text-[9px] sm:text-[10px] md:text-xs font-mono uppercase tracking-[0.4em] sm:tracking-[0.45em] text-emerald-600/65">{{ langText.home.brandIntro }}</p>
                <div class="mt-2 sm:mt-3 sm:mt-6 space-y-1 sm:space-y-1.5 sm:space-y-3">
                  <p class="hero-line hero-line--body font-mono text-[12px] sm:text-[13px] md:text-base md:text-lg leading-snug md:leading-tight text-emerald-600 min-h-[2.5rem] sm:min-h-[3rem]">
                    {{ typedBrandLines[0] }}<span v-if="activeTypingLine === 0" class="typing-caret ml-1 inline-block h-3 sm:h-4 sm:h-6 w-[2px] bg-emerald-500 align-[-0.15em]"></span>
                  </p>
                  <p class="hero-line hero-line--body hero-line--body-soft font-mono text-[12px] sm:text-[13px] md:text-base md:text-lg leading-snug md:leading-tight text-emerald-600/85 min-h-[2.5rem] sm:min-h-[3rem]">
                    {{ typedBrandLines[1] }}<span v-if="activeTypingLine === 1" class="typing-caret ml-1 inline-block h-3 sm:h-4 sm:h-6 w-[2px] bg-emerald-500 align-[-0.15em]"></span>
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-auto pt-5 sm:pt-8 hero-chip-wrap lg:pb-[6.75rem]">
              <div class="flex flex-wrap gap-1.5 sm:gap-3 hero-chip-row">
                <span class="glass-tag glass-tag--emerald group inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/80 bg-gradient-to-br from-white/96 via-white/88 to-emerald-100/66 px-2.5 md:px-4 py-1 md:py-2 text-[10px] md:text-sm font-semibold leading-none text-emerald-950 shadow-[0_16px_38px_rgba(15,118,110,0.16),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-10px_24px_rgba(255,255,255,0.26)] backdrop-blur-xl backdrop-saturate-150 ring-1 ring-emerald-200/55 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/90 hover:shadow-[0_24px_52px_rgba(16,185,129,0.18),inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-12px_28px_rgba(255,255,255,0.3)] hover:ring-emerald-200/70">
                  <span class="glass-tag__pulse"></span>
                  <span class="glass-tag__sheen"></span>
                  <span class="glass-tag__icon relative flex h-3.5 w-3.5 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-emerald-200/38 ring-1 ring-emerald-200/50 shadow-[0_0_22px_rgba(52,211,153,0.24),inset_0_1px_0_rgba(255,255,255,0.62)]">
                    <span class="absolute h-2 w-2 sm:h-3.5 sm:w-3.5 rounded-full bg-emerald-200/95 blur-[5px] transition-transform duration-300 group-hover:scale-125 group-hover:blur-[6px]"></span>
                    <svg class="relative z-10 h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <circle cx="12" cy="12" r="7.5" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8.2v7.6" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.8 12h6.4" />
                    </svg>
                  </span>
                  <span class="relative z-10">{{ langText.home.tags[0] }}</span>
                </span>
                <span class="glass-tag glass-tag--cyan group inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/80 bg-gradient-to-br from-white/96 via-white/88 to-cyan-100/68 px-2.5 md:px-4 py-1 md:py-2 text-[10px] md:text-sm font-semibold leading-none text-cyan-950 shadow-[0_16px_38px_rgba(8,145,178,0.16),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-10px_24px_rgba(255,255,255,0.26)] backdrop-blur-xl backdrop-saturate-150 ring-1 ring-cyan-200/55 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/90 hover:shadow-[0_24px_52px_rgba(34,211,238,0.18),inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-12px_28px_rgba(255,255,255,0.3)] hover:ring-cyan-200/70">
                  <span class="glass-tag__pulse"></span>
                  <span class="glass-tag__sheen"></span>
                  <span class="glass-tag__icon relative flex h-3.5 w-3.5 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-cyan-200/38 ring-1 ring-cyan-200/50 shadow-[0_0_22px_rgba(34,211,238,0.24),inset_0_1px_0_rgba(255,255,255,0.62)]">
                    <span class="absolute h-2 w-2 sm:h-3.5 sm:w-3.5 rounded-full bg-cyan-200/95 blur-[5px] transition-transform duration-300 group-hover:scale-125 group-hover:blur-[6px]"></span>
                    <svg class="relative z-10 h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-cyan-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <circle cx="12" cy="12" r="7.5" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.5 14.6 10.7 11l2 2 2.8-4.1" />
                    </svg>
                  </span>
                  <span class="relative z-10">{{ langText.home.tags[1] }}</span>
                </span>
                <span class="glass-tag glass-tag--orange group inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/80 bg-gradient-to-br from-white/96 via-white/88 to-orange-100/68 px-2.5 md:px-4 py-1 md:py-2 text-[10px] md:text-sm font-semibold leading-none text-orange-950 shadow-[0_16px_38px_rgba(234,88,12,0.16),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-10px_24px_rgba(255,255,255,0.26)] backdrop-blur-xl backdrop-saturate-150 ring-1 ring-orange-200/55 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/90 hover:shadow-[0_24px_52px_rgba(251,146,60,0.18),inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-12px_28px_rgba(255,255,255,0.3)] hover:ring-orange-200/70">
                  <span class="glass-tag__pulse"></span>
                  <span class="glass-tag__sheen"></span>
                  <span class="glass-tag__icon relative flex h-3.5 w-3.5 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-orange-200/38 ring-1 ring-orange-200/50 shadow-[0_0_22px_rgba(251,146,60,0.24),inset_0_1px_0_rgba(255,255,255,0.62)]">
                    <span class="absolute h-2 w-2 sm:h-3.5 sm:w-3.5 rounded-full bg-orange-200/95 blur-[5px] transition-transform duration-300 group-hover:scale-125 group-hover:blur-[6px]"></span>
                    <svg class="relative z-10 h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-orange-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <circle cx="12" cy="12" r="7.5" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8.6v6.8" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.6 12h6.8" />
                      <circle cx="12" cy="12" r="2.3" />
                    </svg>
                  </span>
                  <span class="relative z-10">{{ langText.home.tags[2] }}</span>
                </span>
              </div>
            </div>
          </div>

          <div class="relative hero-slide-panel">
            <div class="hero-slide-glow-trail" :style="heroGlowTrailStyle" aria-hidden="true"></div>
            <transition name="hero-fade" mode="out-in">
              <div
                :key="currentSlide"
                class="hero-slide-card flex flex-col justify-center pl-0 sm:pl-10 min-h-[280px] sm:min-h-[320px] lg:min-h-[420px] lg:pl-14"
              >
                <p class="hero-copy hero-copy--meta text-[9px] sm:text-[10px] md:text-xs font-mono uppercase tracking-[0.35em] sm:tracking-[0.4em] text-emerald-600/50">
                  0{{ currentSlide + 1 }} / 0{{ slides.length }}
                </p>
                <p class="hero-copy hero-copy--subtitle mt-2 sm:mt-6 text-[9px] sm:text-[10px] sm:text-sm font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-emerald-600/60">
                  {{ slides[currentSlide].subtitle }}
                </p>
                <h2
                  class="hero-copy hero-copy--title mt-2 sm:mt-5 max-w-xl font-bold leading-tight tracking-tight text-[#214336]"
                  :class="currentSlide === 0 ? 'text-lg sm:text-xl md:text-3xl lg:text-4xl' : currentSlide === 1 ? 'text-xl sm:text-2xl md:text-4xl lg:text-5xl' : 'text-xl sm:text-2xl md:text-5xl lg:text-6xl'"
                >
                  {{ slides[currentSlide].title }}
                </h2>
                <p class="hero-copy hero-copy--description mt-3 sm:mt-6 max-w-xl text-[12px] sm:text-[13px] md:text-base leading-relaxed text-[#5f7f70] md:text-lg line-clamp-3 md:line-clamp-none">
                  {{ slides[currentSlide].description }}
                </p>

                <div class="hero-copy hero-copy--cta mt-5 sm:mt-10 flex flex-wrap items-center gap-4">
                  <a
                    v-if="slides[currentSlide].link.startsWith('#')"
                    :href="slides[currentSlide].link"
                    @click.prevent="scrollToSection(slides[currentSlide].link)"
                    class="inline-flex items-center gap-2 border-b border-emerald-500/70 pb-1 text-sm font-semibold text-emerald-700 transition-colors hover:border-emerald-500 hover:text-emerald-600"
                  >
                    {{ slides[currentSlide].cta }}
                    <span>→</span>
                  </a>
                  <router-link
                    v-else
                    :to="slides[currentSlide].link"
                    class="inline-flex items-center gap-2 border-b border-emerald-500/70 pb-1 text-sm font-semibold text-emerald-700 transition-colors hover:border-emerald-500 hover:text-emerald-600"
                  >
                    {{ slides[currentSlide].cta }}
                    <span>→</span>
                  </router-link>
                </div>

                <div class="hero-controls mt-5 sm:mt-12 flex flex-row items-center justify-between gap-4 pt-4 md:pt-6">
                  <div class="flex gap-1.5 md:gap-2">
                    <button
                      v-for="(slide, index) in slides"
                      :key="index"
                      @click="setSlide(index)"
                      class="h-1 sm:h-2 rounded-full transition-all duration-300"
                      :class="currentSlide === index ? 'w-6 sm:w-10 bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.28)]' : 'w-1 sm:w-2 bg-emerald-200/75 hover:bg-emerald-300'"
                    ></button>
                  </div>
                  <div class="flex items-center gap-1.5 md:gap-3">
                    <button
                      @click="prevSlide"
                      class="flex h-8 w-8 md:h-11 md:w-11 items-center justify-center rounded-full border border-white/85 bg-white/92 text-emerald-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_14px_30px_rgba(148,163,154,0.16)]"
                    >
                      <svg class="h-3.5 w-3.5 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      @click="toggleAutoPlay"
                      class="flex h-8 min-w-[64px] md:h-11 md:min-w-[88px] items-center justify-center gap-1 md:gap-2 rounded-full border border-white/85 bg-white/92 px-2.5 md:px-4 text-[11px] md:text-sm font-semibold text-emerald-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_30px_rgba(148,163,154,0.16)]"
                    >
                      <svg v-if="!isAutoPlaying" class="h-3 w-3 md:h-4 md:w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <svg v-else class="h-4 w-4 stroke-current" fill="none" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                      {{ isAutoPlaying ? '暂停' : '播放' }}
                    </button>
                    <button
                      @click="nextSlide"
                      class="flex h-8 w-8 md:h-11 md:w-11 items-center justify-center rounded-full border border-white/85 bg-white/92 text-emerald-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_14px_30px_rgba(148,163,154,0.16)]"
                    >
                      <svg class="h-3.5 w-3.5 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- 向下滚动提示指示器 -->
        <div class="hidden md:flex absolute bottom-8 left-1/2 z-0 -translate-x-1/2 scroll-indicator opacity-100 transition-opacity duration-1000">
          <div class="scroll-indicator-stack flex flex-col items-center gap-1.5">
            <div class="scroll-mouse-shell flex items-center justify-center rounded-full">
              <svg
                class="h-10 w-10 text-emerald-900 animate-breathe"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="7" y="2.5" width="10" height="19" rx="5" />
                <path d="M12 6.5v4" />
              </svg>
            </div>
            <p class="scroll-indicator-text text-[11px] font-medium tracking-[0.35em] text-emerald-900/75 uppercase">
              SCROLL/向下滑动
            </p>
            <svg
              class="scroll-arrow h-5 w-5 text-emerald-800"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- 核心功能入口区域 -->
    <section class="relay-section py-24 px-6 border-t border-black/10 relative" id="features">
      <div class="grid grid-cols-12 gap-4">
        <!-- Sticky Sidebar -->
        <div class="col-span-12 md:col-span-3 mb-12 md:mb-0">
          <div class="sticky top-24">
            <h2 class="text-4xl md:text-5xl font-bold mt-2 mb-6 animate-on-scroll">{{ langText.home.featuresTitle }}</h2>
            <p class="text-sm opacity-60 max-w-[200px] animate-on-scroll whitespace-pre-line">
              {{ langText.home.featuresIntro }}
            </p>
          </div>
        </div>

        <!-- Grid Content -->
        <div class="col-span-12 md:col-span-9">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div
              v-for="(feature, index) in features"
              :key="index"
              class="feature-card group relative bg-white aspect-[4/5] md:aspect-square p-8 flex flex-col justify-between border border-black/5 tech-border rounded-3xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden animate-on-scroll"
              :class="{ 'md:mt-24': index % 2 !== 0 }"
            >
              <!-- 背景装饰 -->
              <div
                class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-700"
                :class="feature.gradient"
              ></div>
              <div
                class="feature-card__ghost-icon absolute -right-8 -bottom-8 w-48 h-48 opacity-[0.02] group-hover:opacity-10 transition-all duration-700 transform group-hover:scale-110 group-hover:-rotate-12 pointer-events-none"
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
                  class="feature-card__status w-2 h-2 rounded-full bg-black/10 group-hover:bg-green-500 transition-colors duration-300"
                ></div>
              </div>

              <!-- 核心内容区 -->
              <div class="relative z-10 mt-auto mb-8">
                <div
                  class="feature-card__icon mb-6 w-12 h-12 rounded-xl bg-gray-50 border border-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300 shadow-sm"
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
                  class="feature-card__desc text-sm leading-relaxed text-gray-600 opacity-80 group-hover:opacity-100 transition-opacity border-l-2 border-transparent group-hover:border-primary pl-0 group-hover:pl-3 transition-all duration-300"
                >
                  {{ feature.description }}
                </p>
              </div>

              <!-- 底部操作栏 -->
              <div
                class="feature-card__footer relative z-10 pt-4 border-t border-black/5 group-hover:border-black/10 transition-colors flex justify-between items-center"
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
                  >{{ langText.home.accessGranted }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 动态资讯区域 -->
    <section class="relay-section py-24 px-6 border-t border-black/10 relative" id="news">
      <div class="grid grid-cols-12 gap-4">
        <!-- Sticky Sidebar -->
        <div class="col-span-12 md:col-span-3 mb-12 md:mb-0">
          <div class="sticky top-24">
            <h2 class="text-4xl md:text-5xl font-bold mt-2 mb-6">{{ langText.home.newsTitle }}</h2>
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

    <!-- 数据仪表盘区域 -->
    <section class="relay-section dashboard-section py-24 px-6 border-t border-black/10 relative overflow-hidden" id="dashboard">
      <div class="dashboard-noise"></div>
      <div class="dashboard-grid"></div>
      <div class="dashboard-ambient dashboard-ambient--left"></div>
      <div class="dashboard-ambient dashboard-ambient--right"></div>

      <div class="grid grid-cols-12 gap-4 relative z-10">
        <div class="col-span-12 md:col-span-3 mb-12 md:mb-0">
          <div class="sticky top-24 dashboard-copy">
            <h2 class="text-4xl md:text-5xl font-bold mt-3 mb-6 text-white">{{ langText.home.dashboard.title }}</h2>
            <p class="dashboard-copy__text">
              {{ langText.home.dashboard.intro }}
            </p>
            <div class="dashboard-breathing-chip mt-8 inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm">
              <span class="dashboard-breathing-dot"></span>
              {{ langText.home.dashboard.live }}
            </div>
            <div class="dashboard-copy__meta mt-10">
            </div>
          </div>
        </div>
        <div class="col-span-12 md:col-span-9">
          <div class="grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)]">
            <div class="dashboard-panel dashboard-panel--primary rounded-[2rem] p-6 md:p-8">
              <div class="dashboard-panel__frame"></div>
              <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between relative z-10">
                <div>
                  <p class="dashboard-eyebrow">{{ langText.home.dashboard.impact }}</p>
                  <h3 class="mt-3 text-2xl font-bold text-white">{{ langText.home.dashboard.trendTitle }}</h3>
                </div>
                <p class="dashboard-muted">{{ langText.home.dashboard.sixMonths }}</p>
              </div>

              <div class="mt-8 grid gap-4 sm:grid-cols-3 relative z-10">
                <article
                  v-for="(metric, index) in dashboardMetrics"
                  :key="metric.label"
                  class="dashboard-stat rounded-[1.5rem] p-5"
                >
                  <div class="dashboard-stat__glow"></div>
                  <p class="dashboard-stat__label">{{ metric.label }}</p>
                  <div class="mt-4 flex items-end gap-2">
                    <span class="dashboard-stat__value">{{ displayedDashboardMetrics[index] }}</span>
                    <span class="dashboard-stat__unit">{{ metric.unit }}</span>
                  </div>
                  <p class="dashboard-stat__change mt-3">{{ metric.change }}</p>
                </article>
              </div>

              <div class="mt-10 relative z-10">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-semibold text-white">{{ langText.home.dashboard.monthlyTrend }}</p>
                  <p class="dashboard-muted dashboard-muted--mono">{{ langText.home.dashboard.running }}</p>
                </div>
                <div class="mt-6 grid grid-cols-6 gap-3 md:gap-4 items-end">
                  <div
                    v-for="item in dashboardTrend"
                    :key="item.month"
                    class="flex flex-col items-center gap-3"
                  >
                    <div class="dashboard-bar-track w-full rounded-full">
                      <div
                        class="dashboard-bar breathing-light-bar"
                        :style="{ height: `${item.height}%` }"
                      >
                        <span class="dashboard-bar__shine"></span>
                      </div>
                    </div>
                    <div class="text-center">
                      <p class="dashboard-trend__value">{{ item.value }}</p>
                      <p class="dashboard-trend__month">{{ item.month }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid gap-6">
              <div class="dashboard-panel dashboard-panel--ring rounded-[2rem] p-6 md:p-8">
                <div class="dashboard-panel__frame"></div>
                <div class="flex items-center justify-between gap-4 relative z-10">
                  <div>
                    <p class="dashboard-eyebrow">{{ langText.home.dashboard.pulse }}</p>
                    <h3 class="mt-3 text-2xl font-bold text-white">{{ langText.home.dashboard.ringTitle }}</h3>
                  </div>
                  <div class="dashboard-ring-badge">{{ animatedPulseProgress }}%</div>
                </div>

                <div class="mt-8 flex items-center justify-center relative z-10">
                  <div class="dashboard-ring breathing-ring">
                    <svg viewBox="0 0 120 120" class="h-full w-full -rotate-90">
                      <circle cx="60" cy="60" r="44" class="dashboard-ring__track" />
                      <circle
                        cx="60"
                        cy="60"
                        r="44"
                        class="dashboard-ring__progress"
                        :style="{ strokeDashoffset: animatedPulseOffset }"
                      />
                    </svg>
                    <div class="dashboard-ring__center">
                      <span class="dashboard-ring__number">{{ animatedPulseProgress }}%</span>
                      <span class="dashboard-ring__caption">{{ langText.home.dashboard.rate }}</span>
                    </div>
                  </div>
                </div>

                <div class="mt-8 grid grid-cols-2 gap-4 relative z-10">
                  <div class="dashboard-mini-card">
                    <p class="dashboard-mini-card__label">{{ langText.home.dashboard.weekReduction }}</p>
                    <p class="dashboard-mini-card__value">18.6 {{ lang === 'EN' ? 't' : lang === 'JP' ? 'トン' : '吨' }}</p>
                  </div>
                  <div class="dashboard-mini-card">
                    <p class="dashboard-mini-card__label">{{ langText.home.dashboard.adopted }}</p>
                    <p class="dashboard-mini-card__value">92%</p>
                  </div>
                </div>
              </div>

              <div class="dashboard-panel dashboard-panel--heat rounded-[2rem] p-6 md:p-8">
                <div class="dashboard-panel__frame"></div>
                <div class="flex items-center justify-between gap-3 relative z-10">
                  <div>
                    <p class="dashboard-eyebrow">{{ langText.home.dashboard.heat }}</p>
                    <h3 class="mt-3 text-2xl font-bold text-white">{{ langText.home.dashboard.heatTitle }}</h3>
                  </div>
                  <span class="dashboard-live-tag">{{ langText.home.dashboard.realtime }}</span>
                </div>

                <div class="mt-8 space-y-4 relative z-10">
                  <div v-for="zone in dashboardHeatmap" :key="zone.name" class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                      <span class="dashboard-zone__name">{{ zone.name }}</span>
                      <span class="dashboard-zone__value">{{ zone.value }}%</span>
                    </div>
                    <div class="dashboard-heatmap-track">
                      <div
                        class="dashboard-heatmap-fill"
                        :style="{ width: `${zone.value}%`, background: zone.gradient }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部滚动标语 -->
    <div class="py-12 border-t border-black/10 overflow-hidden bg-white text-white/80">
      <div class="flex whitespace-nowrap animate-marquee">
        <!-- 第一组内容 -->
        <div class="flex items-center shrink-0">
          <span
            v-for="(item, index) in langText.home.marquee"
            :key="`m1-${index}`"
            class="text-[4vw] font-bold mx-8"
            :class="{ 'text-gray-500': index % 3 !== 0 }"
          >{{ item }}</span>
        </div>
        <!-- 第二组内容 (用于无缝循环) -->
        <div class="flex items-center shrink-0">
          <span
            v-for="(item, index) in langText.home.marquee"
            :key="`m2-${index}`"
            class="text-[4vw] font-bold mx-8"
            :class="{ 'text-gray-500': index % 3 !== 0 }"
          >{{ item }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Silk from '@/components/effects/Silk.vue'
import { lang, langText } from '@/language'

gsap.registerPlugin(ScrollTrigger)

// ---- 基础引用 ----
const router = useRouter()
const homeRootRef = ref(null)       // 页面根元素引用
let heroEntranceTimeline = null      // Hero 入场动画时间线

// Hero 区域视差样式（随轮播切换微调位移）
const heroParallaxStyle = computed(() => ({
  transform: `translate3d(0, ${currentSlide.value * -8}px, 0)`,
}))

const heroGlowTrailStyle = computed(() => ({
  background: `radial-gradient(circle at ${18 + currentSlide.value * 28}% ${32 + currentSlide.value * 10}%, rgba(74, 222, 128, 0.24), transparent 34%), radial-gradient(circle at ${72 - currentSlide.value * 14}% ${68 - currentSlide.value * 12}%, rgba(34, 211, 238, 0.18), transparent 28%)`,
}))

// ---- 仪表盘数据配置 ----
const dashboardMetricMeta = [
  { value: 5280, change: '+28.3%', formatter: 'number' },
  { value: 125000, change: '+12.5%', formatter: 'compact' },
  { value: 8450, change: '+15.7%', formatter: 'number' },
]

const dashboardMetrics = computed(() =>
  dashboardMetricMeta.map((metric, index) => ({
    ...metric,
    ...langText.value.home.dashboard.metrics[index],
  })),
)

const dashboardTrendMeta = [
  { value: '2.1k', height: 42 },
  { value: '2.8k', height: 56 },
  { value: '3.6k', height: 68 },
  { value: '4.4k', height: 81 },
  { value: '5.1k', height: 92 },
  { value: '5.8k', height: 100 },
]

const dashboardTrend = computed(() =>
  dashboardTrendMeta.map((item, index) => ({
    ...item,
    month: langText.value.home.dashboard.months[index],
  })),
)

const dashboardHeatmapMeta = [
  { value: 86, gradient: 'linear-gradient(90deg, #22d3ee 0%, #06b6d4 52%, #0ea5e9 100%)' },
  { value: 74, gradient: 'linear-gradient(90deg, #38bdf8 0%, #3b82f6 54%, #6366f1 100%)' },
  { value: 63, gradient: 'linear-gradient(90deg, #2dd4bf 0%, #14b8a6 52%, #0f766e 100%)' },
  { value: 58, gradient: 'linear-gradient(90deg, #67e8f9 0%, #22d3ee 50%, #0284c7 100%)' },
]

const dashboardHeatmap = computed(() =>
  dashboardHeatmapMeta.map((item, index) => ({
    ...item,
    name: langText.value.home.dashboard.zones[index],
  })),
)

const ringCircumference = 2 * Math.PI * 44
const dashboardPulse = {
  progress: 78,
  offset: ringCircumference * (1 - 0.78),
}

const displayedDashboardMetrics = ref(dashboardMetrics.value.map((metric) => formatDashboardMetric(0, metric.formatter)))
const animatedPulseProgress = ref(0)
const animatedPulseOffset = ref(ringCircumference)
const hasAnimatedDashboard = ref(false)
let dashboardAnimationFrame = null
let dashboardObserver = null

function formatDashboardMetric(value, formatter) {
  if (formatter === 'compact') {
    if (value >= 1000) {
      return `${Math.round(value / 1000)}K`
    }
    return `${Math.round(value)}`
  }

  const locale = lang.value === 'EN' ? 'en-US' : lang.value === 'JP' ? 'ja-JP' : 'zh-CN'
  return new Intl.NumberFormat(locale).format(Math.round(value))
}

function animateDashboardValues() {
  if (hasAnimatedDashboard.value) return

  hasAnimatedDashboard.value = true
  const start = performance.now()
  const duration = 1800

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)

    displayedDashboardMetrics.value = dashboardMetrics.value.map((metric) =>
      formatDashboardMetric(metric.value * eased, metric.formatter),
    )

    animatedPulseProgress.value = Math.round(dashboardPulse.progress * eased)
    animatedPulseOffset.value = ringCircumference * (1 - animatedPulseProgress.value / 100)

    if (progress < 1) {
      dashboardAnimationFrame = requestAnimationFrame(tick)
      return
    }

    displayedDashboardMetrics.value = dashboardMetrics.value.map((metric) =>
      formatDashboardMetric(metric.value, metric.formatter),
    )
    animatedPulseProgress.value = dashboardPulse.progress
    animatedPulseOffset.value = dashboardPulse.offset
    dashboardAnimationFrame = null
  }

  dashboardAnimationFrame = requestAnimationFrame(tick)
}

// ---- 打字机效果 ----
const brandLines = computed(() => langText.value.home.typeLines)
const typedBrandLines = ref(['', ''])
const activeTypingLine = ref(0)
const showWelcomeModal = ref(false)
let typingInterval = null
let typingRestartTimeout = null

const startTypewriter = () => {
  if (typingInterval) clearInterval(typingInterval)
  if (typingRestartTimeout) clearTimeout(typingRestartTimeout)

  let lineIndex = 0
  let charIndex = 0
  let isPaused = false
  let isDeleting = false
  typedBrandLines.value = ['', '']
  activeTypingLine.value = 0

  const tick = () => {
    const currentLine = brandLines.value[lineIndex]

    if (isPaused) {
      return
    }

    if (!isDeleting) {
      // 打字阶段
      if (charIndex < currentLine.length) {
        typedBrandLines.value[lineIndex] += currentLine[charIndex]
        typedBrandLines.value = [...typedBrandLines.value]
        charIndex += 1
        return
      }

      // 打字完成，暂停一段时间后开始删除
      isPaused = true
      typingRestartTimeout = setTimeout(() => {
        isPaused = false
        isDeleting = true
      }, 1500)
      return
    } else {
      // 删除阶段
      if (charIndex > 0) {
        typedBrandLines.value[lineIndex] = currentLine.substring(0, charIndex - 1)
        typedBrandLines.value = [...typedBrandLines.value]
        charIndex -= 1
        return
      }

      // 删除完成，暂停一段时间后切换到下一行
      isPaused = true
      isDeleting = false
      typingRestartTimeout = setTimeout(() => {
        isPaused = false
        lineIndex = (lineIndex + 1) % brandLines.value.length
        charIndex = 0
        activeTypingLine.value = lineIndex
      }, 500)
      return
    }
  }

  typingInterval = setInterval(tick, 90)
}

// 检测首次访问，显示欢迎弹窗
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

// ---- 轮播逻辑 ----
const currentSlide = ref(0)       // 当前轮播索引
const isAutoPlaying = ref(true)   // 是否自动播放
let autoPlayInterval = null

const slideMeta = [
  { link: '#features' },
  { link: '/community' },
  { link: '/chat' },
]

const slides = computed(() =>
  langText.value.home.slides.map((slide, index) => ({
    ...slide,
    ...slideMeta[index],
  })),
)

const scrollToSection = (hash) => {
  const target = document.querySelector(hash)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
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

// ---- 功能卡片数据 ----
const featureMeta = [
  {
    link: '/reconstruction',
    icon: 'M12 3.5 4.5 7.75v8.5L12 20.5l7.5-4.25v-8.5L12 3.5z',
    gradient: 'from-orange-400 to-pink-400',
  },
  {
    link: '/chat',
    icon: 'M6 7.5h12a2.5 2.5 0 0 1 2.5 2.5v4A2.5 2.5 0 0 1 18 16.5h-6l-4.5 4v-4H6A2.5 2.5 0 0 1 3.5 14v-4A2.5 2.5 0 0 1 6 7.5Z M8 12h.01M12 12h.01M16 12h.01',
    gradient: 'from-emerald-400 to-cyan-400',
  },
  {
    link: '/achievements',
    icon: 'M12 4.25 13.894 8.356 18.25 8.83 15 11.914 15.9 16.25 12 14.07 8.1 16.25 9 11.914 5.75 8.83 10.106 8.356 12 4.25ZM6 3.75v3.5M4.25 5.5h3.5M18 16.75v3.5m-1.75-1.75h3.5',
    gradient: 'from-yellow-400 to-amber-400',
  },
  {
    link: '/community',
    icon: 'M8.5 11.25a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Zm7 0a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5ZM3.75 18.25a4.75 4.75 0 0 1 8.21-3.25M20.25 18.25a4.75 4.75 0 0 0-8.21-3.25M8.5 18.25a3.5 3.5 0 0 1 7 0',
    gradient: 'from-green-400 to-teal-400',
  },
  {
    link: '/volunteer',
    icon: 'M12 20s-6.5-4.35-8.5-8.15C1.6 8.96 3.1 5.75 6.5 5.75c2.05 0 3.14 1.08 4.03 2.3.63-.96 1.98-2.3 4.47-2.3 3.39 0 4.9 3.21 3 6.1C18.5 15.65 12 20 12 20Z',
    gradient: 'from-red-400 to-rose-400',
  },
  {
    link: '/weather',
    icon: 'M7 18.25h9a4.25 4.25 0 1 0-.68-8.445A5.5 5.5 0 0 0 4.75 12a3.25 3.25 0 0 0 2.25 6.25Z',
    gradient: 'from-violet-400 to-purple-400',
  },
]

const features = computed(() =>
  langText.value.home.features.map((feature, index) => ({
    ...feature,
    ...featureMeta[index],
  })),
)

// ---- 新闻数据与分页 ----
const newsDates = ['2025.03.18', '2025.03.15', '2025.03.12', '2025.03.10', '2025.03.07', '2025.03.05']
const newsItems = computed(() =>
  langText.value.home.news.map((news, index) => ({
    ...news,
    date: newsDates[index],
  })),
)

const currentPage = ref(1)
const itemsPerPage = 4

const playHomeEntrance = () => {
  if (!homeRootRef.value || heroEntranceTimeline) return

  const heroSection = homeRootRef.value.querySelector('section')
  if (!heroSection) return

  const badge = heroSection.querySelector('.hero-badge')
  const brandBlock = heroSection.querySelector('.hero-brand-block')
  const heroLines = heroSection.querySelectorAll('.hero-line')
  const chipRow = heroSection.querySelector('.hero-chip-row')
  const chipItems = heroSection.querySelectorAll('.glass-tag')
  const slidePanel = heroSection.querySelector('.hero-slide-panel')
  const slideCopies = heroSection.querySelectorAll('.hero-copy')
  const controls = heroSection.querySelector('.hero-controls')
  const scrollIndicator = heroSection.querySelector('.scroll-indicator')

  heroEntranceTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

  heroEntranceTimeline
    .set([badge, brandBlock, heroLines, chipRow, chipItems, slidePanel, slideCopies, controls, scrollIndicator], {
      willChange: 'transform, opacity, filter',
    })
    .fromTo(
      heroSection,
      { opacity: 0, scale: 1.015, filter: 'blur(14px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.05, clearProps: 'filter' },
    )
    .fromTo(
      badge,
      { y: -28, opacity: 0, scale: 0.94 },
      { y: 0, opacity: 1, scale: 1, duration: 0.72 },
      '-=0.72',
    )
    .fromTo(
      brandBlock,
      { y: 36, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.95 },
      '-=0.44',
    )
    .fromTo(
      heroLines,
      { y: 26, opacity: 0, filter: 'blur(6px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.72, stagger: 0.14 },
      '-=0.72',
    )
    .fromTo(
      chipRow,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.78 },
      '-=0.54',
    )
    .fromTo(
      chipItems,
      { y: 18, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.56, stagger: 0.08 },
      '-=0.56',
    )
    .fromTo(
      slidePanel,
      { x: 42, opacity: 0, filter: 'blur(10px)' },
      { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9 },
      '-=0.78',
    )
    .fromTo(
      slideCopies,
      { x: 18, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.52, stagger: 0.1 },
      '-=0.64',
    )
    .fromTo(
      controls,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.64 },
      '-=0.26',
    )
    .fromTo(
      scrollIndicator,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.85, clearProps: 'all' },
      '-=0.08',
    )
    .add(() => {
      heroEntranceTimeline = null
    })
}

const handleAppIntroComplete = () => {
  nextTick(() => {
    playHomeEntrance()
  })
}


const totalPages = computed(() => Math.ceil(newsItems.value.length / itemsPerPage))
const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return newsItems.value.slice(start, start + itemsPerPage)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

watch(lang, () => {
  currentPage.value = 1
  displayedDashboardMetrics.value = dashboardMetrics.value.map((metric) =>
    formatDashboardMetric(metric.value, metric.formatter),
  )
  startTypewriter()
})

// --- Lifecycle ---
onMounted(() => {
  checkFirstVisit()
  startAutoPlay()
  startTypewriter()

  window.addEventListener('app-intro-complete', handleAppIntroComplete)

  if (document.documentElement.dataset.appIntroDone === 'true') {
    handleAppIntroComplete()
  }

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

    // Relay Sections Sequential Entrance
    const relaySections = gsap.utils.toArray('.relay-section')
    relaySections.forEach((section, index) => {
      const relayTargets = section.querySelectorAll('h2, p, .group.relative, .dashboard-panel, .group.border-b')
      if (!relayTargets.length) return

      gsap.fromTo(
        relayTargets,
        {
          y: 42,
          opacity: 0,
          filter: 'blur(10px)',
        },
        {
          scrollTrigger: {
            trigger: section,
            start: index === 0 ? 'top 82%' : 'top 78%',
            toggleActions: 'play none none none',
          },
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.95,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'all',
        },
      )
    })

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

    const dashboardSection = document.querySelector('#dashboard')
    if (dashboardSection) {
      dashboardObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          animateDashboardValues()
          dashboardObserver?.disconnect()
          dashboardObserver = null
        },
        { threshold: 0.35 },
      )

      dashboardObserver.observe(dashboardSection)
    }
  })
})

onUnmounted(() => {
  stopAutoPlay()
  if (typingInterval) clearInterval(typingInterval)
  if (typingRestartTimeout) clearTimeout(typingRestartTimeout)
  if (dashboardAnimationFrame) cancelAnimationFrame(dashboardAnimationFrame)
  if (dashboardObserver) dashboardObserver.disconnect()
  if (heroEntranceTimeline) {
    heroEntranceTimeline.kill()
    heroEntranceTimeline = null
  }
  window.removeEventListener('app-intro-complete', handleAppIntroComplete)
})
</script>

<style scoped>
.home-view {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.home-view::-webkit-scrollbar {
  display: none;
}

/* 欢迎弹窗过渡动画 */
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

/* 轮播卡片淡入淡出过渡 */
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

.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
  transform: translateY(18px);
}

/* 打字机光标闪烁动画 */
.typing-caret {
  animation: blink-caret 0.9s steps(1) infinite;
}

@keyframes blink-caret {
  0%,
  45% {
    opacity: 1;
  }
  46%,
  100% {
    opacity: 0;
  }
}

.hero-orbit {
  transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.hero-section {
  overflow: hidden;
}

@media (min-width: 768px) and (max-width: 1100px) {
  .hero-section {
    overflow: hidden;
    min-height: calc(100dvh - 4rem);
    padding-top: 5.25rem;
    padding-bottom: 2.75rem;
  }

  .hero-orbit {
    height: 100%;
    justify-content: flex-end;
    padding-top: 2.5rem;
    padding-bottom: 0.75rem;
  }

  .hero-layout-grid {
    min-height: 540px;
    align-items: end;
  }

  .hero-brand-block {
    min-height: 500px;
    padding-right: 1rem;
    padding-bottom: 0.35rem;
  }

  .hero-brand-block > .mt-4 {
    justify-content: flex-end;
  }

  .hero-line--eyebrow {
    font-size: 0.62rem;
    letter-spacing: 0.52em;
  }

  .hero-line--body,
  .hero-line--body-soft {
    font-size: 1.05rem;
    line-height: 1.9;
    min-height: 2.75rem;
  }

  .hero-chip-wrap {
    margin-top: 0;
    padding-top: 1.5rem;
    padding-bottom: 1.25rem;
    transform: translateY(-1rem);
  }

  .hero-chip-row {
    gap: 0.75rem;
  }

  .hero-chip-row .glass-tag {
    padding-inline: 0.95rem;
    padding-block: 0.55rem;
    font-size: 0.86rem;
    box-shadow: 0 14px 26px rgba(15, 118, 110, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.92), inset 0 -10px 24px rgba(255, 255, 255, 0.22);
  }

  .hero-slide-panel {
    display: flex;
    align-items: flex-end;
    min-height: 500px;
    padding-left: 1rem;
  }

  .hero-slide-glow-trail {
    inset: 16% -4% 8% 10%;
    filter: blur(28px);
    opacity: 0.72;
  }

  .hero-slide-card {
    min-height: 500px;
    justify-content: flex-end;
    padding-top: 4rem;
    padding-bottom: 0.25rem;
    padding-left: 1.5rem;
  }

  .hero-copy--meta {
    font-size: 0.62rem;
    letter-spacing: 0.4em;
  }

  .hero-copy--subtitle {
    margin-top: 0.85rem;
    font-size: 0.68rem;
    letter-spacing: 0.3em;
  }

  .hero-copy--title {
    margin-top: 1rem;
    max-width: 32rem;
    font-size: 3rem !important;
    line-height: 1.08;
  }

  .hero-copy--description {
    margin-top: 1.25rem;
    max-width: 30rem;
    font-size: 1.02rem;
    line-height: 1.9;
    -webkit-line-clamp: unset;
    line-clamp: unset;
  }

  .hero-copy--cta {
    margin-top: 1.5rem;
  }

  .hero-controls {
    margin-top: 2.25rem;
    padding-top: 0;
  }
}

/* 品牌标语区域 */
.hero-brand-block {
  position: relative;
}

/* 品牌区域绿色光晕装饰 */
.hero-brand-glow {
  position: absolute;
  inset: 6% -8% auto auto;
  width: clamp(10rem, 18vw, 15rem);
  height: clamp(10rem, 18vw, 15rem);
  border-radius: 999px;
  background: radial-gradient(circle, rgba(74, 222, 128, 0.22) 0%, rgba(74, 222, 128, 0.08) 42%, rgba(74, 222, 128, 0) 72%);
  filter: blur(18px);
  opacity: 0.9;
  pointer-events: none;
  animation: brand-glow-float 6s ease-in-out infinite;
}

.hero-line {
  display: block;
  transform-origin: left center;
}

.hero-line--eyebrow {
  text-shadow: 0 0 16px rgba(16, 185, 129, 0.1);
}

.hero-line--body-soft {
  opacity: 0.82;
}

.hero-slide-panel {
  position: relative;
  isolation: isolate;
}

.hero-slide-glow-trail {
  position: absolute;
  inset: 8% -6% 10% 18%;
  border-radius: 2.5rem;
  filter: blur(24px);
  opacity: 0.9;
  pointer-events: none;
  z-index: 0;
  transition: background 0.8s ease, transform 0.8s ease;
  animation: glow-trail-drift 7s ease-in-out infinite;
}

.hero-slide-card {
  position: relative;
  z-index: 1;
}

.hero-copy {
  will-change: transform, opacity;
}

.hero-copy--title {
  text-shadow: 0 12px 28px rgba(31, 63, 49, 0.08);
}

.hero-copy--description {
  text-wrap: pretty;
}

/* 各内容区块 */
.relay-section {
  position: relative;
}

/* 内容区块左侧装饰竖线 */
.relay-section::before {
  content: '';
  position: absolute;
  left: 1.5rem;
  top: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.18), rgba(16, 185, 129, 0.02));
  opacity: 0.7;
  pointer-events: none;
}

:global(:root[data-theme='dark']) .relay-section {
  border-color: rgba(255, 255, 255, 0.1);
}

:global(:root[data-theme='dark']) .home-view {
  background: #1f1f1f !important;
  color: #f7fff8 !important;
}

:global(:root[data-theme='dark']) .hero-section {
  background: #1f1f1f !important;
  color: #f7fff8 !important;
}

:global(:root[data-theme='dark']) .hero-silk-layer {
  opacity: 0 !important;
}

:global(:root[data-theme='dark']) .hero-tint-layer {
  background: transparent !important;
  opacity: 0 !important;
}

:global(:root[data-theme='dark']) .hero-grid-layer {
  opacity: 0.16 !important;
}

:global(:root[data-theme='dark']) .hero-grid-layer .border-r,
:global(:root[data-theme='dark']) .hero-section .border-r {
  border-color: rgba(177, 255, 196, 0.16) !important;
}

:global(:root[data-theme='dark']) .hero-badge {
  background: #2b2b2b !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  box-shadow: none !important;
}

:global(:root[data-theme='dark']) .hero-badge p,
:global(:root[data-theme='dark']) .hero-section .hero-line,
:global(:root[data-theme='dark']) .hero-section .hero-copy,
:global(:root[data-theme='dark']) .hero-section .hero-copy--title,
:global(:root[data-theme='dark']) .hero-section .hero-copy--description {
  color: #f7fff8 !important;
  opacity: 1 !important;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.36);
}

:global(:root[data-theme='dark']) .hero-section .hero-copy--meta,
:global(:root[data-theme='dark']) .hero-section .hero-copy--subtitle,
:global(:root[data-theme='dark']) .hero-section .hero-line--eyebrow,
:global(:root[data-theme='dark']) .hero-section .hero-line--body,
:global(:root[data-theme='dark']) .hero-section .scroll-indicator-text {
  color: #cfcfcf !important;
  opacity: 1 !important;
}

:global(:root[data-theme='dark']) .hero-section .glass-tag {
  background: #2b2b2b !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #f8fff9 !important;
  box-shadow: none !important;
}

:global(:root[data-theme='dark']) .hero-section .hero-controls button,
:global(:root[data-theme='dark']) .hero-section .scroll-mouse-shell {
  background: #2b2b2b !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
  box-shadow: none !important;
}

:global(:root[data-theme='dark']) .hero-section a {
  color: #c8b8ff !important;
  border-color: rgba(200, 184, 255, 0.68) !important;
}

:global(:root[data-theme='dark']) .feature-card {
  border-color: rgba(255, 255, 255, 0.12) !important;
  background:
    none !important;
  background-color: #2b2b2b !important;
  color: var(--color-text);
  box-shadow: none;
}

:global(:root[data-theme='dark']) .feature-card:hover {
  border-color: rgba(255, 255, 255, 0.2) !important;
  background: #333333 !important;
  box-shadow: none;
}

:global(:root[data-theme='dark']) .feature-card__icon {
  border-color: rgba(255, 255, 255, 0.16) !important;
  background: #3a3a3a !important;
  color: #ffffff !important;
  box-shadow: none;
}

:global(:root[data-theme='dark']) .feature-card:hover .feature-card__icon {
  border-color: rgba(255, 255, 255, 0.24) !important;
  background: #4a4a4a !important;
  color: var(--color-primary) !important;
}

:global(:root[data-theme='dark']) .feature-card__ghost-icon {
  opacity: 0.08 !important;
  color: rgba(244, 247, 244, 0.42);
}

:global(:root[data-theme='dark']) .feature-card:hover .feature-card__ghost-icon {
  opacity: 0.16 !important;
  color: rgba(110, 231, 123, 0.5);
}

:global(:root[data-theme='dark']) .feature-card__status {
  background: rgba(110, 231, 123, 0.34) !important;
  box-shadow: 0 0 18px rgba(110, 231, 123, 0.24);
}

:global(:root[data-theme='dark']) .feature-card__desc,
:global(:root[data-theme='dark']) .feature-card p {
  color: var(--color-text-muted) !important;
}

:global(:root[data-theme='dark']) .feature-card h3,
:global(:root[data-theme='dark']) .feature-card a {
  color: var(--color-text) !important;
}

:global(:root[data-theme='dark']) .feature-card a:hover {
  color: var(--color-primary) !important;
}

:global(:root[data-theme='dark']) .feature-card__footer {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:global(:root[data-theme='dark']) .feature-card .font-mono {
  color: var(--color-text-muted);
}

@keyframes brand-glow-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(10px, -14px, 0) scale(1.06);
  }
}

@keyframes glow-trail-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate3d(12px, -8px, 0) scale(1.04);
    opacity: 1;
  }
}

.hero-title {
  /* Ensure big text doesn't break layout on small screens */
  word-break: break-word;
}

/* 底部滚动标语动画 */
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

@media (min-width: 768px) and (max-width: 1100px) {
  .hero-section .scroll-indicator {
    bottom: 1.25rem;
  }
}

/* Scroll Indicator Mouse */
.scroll-indicator-stack {
  animation: indicator-drift 2.2s ease-in-out infinite;
}

.scroll-mouse-shell {
  position: relative;
  width: 4.5rem;
  height: 4.5rem;
}

.scroll-mouse-shell::before {
  content: '';
  position: absolute;
  inset: 0.5rem;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0.08) 45%, rgba(16, 185, 129, 0) 75%);
  filter: blur(6px);
  animation: mouse-glow 2.2s ease-in-out infinite;
}

.scroll-arrow {
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.22));
  animation: arrow-drop 1.6s ease-in-out infinite;
}

.scroll-indicator-text {
  text-shadow: 0 0 12px rgba(16, 185, 129, 0.12);
  animation: text-breathe 2s ease-in-out infinite;
}

/* Scroll Indicator Breathe */
.animate-breathe {
  filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.32));
  animation: breathe-icon 2.2s ease-in-out infinite;
}

@keyframes indicator-drift {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}

@keyframes mouse-glow {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(0.92);
  }
  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}

@keyframes arrow-drop {
  0%,
  100% {
    opacity: 0.45;
    transform: translateY(0) scale(0.92);
  }
  50% {
    opacity: 1;
    transform: translateY(6px) scale(1);
  }
}

@keyframes text-breathe {
  0%,
  100% {
    opacity: 0.55;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(2px);
  }
}

@keyframes breathe-icon {
  0%, 100% {
    opacity: 0.72;
    transform: translateY(0) scale(0.96);
  }
  50% {
    opacity: 1;
    transform: translateY(-4px) scale(1.04);
  }
}

/* 仪表盘区域环境光装饰 */
.dashboard-ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(70px);
  pointer-events: none;
  opacity: 0.5;
}

.dashboard-ambient--left {
  top: 5rem;
  left: -4rem;
  width: 14rem;
  height: 14rem;
  background: radial-gradient(circle, rgba(134, 239, 172, 0.42) 0%, rgba(134, 239, 172, 0) 72%);
}

.dashboard-ambient--right {
  right: -3rem;
  bottom: 2rem;
  width: 16rem;
  height: 16rem;
  background: radial-gradient(circle, rgba(167, 243, 208, 0.4) 0%, rgba(167, 243, 208, 0) 75%);
}

/* 仪表盘面板基础样式 */
.dashboard-panel {
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(242, 251, 245, 0.92));
}

.dashboard-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.55), transparent 42%);
  pointer-events: none;
}

.dashboard-panel--soft {
  background: linear-gradient(145deg, rgba(247, 253, 249, 0.98), rgba(227, 245, 234, 0.94));
}

.dashboard-breathing-chip {
  position: relative;
}

.dashboard-breathing-chip::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(74, 222, 128, 0.2) 0%, rgba(74, 222, 128, 0) 70%);
  z-index: -1;
  animation: dashboard-chip-breathe 2.6s ease-in-out infinite;
}

.dashboard-breathing-dot {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 999px;
  background: #4ade80;
  box-shadow: 0 0 0 rgba(74, 222, 128, 0.45);
  animation: dashboard-dot-pulse 2s ease-in-out infinite;
}

.dashboard-stat {
  position: relative;
  overflow: hidden;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.dashboard-stat:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(102, 187, 106, 0.14);
}

.dashboard-stat__glow {
  position: absolute;
  inset: auto -20% -55% auto;
  width: 8rem;
  height: 8rem;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(110, 231, 183, 0.26) 0%, rgba(110, 231, 183, 0) 70%);
}

.dashboard-bar-track {
  position: relative;
  height: 15rem;
  padding: 0.35rem;
  display: flex;
  align-items: flex-end;
  background: linear-gradient(180deg, rgba(236, 253, 245, 0.9), rgba(220, 252, 231, 0.9));
}

.dashboard-bar {
  position: relative;
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(180deg, #bbf7d0 0%, #4ade80 45%, #16a34a 100%);
  box-shadow: 0 18px 40px rgba(74, 222, 128, 0.24);
  min-height: 2.5rem;
  transition: transform 0.35s ease;
}

.dashboard-bar:hover {
  transform: translateY(-4px);
}

.breathing-light-bar {
  animation: dashboard-bar-breathe 2.8s ease-in-out infinite;
  transform-origin: bottom;
}

.dashboard-bar__shine {
  position: absolute;
  top: 0.75rem;
  left: 50%;
  width: 55%;
  height: 26%;
  transform: translateX(-50%);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0));
}

.dashboard-ring-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(22, 101, 52, 0.08);
  font-weight: 700;
  color: #166534;
  box-shadow: 0 12px 24px rgba(134, 239, 172, 0.2);
}

.dashboard-ring {
  position: relative;
  width: 16rem;
  height: 16rem;
}

.dashboard-ring__track,
.dashboard-ring__progress {
  fill: none;
  stroke-width: 10;
}

.dashboard-ring__track {
  stroke: rgba(34, 197, 94, 0.12);
}

.dashboard-ring__progress {
  stroke: #22c55e;
  stroke-linecap: round;
  stroke-dasharray: 276.46;
}

.breathing-ring {
  filter: drop-shadow(0 0 24px rgba(74, 222, 128, 0.24));
  animation: dashboard-ring-breathe 2.8s ease-in-out infinite;
}

.dashboard-ring__center {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dashboard-heatmap-track {
  height: 0.85rem;
  width: 100%;
  overflow: hidden;
  border-radius: 999px;
  background: linear-gradient(90deg, #f0fdf4 0%, #dcfce7 100%);
}

.dashboard-heatmap-fill {
  height: 100%;
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(74, 222, 128, 0.18);
  animation: dashboard-heat-breathe 3s ease-in-out infinite;
}

@keyframes dashboard-dot-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.35);
  }
  50% {
    transform: scale(1.18);
    box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
  }
}

@keyframes dashboard-chip-breathe {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(0.96);
  }
  50% {
    opacity: 1;
    transform: scale(1.04);
  }
}

.dashboard-section :deep(h2),
.dashboard-section :deep(h3),
.dashboard-section :deep(p),
.dashboard-section :deep(span) {
  color: #000;
}

.dashboard-section .dashboard-ring__track,
.dashboard-section .dashboard-ring__progress {
  color: initial;
}

@keyframes dashboard-bar-breathe {
  0%,
  100% {
    filter: brightness(1);
    box-shadow: 0 16px 34px rgba(74, 222, 128, 0.18);
  }
  50% {
    filter: brightness(1.06);
    box-shadow: 0 22px 46px rgba(74, 222, 128, 0.28);
  }
}

@keyframes dashboard-ring-breathe {
  0%,
  100% {
    transform: scale(0.98);
    opacity: 0.92;
  }
  50% {
    transform: scale(1.03);
    opacity: 1;
  }
}

@keyframes dashboard-heat-breathe {
  0%,
  100% {
    filter: saturate(1);
    opacity: 0.9;
  }
  50% {
    filter: saturate(1.08);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .dashboard-bar-track {
    height: 11rem;
  }

  .dashboard-ring {
    width: 13rem;
    height: 13rem;
  }
}

.hero-chip-row {
  align-items: flex-start;
}

.hero-chip-wrap {
  position: relative;
  z-index: 2;
  padding-bottom: 0.75rem;
}

.hero-chip-row .glass-tag {
  flex: 0 0 auto;
  min-width: max-content;
  white-space: nowrap;
}

@media (min-width: 768px) and (max-width: 1100px) {
  .hero-chip-row {
    gap: 0.75rem;
  }

  .hero-chip-row .glass-tag {
    padding-inline: 0.9rem;
    font-size: 0.78rem;
  }
}

@media (max-width: 480px) {
  .hero-chip-row .glass-tag {
    min-width: 0;
    white-space: normal;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dashboard-breathing-chip::after,
  .dashboard-breathing-dot,
  .breathing-light-bar,
  .breathing-ring,
  .dashboard-heatmap-fill,
  .glass-tag,
  .glass-tag__pulse,
  .glass-tag__sheen {
    animation: none;
  }
}

.glass-tag {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  animation: glass-tag-breathe 4.8s ease-in-out infinite;
}

.glass-tag__icon {
  flex-shrink: 0;
}

.glass-tag__pulse {
  position: absolute;
  inset: -18%;
  z-index: 0;
  border-radius: 999px;
  opacity: 0.42;
  pointer-events: none;
  filter: blur(18px);
  animation: glass-tag-pulse 4.8s ease-in-out infinite;
}

.glass-tag--emerald .glass-tag__pulse {
  background: radial-gradient(circle at 50% 50%, rgba(167, 243, 208, 0.62) 0%, rgba(110, 231, 183, 0.24) 45%, rgba(16, 185, 129, 0) 82%);
}

.glass-tag--cyan .glass-tag__pulse {
  background: radial-gradient(circle at 50% 50%, rgba(165, 243, 252, 0.62) 0%, rgba(103, 232, 249, 0.24) 45%, rgba(6, 182, 212, 0) 82%);
}

.glass-tag--orange .glass-tag__pulse {
  background: radial-gradient(circle at 50% 50%, rgba(254, 215, 170, 0.62) 0%, rgba(253, 186, 116, 0.24) 45%, rgba(249, 115, 22, 0) 82%);
}

.glass-tag__sheen {
  position: absolute;
  inset: -38% auto auto -42%;
  z-index: 0;
  width: 48%;
  height: 195%;
  transform: rotate(24deg);
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.04) 12%, rgba(255, 255, 255, 0.2) 26%, rgba(255, 255, 255, 0.82) 50%, rgba(255, 255, 255, 0.24) 68%, rgba(255, 255, 255, 0.06) 82%, transparent 100%);
  opacity: 0.92;
  pointer-events: none;
  mix-blend-mode: screen;
  animation: glass-tag-sheen 4.9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.glass-tag:hover .glass-tag__sheen {
  animation-duration: 1.85s;
}

.glass-tag--emerald .glass-tag__sheen {
  filter: drop-shadow(0 0 18px rgba(110, 231, 183, 0.26));
}

.glass-tag--cyan .glass-tag__sheen {
  filter: drop-shadow(0 0 18px rgba(103, 232, 249, 0.26));
}

.glass-tag--orange .glass-tag__sheen {
  filter: drop-shadow(0 0 18px rgba(253, 186, 116, 0.26));
}

@keyframes glass-tag-breathe {
  0%,
  100% {
    transform: translateY(0);
    filter: brightness(1) saturate(1);
  }
  50% {
    transform: translateY(-1px);
    filter: brightness(1.035) saturate(1.04);
  }
}

@keyframes glass-tag-pulse {
  0%,
  100% {
    opacity: 0.28;
    transform: scale(0.98);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.04);
  }
}

@keyframes glass-tag-sheen {
  0% {
    transform: translateX(-172%) rotate(24deg);
    opacity: 0;
  }
  10% {
    opacity: 0.16;
  }
  24% {
    opacity: 0.88;
  }
  42% {
    transform: translateX(300%) rotate(24deg);
    opacity: 0;
  }
  100% {
    transform: translateX(300%) rotate(24deg);
    opacity: 0;
  }
}
</style>

<template>
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans pt-22 px-5 pb-10 xl:px-6">
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
      <div v-for="n in 4" :key="`m-${n}`" class="border-r border-black h-full block md:hidden col-span-3"></div>
    </div>

    <div class="relative z-10 mx-auto max-w-[1480px] grid grid-cols-12 gap-5 xl:gap-6">
      <div class="col-span-12 md:col-span-4 xl:col-span-3">
        <div class="sticky top-24 space-y-5">
          <router-link
            to="/chat"
            class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-primary transition-opacity mb-8"
          >
            <span>&larr; 返回 AI 助手</span>
          </router-link>

          <h1 class="text-4xl md:text-5xl font-bold mt-2 mb-6">碳足迹<br />速算器</h1>
          <p class="text-sm opacity-60 max-w-[240px] mb-8 leading-6">
            用常见生活行为快速估算今日碳排放，并结合可视图与绿色出行建议，帮你更直观地看到减排方向。
          </p>

          <div class="hidden md:block text-xs font-mono opacity-40 space-y-2">
            <p>维度：交通 / 用电 / 饮食</p>
            <p>模型：本地估算</p>
            <p>单位：kg CO₂e / 日</p>
          </div>
        </div>
      </div>

      <div class="col-span-12 md:col-span-8 xl:col-span-9">
        <div class="carbon-core-layout">
          <section class="carbon-card carbon-card--form carbon-card--primary p-4 md:p-5 xl:p-5.5">
            <div class="carbon-card__header mb-4">
              <div>
                <p class="carbon-card__eyebrow">Footprint Input</p>
                <h2 class="carbon-card__title">填写今天的生活数据</h2>
              </div>
              <button
                @click="resetForm"
                class="carbon-card__action px-4 py-2 border border-black/15 text-xs font-mono uppercase hover:bg-black hover:text-white transition-colors rounded-full"
              >
                重置
              </button>
            </div>

            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 auto-rows-fr">
                <div class="summary-chip rounded-[20px] px-3.5 py-3 h-full min-h-[88px] flex flex-col justify-between">
                  <p class="text-[11px] font-mono uppercase tracking-[0.18em] text-black/35 mb-2">Commute</p>
                  <div class="text-xl font-bold">{{ commuteKm }} km</div>
                  <p class="text-sm text-black/50 mt-1">{{ commuteModeLabel }}</p>
                </div>
                <div class="summary-chip rounded-[20px] px-3.5 py-3 h-full min-h-[88px] flex flex-col justify-between">
                  <p class="text-[11px] font-mono uppercase tracking-[0.18em] text-black/35 mb-2">Electricity</p>
                  <div class="text-xl font-bold">{{ electricityKwh }} kWh</div>
                  <p class="text-sm text-black/50 mt-1">家庭日常用电输入</p>
                </div>
                <div class="summary-chip rounded-[20px] px-3.5 py-3 h-full min-h-[88px] flex flex-col justify-between">
                  <p class="text-[11px] font-mono uppercase tracking-[0.18em] text-black/35 mb-2">Diet</p>
                  <div class="text-xl font-bold">{{ meatMeals }} 餐</div>
                  <p class="text-sm text-black/50 mt-1">高碳饮食次数</p>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-3 flex-wrap gap-3">
                  <label class="font-bold">快速场景</label>
                  <span class="text-xs font-mono opacity-45">一键套用日常模板</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    v-for="preset in carbonPresets"
                    :key="preset.key"
                    @click="applyPreset(preset)"
                    class="transport-option px-3 py-2 text-left rounded-2xl transition-all"
                    :class="activePresetKey === preset.key ? 'transport-option--active' : 'transport-option--idle'"
                  >
                    <p class="text-xs font-mono uppercase tracking-[0.12em] mb-1 text-black/45">{{ preset.label }}</p>
                    <p class="text-sm text-black/65">{{ preset.desc }}</p>
                  </button>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="font-bold">通勤距离</label>
                  <span class="text-xs font-mono opacity-50">{{ commuteKm }} km</span>
                </div>
                <input v-model="commuteKm" type="range" min="0" max="80" class="w-full accent-green-700" />
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    v-for="option in commuteModes"
                    :key="option.value"
                    @click="commuteMode = option.value"
                    class="transport-option px-3 py-2 text-sm rounded-2xl transition-all"
                    :class="commuteMode === option.value ? 'transport-option--active' : 'transport-option--idle'"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="font-bold">家庭用电</label>
                  <span class="text-xs font-mono opacity-50">{{ electricityKwh }} kWh</span>
                </div>
                <input v-model="electricityKwh" type="range" min="0" max="30" step="0.5" class="w-full accent-green-700" />
              </div>

              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="font-bold">肉类餐食</label>
                  <span class="text-xs font-mono opacity-50">{{ meatMeals }} 餐</span>
                </div>
                <input v-model="meatMeals" type="range" min="0" max="6" class="w-full accent-green-700" />
              </div>
            </div>
          </section>

          <div class="carbon-bottom-grid">
            <section class="carbon-card carbon-card--secondary p-4.5 md:p-5">
              <div class="carbon-card__header mb-4">
                <div>
                  <p class="carbon-card__eyebrow">Visual Insight</p>
                  <h3 class="carbon-card__title">排放可视图</h3>
                </div>
                <div class="carbon-card__meta-stack">
                  <div class="carbon-card__meta">今日结构占比</div>
                  <div v-if="latestSavedAt" class="carbon-card__meta carbon-card__meta--success">已同步 {{ String(latestSavedAt).slice(0, 16).replace('T', ' ') }}</div>
                </div>
              </div>

              <div class="grid grid-cols-1 xl:grid-cols-[190px_1fr] gap-4 items-stretch">
                <div class="flex justify-center">
                  <div
                    class="relative w-[164px] h-[164px] rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]"
                    :style="{ background: donutGradient }"
                  >
                    <div class="absolute inset-[18px] rounded-full bg-white flex flex-col items-center justify-center text-center shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                      <div class="text-[11px] font-mono uppercase tracking-[0.18em] text-black/35 mb-2">TODAY</div>
                      <div class="text-4xl font-bold leading-none">{{ totalFootprint.toFixed(2) }}</div>
                      <div class="mt-2 text-sm text-black/45">kg CO₂e</div>
                    </div>
                  </div>
                </div>

                <div class="space-y-2 h-full flex flex-col justify-between">
                  <div v-for="item in animatedBreakdownItems" :key="item.key" class="rounded-2xl border border-black/8 bg-[#fbfcfb] p-4">
                    <div class="flex items-center justify-between gap-4 mb-3">
                      <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }"></span>
                        <span class="font-medium">{{ item.label }}</span>
                      </div>
                      <span class="text-sm font-mono text-black/55">{{ item.value.toFixed(2) }} kg · {{ item.percent }}%</span>
                    </div>

                    <div class="relative h-3 rounded-full bg-black/5 overflow-hidden">
                      <div
                        class="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                        :style="{ width: `${item.percent}%`, background: item.gradient, boxShadow: item.glow }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-3 auto-rows-fr">
                <div
                  v-for="item in animatedBreakdownItems"
                  :key="`${item.key}-metric`"
                  class="insight-metric-card group relative rounded-[24px] border border-black/8 p-4 overflow-hidden"
                >
                  <div class="insight-metric-card__pulse" :style="{ '--pulse-glow': item.glow, '--pulse-color': item.color }"></div>
                  <div class="relative z-10 flex h-full min-h-[126px] flex-col justify-between">
                    <div>
                      <div class="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p class="text-xs font-mono uppercase tracking-[0.16em] text-black/35 mb-2">{{ item.shortLabel }}</p>
                          <p class="text-sm font-medium text-black/70">{{ item.label }}</p>
                        </div>
                        <span class="insight-metric-card__dot" :style="{ '--dot-color': item.color, '--dot-glow': item.glow }"></span>
                      </div>
                      <div class="text-3xl font-bold mb-1">{{ item.percent }}%</div>
                      <p class="text-sm text-black/50">{{ item.value.toFixed(2) }} kg CO₂e</p>
                    </div>

                    <div class="insight-metric-card__detail mt-5 rounded-2xl border border-white/70 px-4 py-3">
                      <p class="text-[11px] font-mono uppercase tracking-[0.18em] text-black/35 mb-2">Hover Insight</p>
                      <p class="text-sm leading-6 text-[#294634]">{{ item.detail }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 rounded-2xl bg-[#f5fbf6] border border-emerald-100 p-4">
                <div class="flex items-center justify-between gap-4 mb-3 flex-wrap">
                  <h4 class="font-bold text-[#183222]">减排优先级</h4>
                  <span class="text-xs font-mono uppercase tracking-[0.16em] text-emerald-700/70">Top Action</span>
                </div>
                <p class="text-sm leading-7 text-[#294634]">
                  建议优先关注 <span class="font-bold">{{ dominantSource.label }}</span>，它当前占今日总排放
                  <span class="font-bold">{{ dominantSource.percent }}%</span>。{{ dominantSourceAdvice }}
                </p>
              </div>
            </section>

            <section class="carbon-card carbon-card--secondary p-4.5 md:p-5">
              <div class="carbon-card__header mb-4">
                <div>
                  <p class="carbon-card__eyebrow">Green Commute</p>
                  <h3 class="carbon-card__title">绿色出行建议</h3>
                </div>
                <button
                  @click="generateAiTravelAdvice"
                  :disabled="isGeneratingAdvice || adviceCooldown > 0"
                  class="carbon-card__action inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-[linear-gradient(135deg,#103d22,#1f7a3a)] px-4 py-2 text-xs font-mono uppercase tracking-[0.16em] text-white shadow-[0_12px_28px_rgba(22,163,74,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(22,163,74,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span class="w-4 h-4 block" :class="{ 'animate-spin': isGeneratingAdvice }" v-html="renderIcon('leaf')"></span>
                  <span class="inline-flex items-center gap-1.5">
                    <span>{{ isGeneratingAdvice ? '生成中' : adviceCooldown > 0 ? `${adviceCooldown}s 后可重试` : 'AI 出行建议' }}</span>
                    <span v-if="isGeneratingAdvice" class="ai-dot-wave" aria-hidden="true">
                      <span></span><span></span><span></span>
                    </span>
                  </span>
                </button>
              </div>

              <div class="space-y-2.5 md:grid md:grid-cols-2 md:gap-2.5 md:space-y-0 items-stretch">
                <div
                  v-for="tip in ecoTravelSuggestions"
                  :key="tip.title"
                  class="tip-card rounded-[22px] p-3.5 transition-colors min-h-[88px] flex items-center"
                >
                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <span class="w-5 h-5 block" v-html="renderIcon(tip.icon)"></span>
                    </div>
                    <div>
                      <h4 class="font-bold mb-1 text-[15px]">{{ tip.title }}</h4>
                      <p class="text-sm leading-6 text-black/60 line-clamp-2">{{ tip.description }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-3 rounded-[24px] border border-emerald-200 bg-[linear-gradient(135deg,rgba(244,255,247,0.98),rgba(232,248,236,0.96))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <div class="flex items-center justify-between gap-4 flex-wrap mb-3">
                  <div>
                    <p class="text-xs font-mono uppercase tracking-[0.16em] text-emerald-800/60 mb-2">AI Travel Brief</p>
                    <h4 class="font-bold text-[#183222]">AI 生成出行建议</h4>
                  </div>
                  <div class="flex items-center gap-2 flex-wrap justify-end">
                    <button
                      v-if="aiTravelAdvice"
                      @click="copyAiTravelAdvice"
                      class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      <span class="w-3.5 h-3.5 block" v-html="renderIcon('pin')"></span>
                      <span>{{ copiedAdvice ? '已复制' : '复制建议' }}</span>
                    </button>
                    <span class="rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.16em] text-emerald-700/80">
                      {{ commuteModeLabel }} · {{ commuteKm }} km
                    </span>
                  </div>
                </div>

                <div
                  class="min-h-[96px] rounded-2xl border border-white/70 bg-white/80 px-4 py-3.5 text-sm leading-7 text-[#294634] whitespace-pre-line overflow-hidden"
                  :class="{ 'ai-loading-panel': isGeneratingAdvice }"
                >
                  <template v-if="isGeneratingAdvice && !aiTravelAdvice">
                    <div class="flex items-start gap-3">
                      <div class="ai-radar shrink-0 mt-1">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-700/70 mb-2">AI Analyzing Route</div>
                        <div class="ai-typing-text">正在根据你的通勤方式、距离与交通排放生成个性化低碳出行建议</div>
                        <div class="mt-4 space-y-2.5" aria-hidden="true">
                          <div class="ai-skeleton-line w-[92%]"></div>
                          <div class="ai-skeleton-line w-[78%]"></div>
                          <div class="ai-skeleton-line w-[85%]"></div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="aiTravelAdvice">
                    <div :class="{ 'ai-streaming-text': isGeneratingAdvice }">{{ displayedAiTravelAdvice }}</div>
                  </template>
                  <template v-else>
                    点击右上角按钮，生成基于当前通勤方式、距离和交通排放的 AI 个性化出行建议。
                  </template>
                </div>
              </div>

              <ul class="mt-4 space-y-2">
                <li v-for="tip in suggestions" :key="tip" class="flex gap-3 text-sm text-black/75 leading-relaxed">
                  <span class="text-green-600">●</span>
                  <span>{{ tip }}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { consumeChatCompletionsStream, getResponseErrorMessage } from '@/utils/api'
import { createCarbonRecord, fetchLatestCarbonRecord } from '@/services/carbonService'

const commuteKm = ref(12)
const electricityKwh = ref(6)
const meatMeals = ref(1)
const commuteMode = ref('bus')
const latestSavedAt = ref('')
const userStore = useUserStore()
const aiTravelAdvice = ref('')
const aiTravelAdviceBuffer = ref('')
const isGeneratingAdvice = ref(false)
const adviceCooldown = ref(0)
const copiedAdvice = ref(false)
const activePresetKey = ref('default')
const typewriterTimer = ref(null)
const cooldownTimer = ref(null)
const copyResetTimer = ref(null)

const commuteModes = [
  { label: '步行/骑行', value: 'bike', factor: 0 },
  { label: '公交/地铁', value: 'bus', factor: 0.08 },
  { label: '私家车', value: 'car', factor: 0.19 },
]

const carbonPresets = [
  {
    key: 'default',
    label: '城市通勤日',
    desc: '中等通勤 + 日常用电 + 轻度肉食',
    values: { commuteKm: 12, electricityKwh: 6, meatMeals: 1, commuteMode: 'bus' },
  },
  {
    key: 'home',
    label: '居家办公日',
    desc: '少出行 + 稳定用电 + 低碳饮食',
    values: { commuteKm: 2, electricityKwh: 8, meatMeals: 1, commuteMode: 'bike' },
  },
  {
    key: 'heavy',
    label: '高负荷出行日',
    desc: '远距离通勤 + 高能耗 + 肉食偏多',
    values: { commuteKm: 28, electricityKwh: 11, meatMeals: 2, commuteMode: 'car' },
  },
]

const iconMap = {
  bus: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 3.75C5.75736 3.75 4.75 4.75736 4.75 6V14.5C4.75 15.8807 5.86929 17 7.25 17H7.5V18.25C7.5 18.9404 8.05964 19.5 8.75 19.5C9.44036 19.5 10 18.9404 10 18.25V17H14V18.25C14 18.9404 14.5596 19.5 15.25 19.5C15.9404 19.5 16.5 18.9404 16.5 18.25V17H16.75C18.1307 17 19.25 15.8807 19.25 14.5V6C19.25 4.75736 18.2426 3.75 17 3.75H7Z" stroke="currentColor" stroke-width="1.5"/><path d="M7.5 8H16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8.25 13.25H8.26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15.75 13.25H15.76" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4.25C8.82436 4.25 6.25 6.82436 6.25 10C6.25 12.0767 7.35049 13.8958 9 14.8963V16.25C9 16.9404 9.55964 17.5 10.25 17.5H13.75C14.4404 17.5 15 16.9404 15 16.25V14.8963C16.6495 13.8958 17.75 12.0767 17.75 10C17.75 6.82436 15.1756 4.25 12 4.25Z" stroke="currentColor" stroke-width="1.5"/><path d="M10 20H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10.25 17.5H13.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.75 5.25C11.8475 5.25 6.25 10.8475 6.25 17.75V18.75H7.25C14.1525 18.75 19.75 13.1525 19.75 6.25V5.25H18.75Z" stroke="currentColor" stroke-width="1.5"/><path d="M8.5 16.5C10.5 13.5 13.5 10.5 17.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  walk: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 6.5C13.1046 6.5 14 5.60457 14 4.5C14 3.39543 13.1046 2.5 12 2.5C10.8954 2.5 10 3.39543 10 4.5C10 5.60457 10.8954 6.5 12 6.5Z" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 21L11.5 15.5L9 13L10.5 9.5L13 11.5L15.5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 21L12.25 16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.75L18.25 6V11.392C18.25 15.3442 15.5874 18.8031 12 19.75C8.41258 18.8031 5.75 15.3442 5.75 11.392V6L12 3.75Z" stroke="currentColor" stroke-width="1.5"/><path d="M9.5 12L11.25 13.75L14.75 10.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  group: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 11.25C10.5188 11.25 11.75 10.0188 11.75 8.5C11.75 6.98122 10.5188 5.75 9 5.75C7.48122 5.75 6.25 6.98122 6.25 8.5C6.25 10.0188 7.48122 11.25 9 11.25Z" stroke="currentColor" stroke-width="1.5"/><path d="M15.5 10.75C16.7426 10.75 17.75 9.74264 17.75 8.5C17.75 7.25736 16.7426 6.25 15.5 6.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M4.75 18.25C4.75 15.9028 6.65279 14 9 14C11.3472 14 13.25 15.9028 13.25 18.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M14.75 17C15.1008 15.5085 16.4387 14.4 18 14.4C18.4314 14.4 18.8459 14.4846 19.2252 14.6382" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  metro: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 4.25H17C18.2426 4.25 19.25 5.25736 19.25 6.5V13.5C19.25 14.7426 18.2426 15.75 17 15.75H7C5.75736 15.75 4.75 14.7426 4.75 13.5V6.5C4.75 5.25736 5.75736 4.25 7 4.25Z" stroke="currentColor" stroke-width="1.5"/><path d="M8 8H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8.5 12.25H8.51" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15.5 12.25H15.51" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 15.75L7.5 18.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M15 15.75L16.5 18.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20C12 20 17 15.5 17 11.25C17 8.35051 14.6495 6 11.75 6C8.85051 6 6.5 8.35051 6.5 11.25C6.5 15.5 12 20 12 20Z" stroke="currentColor" stroke-width="1.5"/><path d="M11.75 12.5C12.4404 12.5 13 11.9404 13 11.25C13 10.5596 12.4404 10 11.75 10C11.0596 10 10.5 10.5596 10.5 11.25C10.5 11.9404 11.0596 12.5 11.75 12.5Z" stroke="currentColor" stroke-width="1.5"/></svg>',
}

const renderIcon = (name) => iconMap[name] ?? iconMap.leaf

const commuteModeLabel = computed(() => commuteModes.find((item) => item.value === commuteMode.value)?.label ?? '未选择')
const commuteFactor = computed(() => commuteModes.find((item) => item.value === commuteMode.value)?.factor ?? 0)
const commuteEmission = computed(() => Number(commuteKm.value) * commuteFactor.value)
const electricityEmission = computed(() => Number(electricityKwh.value) * 0.58)
const dietEmission = computed(() => Number(meatMeals.value) * 1.6)
const totalFootprint = computed(() => commuteEmission.value + electricityEmission.value + dietEmission.value)

const persistCarbonRecord = async () => {
  const result = await createCarbonRecord({
    commuteKm: Number(commuteKm.value),
    commuteMode: commuteMode.value,
    electricityKwh: Number(electricityKwh.value),
    meatMeals: Number(meatMeals.value),
  })
  if (result.ok && result.data?.createdAt) latestSavedAt.value = result.data.createdAt
}

const updateActivePreset = () => {
  const matched = carbonPresets.find((preset) => {
    const values = preset.values
    return (
      Number(values.commuteKm) === Number(commuteKm.value) &&
      Number(values.electricityKwh) === Number(electricityKwh.value) &&
      Number(values.meatMeals) === Number(meatMeals.value) &&
      values.commuteMode === commuteMode.value
    )
  })
  activePresetKey.value = matched?.key || 'custom'
}

const applyPreset = (preset) => {
  if (!preset?.values) return
  commuteKm.value = Number(preset.values.commuteKm)
  electricityKwh.value = Number(preset.values.electricityKwh)
  meatMeals.value = Number(preset.values.meatMeals)
  commuteMode.value = preset.values.commuteMode
  activePresetKey.value = preset.key
}

const hydrateLatestRecord = async () => {
  await userStore.init()
  if (!userStore.isLoggedIn) return

  const result = await fetchLatestCarbonRecord()
  if (!result.ok || !result.data) return

  const record = result.data
  commuteKm.value = Number(record.commuteKm || 0)
  electricityKwh.value = Number(record.electricityKwh || 0)
  meatMeals.value = Number(record.meatMeals || 0)
  commuteMode.value = record.commuteMode || 'bus'
  latestSavedAt.value = record.createdAt || ''
}

const percentOfTotal = (value) => {
  if (totalFootprint.value <= 0) return 0
  return Math.round((value / totalFootprint.value) * 100)
}

const breakdownItems = computed(() => [
  {
    key: 'commute',
    label: '交通排放',
    shortLabel: 'Traffic',
    detail: '由通勤距离与出行方式共同决定，切换到公交、地铁、步行或骑行通常能最快看到下降。',
    value: commuteEmission.value,
    percent: percentOfTotal(commuteEmission.value),
    color: '#16a34a',
    gradient: 'linear-gradient(90deg, #16a34a, #22c55e)',
    glow: '0 0 18px rgba(34, 197, 94, 0.28)',
  },
  {
    key: 'electricity',
    label: '用电排放',
    shortLabel: 'Power',
    detail: '主要来自空调、照明和待机设备，压缩高峰时段与无效耗电能明显优化整体占比。',
    value: electricityEmission.value,
    percent: percentOfTotal(electricityEmission.value),
    color: '#0ea5e9',
    gradient: 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
    glow: '0 0 18px rgba(56, 189, 248, 0.24)',
  },
  {
    key: 'diet',
    label: '饮食排放',
    shortLabel: 'Diet',
    detail: '高碳肉类频次越多，占比越高；适当增加豆类、蔬菜与谷物组合会更轻盈。',
    value: dietEmission.value,
    percent: percentOfTotal(dietEmission.value),
    color: '#f59e0b',
    gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
    glow: '0 0 18px rgba(251, 191, 36, 0.24)',
  },
])

const animatedBreakdownItems = computed(() =>
  breakdownItems.value.map((item) => ({
    ...item,
    percent: item.percent === 0 && item.value > 0 ? 1 : item.percent,
  })),
)

const donutGradient = computed(() => {
  const [commute, electricity, diet] = breakdownItems.value
  const first = commute.percent
  const second = first + electricity.percent

  return `conic-gradient(${commute.color} 0% ${first}%, ${electricity.color} ${first}% ${second}%, ${diet.color} ${second}% 100%)`
})

const dominantSource = computed(() => [...breakdownItems.value].sort((a, b) => b.value - a.value)[0])

const dominantSourceAdvice = computed(() => {
  if (dominantSource.value.key === 'commute') return '如果把部分通勤从私家车切换到公交、骑行或步行，减排会最明显。'
  if (dominantSource.value.key === 'electricity') return '从空调温度、待机设备和照明时长入手，通常能最快降低这一部分排放。'
  return '适当减少高碳肉类频次，增加豆类和蔬菜比例，会让饮食排放更快下降。'
})

const ecoTravelSuggestions = computed(() => {
  if (commuteMode.value === 'bike') {
    return [
      {
        icon: 'walk',
        title: '继续保持低碳通勤',
        description: '你当前已经选择步行或骑行，这本身就是最直接有效的减排方式。',
      },
      {
        icon: 'shield',
        title: '关注通勤安全',
        description: '优先选择人行道、自行车道和照明更好的路线，让绿色出行更稳定。',
      },
    ]
  }

  if (commuteMode.value === 'car') {
    return [
      {
        icon: 'bus',
        title: '优先替换短途驾车',
        description: '5 公里内的通勤最适合先切换到公交、骑行或步行，减排效率最高。',
      },
      {
        icon: 'group',
        title: '尝试拼车或组合出行',
        description: '即使不能完全放弃开车，也可以通过拼车和换乘降低单次排放。',
      },
    ]
  }

  return [
    {
      icon: 'metro',
      title: '保持公共交通优先',
      description: '公交和地铁在通勤场景下通常已经是成本与减排表现较平衡的方案。',
    },
    {
      icon: 'pin',
      title: '缩短接驳距离',
      description: '最后一公里可尝试步行或共享单车，让整段通勤进一步降碳。',
    },
  ]
})

const suggestions = computed(() => {
  const list = []

  if (commuteMode.value === 'car' && Number(commuteKm.value) > 5) {
    list.push('将部分私家车通勤改为公交、地铁或拼车，通常是最快见效的减排方式。')
  }
  if (Number(electricityKwh.value) > 10) {
    list.push('优先检查空调温度、待机设备和照明时长，家庭用电偏高时这三项最有效。')
  }
  if (Number(meatMeals.value) >= 2) {
    list.push('尝试把一餐肉类替换为豆制品或蔬菜主食组合，可明显降低饮食碳排。')
  }
  if (list.length === 0) {
    list.push('继续保持当前节奏，并把这种低碳习惯延续到一周以上，效果会更稳定。')
    list.push('如果想进一步降低排放，可优先从绿色出行和峰谷用电管理入手。')
  }

  return list.slice(0, 3)
})

const displayedAiTravelAdvice = computed(() => aiTravelAdvice.value)

const clearTypewriterTimer = () => {
  if (typewriterTimer.value) {
    clearTimeout(typewriterTimer.value)
    typewriterTimer.value = null
  }
}

const clearCooldownTimer = () => {
  if (cooldownTimer.value) {
    clearInterval(cooldownTimer.value)
    cooldownTimer.value = null
  }
}

const clearCopyResetTimer = () => {
  if (copyResetTimer.value) {
    clearTimeout(copyResetTimer.value)
    copyResetTimer.value = null
  }
}

const syncTypewriterToBuffer = () => {
  clearTypewriterTimer()

  const revealNext = () => {
    if (aiTravelAdvice.value.length >= aiTravelAdviceBuffer.value.length) {
      typewriterTimer.value = null
      return
    }

    const nextIndex = aiTravelAdvice.value.length + 1
    aiTravelAdvice.value = aiTravelAdviceBuffer.value.slice(0, nextIndex)

    const nextChar = aiTravelAdviceBuffer.value[nextIndex] ?? ''
    const delay = /[，。！？；：\n]/.test(nextChar) ? 72 : 18
    typewriterTimer.value = setTimeout(revealNext, delay)
  }

  revealNext()
}

const startAdviceCooldown = (seconds = 8) => {
  clearCooldownTimer()
  adviceCooldown.value = seconds

  cooldownTimer.value = setInterval(() => {
    if (adviceCooldown.value <= 1) {
      adviceCooldown.value = 0
      clearCooldownTimer()
      return
    }
    adviceCooldown.value -= 1
  }, 1000)
}

const copyAiTravelAdvice = async () => {
  if (!aiTravelAdvice.value.trim()) return

  try {
    await navigator.clipboard.writeText(aiTravelAdvice.value)
    copiedAdvice.value = true
    ElMessage.success('建议已复制')
    clearCopyResetTimer()
    copyResetTimer.value = setTimeout(() => {
      copiedAdvice.value = false
      copyResetTimer.value = null
    }, 1800)
  } catch (error) {
    console.error('Copy AI travel advice failed:', error)
    ElMessage.error('复制失败')
  }
}

const buildTravelAdvicePrompt = () => {
  return [
    '你是绿色出行顾问，请基于用户当前碳足迹数据，生成中文出行建议。',
    '要求：',
    '1. 只聚焦绿色出行，不要展开到用电和饮食。',
    '2. 给出 3 条建议，每条建议要具体、可执行。',
    '3. 额外补充 1 句“预计减排亮点”。',
    '4. 总长度控制在 120-180 字，语气友好专业。',
    `当前通勤方式：${commuteModeLabel.value}`,
    `当前通勤距离：${commuteKm.value} km`,
    `交通排放：${commuteEmission.value.toFixed(2)} kg CO₂e`,
    `今日总碳足迹：${totalFootprint.value.toFixed(2)} kg CO₂e`,
  ].join('\n')
}

const generateAiTravelAdvice = async () => {
  if (isGeneratingAdvice.value || adviceCooldown.value > 0) return

  startAdviceCooldown()
  clearTypewriterTimer()
  copiedAdvice.value = false
  aiTravelAdvice.value = ''
  aiTravelAdviceBuffer.value = ''
  isGeneratingAdvice.value = true

  try {
    await userStore.init()

    const response = await fetch('/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token || ''}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: '你是 GreenSight 的绿色出行 AI 助手，擅长根据用户的通勤方式、距离和排放结果，输出简洁、实用、可执行的低碳出行建议。',
          },
          {
            role: 'user',
            content: buildTravelAdvicePrompt(),
          },
        ],
        stream: true,
      }),
    })

    if (!response.ok) {
      const message = await getResponseErrorMessage(response, `生成失败 (${response.status})`)
      throw new Error(message)
    }

    if (!response.body) {
      throw new Error('未收到 AI 返回内容')
    }

    await consumeChatCompletionsStream(response.body, {
      onDeltaContent: (content) => {
        aiTravelAdviceBuffer.value += content
        syncTypewriterToBuffer()
      },
    })

    syncTypewriterToBuffer()

    if (!aiTravelAdviceBuffer.value.trim()) {
      throw new Error('AI 暂未生成建议，请稍后重试')
    }
  } catch (error) {
    console.error('Generate AI travel advice failed:', error)
    aiTravelAdviceBuffer.value = [
      `1. 你当前主要通勤方式是${commuteModeLabel.value}，建议优先把固定路线稳定下来，减少绕路和空驶。`,
      Number(commuteKm.value) > 8
        ? '2. 通勤距离较长，可优先选择地铁/公交 + 步行接驳，兼顾时间效率与减排效果。'
        : '2. 通勤距离较短，可优先尝试步行、骑行或共享单车，替代短途高碳出行。',
      commuteMode.value === 'car'
        ? '3. 若暂时必须开车，建议至少安排拼车或错峰出行，先降低单次通勤排放。'
        : '3. 保持当前较低碳的出行方式，同时为最后一公里增加步行比例，会更环保。',
      `预计减排亮点：如果持续优化通勤方式，你最有机会先从交通排放的 ${commuteEmission.value.toFixed(2)} kg CO₂e 中看到下降。`,
    ].join('\n')
    aiTravelAdvice.value = ''
    syncTypewriterToBuffer()
    ElMessage.warning(error?.message || 'AI 建议生成失败，已提供本地建议')
  } finally {
    isGeneratingAdvice.value = false
  }
}

const resetForm = () => {
  commuteKm.value = 12
  electricityKwh.value = 6
  meatMeals.value = 1
  commuteMode.value = 'bus'
  activePresetKey.value = 'default'
  latestSavedAt.value = ''
  aiTravelAdvice.value = ''
  aiTravelAdviceBuffer.value = ''
  copiedAdvice.value = false
  clearTypewriterTimer()
}

watch([commuteKm, electricityKwh, meatMeals, commuteMode], () => {
  updateActivePreset()
  if (!userStore.isLoggedIn) return
  persistCarbonRecord().catch(() => {})
})

onMounted(async () => {
  await hydrateLatestRecord()
  updateActivePreset()
})

onUnmounted(() => {
  clearTypewriterTimer()
  clearCooldownTimer()
  clearCopyResetTimer()
})
</script>

<style scoped>
.carbon-core-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.carbon-bottom-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  width: min(100%, 1120px);
}

.carbon-card {
  position: relative;
  border: 1px solid rgba(21, 48, 33, 0.1);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.93), rgba(248, 252, 249, 0.9));
  backdrop-filter: blur(14px);
  box-shadow: 0 10px 24px rgba(20, 40, 28, 0.07);
  overflow: hidden;
}

.carbon-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid rgba(255, 255, 255, 0.52);
  pointer-events: none;
}

.carbon-card--form {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(245, 251, 247, 0.9)),
    rgba(255, 255, 255, 0.9);
}

.carbon-card--primary {
  min-height: 100%;
}

.carbon-card--secondary {
  min-height: 0;
}

.carbon-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  min-height: 64px;
}

.carbon-card__eyebrow {
  margin-bottom: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: rgba(26, 26, 26, 0.35);
}

.carbon-card__title {
  font-size: 1.25rem;
  line-height: 1.2;
  font-weight: 700;
  color: #121912;
}

.carbon-card__meta-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.carbon-card__meta {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 11px;
  color: rgba(26, 26, 26, 0.42);
  white-space: nowrap;
}

.carbon-card__meta--success {
  color: rgba(4, 120, 87, 0.72);
}

.carbon-card__action {
  min-height: 36px;
}

.summary-chip {
  border: 1px solid rgba(21, 48, 33, 0.09);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(243, 249, 245, 0.94));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

.tip-card {
  min-height: 104px;
}

.transport-option {
  border: 1px solid rgba(21, 48, 33, 0.11);
  border-radius: 20px;
  min-height: 54px;
}

.transport-option--idle {
  color: #587262;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(241, 247, 243, 0.97));
}

.transport-option--idle:hover {
  border-color: rgba(74, 222, 128, 0.35);
  background: linear-gradient(180deg, rgba(250, 255, 251, 1), rgba(236, 247, 239, 1));
  transform: translateY(-1px);
}

.transport-option--active {
  color: #4f6358;
  border-color: rgba(74, 222, 128, 0.4);
  background: linear-gradient(135deg, rgba(242, 251, 245, 1), rgba(228, 246, 235, 1) 68%, rgba(214, 247, 231, 0.95) 100%);
  box-shadow: 0 8px 18px rgba(134, 239, 172, 0.2);
}

.stacked-cards {
  position: relative;
}

.tip-card,
.insight-metric-card {
  border: 1px solid rgba(21, 48, 33, 0.08);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(244, 250, 246, 0.9));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.tip-card:hover {
  background: linear-gradient(180deg, rgba(247, 252, 248, 1), rgba(238, 247, 241, 0.98));
}

.insight-metric-card {
  isolation: isolate;
  transition: transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease;
}

.insight-metric-card:hover {
  transform: translateY(-3px);
  border-color: rgba(34, 197, 94, 0.14);
  box-shadow: 0 14px 28px rgba(18, 40, 28, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.74);
}

.insight-metric-card__pulse {
  position: absolute;
  inset: -12%;
  border-radius: 24px;
  background:
    radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--pulse-color) 12%, transparent), transparent 58%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(239, 248, 241, 0.32));
  opacity: 0.72;
  animation: insight-breathe 4.2s ease-in-out infinite;
  pointer-events: none;
}

.insight-metric-card__dot {
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  flex-shrink: 0;
  background: var(--dot-color);
  box-shadow: var(--dot-glow);
  animation: signal-breathe 2.8s ease-in-out infinite;
}

.insight-metric-card__detail {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(239, 248, 241, 0.92));
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.insight-metric-card:hover .insight-metric-card__detail {
  opacity: 1;
  transform: translateY(0);
}

.ai-dot-wave {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 1279px) {
  .carbon-bottom-grid {
    grid-template-columns: 1fr;
    width: 100%;
  }

  .carbon-core-layout {
    grid-template-columns: 1fr;
  }

  .carbon-card__meta-stack {
    align-items: flex-start;
  }
}

@media (hover: none) {
  .insight-metric-card__detail {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 1280px) {
  .carbon-bottom-grid > section {
    min-height: 100%;
  }
}

.ai-dot-wave span {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: currentColor;
  opacity: 0.35;
  animation: ai-dot-bounce 1s infinite ease-in-out;
}

.ai-dot-wave span:nth-child(2) {
  animation-delay: 0.16s;
}

.ai-dot-wave span:nth-child(3) {
  animation-delay: 0.32s;
}

.ai-loading-panel {
  position: relative;
}

.ai-loading-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 0%, rgba(34, 197, 94, 0.09) 35%, transparent 70%);
  transform: translateX(-100%);
  animation: ai-panel-sheen 1.8s linear infinite;
}

.ai-radar {
  position: relative;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ai-radar span {
  position: absolute;
  border: 1px solid rgba(22, 163, 74, 0.35);
  border-radius: 9999px;
  animation: ai-ripple 1.8s infinite ease-out;
}

.ai-radar span:nth-child(1) {
  width: 8px;
  height: 8px;
  background: rgba(159, 202, 175, 0.8);
  border-color: transparent;
  animation: none;
}

.ai-radar span:nth-child(2) {
  width: 20px;
  height: 20px;
}

.ai-radar span:nth-child(3) {
  width: 20px;
  height: 20px;
  animation-delay: 0.9s;
}

.ai-typing-text,
.ai-streaming-text {
  position: relative;
}

.ai-streaming-text {
  animation: ai-text-fade-in 0.28s ease-out;
}

.ai-typing-text::after,
.ai-streaming-text::after {
  content: '▋';
  display: inline-block;
  margin-left: 3px;
  color: #718b7b;
  animation: ai-caret-blink 0.9s step-end infinite;
}

.ai-skeleton-line {
  height: 10px;
  border-radius: 9999px;
  background: linear-gradient(90deg, rgba(209, 250, 229, 0.55) 0%, rgba(134, 239, 172, 0.9) 50%, rgba(209, 250, 229, 0.55) 100%);
  background-size: 200% 100%;
  animation: ai-skeleton-shimmer 1.4s linear infinite;
}

@keyframes insight-breathe {
  0%,
  100% {
    transform: scale(0.97);
    opacity: 0.68;
    filter: saturate(0.96);
  }
  50% {
    transform: scale(1.03);
    opacity: 1;
    filter: saturate(1.08);
  }
}

@keyframes signal-breathe {
  0%,
  100% {
    transform: scale(0.92);
    opacity: 0.78;
  }
  50% {
    transform: scale(1.18);
    opacity: 1;
  }
}

@keyframes ai-dot-bounce {
  0%,
  80%,
  100% {
    opacity: 0.35;
    transform: translateY(0) scale(0.85);
  }
  40% {
    opacity: 1;
    transform: translateY(-2px) scale(1);
  }
}

@keyframes ai-panel-sheen {
  to {
    transform: translateX(100%);
  }
}

@keyframes ai-ripple {
  0% {
    transform: scale(0.45);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.25);
    opacity: 0;
  }
}

@keyframes ai-caret-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes ai-text-fade-in {
  from {
    opacity: 0.22;
    filter: blur(1px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes ai-skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

<template>
  <div class="bg-transparent min-h-screen pt-10 px-6 pb-12">
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
    </div>

    <div class="carbon-back-link-wrap relative z-10 mx-auto max-w-[1680px] mb-2">
      <router-link
        to="/chat"
        class="carbon-back-link inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-primary transition-opacity"
      >
        <span>&larr; 返回 AI 助手</span>
      </router-link>
    </div>

    <div class="carbon-page__grid relative z-10 mx-auto max-w-[1680px]">
      <section class="carbon-panel carbon-panel--input carbon-rotate-reveal carbon-rotate-reveal--panel-1">
        <div class="carbon-panel__heading-wrap">
          <h2 class="carbon-panel__heading">数据输入</h2>
        </div>

        <div class="space-y-5">
          <div class="carbon-field">
            <label class="carbon-field__label">交通方式：</label>
            <select v-model="commuteMode" class="carbon-field__control">
              <option v-for="option in commuteModes" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>

          <div class="carbon-field">
            <label class="carbon-field__label">通勤距离：</label>
            <div class="carbon-field__range-wrap">
              <input v-model="commuteKm" type="range" min="0" max="80" class="carbon-field__range" />
              <div class="carbon-field__hint">{{ commuteKm }} km</div>
            </div>
          </div>

          <div class="carbon-field">
            <label class="carbon-field__label">能源使用：</label>
            <input v-model="electricityKwh" type="number" min="0" max="30" step="0.5" class="carbon-field__control" />
          </div>

          <div class="carbon-field">
            <label class="carbon-field__label">肉类餐食：</label>
            <input v-model="meatMeals" type="number" min="0" max="6" step="1" class="carbon-field__control" />
          </div>

          <div class="carbon-field">
            <label class="carbon-field__label">快速场景：</label>
            <div class="grid grid-cols-1 gap-2">
              <button
                v-for="preset in carbonPresets"
                :key="preset.key"
                @click="applyPreset(preset)"
                class="carbon-preset"
                :class="activePresetKey === preset.key ? 'carbon-preset--active' : ''"
              >
                <span class="carbon-preset__title">{{ preset.label }}</span>
                <span class="carbon-preset__desc">{{ preset.desc }}</span>
              </button>
            </div>
          </div>

          <button @click="resetForm" class="carbon-submit">重置数据</button>
        </div>
      </section>

      <section class="carbon-panel carbon-panel--result carbon-rotate-reveal carbon-rotate-reveal--panel-2">
        <div class="carbon-panel__heading-wrap">
          <h2 class="carbon-panel__heading">计算结果展示</h2>
        </div>

        <div class="carbon-result-stack">
          <div class="carbon-chart-card carbon-rotate-reveal carbon-rotate-reveal--chart">
            <div class="carbon-legend">
              <span v-for="item in animatedBreakdownItems" :key="`${item.key}-legend`" class="carbon-legend__item">
                <span class="carbon-legend__dot" :style="{ backgroundColor: item.color }"></span>
                {{ item.label }}
              </span>
            </div>

            <div class="flex justify-center py-3">
              <div :key="donutAnimationKey" class="carbon-donut-wrap">
                <div class="carbon-donut-ring relative w-[270px] h-[270px] rounded-full" :style="{ background: donutGradient }">
                  <div class="absolute inset-[42px] rounded-full bg-white flex flex-col items-center justify-center text-center shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
                    <div class="text-sm text-black/50 mb-1">总碳足迹</div>
                    <div class="text-4xl font-bold leading-none">{{ totalFootprint.toFixed(2) }}</div>
                    <div class="mt-2 text-sm text-black/55">kg CO₂e</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="carbon-chart-card carbon-chart-card--bars carbon-rotate-reveal carbon-rotate-reveal--bars">
            <div class="carbon-bars space-y-4">
              <div v-for="item in animatedBreakdownItems" :key="`${item.key}-bar`" class="carbon-bar-row">
                <div class="carbon-bar-row__head">
                  <span>{{ item.label }}</span>
                  <span>{{ item.percent }}%</span>
                </div>
                <div class="carbon-bar-row__track">
                  <div class="carbon-bar-row__fill carbon-bar-row__fill--breathing" :style="{ width: `${item.percent}%`, background: item.gradient, '--bar-glow': item.glow }"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="carbon-summary carbon-rotate-reveal carbon-rotate-reveal--summary">
            <p class="mb-3">您的碳足迹为：<strong>{{ totalFootprint.toFixed(2) }} kg CO₂e。</strong> 以下是详细分析：</p>
            <ul class="space-y-2">
              <li v-for="item in animatedBreakdownItems" :key="`${item.key}-summary`">
                {{ item.label }}占比：{{ item.percent }}%
              </li>
            </ul>
            <p v-if="latestSavedAt" class="carbon-summary__meta">最近同步：{{ String(latestSavedAt).slice(0, 16).replace('T', ' ') }}</p>
          </div>
        </div>
      </section>

      <section class="carbon-panel carbon-panel--advice carbon-rotate-reveal carbon-rotate-reveal--panel-3">
        <div class="carbon-panel__heading-wrap">
          <h2 class="carbon-panel__heading carbon-panel__heading--green">环保建议</h2>
        </div>

        <div class="carbon-advice-block">
          <p><strong>减排重点：</strong>优先关注{{ dominantSource.label }}，当前占比 {{ dominantSource.percent }}%。{{ dominantSourceAdvice }}</p>
        </div>

        <div class="carbon-advice-block space-y-3">
          <div v-for="tip in suggestions" :key="tip" class="carbon-advice-item">
            <span>{{ tip }}</span>
          </div>
        </div>

        <div class="carbon-advice-block space-y-3">
          <div v-for="tip in ecoTravelSuggestions" :key="tip.title" class="carbon-advice-item carbon-advice-item--icon">
            <span class="carbon-advice-item__icon" v-html="renderIcon(tip.icon)"></span>
            <div>
              <p class="font-semibold text-[#23452f]">{{ tip.title }}</p>
              <p class="text-sm leading-6 text-[#476252]">{{ tip.description }}</p>
            </div>
          </div>
        </div>

        <div class="carbon-ai-box carbon-rotate-reveal carbon-rotate-reveal--ai-box">
          <div class="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <h3 class="font-semibold text-[#23452f]">AI 出行建议</h3>
            <button
              @click="generateAiTravelAdvice"
              :disabled="isGeneratingAdvice || adviceCooldown > 0"
              class="carbon-ai-box__button"
            >
              {{ isGeneratingAdvice ? '生成中' : adviceCooldown > 0 ? `${adviceCooldown}s 后可重试` : '生成建议' }}
            </button>
          </div>

          <div class="carbon-ai-box__content" :class="{ 'ai-loading-panel': isGeneratingAdvice }">
            <template v-if="isGeneratingAdvice && !aiTravelAdvice">
              正在根据你的通勤方式、距离与交通排放生成个性化低碳出行建议...
            </template>
            <template v-else-if="aiTravelAdvice">
              <div :class="{ 'ai-streaming-text': isGeneratingAdvice }">{{ displayedAiTravelAdvice }}</div>
            </template>
            <template v-else>
              点击按钮生成基于当前通勤方式和排放结果的 AI 个性化建议。
            </template>
          </div>
        </div>
      </section>
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
const donutAnimationKey = ref(0)
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

const replayDonutAnimation = () => {
  donutAnimationKey.value += 1
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
  replayDonutAnimation()
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
.carbon-page__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
}

.carbon-panel {
  min-height: calc(100vh - 10.5rem);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(245, 251, 247, 0.88));
  border: 1px solid rgba(71, 121, 84, 0.16);
  border-radius: 28px;
  box-shadow: 0 18px 38px rgba(27, 48, 30, 0.08);
  backdrop-filter: blur(10px);
  padding: 22px 24px 26px;
  overflow: hidden;
}

.carbon-panel--input,
.carbon-panel--result,
.carbon-panel--advice {
  border-right: 1px solid rgba(71, 121, 84, 0.16);
}

.carbon-panel--advice {
  background: linear-gradient(180deg, rgba(244, 252, 245, 0.92), rgba(236, 248, 238, 0.9));
  border-left: 1px solid rgba(71, 121, 84, 0.16);
}

.carbon-panel__heading-wrap {
  border-bottom: 1px solid rgba(74, 154, 88, 0.22);
  padding-bottom: 12px;
  margin-bottom: 20px;
}

.carbon-panel__heading {
  font-size: 1.05rem;
  font-weight: 700;
  color: #2f3b30;
}

.carbon-panel__heading--green {
  color: #3a8b37;
}

.carbon-field {
  display: grid;
  gap: 8px;
}

.carbon-field__label {
  font-size: 0.98rem;
  font-weight: 700;
  color: #47554a;
}

.carbon-field__control {
  width: 100%;
  min-height: 44px;
  border-radius: 8px;
  border: 1px solid #d3d8d0;
  background: #fff;
  padding: 0 14px;
  font-size: 1rem;
  color: #273229;
}

.carbon-field__range-wrap {
  border: 1px solid #d3d8d0;
  border-radius: 8px;
  background: #fff;
  padding: 12px 14px;
}

.carbon-field__range {
  width: 100%;
  accent-color: #45a049;
}

.carbon-field__hint {
  margin-top: 8px;
  font-size: 0.92rem;
  color: #607063;
}

.carbon-preset {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid #d9dfd7;
  border-radius: 8px;
  background: #fff;
  padding: 10px 12px;
  text-align: left;
  transition: all 0.2s ease;
}

.carbon-preset:hover,
.carbon-preset--active {
  border-color: #47a652;
  background: #f4fcf4;
}

.carbon-preset__title {
  font-weight: 700;
  color: #334334;
}

.carbon-preset__desc {
  font-size: 0.86rem;
  color: #657366;
}

.carbon-submit {
  width: 100%;
  min-height: 48px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(90deg, #42b549, #3f9444);
  color: #fff;
  font-size: 1.05rem;
  font-weight: 700;
}

.carbon-result-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.carbon-back-link-wrap {
  animation: rotate-reveal-left 0.72s cubic-bezier(0.22, 0.85, 0.24, 1) both;
  transform-origin: left center;
}

.carbon-back-link {
  animation: link-float-in 0.95s ease-out both;
}

.carbon-rotate-reveal {
  opacity: 0;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  will-change: transform, opacity, filter;
}

.carbon-rotate-reveal--panel-1 {
  animation: rotate-reveal-left 0.82s cubic-bezier(0.22, 0.85, 0.24, 1) 0.08s both;
  transform-origin: left center;
}

.carbon-rotate-reveal--panel-2 {
  animation: rotate-reveal-center 0.9s cubic-bezier(0.22, 0.85, 0.24, 1) 0.16s both;
  transform-origin: center center;
}

.carbon-rotate-reveal--panel-3 {
  animation: rotate-reveal-right 0.92s cubic-bezier(0.22, 0.85, 0.24, 1) 0.24s both;
  transform-origin: right center;
}

.carbon-rotate-reveal--chart {
  animation: rotate-reveal-center 0.85s cubic-bezier(0.22, 0.85, 0.24, 1) 0.3s both;
  transform-origin: center center;
}

.carbon-rotate-reveal--bars {
  animation: rotate-reveal-left 0.82s cubic-bezier(0.22, 0.85, 0.24, 1) 0.42s both;
  transform-origin: left center;
}

.carbon-rotate-reveal--summary {
  animation: rotate-reveal-right 0.82s cubic-bezier(0.22, 0.85, 0.24, 1) 0.52s both;
  transform-origin: right center;
}

.carbon-rotate-reveal--ai-box {
  animation: rotate-reveal-right 0.9s cubic-bezier(0.22, 0.85, 0.24, 1) 0.36s both;
  transform-origin: right center;
}

.carbon-chart-card {
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(243, 249, 245, 0.92));
  border: 1px solid rgba(71, 121, 84, 0.12);
  box-shadow: 0 12px 26px rgba(14, 29, 18, 0.07);
  padding: 14px 16px 18px;
}

.carbon-donut-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: donut-enter 0.78s cubic-bezier(0.16, 0.84, 0.24, 1);
  transform-origin: center;
  will-change: transform, opacity;
}

.carbon-donut-ring {
  animation: donut-spin-in 0.95s cubic-bezier(0.16, 0.84, 0.24, 1), donut-breathe 4.2s ease-in-out 1s infinite;
  box-shadow: 0 18px 36px rgba(42, 115, 57, 0.08);
  will-change: transform, opacity, filter;
}

.carbon-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  font-size: 0.86rem;
  color: #606e61;
  margin-bottom: 8px;
}

.carbon-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.carbon-legend__dot {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.carbon-bar-row__head {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #445446;
  margin-bottom: 6px;
}

.carbon-bar-row__track {
  height: 18px;
  border-radius: 999px;
  background: #eef1eb;
  overflow: hidden;
  position: relative;
}

.carbon-bar-row__fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.5s ease;
}

.carbon-bar-row__fill--breathing {
  position: relative;
  animation: bar-breathe 2.8s ease-in-out infinite;
  box-shadow: var(--bar-glow);
}

.carbon-bar-row__fill--breathing::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.34), rgba(255,255,255,0.08));
  mix-blend-mode: screen;
  animation: bar-sheen 2.2s linear infinite;
}

.carbon-summary {
  font-size: 0.98rem;
  line-height: 1.8;
  color: #374538;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(241, 248, 243, 0.92));
  border: 1px solid rgba(71, 121, 84, 0.12);
  box-shadow: 0 12px 26px rgba(14, 29, 18, 0.06);
  padding: 16px 18px;
}

.carbon-summary__meta {
  margin-top: 12px;
  font-size: 0.88rem;
  color: #6a796c;
}

.carbon-advice-block {
  margin-bottom: 18px;
  color: #304633;
  line-height: 1.9;
}

.carbon-advice-item {
  font-size: 1rem;
}

.carbon-advice-item--icon {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.carbon-advice-item__icon {
  width: 20px;
  height: 20px;
  color: #4aa556;
  flex-shrink: 0;
  margin-top: 3px;
}

.carbon-advice-item__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.carbon-ai-box {
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(239, 248, 241, 0.92));
  border: 1px solid rgba(87, 170, 92, 0.18);
  box-shadow: 0 12px 24px rgba(24, 54, 30, 0.06);
  padding: 16px;
}

.carbon-ai-box__button {
  border: none;
  border-radius: 999px;
  background: #45a049;
  color: #fff;
  padding: 8px 14px;
  font-size: 0.86rem;
  font-weight: 700;
}

.carbon-ai-box__button:disabled {
  opacity: 0.6;
}

.carbon-ai-box__content {
  min-height: 110px;
  border-radius: 10px;
  background: rgba(248, 252, 248, 0.9);
  border: 1px solid rgba(100, 155, 108, 0.16);
  padding: 12px 14px;
  font-size: 0.95rem;
  line-height: 1.8;
  color: #335036;
  white-space: pre-line;
}

.ai-loading-panel {
  position: relative;
  overflow: hidden;
}

.ai-loading-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 0%, rgba(34, 197, 94, 0.08) 35%, transparent 70%);
  transform: translateX(-100%);
  animation: ai-panel-sheen 1.8s linear infinite;
}

.ai-streaming-text {
  animation: ai-text-fade-in 0.28s ease-out;
}

@media (max-width: 1200px) {
  .carbon-page__grid {
    grid-template-columns: 1fr;
  }

  .carbon-panel {
    min-height: auto;
  }
}

@keyframes bar-breathe {
  0%,
  100% {
    filter: saturate(0.95) brightness(0.96);
    transform: scaleY(0.98);
  }
  50% {
    filter: saturate(1.08) brightness(1.05);
    transform: scaleY(1);
  }
}

@keyframes link-float-in {
  0% {
    opacity: 0;
    transform: translateY(-8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotate-reveal-left {
  0% {
    opacity: 0;
    transform: perspective(1200px) rotateY(-14deg) rotateX(8deg) translateX(-28px) scale(0.94);
    filter: blur(5px);
  }
  65% {
    opacity: 1;
    transform: perspective(1200px) rotateY(2deg) rotateX(-1deg) translateX(0) scale(1.01);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: perspective(1200px) rotateY(0) rotateX(0) translateX(0) scale(1);
    filter: blur(0);
  }
}

@keyframes rotate-reveal-center {
  0% {
    opacity: 0;
    transform: perspective(1200px) rotateX(16deg) rotateZ(-2deg) translateY(20px) scale(0.92);
    filter: blur(6px);
  }
  65% {
    opacity: 1;
    transform: perspective(1200px) rotateX(-2deg) rotateZ(0.6deg) translateY(0) scale(1.015);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: perspective(1200px) rotateX(0) rotateZ(0) translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes rotate-reveal-right {
  0% {
    opacity: 0;
    transform: perspective(1200px) rotateY(14deg) rotateX(8deg) translateX(28px) scale(0.94);
    filter: blur(5px);
  }
  65% {
    opacity: 1;
    transform: perspective(1200px) rotateY(-2deg) rotateX(-1deg) translateX(0) scale(1.01);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: perspective(1200px) rotateY(0) rotateX(0) translateX(0) scale(1);
    filter: blur(0);
  }
}

@keyframes donut-enter {
  0% {
    opacity: 0;
    transform: translateY(24px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes donut-spin-in {
  0% {
    opacity: 0;
    transform: scale(0.82);
    filter: saturate(0.9) brightness(0.96);
  }
  45% {
    opacity: 1;
    transform: scale(1.045);
    filter: saturate(1.04) brightness(1.02);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: saturate(1) brightness(1);
  }
}

@keyframes donut-breathe {
  0%,
  100% {
    transform: translateY(0) scale(1);
    filter: saturate(0.99);
    box-shadow: 0 18px 36px rgba(42, 115, 57, 0.08);
  }
  50% {
    transform: translateY(-2px) scale(1.012);
    filter: saturate(1.04);
    box-shadow: 0 22px 42px rgba(42, 115, 57, 0.12);
  }
}

@keyframes bar-sheen {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes ai-panel-sheen {
  to {
    transform: translateX(100%);
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
</style>




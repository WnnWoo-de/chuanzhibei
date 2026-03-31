<template>
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans pt-24 px-6 pb-12 flex flex-col">
    <!-- Grid Background -->
    <div
      class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6"
    >
      <div v-for="n in 12" :key="n" class="border-r border-black h-full"></div>
    </div>

    <div class="relative z-10 grid grid-cols-12 gap-6 flex-1">
      <!-- Sidebar / Header Info -->
      <div class="col-span-12 md:col-span-3 flex flex-col">
        <div class="sticky top-24">
          <router-link
            to="/chat"
            class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-primary transition-opacity mb-8"
          >
            <span>&larr; 返回 AI 助手</span>
          </router-link>

          <h1 class="text-4xl md:text-5xl font-bold mt-2 mb-6">碳足迹<br />分析</h1>
          <p class="text-sm opacity-60 max-w-[200px] mb-8">
            AI 驱动的碳排放计算与分析工具。<br />
            了解您的环境影响，获取个性化减排建议。
          </p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="col-span-12 md:col-span-9 flex flex-col h-full">
        <div
          class="bg-white/90 backdrop-blur-md border border-black/10 flex-1 flex flex-col md:flex-row relative overflow-hidden shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500"
        >
          <!-- Calculator Form -->
          <div
            class="flex-1 p-8 border-b md:border-b-0 md:border-r border-black/10 overflow-y-auto"
          >
            <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
              <el-icon><EditPen /></el-icon>
              数据输入
            </h2>

            <form @submit.prevent="calculateCarbon" class="space-y-6">
              <!-- Transport -->
              <div class="space-y-2">
                <label class="text-xs font-mono uppercase tracking-wider opacity-70"
                  >交通出行 (月度)</label
                >
                <div class="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div>
                    <label class="block text-sm mb-1">私家车里程 (km)</label>
                    <input
                      v-model.number="form.car"
                      type="number"
                      class="w-full bg-white border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-sm mb-1">公共交通里程 (km)</label>
                    <input
                      v-model.number="form.publicTransport"
                      type="number"
                      class="w-full bg-white border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <!-- Energy -->
              <div class="space-y-2">
                <label class="text-xs font-mono uppercase tracking-wider opacity-70"
                  >家庭能源 (月度)</label
                >
                <div class="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div>
                    <label class="block text-sm mb-1">用电量 (kWh)</label>
                    <input
                      v-model.number="form.electricity"
                      type="number"
                      class="w-full bg-white border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-sm mb-1">天然气用量 (m³)</label>
                    <input
                      v-model.number="form.gas"
                      type="number"
                      class="w-full bg-white border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <!-- Lifestyle -->
              <div class="space-y-2">
                <label class="text-xs font-mono uppercase tracking-wider opacity-70"
                  >生活方式</label
                >
                <div class="bg-gray-50 p-4 rounded-lg">
                  <label class="block text-sm mb-1">肉类消费频率</label>
                  <select
                    v-model="form.meat"
                    class="w-full bg-white border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-green-500 transition-colors"
                  >
                    <option value="low">低 (每周 0-2 次)</option>
                    <option value="medium">中 (每周 3-5 次)</option>
                    <option value="high">高 (几乎每天)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                class="w-full bg-black text-white py-4 font-mono uppercase tracking-widest hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>开始分析</span>
                <el-icon><ArrowRight /></el-icon>
              </button>
            </form>
          </div>

          <!-- Results & AI Analysis -->
          <div class="flex-1 p-8 bg-gray-50/50 relative flex flex-col overflow-y-auto">
            <!-- Score Header -->
            <div class="text-center mb-6">
              <div class="flex items-center justify-center gap-2 mb-4">
                <button
                  class="px-3 py-1.5 text-xs font-mono rounded-full border transition-colors"
                  :class="viewMode === 'monthly' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
                  @click="viewMode = 'monthly'"
                >
                  月度
                </button>
                <button
                  class="px-3 py-1.5 text-xs font-mono rounded-full border transition-colors"
                  :class="viewMode === 'yearly' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
                  @click="viewMode = 'yearly'"
                >
                  年度
                </button>
              </div>

              <span class="font-mono text-xs uppercase tracking-widest opacity-50">{{ periodLabel }}预估碳排放</span>
              <div class="text-6xl font-bold mt-2 mb-1 text-green-700 counter-value transition-all duration-500">
                {{ hasCalculated ? displayedTotalEmission.toFixed(1) : '--' }}
                <span class="text-lg text-black font-normal">kg CO₂e</span>
              </div>
              <div
                class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-500"
                :class="hasCalculated ? ratingClass : 'bg-gray-200 text-gray-500'"
              >
                {{ hasCalculated ? ratingText : '等待分析' }}
              </div>
            </div>

            <!-- Breakdown -->
            <div class="grid grid-cols-3 gap-2 mb-6">
              <div class="bg-white p-3 rounded border border-gray-100 text-center">
                <div class="text-xs opacity-50 mb-1">交通</div>
                <div class="font-bold">{{ hasCalculated ? displayedBreakdown.transport.toFixed(0) : '--' }}</div>
              </div>
              <div class="bg-white p-3 rounded border border-gray-100 text-center">
                <div class="text-xs opacity-50 mb-1">能源</div>
                <div class="font-bold">{{ hasCalculated ? displayedBreakdown.energy.toFixed(0) : '--' }}</div>
              </div>
              <div class="bg-white p-3 rounded border border-gray-100 text-center">
                <div class="text-xs opacity-50 mb-1">生活</div>
                <div class="font-bold">{{ hasCalculated ? displayedBreakdown.lifestyle.toFixed(0) : '--' }}</div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 mb-6">
              <button
                class="px-3 py-1.5 text-xs font-mono rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-green-500 hover:text-green-700 transition-colors"
                @click="exportSingleChart('trend')"
              >
                导出折线图 PNG
              </button>
              <button
                class="px-3 py-1.5 text-xs font-mono rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-green-500 hover:text-green-700 transition-colors"
                @click="exportSingleChart('pie')"
              >
                导出饼图 PNG
              </button>
              <button
                class="px-3 py-1.5 text-xs font-mono rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-green-500 hover:text-green-700 transition-colors"
                @click="exportSingleChart('radar')"
              >
                导出雷达图 PNG
              </button>
              <button
                class="px-3 py-1.5 text-xs font-mono rounded-lg border border-black bg-black text-white hover:bg-green-700 hover:border-green-700 transition-colors"
                @click="exportAllCharts"
              >
                一键导出全部 PNG
              </button>
            </div>

            <!-- Charts -->
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
              <div class="xl:col-span-2 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-sm font-bold text-gray-700">碳排放趋势折线图</h3>
                  <span class="text-[11px] font-mono text-gray-400">支持缩放 / tooltip</span>
                </div>
                <div ref="trendChartRef" class="h-56"></div>
              </div>

              <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <h3 class="text-sm font-bold text-gray-700 mb-3">来源占比饼图</h3>
                <div ref="pieChartRef" class="h-64"></div>
              </div>

              <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <h3 class="text-sm font-bold text-gray-700 mb-3">排放结构雷达图</h3>
                <div ref="radarChartRef" class="h-64"></div>
              </div>
            </div>

            <!-- AI Advice Section -->
            <div
              class="flex-1 bg-white/80 backdrop-blur-sm border border-green-100 rounded-2xl p-6 relative overflow-hidden shadow-lg"
            >
              <div
                class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"
              ></div>

              <div class="flex items-center gap-2 mb-4 text-green-800">
                <el-icon class="animate-pulse"><Cpu /></el-icon>
                <span class="font-bold text-sm">AI 智能减排建议</span>
              </div>

              <div v-if="!hasCalculated" class="text-sm text-gray-500 leading-relaxed">
                完成一次碳足迹分析后，这里会显示个性化减排建议。
              </div>

              <template v-else>
                <div v-if="analyzing || isStreaming" class="space-y-3">
                  <div v-if="analyzing && !isStreaming" class="space-y-3">
                    <div class="h-2 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                    <div class="h-2 bg-gray-100 rounded w-full animate-pulse"></div>
                    <div class="h-2 bg-gray-100 rounded w-5/6 animate-pulse"></div>
                  </div>
                  <div v-if="isStreaming" class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {{ streamingAdvice }}<span class="inline-block w-0.5 h-4 bg-green-500 animate-pulse ml-0.5 align-middle"></span>
                  </div>
                </div>

                <div v-else class="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                  <p v-for="(advice, index) in aiAdvice" :key="index" class="mb-2 flex gap-2">
                    <span class="text-green-500 flex-shrink-0">•</span>
                    {{ advice }}
                  </p>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// views/chat/CarbonFootprintView.vue - 碳足迹分析页面
// 用户输入交通、能源、饮食数据，本地计算碳排放量
// 并调用后端 AI 接口（SSE 流式）生成个性化减排建议
// ============================================================
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { EditPen, ArrowRight, Cpu } from '@element-plus/icons-vue'
import { consumeChatCompletionsStream, getResponseErrorMessage } from '@/utils/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// ---- 表单数据 ----
const form = ref({
  car: 0,              // 私家车月行驶里程（km）
  publicTransport: 0,  // 公共交通月里程（km）
  electricity: 0,      // 月用电量（kWh）
  gas: 0,              // 月天然气用量（m³）
  meat: 'medium',      // 肉类消费频率（low/medium/high）
})

// ---- 状态变量 ----
const hasCalculated = ref(false)     // 是否已计算过（控制结果区域显示）
const analyzing = ref(false)         // 是否正在请求 AI 建议
const totalEmission = ref(0)         // 月度总碳排放量（kg CO₂e）
const breakdown = ref({ transport: 0, energy: 0, lifestyle: 0 }) // 各类分项排放
const aiAdvice = ref([])             // AI 减排建议列表（流结束后解析填充）
const streamingAdvice = ref('')      // 流式输出中的累积文本
const isStreaming = ref(false)       // 是否正在接收流式 AI 内容
const abortController = ref(null)   // 用于中断 AI 请求

// ---- 图表 DOM 与实例 ----
const trendChartRef = ref(null)
const pieChartRef = ref(null)
const radarChartRef = ref(null)
const trendChart = ref(null)
const pieChart = ref(null)
const radarChart = ref(null)

const FACTORS = {
  car: 0.2,
  publicTransport: 0.05,
  electricity: 0.5,
  gas: 2.0,
  meat: { low: 50, medium: 100, high: 200 },
}

// ---- 视图维度（月度 / 年度）----
const viewMode = ref('monthly')

const periodLabel = computed(() => (viewMode.value === 'monthly' ? '月度' : '年度'))
const valueMultiplier = computed(() => (viewMode.value === 'yearly' ? 12 : 1))
const displayedTotalEmission = computed(() => totalEmission.value * valueMultiplier.value)
const displayedBreakdown = computed(() => ({
  transport: breakdown.value.transport * valueMultiplier.value,
  energy: breakdown.value.energy * valueMultiplier.value,
  lifestyle: breakdown.value.lifestyle * valueMultiplier.value,
}))

/** 根据总排放量返回评级文字 */
const ratingText = computed(() => {
  const emission = displayedTotalEmission.value
  const lowThreshold = 150 * valueMultiplier.value
  const mediumThreshold = 300 * valueMultiplier.value
  if (emission < lowThreshold) return '低碳环保'
  if (emission < mediumThreshold) return '中等水平'
  return '需要改进'
})

/** 根据总排放量返回评级标签的 CSS 类名 */
const ratingClass = computed(() => {
  const emission = displayedTotalEmission.value
  const lowThreshold = 150 * valueMultiplier.value
  const mediumThreshold = 300 * valueMultiplier.value
  if (emission < lowThreshold) return 'bg-green-100 text-green-800'
  if (emission < mediumThreshold) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
})

/**
 * 计算碳排放并触发 AI 建议获取
 * 1. 根据表单数据和排放系数计算各分项及总量
 * 2. 调用后端 AI 接口获取流式减排建议
 */
const calculateCarbon = async () => {
  hasCalculated.value = true
  analyzing.value = true
  aiAdvice.value = []
  streamingAdvice.value = ''
  isStreaming.value = false

  const transport = form.value.car * FACTORS.car + form.value.publicTransport * FACTORS.publicTransport
  const energy = form.value.electricity * FACTORS.electricity + form.value.gas * FACTORS.gas
  const lifestyle = FACTORS.meat[form.value.meat]

  breakdown.value = { transport, energy, lifestyle }
  totalEmission.value = transport + energy + lifestyle

  await fetchAiAdvice(transport, energy, lifestyle)
  analyzing.value = false
}

/**
 * 调用后端 SSE 接口获取 AI 减排建议
 * 流结束后解析文本，按「•」分割为建议列表
 * 失败时降级到本地预设建议
 */
const fetchAiAdvice = async (transport, energy, lifestyle) => {
  const meatLabel = form.value.meat === 'low' ? '低（每周0-2次）' : form.value.meat === 'medium' ? '中（每周3-5次）' : '高（每天）'
  const prompt = `你是专业碳排放顾问。用户本月碳足迹数据：\n- 交通：${transport.toFixed(1)} kg CO₂e（私家车${form.value.car}km，公共交通${form.value.publicTransport}km）\n- 能源：${energy.toFixed(1)} kg CO₂e（用电${form.value.electricity}kWh，天然气${form.value.gas}m³）\n- 饮食：${lifestyle.toFixed(1)} kg CO₂e（肉类频率：${meatLabel}）\n- 月度总排放：${(transport+energy+lifestyle).toFixed(1)} kg CO₂e\n\n请给出3条具体可行的减排建议，每条以「• 」开头，说明做法和预期效果，每条不超过50字。`

  try {
    if (abortController.value) abortController.value.abort()
    abortController.value = new AbortController()

    const response = await fetch('/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token || ''}`
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: '你是Green AI环保顾问，回答简洁专业，直接给建议，不要重复用户数据。' },
          { role: 'user', content: prompt }
        ],
        stream: true,
      }),
      signal: abortController.value.signal,
    })

    if (!response.ok) throw new Error(await getResponseErrorMessage(response, '分析失败'))
    if (!response.body) throw new Error('No response body')

    isStreaming.value = true
    streamingAdvice.value = ''

    await consumeChatCompletionsStream(response.body, {
      signal: abortController.value.signal,
      onDeltaContent: (content) => { streamingAdvice.value += content },
    })

    const lines = streamingAdvice.value
      .split('\n')
      .map(l => l.replace(/^[•\-·]\s*/, '').trim())
      .filter(Boolean)
    aiAdvice.value = lines.length > 0 ? lines : [streamingAdvice.value]
    isStreaming.value = false

  } catch (error) {
    if (error.name === 'AbortError') return
    isStreaming.value = false
    generateAiAdviceFallback(transport, energy, lifestyle)
  } finally {
    abortController.value = null
  }
}

/**
 * 本地规则降级：根据各分项排放量生成预设减排建议
 * 当 AI 接口不可用时调用
 */
const generateAiAdviceFallback = (transport, energy, lifestyle) => {
  const list = []
  if (transport > 100) list.push('交通碳排放较高，建议每周增加一次公共交通或骑行，每月可减少约 15kg 排放。')
  else list.push('出行方式非常环保，请继续保持绿色出行习惯！')
  if (energy > 150) list.push('家庭能源消耗偏高，检查电器节能等级，或将空调温度调整 1°C 可显著减排。')
  if (lifestyle > 150) list.push('饮食碳排放较大，尝试「周一无肉日」，每月可减少约 25kg CO₂e。')
  else list.push('饮食结构健康且环保，值得坚持！')
  if (list.length < 3) list.push('积极参与旧物重构，延长物品使用寿命，减少生产环节的隐性碳排放。')
  aiAdvice.value = list
}

/** 图表初始化 */
const initCharts = () => {
  if (trendChartRef.value && !trendChart.value) {
    trendChart.value = echarts.init(trendChartRef.value)
  }
  if (pieChartRef.value && !pieChart.value) {
    pieChart.value = echarts.init(pieChartRef.value)
  }
  if (radarChartRef.value && !radarChart.value) {
    radarChart.value = echarts.init(radarChartRef.value)
  }
  renderCharts()
}

/** 根据当前结果渲染全部图表 */
const renderCharts = () => {
  renderTrendChart()
  renderPieChart()
  renderRadarChart()
}

/** 趋势线：展示最近6个月估算趋势，支持 dataZoom */
const renderTrendChart = () => {
  if (!trendChart.value) return

  const now = new Date()
  const labels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return viewMode.value === 'monthly' ? `${d.getMonth() + 1}月` : `${d.getFullYear()}年`
  })

  const current = displayedTotalEmission.value
  const ratio = viewMode.value === 'monthly'
    ? [1.18, 1.12, 1.08, 1.03, 0.98, 1]
    : [1.05, 1.03, 1.01, 1, 0.97, 0.95]
  const series = hasCalculated.value
    ? ratio.map((r) => Number((current * r).toFixed(1)))
    : [0, 0, 0, 0, 0, 0]

  trendChart.value.setOption({
    animationDuration: 900,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(22, 26, 29, 0.88)',
      borderWidth: 0,
      textStyle: { color: '#e5f8ea' },
      valueFormatter: (value) => `${value} kg CO₂e`,
    },
    grid: { left: 28, right: 22, top: 22, bottom: 56, containLabel: true },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { lineStyle: { color: '#d7d7d7' } },
      axisLabel: { color: '#6b7280' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#edf2ef' } },
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      {
        type: 'slider',
        height: 16,
        bottom: 12,
        borderColor: '#dbeadf',
        backgroundColor: '#f4faf6',
        fillerColor: 'rgba(34, 197, 94, 0.25)',
      },
    ],
    series: [
      {
        name: '总碳排放',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: series,
        lineStyle: { width: 3, color: '#22c55e' },
        itemStyle: { color: '#16a34a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34, 197, 94, 0.35)' },
            { offset: 1, color: 'rgba(34, 197, 94, 0.02)' },
          ]),
        },
      },
    ],
  }, true)
}

/** 饼图：来源占比 */
const renderPieChart = () => {
  if (!pieChart.value) return

  const pieData = [
    { name: '交通', value: Number(displayedBreakdown.value.transport.toFixed(1)) },
    { name: '能源', value: Number(displayedBreakdown.value.energy.toFixed(1)) },
    { name: '生活', value: Number(displayedBreakdown.value.lifestyle.toFixed(1)) },
  ]

  pieChart.value.setOption({
    animationDuration: 900,
    animationEasing: 'quarticOut',
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>{c} kg CO₂e ({d}%)',
      backgroundColor: 'rgba(22, 26, 29, 0.88)',
      borderWidth: 0,
      textStyle: { color: '#e5f8ea' },
    },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: { color: '#6b7280', fontSize: 12 },
    },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '42%'],
        padAngle: 2,
        label: { show: true, formatter: '{b|{b}}\n{c|{d}%}', rich: { b: { fontSize: 11 }, c: { color: '#4b5563', fontSize: 11 } } },
        labelLine: { length: 10, length2: 8 },
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        emphasis: { scale: true, scaleSize: 8 },
        data: hasCalculated.value
          ? pieData
          : pieData.map((i) => ({ ...i, value: i.name === '生活' ? 1 : 0 })),
        color: ['#34d399', '#60a5fa', '#fbbf24'],
      },
    ],
  }, true)
}

/** 雷达图：结构强弱 */
const renderRadarChart = () => {
  if (!radarChart.value) return

  const maxValue = Math.max(50, displayedBreakdown.value.transport, displayedBreakdown.value.energy, displayedBreakdown.value.lifestyle)
  const values = hasCalculated.value
    ? [displayedBreakdown.value.transport, displayedBreakdown.value.energy, displayedBreakdown.value.lifestyle]
    : [0, 0, 0]

  radarChart.value.setOption({
    animationDuration: 950,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(22, 26, 29, 0.88)',
      borderWidth: 0,
      textStyle: { color: '#e5f8ea' },
      formatter: (params) => {
        const [t, e, l] = params.value || [0, 0, 0]
        return `交通: ${t.toFixed(1)}<br/>能源: ${e.toFixed(1)}<br/>生活: ${l.toFixed(1)} kg CO₂e`
      },
    },
    radar: {
      radius: 82,
      splitNumber: 4,
      axisName: { color: '#4b5563', fontSize: 12 },
      splitArea: { areaStyle: { color: ['#f8faf8', '#f1f7f2', '#ecf5ee', '#e7f2ea'] } },
      splitLine: { lineStyle: { color: '#d8e7dc' } },
      axisLine: { lineStyle: { color: '#d8e7dc' } },
      indicator: [
        { name: '交通', max: maxValue },
        { name: '能源', max: maxValue },
        { name: '生活', max: maxValue },
      ],
    },
    series: [
      {
        type: 'radar',
        symbol: 'circle',
        symbolSize: 6,
        data: [
          {
            value: values,
            name: '结构分析',
            areaStyle: { color: 'rgba(34, 197, 94, 0.35)' },
            lineStyle: { color: '#16a34a', width: 2.5 },
            itemStyle: { color: '#16a34a' },
          },
        ],
      },
    ],
  }, true)
}

const downloadDataUrl = (dataUrl, filename) => {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

const exportSingleChart = (type) => {
  const chartMap = {
    trend: trendChart.value,
    pie: pieChart.value,
    radar: radarChart.value,
  }
  const chart = chartMap[type]
  if (!chart) return
  const modeText = viewMode.value === 'monthly' ? 'monthly' : 'yearly'
  const dataUrl = chart.getDataURL({ pixelRatio: 2, backgroundColor: '#ffffff' })
  downloadDataUrl(dataUrl, `carbon-${type}-${modeText}.png`)
}

const exportAllCharts = () => {
  exportSingleChart('trend')
  setTimeout(() => exportSingleChart('pie'), 120)
  setTimeout(() => exportSingleChart('radar'), 240)
}

const handleResize = () => {
  trendChart.value?.resize()
  pieChart.value?.resize()
  radarChart.value?.resize()
}

watch(
  () => [
    hasCalculated.value,
    totalEmission.value,
    breakdown.value.transport,
    breakdown.value.energy,
    breakdown.value.lifestyle,
    viewMode.value,
  ],
  async () => {
    await nextTick()
    renderCharts()
  },
  { deep: true },
)

onMounted(async () => {
  await nextTick()
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart.value?.dispose()
  pieChart.value?.dispose()
  radarChart.value?.dispose()
})

</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>


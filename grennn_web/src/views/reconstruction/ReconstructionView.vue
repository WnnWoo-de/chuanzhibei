<template>
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans pt-24 px-6 pb-12">
    <!-- Grid Background -->
    <div
      class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6"
    >
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
      <!-- Mobile grid -->
      <div v-for="n in 4" :key="`m-${n}`" class="border-r border-black h-full block md:hidden col-span-3"></div>
    </div>

    <div class="relative z-10 grid grid-cols-12 gap-4">
      <!-- Sidebar / Header -->
      <div class="col-span-12 md:col-span-3">
        <div class="sticky top-24">
          <h1 class="text-4xl md:text-5xl font-bold mt-2 mb-6">旧物重构</h1>
          <p class="text-sm opacity-60 max-w-[200px] mb-8">
            智能回收<br />
            上传旧物，AI 为您提供创意重构方案。
          </p>

          <!-- Upload Area -->
          <div
            @click="triggerFileInput"
            @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            class="border-2 border-dashed border-black/20 p-6 text-center cursor-pointer hover:border-primary hover:bg-white/50 transition-all mb-8 relative overflow-hidden group active:bg-white/80"
            :class="{ 'border-primary bg-white/50': isDragging }"
          >
            <div
              class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            ></div>
            <el-icon
              class="text-4xl mb-2 opacity-40 group-hover:scale-110 transition-transform duration-300"
              ><Upload
            /></el-icon>
            <p class="text-xs font-mono mb-1">点击或拖拽上传</p>
            <p class="text-[10px] opacity-50">支持 JPG, PNG 格式</p>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              class="hidden"
            />
          </div>

          <div class="hidden md:block text-xs font-mono opacity-40 space-y-2">
            <p>模式：{{ showAnalysis ? 'AI 分析中' : '案例浏览' }}</p>
            <p>案例数：{{ cases.length }}</p>
            <p>更新：2025.12.21</p>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="col-span-12 md:col-span-9">
        <!-- AI Analysis Section (Shows when uploading) -->
        <transition name="fade">
          <div
            v-if="showAnalysis"
            class="mb-8 bg-white/90 backdrop-blur-md border border-black/10 p-8 relative overflow-hidden shadow-xl rounded-2xl"
          >
            <div class="absolute top-4 right-4 font-mono text-xs opacity-20">AI_ANALYSIS_01</div>

            <h3 class="text-2xl font-bold mb-6 flex items-center gap-3">
              <span
                v-if="!analysisComplete"
                class="inline-block w-3 h-3 bg-primary rounded-full animate-ping"
              ></span>
              AI 分析结果
            </h3>

            <!-- Uploaded Image Preview & Scanning -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <p class="text-xs font-mono mb-2 opacity-50">您的物品</p>
                <div class="aspect-square bg-gray-100 rounded overflow-hidden relative group">
                  <img
                    v-if="uploadedImage"
                    :src="uploadedImage"
                    alt="Uploaded item"
                    class="w-full h-full object-cover"
                  />

                  <!-- Scanning Effect -->
                  <div v-if="!analysisComplete" class="absolute inset-0 z-10 pointer-events-none">
                    <div
                      class="absolute top-0 left-0 w-full h-1 bg-primary/80 shadow-[0_0_15px_rgba(46,125,50,0.8)] animate-scan"
                    ></div>
                    <div class="absolute inset-0 bg-primary/10 animate-pulse"></div>

                    <!-- Tech Markers -->
                    <div
                      class="absolute top-1/4 left-1/4 w-8 h-8 border-t-2 border-l-2 border-white/80"
                    ></div>
                    <div
                      class="absolute bottom-1/4 right-1/4 w-8 h-8 border-b-2 border-r-2 border-white/80"
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <p class="text-xs font-mono mb-2 opacity-50">AI 识别进度</p>
                <div class="space-y-4">
                  <div
                    v-for="(item, index) in analysisSteps"
                    :key="index"
                    class="flex items-center gap-3"
                  >
                    <transition name="check-bounce" mode="out-in">
                      <el-icon v-if="item.completed" class="text-primary text-xl"
                        ><CircleCheckFilled
                      /></el-icon>
                      <div
                        v-else-if="item.active"
                        class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"
                      ></div>
                      <div v-else class="w-5 h-5 border-2 border-gray-200 rounded-full"></div>
                    </transition>
                    <span
                      class="text-sm transition-all duration-300"
                      :class="[
                        item.completed ? 'opacity-100 text-black font-medium' : 'opacity-40',
                        item.active ? 'opacity-80 text-primary' : '',
                      ]"
                    >
                      {{ item.text }}
                    </span>
                  </div>
                </div>

                <transition name="fade">
                  <div
                    v-if="analysisComplete"
                    class="mt-6 p-4 bg-gray-50 border border-black/5 rounded text-xs font-mono space-y-3"
                  >
                    <div class="flex justify-between gap-4">
                      <span class="opacity-50">物品识别:</span>
                      <span class="text-right">{{ analysisMeta.itemName }}</span>
                    </div>
                    <div class="flex justify-between gap-4">
                      <span class="opacity-50">主要材质:</span>
                      <span class="text-right">{{ analysisMeta.material }}</span>
                    </div>
                    <div class="flex justify-between gap-4">
                      <span class="opacity-50">完整性:</span>
                      <span class="text-right">{{ analysisMeta.integrity }}</span>
                    </div>
                    <div class="flex justify-between gap-4">
                      <span class="opacity-50">识别置信度:</span>
                      <span class="text-right">{{ analysisMeta.confidence }}</span>
                    </div>
                    <div class="flex justify-between gap-4">
                      <span class="opacity-50">重构可行性:</span>
                      <span :class="analysisMeta.reconstructable ? 'text-primary font-bold' : 'text-amber-600 font-bold'">
                        {{ analysisMeta.reconstructable ? '适合重构' : '不建议重构' }}
                      </span>
                    </div>
                    <div class="flex justify-between gap-4">
                      <span class="opacity-50">预估碳减排:</span>
                      <span class="text-right" :class="analysisMeta.reconstructable ? 'text-primary font-bold' : 'text-gray-500'">
                        {{ analysisMeta.carbonReduction }}
                      </span>
                    </div>
                    <div class="pt-3 border-t border-black/5 space-y-2 leading-relaxed">
                      <p><span class="opacity-50">判断依据:</span> {{ analysisMeta.reason }}</p>
                      <p><span class="opacity-50">处理建议:</span> {{ analysisMeta.disposalAdvice }}</p>
                    </div>
                  </div>
                </transition>
              </div>
            </div>

            <!-- Reconstruction Suggestions -->
            <transition name="slide-up">
              <div v-if="analysisComplete" class="border-t border-black/10 pt-6">
                <h4 class="font-bold mb-4 flex items-center gap-2">
                  <el-icon class="text-primary"><MagicStick /></el-icon>
                  {{ analysisMeta.reconstructable ? '重构建议' : '处理建议' }}
                </h4>

                <div
                  v-if="suggestions.length > 0"
                  class="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div
                    v-for="(suggestion, idx) in suggestions"
                    :key="idx"
                    class="border border-black/10 p-4 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer bg-white/80 backdrop-blur-sm rounded-xl shadow-md"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <h5 class="font-bold">{{ suggestion.title }}</h5>
                      <span class="text-[10px] px-2 py-0.5 bg-gray-100 rounded text-gray-500">{{
                        suggestion.difficulty
                      }}</span>
                    </div>
                    <p class="text-xs text-gray-600 mb-3 leading-relaxed">
                      {{ suggestion.description }}
                    </p>
                    <button
                      @click.stop="openStepsDialog(suggestion)"
                      class="text-xs font-mono text-primary hover:underline flex items-center gap-1"
                    >
                      查看图纸 <el-icon><ArrowRight /></el-icon>
                    </button>
                  </div>
                </div>

                <div
                  v-else
                  class="rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4 text-sm leading-relaxed text-amber-900"
                >
                  <p class="font-semibold mb-1">当前物品不适合进行旧物重构</p>
                  <p>{{ analysisMeta.disposalAdvice }}</p>
                </div>

                <div class="mt-8 flex justify-between items-center">
                  <p class="text-xs text-gray-400">
                    <template v-if="userStore.isLoggedIn">
                      完成分析获得 <span class="text-primary font-bold">+50</span> 积分
                    </template>
                    <template v-else>
                      登录后可获得 <span class="text-primary font-bold">+50</span> 积分奖励
                    </template>
                  </p>
                  <button
                    @click="closeAnalysis"
                    class="border border-black px-6 py-2 text-sm font-mono uppercase hover:bg-black hover:text-white transition-colors"
                  >
                    返回案例库
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </transition>

        <!-- Cases Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            v-for="(item, index) in cases"
            :key="index"
            @click="openCaseDetail(item)"
            class="bg-white/80 backdrop-blur-md border border-black/10 p-6 group hover:shadow-2xl transition-all duration-500 relative cursor-pointer rounded-2xl shadow-lg hover:-translate-y-1"
          >
            <!-- Decorative Index -->
            <div class="absolute top-4 right-4 font-mono text-xs opacity-20">
              CASE #{{ 2000 + index }}
            </div>

            <!-- Real Image -->
            <div class="aspect-video bg-gray-100 mb-6 overflow-hidden relative">
              <img
                :src="item.image"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div
                class="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 text-[10px] font-mono uppercase backdrop-blur-sm"
              >
                {{ item.category }}
              </div>
            </div>

            <div class="mb-4">
              <h3 class="text-xl font-bold mb-1">{{ item.title }}</h3>
              <p class="font-mono text-xs opacity-50 mb-3">{{ item.subtitle }}</p>
              <p class="text-sm text-gray-600 leading-relaxed line-clamp-3">
                {{ item.description }}
              </p>
            </div>

            <!-- Transformation Data -->
            <div class="border-t border-black/10 pt-4 mt-auto">
              <div class="flex justify-between items-center text-xs font-mono">
                <div>
                  <span class="opacity-40 block">来源</span>
                  <span>{{ item.source }}</span>
                </div>
                <div class="text-right">
                  <span class="opacity-40 block">重构为</span>
                  <span class="text-primary">{{ item.result }}</span>
                </div>
              </div>
            </div>

            <!-- Interaction Bar -->
            <div class="absolute top-4 left-4 z-10 flex gap-2">
                <button
                    @click.stop="toggleLike(item)"
                    class="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition-transform flex items-center justify-center text-primary"
                >
                    <el-icon v-if="item.liked"><StarFilled /></el-icon>
                    <el-icon v-else><Star /></el-icon>
                </button>
            </div>

            <div
              class="mt-4 font-mono text-xs uppercase opacity-0 group-hover:opacity-100 transition-opacity text-center"
            >
              点击查看详情 →
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Steps Dialog -->
    <el-dialog
      v-model="showStepsDialog"
      :title="selectedSuggestion?.title || '制作步骤'"
      :width="560"
      align-center
    >
      <template v-if="selectedSuggestion">
        <div class="mb-4 flex items-center gap-3">
          <span class="px-2 py-1 text-xs font-mono bg-gray-100 rounded">难度：{{ selectedSuggestion.difficulty }}</span>
          <p class="text-sm text-gray-600">{{ selectedSuggestion.description }}</p>
        </div>
        <ol class="space-y-3">
          <li
            v-for="(step, idx) in (selectedSuggestion.steps || defaultSteps)"
            :key="idx"
            class="flex gap-3 items-start p-3 bg-gray-50 rounded border border-black/5"
          >
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">{{ idx + 1 }}</span>
            <span class="text-sm leading-relaxed">{{ step }}</span>
          </li>
        </ol>
        <div class="mt-6 pt-4 border-t border-black/10 flex justify-between items-center">
          <p class="text-xs text-gray-400 font-mono">预计用时：{{ selectedSuggestion.duration || '2-4 小时' }}</p>
          <button @click="showStepsDialog = false" class="border border-black px-4 py-2 text-xs font-mono uppercase hover:bg-black hover:text-white transition-colors">关闭</button>
        </div>
      </template>
    </el-dialog>

    <!-- Case Detail Dialog -->
    <el-dialog
      v-model="showDetailDialog"
      :width="800"
      :show-close="true"
      class="reconstruction-dialog"
    >
      <template v-if="selectedCase">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img :src="selectedCase.image" :alt="selectedCase.title" class="w-full rounded" />
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2">{{ selectedCase.title }}</h2>
            <p class="text-xs font-mono text-primary mb-4">{{ selectedCase.category }}</p>
            <p class="text-sm text-gray-600 leading-relaxed mb-6">{{ selectedCase.description }}</p>

            <div class="border-t border-black/10 pt-4 mb-4">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="font-mono text-xs opacity-50 mb-1">来源材料</p>
                  <p class="font-bold">{{ selectedCase.source }}</p>
                </div>
                <div>
                  <p class="font-mono text-xs opacity-50 mb-1">重构产物</p>
                  <p class="font-bold text-primary">{{ selectedCase.result }}</p>
                </div>
              </div>
            </div>

            <div v-if="selectedCase.steps" class="mb-6">
              <h4 class="font-bold mb-3">制作步骤</h4>
              <ol class="space-y-2 text-sm">
                <li v-for="(step, idx) in selectedCase.steps" :key="idx" class="flex gap-2">
                  <span class="font-mono text-primary">{{ idx + 1 }}.</span>
                  <span>{{ step }}</span>
                </li>
              </ol>
            </div>

            <button
              @click="showDetailDialog = false"
              class="w-full border border-black px-4 py-3 text-sm font-mono uppercase hover:bg-black hover:text-white transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// ============================================================
// views/reconstruction/ReconstructionView.vue - 旧物重构页面
// 功能：上传旧物图片 → 调用 AI 分析 → 展示材质/碳减排数据和重构建议
// 案例库：静态展示 4 个优质重构案例，支持点击查看详情
// ============================================================
import { ref, onMounted } from 'vue'
import { Upload, CircleCheckFilled, MagicStick, ArrowRight, Star, StarFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { mapAnalyzeResult } from '@/services/reconstructionService'
import { analyzeReconstruction } from '@/services/reconstructionService'

// Import images
import case1 from '@/assets/images/case_1.png'
import case2 from '@/assets/images/case_2.png'
import case3 from '@/assets/images/case_3.png'
import case4 from '@/assets/images/case_4.png'

const userStore = useUserStore()
const fileInput = ref(null)           // 隐藏的文件 input DOM 引用
const isDragging = ref(false)          // 拖拽悬停状态
const uploadedImage = ref(null)        // 上传图片的 base64 预览
const uploadedFile = ref(null)         // 待上传的 File 对象
const showAnalysis = ref(false)        // 是否显示 AI 分析区域
const analysisComplete = ref(false)    // AI 分析是否已完成
const analysisRunId = ref(0)           // 每次分析的唯一 ID，用于取消过期分析
const showDetailDialog = ref(false)    // 案例详情对话框可见性
const selectedCase = ref(null)         // 当前选中的案例
const showStepsDialog = ref(false)     // 制作步骤对话框可见性
const selectedSuggestion = ref(null)   // 当前选中的重构建议

// 未提供具体步骤时的通用制作流程（fallback）
const defaultSteps = [
  '仔细检查物品现状，评估可用部件',
  '准备所需工具和辅助材料',
  '按照方案拆解或改造物品结构',
  '进行打磨、上色或组装等处理',
  '完成收尾工作，检验成品质量',
]

/** 打开制作步骤对话框 */
const openStepsDialog = (suggestion) => {
  selectedSuggestion.value = suggestion
  showStepsDialog.value = true
}
const analysisMeta = ref({
  itemName: '等待识别',
  material: '等待识别',
  integrity: '不适用',
  carbonReduction: '不适用',
  confidence: '低',
  reconstructable: false,
  reason: '上传图片后开始分析',
  disposalAdvice: '识别完成后将显示处理建议',
})

const analysisSteps = ref([
  { text: '正在扫描物品特征...', completed: false, active: false },
  { text: 'AI 识别材质与结构...', completed: false, active: false },
  { text: '计算环境影响值...', completed: false, active: false },
  { text: '生成创意重构方案...', completed: false, active: false },
])

const suggestions = ref([])

const cases = ref([
  {
    title: '复古植物架',
    subtitle: '复古花架',
    category: '家具',
    description:
      '移除破损的座椅部分，加固框架，并将其用作放置大型盆栽植物的独特支架。保留原木质感以增加复古风味。',
    source: '旧木椅',
    result: '植物架',
    image: case1,
    steps: [
      '移除破损的椅面，保留框架结构',
      '打磨木材表面，去除旧漆和污渍',
      '加固连接处，确保结构稳定',
      '涂刷清漆或木蜡油保护木材',
      '摆放盆栽，享受复古园艺美学',
    ],
    liked: false
  },
  {
    title: '牛仔托特包',
    subtitle: '牛仔包',
    category: '时尚',
    description: '利用不再合身的旧牛仔裤，通过简单的剪裁和缝纫，改造成时尚耐用的购物托特包。',
    source: '旧牛仔裤',
    result: '托特包',
    image: case2,
    steps: [
      '剪下牛仔裤的两条裤腿',
      '将裤腿底部缝合作为包底',
      '剪裁合适的手提带并缝制',
      '添加内袋和装饰口袋',
      '缝合开口，完成托特包',
    ],
    liked: true
  },
  {
    title: '玻璃瓶氛围灯',
    subtitle: '瓶灯',
    category: '装饰',
    description: '将废弃的玻璃饮料瓶清洗干净，放入LED灯串，打造出温暖浪漫的居家氛围灯。',
    source: '玻璃瓶',
    result: '氛围灯',
    image: case3,
    steps: [
      '清洗玻璃瓶并去除标签',
      '准备LED暖光灯串',
      '将灯串小心放入瓶中',
      '调整灯串位置以获得最佳效果',
      '连接电源，享受温馨氛围',
    ],
    liked: false
  },
  {
    title: '自行车轮时钟',
    subtitle: '车轮时钟',
    category: '艺术',
    description: '回收废弃的自行车轮圈，安装时钟机芯，制作成充满工业风的挂钟。',
    source: '车轮',
    result: '挂钟',
    image: case4,
    steps: [
      '清洁自行车轮圈，去除锈迹',
      '在轮圈中心钻孔以安装时钟机芯',
      '安装时钟机芯和指针',
      '添加数字或刻度标记（可选）',
      '安装壁挂固定装置',
    ],
    liked: false
  },
])

/** 触发隐藏的文件选择框 */
const triggerFileInput = () => {
  fileInput.value?.click()
}

/** 切换案例收藏状态（本地 mock，未同步后端） */
const toggleLike = (item) => {
    item.liked = !item.liked
    if (item.liked) {
        ElMessage.success('已收藏该案例')
    }
}

/** 处理文件 input change 事件，校验并处理图片文件 */
const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
        ElMessage.warning('请上传图片文件')
        event.target.value = ''
        return
    }
    if (file.size > 5 * 1024 * 1024) {
        ElMessage.warning('图片大小不能超过 5MB')
        event.target.value = ''
        return
    }
    processFile(file)
  }
  event.target.value = ''
}

/** 处理拖拽放置事件 */
const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
      if (file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) {
            ElMessage.warning('图片大小不能超过 5MB')
            return
        }
        processFile(file)
      } else {
        ElMessage.warning('请上传图片文件')
      }
  }
}

/**
 * 使用 FileReader 将文件读取为 base64 并触发分析
 * @param file - 用户选择的图片 File 对象
 */
const processFile = (file) => {
  uploadedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target.result
    startAnalysis()
  }
  reader.readAsDataURL(file)
}

/**
 * 启动 AI 分析流程
 * 1. 显示逐步骤进度动画（每步 1.5s）
 * 2. 并行发起后端 AI 分析接口请求
 * 3. 分析完成后更新 meta 和 suggestions，并奖励积分
 * 使用 analysisRunId 防止多次上传时的竞争条件
 */
const startAnalysis = async () => {
  const runId = analysisRunId.value + 1
  analysisRunId.value = runId
  showAnalysis.value = true
  analysisComplete.value = false
  analysisMeta.value = {
    itemName: '分析中',
    material: '分析中',
    integrity: '分析中',
    carbonReduction: '不适用',
    confidence: '低',
    reconstructable: false,
    reason: 'AI 正在识别物品并判断是否适合重构',
    disposalAdvice: '请稍候，分析完成后显示建议',
  }
  suggestions.value = []

  // Reset steps
  analysisSteps.value.forEach((step) => {
    step.completed = false
    step.active = false
  })

  const file = uploadedFile.value
  const apiPromise = file
    ? (async () => {
        return await analyzeReconstruction(file)
      })()
    : null

  // Simulate AI analysis sequence
  for (let i = 0; i < analysisSteps.value.length; i++) {
    if (analysisRunId.value !== runId || !showAnalysis.value) return
    analysisSteps.value[i].active = true
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Wait 1.5s per step
    if (analysisRunId.value !== runId || !showAnalysis.value) return
    analysisSteps.value[i].active = false
    analysisSteps.value[i].completed = true
  }

  if (analysisRunId.value !== runId || !showAnalysis.value) return

  if (apiPromise) {
    const result = await apiPromise
    if (analysisRunId.value !== runId || !showAnalysis.value) return

    if (result.ok) {
      const mapped = mapAnalyzeResult(result.data)
      analysisMeta.value = mapped.meta
      suggestions.value = mapped.suggestions
      ElMessage.success(
        mapped.summary.isReconstructable
          ? '识别完成，已生成重构建议'
          : '识别完成，该物品更适合分类处理',
      )
    } else {
      const failureMessage =
        result.status === 404
          ? '分析接口未找到。请先强制刷新页面（Ctrl+F5）或清除旧缓存，再确认 Node 后端已重启。'
          : result.message || '后端分析失败'

      const disposalAdvice =
        result.status === 401 || result.status === 403
          ? '系统已切换为游客可分析模式，请刷新页面或重启后端后重试'
          : '请确认后端与 FastAPI 服务已启动，再重新上传图片'

      analysisMeta.value = {
        itemName: '识别失败',
        material: '未识别',
        integrity: '不适用',
        carbonReduction: '不适用',
        confidence: '低',
        reconstructable: false,
        reason: failureMessage,
        disposalAdvice,
      }
      suggestions.value = []
      ElMessage.warning(failureMessage)
    }
  }

  analysisComplete.value = true
  if (userStore.isLoggedIn) {
    userStore.addPoints(50) // Reward logged-in user only
  }
}

/** 关闭分析区域并重置所有分析状态 */
const closeAnalysis = () => {
  analysisRunId.value += 1
  showAnalysis.value = false
  analysisComplete.value = false
  uploadedImage.value = null
  uploadedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

/** 打开案例详情对话框 */
const openCaseDetail = (caseItem) => {
  selectedCase.value = caseItem
  showDetailDialog.value = true
}

// 组件挂载时初始化用户状态（用于积分奖励）
onMounted(() => {
  userStore.init()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.check-bounce-enter-active {
  animation: bounce-in 0.5s;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes scan {
  0% {
    top: 0%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

.animate-scan {
  animation: scan 2s linear infinite;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

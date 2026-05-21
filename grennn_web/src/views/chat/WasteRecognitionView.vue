<template>
  <!-- 垃圾分类识别页面主容器 -->
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans pt-20 px-6 pb-12 flex flex-col">
    <!-- 网格背景装饰 -->
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
    </div>

    <!-- 主内容区域 -->
    <div class="relative z-10 grid grid-cols-12 gap-6 flex-1">
      <!-- 左侧边栏：返回链接和页面标题 -->
      <div class="col-span-12 md:col-span-3 flex flex-col">
        <div class="sticky top-24">
          <!-- 返回 AI 聊天页面链接 -->
          <router-link
            to="/chat"
            class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-primary transition-opacity mb-8"
          >
            <span>&larr; {{ langText.wasteRecognition.backToAI }}</span>
          </router-link>

          <!-- 页面标题和描述 -->
          <h1 class="text-4xl md:text-5xl font-bold mt-2 mb-6">{{ langText.wasteRecognition.pageTitle1 }}<br />{{ langText.wasteRecognition.pageTitle2 }}</h1>
          <p class="text-sm opacity-60 max-w-[200px] mb-8">
            {{ langText.wasteRecognition.pageDesc }}
          </p>
        </div>
      </div>

      <!-- 右侧主内容区域：上传和识别结果 -->
      <div class="col-span-12 md:col-span-9 flex flex-col h-full">
        <!-- 识别卡片容器：左右分栏布局 -->
        <div class="bg-white border border-black/10 flex-1 flex flex-col md:flex-row relative overflow-hidden shadow-sm rounded-2xl">

          <!-- 左侧：图片上传区域 -->
          <div class="flex-1 p-8 border-b md:border-b-0 md:border-r border-black/10 flex flex-col items-center justify-center relative bg-gray-50/30">
            <h2 class="text-2xl font-bold mb-6 flex items-center gap-3 self-start w-full">
              <el-icon><Camera /></el-icon>
              {{ langText.wasteRecognition.imageRecognition }}
            </h2>

            <!-- 拖拽/点击上传区域 -->
            <div
              class="w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden"
              :class="isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="$refs.fileInput.click()"
            >
              <!-- 隐藏的文件输入框 -->
              <input
                type="file"
                ref="fileInput"
                class="hidden"
                accept="image/*"
                @change="handleFileChange"
              />

              <!-- 已上传图片预览 -->
              <template v-if="previewUrl">
                <img :src="previewUrl" class="w-full h-full object-contain relative z-10 p-2" />
                <!-- 分析中遮罩层（扫描动画） -->
                <div v-if="isAnalyzing" class="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center text-black backdrop-blur-sm">
                  <el-icon class="animate-spin text-4xl mb-2 text-primary"><Loading /></el-icon>
                  <p class="font-mono text-sm uppercase tracking-widest font-bold">{{ langText.wasteRecognition.analyzing }}</p>
                  <!-- 扫描进度条动效 -->
                  <div class="absolute top-0 left-0 w-full h-1 bg-primary animate-[scan_2s_linear_infinite] shadow-[0_0_8px_2px_rgba(46,125,50,0.8)]"></div>
                </div>
              </template>
              <!-- 未上传时的占位提示 -->
              <template v-else>
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400 group-hover:text-primary transition-colors">
                  <el-icon size="24"><UploadFilled /></el-icon>
                </div>
                <p class="font-bold text-gray-700 mb-1 pointer-events-none">{{ langText.wasteRecognition.uploadHint }}</p>
                <p class="text-xs text-gray-500 font-mono pointer-events-none">{{ langText.wasteRecognition.uploadFormats }}</p>
              </template>
            </div>

            <!-- 重新上传按钮 -->
            <div class="w-full mt-6" v-if="previewUrl && !isAnalyzing">
              <button
                @click="resetUpload"
                class="w-full py-3 bg-white border border-black/20 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
              >
                {{ langText.wasteRecognition.reupload }}
              </button>
            </div>
          </div>

          <!-- 右侧：识别结果展示区域 -->
          <div class="flex-1 p-8 relative flex flex-col bg-white overflow-y-auto">
            <!-- 未识别时显示默认提示 -->
            <div v-if="!analysisResult && !isAnalyzing" class="flex-1 animate-fade-in flex flex-col">
              <div class="flex-1 bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-md">
                <h4 class="font-bold mb-4 flex items-center gap-2">
                  <el-icon class="text-primary"><InfoFilled /></el-icon> {{ langText.wasteRecognition.defaultAdviceTitle }}
                </h4>
                <ul class="space-y-3">
                  <li class="flex gap-3 text-sm text-gray-600 leading-relaxed">
                    <span class="text-primary mt-0.5">•</span>
                    <span>{{ langText.wasteRecognition.defaultAdvice1 }}</span>
                  </li>
                  <li class="flex gap-3 text-sm text-gray-600 leading-relaxed">
                    <span class="text-primary mt-0.5">•</span>
                    <span>{{ langText.wasteRecognition.defaultAdvice2 }}</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <!-- 识别结果展示 -->
            <div v-else-if="analysisResult" class="flex-1 animate-fade-in flex flex-col">
              <!-- 识别物品名称和置信度 -->
              <div class="mb-6">
                <span class="font-mono text-xs uppercase tracking-widest opacity-50 block mb-2">{{ langText.wasteRecognition.featureExtracted }} / {{ langText.wasteRecognition.extracted }}</span>
                <h3 class="text-3xl font-bold flex items-center gap-3">
                  {{ analysisResult.itemName }}
                  <span class="text-xs font-mono font-normal px-2 py-1 rounded-sm text-white bg-black whitespace-nowrap">{{ langText.wasteRecognition.confidence }} {{ analysisResult.confidence }}%</span>
                </h3>
              </div>
              
              <!-- 垃圾分类信息卡片（带颜色标识） -->
              <div class="p-6 rounded border-l-4 mb-6 shadow-sm" :class="categoryColor(analysisResult.category)">
                <div class="flex items-center gap-4 mb-4">
                  <!-- 分类图标 -->
                  <div class="w-12 h-12 rounded flex items-center justify-center text-2xl text-white shadow-sm font-bold" :class="categoryBgColor(analysisResult.category)">
                    {{ categoryIcon(analysisResult.category) }}
                  </div>
                  <div>
                    <!-- 分类名称 -->
                    <h4 class="text-xl font-bold">{{ categoryLabel(analysisResult.category) }}</h4>
                    <p class="text-xs opacity-70 font-mono uppercase tracking-widest">{{ categoryEngLabel(analysisResult.category) }}</p>
                  </div>
                </div>
                <!-- 分类说明 -->
                <p class="text-sm leading-relaxed text-gray-700">{{ analysisResult.description }}</p>
              </div>

              <!-- 环保建议列表 -->
              <div class="flex-1 bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-md">
                <h4 class="font-bold mb-4 flex items-center gap-2">
                  <el-icon class="text-primary"><InfoFilled /></el-icon> {{ langText.wasteRecognition.ecoAdviceTitle }}
                </h4>
                <ul class="space-y-3">
                  <li v-for="(tip, idx) in analysisResult.tips" :key="idx" class="flex gap-3 text-sm text-gray-600 leading-relaxed">
                    <span class="text-primary mt-0.5">•</span>
                    <span>{{ tip }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// views/chat/WasteRecognitionView.vue - 垃圾分类 AI 识别页面
// 用户上传图片后，调用后端识别接口返回分类结果和环保建议
// ============================================================
import { ref, computed } from 'vue'
import { Camera, UploadFilled, Loading, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { analyzeWasteImage } from '@/services/wasteService'
import { langText } from '@/language'

// 拖拽悬停状态（控制上传区域的高亮效果）
const isDragging = ref(false)
const previewUrl = ref(null)        // 上传图片的预览 URL（Object URL）
const fileInput = ref(null)         // 文件 input DOM 引用
const isAnalyzing = ref(false)      // 是否正在「识别」中（显示扫描动画）
const analysisResult = ref(null)    // 识别结果对象

/** 处理拖拽放置事件 */
const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) processFile(file)
}

/** 处理文件 input 变更事件 */
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) processFile(file)
}

/**
 * 校验并处理用户选择的文件
 * 通过校验后创建预览 URL 并触发 AI 识别
 */
const processFile = (file) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error(langText.value.wasteRecognition.uploadImageError)
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error(langText.value.wasteRecognition.imageSizeError)
    return
  }
  
  previewUrl.value = URL.createObjectURL(file)
  analyzeImage(file)
}

/** 重置上传状态，清除预览和识别结果 */
const resetUpload = () => {
  previewUrl.value = null
  analysisResult.value = null
  if (fileInput.value) fileInput.value.value = ''
}

/** 调用后端 AI 图像识别接口 */
const analyzeImage = async (file) => {
  isAnalyzing.value = true
  analysisResult.value = null

  const result = await analyzeWasteImage(file)
  isAnalyzing.value = false

  if (!result.ok || !result.data) {
    ElMessage.error(result.message || langText.value.wasteRecognition.recognitionFailed)
    return
  }

  analysisResult.value = result.data
}

// ---- 分类样式映射工具函数 ----

// API 返回的中文分类名到 i18n key 的映射
const categoryKeyMap = {
  '可回收物': 'recyclable',
  '有害垃圾': 'hazardous',
  '厨余垃圾': 'food',
  '其他垃圾': 'residual',
}

/** 返回分类对应的左边框+背景色 CSS 类 */
const categoryColor = (cat) => {
  const map = {
    recyclable: 'border-blue-500 bg-blue-50/50',
    hazardous: 'border-red-500 bg-red-50/50',
    food: 'border-green-500 bg-green-50/50',
    residual: 'border-gray-500 bg-gray-50/50',
  }
  const key = categoryKeyMap[cat] || cat
  return map[key] || 'border-gray-500 bg-gray-50/50'
}

/** 返回分类图标圆形背景色 CSS 类 */
const categoryBgColor = (cat) => {
  const map = {
    recyclable: 'bg-blue-500',
    hazardous: 'bg-red-500',
    food: 'bg-green-500',
    residual: 'bg-gray-500',
  }
  const key = categoryKeyMap[cat] || cat
  return map[key] || 'bg-gray-500'
}

/** 返回分类对应的 Emoji 图标 */
const categoryIcon = (cat) => {
  const map = {
    recyclable: '♻️',
    hazardous: '☠️',
    food: '🍎',
    residual: '🗑️',
  }
  const key = categoryKeyMap[cat] || cat
  return map[key] || '📦'
}

/** 返回分类的国际化名称 */
const categoryLabel = (cat) => {
  const key = categoryKeyMap[cat] || cat
  return langText.value.wasteRecognition.categories[key] || cat
}

/** 返回分类的英文名称 */
const categoryEngLabel = (cat) => {
  const key = categoryKeyMap[cat] || cat
  return langText.value.wasteRecognition.categoryEng[key] || 'Unknown'
}
</script>

<style scoped>
/* 识别结果淡入动画 */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 图片扫描进度条动画 */
@keyframes scan {
  0% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
</style>

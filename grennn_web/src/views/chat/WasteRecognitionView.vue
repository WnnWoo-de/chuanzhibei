<template>
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans pt-24 px-6 pb-12 flex flex-col">
    <!-- Grid Background -->
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
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

          <h1 class="text-4xl md:text-5xl font-bold mt-2 mb-6">AI 识别<br />回收分类</h1>
          <p class="text-sm opacity-60 max-w-[200px] mb-8">
            上传物品图片，AI 将自动为您识别并建议正确的垃圾分类方式。
          </p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="col-span-12 md:col-span-9 flex flex-col h-full">
        <div class="bg-white border border-black/10 flex-1 flex flex-col md:flex-row relative overflow-hidden shadow-sm rounded-2xl">
          
          <!-- Upload Area -->
          <div class="flex-1 p-8 border-b md:border-b-0 md:border-r border-black/10 flex flex-col items-center justify-center relative bg-gray-50/30">
            <h2 class="text-2xl font-bold mb-6 flex items-center gap-3 self-start w-full">
              <el-icon><Camera /></el-icon>
              图像识别
            </h2>
            
            <div 
              class="w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden"
              :class="isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="$refs.fileInput.click()"
            >
              <input 
                type="file" 
                ref="fileInput" 
                class="hidden" 
                accept="image/*"
                @change="handleFileChange"
              />
              
              <template v-if="previewUrl">
                <img :src="previewUrl" class="w-full h-full object-contain relative z-10 p-2" />
                <div v-if="isAnalyzing" class="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center text-black backdrop-blur-sm">
                  <el-icon class="animate-spin text-4xl mb-2 text-primary"><Loading /></el-icon>
                  <p class="font-mono text-sm uppercase tracking-widest font-bold">AI 视觉分析中...</p>
                  <!-- Scanning effect -->
                  <div class="absolute top-0 left-0 w-full h-1 bg-primary animate-[scan_2s_linear_infinite] shadow-[0_0_8px_2px_rgba(46,125,50,0.8)]"></div>
                </div>
              </template>
              <template v-else>
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400 group-hover:text-primary transition-colors">
                  <el-icon size="24"><UploadFilled /></el-icon>
                </div>
                <p class="font-bold text-gray-700 mb-1 pointer-events-none">点击或拖拽上传图片</p>
                <p class="text-xs text-gray-500 font-mono pointer-events-none">支持 JPG, PNG 格式，最大 5MB</p>
              </template>
            </div>
            
            <div class="w-full mt-6" v-if="previewUrl && !isAnalyzing">
              <button 
                @click="resetUpload" 
                class="w-full py-3 bg-white border border-black/20 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
              >
                重新上传
              </button>
            </div>
          </div>

          <!-- Analysis Results -->
          <div class="flex-1 p-8 relative flex flex-col bg-white overflow-y-auto">
            <div v-if="!analysisResult && !isAnalyzing" class="flex-1 animate-fade-in flex flex-col">
              <div class="flex-1 bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-md">
                <h4 class="font-bold mb-4 flex items-center gap-2">
                  <el-icon class="text-primary"><InfoFilled /></el-icon> AI 绿色环保建议
                </h4>
                <ul class="space-y-3">
                  <li class="flex gap-3 text-sm text-gray-600 leading-relaxed">
                    <span class="text-primary mt-0.5">•</span>
                    <span>当前展示为默认演示建议；接入 AI 识别接口后，会根据上传图片内容动态生成更精准的分类建议。</span>
                  </li>
                  <li class="flex gap-3 text-sm text-gray-600 leading-relaxed">
                    <span class="text-primary mt-0.5">•</span>
                    <span>建议接入后端视觉模型与知识库（如分类规范、投放点规则），实现按城市与物品类型返回个性化环保建议。</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div v-else-if="analysisResult" class="flex-1 animate-fade-in flex flex-col">
              <div class="mb-6">
                <span class="font-mono text-xs uppercase tracking-widest opacity-50 block mb-2">特征提取完成 / Extracted</span>
                <h3 class="text-3xl font-bold flex items-center gap-3">
                  {{ analysisResult.itemName }}
                  <span class="text-xs font-mono font-normal px-2 py-1 rounded-sm text-white bg-black whitespace-nowrap">置信度 {{ analysisResult.confidence }}%</span>
                </h3>
              </div>
              
              <div class="p-6 rounded border-l-4 mb-6 shadow-sm" :class="categoryColor(analysisResult.category)">
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-12 h-12 rounded flex items-center justify-center text-2xl text-white shadow-sm font-bold" :class="categoryBgColor(analysisResult.category)">
                    {{ categoryIcon(analysisResult.category) }}
                  </div>
                  <div>
                    <h4 class="text-xl font-bold">{{ analysisResult.category }}</h4>
                    <p class="text-xs opacity-70 font-mono uppercase tracking-widest">{{ categoryEng(analysisResult.category) }}</p>
                  </div>
                </div>
                <p class="text-sm leading-relaxed text-gray-700">{{ analysisResult.description }}</p>
              </div>
              
              <div class="flex-1 bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-md">
                <h4 class="font-bold mb-4 flex items-center gap-2">
                  <el-icon class="text-primary"><InfoFilled /></el-icon> AI 环保建议
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
// 用户上传图片后，模拟 AI 识别物品类型并返回分类结果和环保建议
// 当前为本地 mock 识别逻辑，可替换为后端 /api/v1/classify 接口
// ============================================================
import { ref } from 'vue'
import { Camera, UploadFilled, Loading, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

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
    ElMessage.error('请上传图片文件')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 5MB')
    return
  }
  
  previewUrl.value = URL.createObjectURL(file)
  analyzeImage(file.name)
}

/** 重置上传状态，清除预览和识别结果 */
const resetUpload = () => {
  previewUrl.value = null
  analysisResult.value = null
  if (fileInput.value) fileInput.value.value = ''
}

/**
 * 模拟 AI 图像识别（本地 mock）
 * 根据文件名关键词匹配预设分类结果
 * 生产环境可替换为 POST /api/v1/classify 接口调用
 * @param filename - 上传文件的文件名
 */
const analyzeImage = async (filename) => {
  isAnalyzing.value = true
  analysisResult.value = null
  
  // 模拟识别延迟
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const keywords = filename.toLowerCase()
  let result = {}
  
  // 简单的伪识别逻辑
  if (keywords.includes('bottle') || keywords.includes('瓶') || keywords.includes('塑料')) {
    result = {
      itemName: '塑料瓶 / 玻璃瓶',
      confidence: 96,
      category: '可回收物',
      description: '适宜回收和资源化利用的废弃物。塑料瓶属于可回收的高价值废弃物。',
      tips: [
        '请清空瓶内残留液体并用水简单冲洗。',
        '建议压扁后投放，以节省回收桶空间。',
        '如果是玻璃瓶，请小心轻放避免破碎。'
      ]
    }
  } else if (keywords.includes('battery') || keywords.includes('电池')) {
    result = {
      itemName: '废旧电池',
      confidence: 94,
      category: '有害垃圾',
      description: '含有毒有害化学物质的垃圾。会对土壤和地下水造成严重污染。',
      tips: [
        '请勿破坏电池外壳，防止有害物质泄漏。',
        '必须投放到专门的红色有害垃圾桶中或寻找特定的回收点。',
        '建议日常生活中使用可充电电池代替一次性干电池。'
      ]
    }
  } else if (keywords.includes('apple') || keywords.includes('果') || keywords.includes('food')) {
    result = {
      itemName: '水果残余 / 厨余',
      confidence: 98,
      category: '厨余垃圾',
      description: '家庭或饮食服务产生的易腐性垃圾。可以通过生物技术转化为有机肥料。',
      tips: [
        '请沥干水分后投放。',
        '不要连带塑料袋一起投入，需破袋投放。',
        '您也可以尝试在阳台使用这些果皮自制环保酵素或堆肥。'
      ]
    }
  } else {
    // 随机一个结果作为演示，让体验更好
    const random = Math.random()
    if (random < 0.33) {
      result = {
        itemName: '纸制品 / 快递箱',
        confidence: 89,
        category: '可回收物',
        description: '未被严重污染的纸质废弃物，可回收再造。',
        tips: [
          '请撕掉快递箱上的胶带和快递单。',
          '将纸箱拆解、压扁打捆后投放。',
          '严重沾染食物油渍的纸张（如披萨盒）不可回收，属于其他垃圾。'
        ]
      }
    } else if (random < 0.66) {
      result = {
        itemName: '污损物 / 混合垃圾',
        confidence: 82,
        category: '其他垃圾',
        description: '除有害垃圾、可回收物、厨余垃圾外的其他生活废弃物。',
        tips: [
          '如果受到严重污染且难以清洗，应直接作为其他垃圾处理。',
          '尽量沥干水分后投放到灰色其他垃圾桶，这些垃圾通常会被焚烧发电。'
        ]
      }
    } else {
      result = {
          itemName: '废旧衣物 / 织物',
          confidence: 91,
          category: '可回收物',
          description: '未经严重污染的纺织类废弃物。',
          tips: [
            '请洗净、晾干后再投入专门的旧衣物回收箱。',
            '可以考虑捐赠给需要的群体。',
            '您也可以在我们的「旧物重构」板块寻找改造灵感！'
          ]
      }
    }
  }
  
  analysisResult.value = result
  isAnalyzing.value = false
}

// ---- 分类样式映射工具函数 ----
/** 返回分类对应的左边框+背景色 CSS 类 */
const categoryColor = (cat) => {
  const map = {
    '可回收物': 'border-blue-500 bg-blue-50/50',
    '有害垃圾': 'border-red-500 bg-red-50/50',
    '厨余垃圾': 'border-green-500 bg-green-50/50',
    '其他垃圾': 'border-gray-500 bg-gray-50/50'
  }
  return map[cat] || 'border-gray-500 bg-gray-50/50'
}

/** 返回分类图标圆形背景色 CSS 类 */
const categoryBgColor = (cat) => {
  const map = {
    '可回收物': 'bg-blue-500',
    '有害垃圾': 'bg-red-500',
    '厨余垃圾': 'bg-green-500',
    '其他垃圾': 'bg-gray-500'
  }
  return map[cat] || 'bg-gray-500'
}

/** 返回分类对应的 Emoji 图标 */
const categoryIcon = (cat) => {
  const map = {
    '可回收物': '♻️',
    '有害垃圾': '☠️',
    '厨余垃圾': '🍎',
    '其他垃圾': '🗑️'
  }
  return map[cat] || '📦'
}

/** 返回分类的英文名称 */
const categoryEng = (cat) => {
  const map = {
    '可回收物': 'Recyclable Waste',
    '有害垃圾': 'Hazardous Waste',
    '厨余垃圾': 'Food Waste',
    '其他垃圾': 'Residual Waste'
  }
  return map[cat] || 'Unknown'
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scan {
  0% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
</style>

<template>
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans pt-24 px-6 pb-12">
    <!-- Grid Background -->
    <div
      class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6"
    >
      <div v-for="n in 12" :key="n" class="border-r border-black h-full"></div>
    </div>

    <div class="relative z-10 max-w-6xl mx-auto">
      <!-- 成就页面头部：标题、总积分 -->
      <header class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 class="text-4xl md:text-5xl font-bold mt-2 mb-2">{{ langText.achievements.title }}</h1>
          <p class="text-gray-600">{{ langText.achievements.subtitle }}</p>
        </div>
        <div class="text-left md:text-right bg-white/80 backdrop-blur-md p-4 border border-black/10 rounded-2xl shadow-xl">
          <p class="text-xs font-mono opacity-50 mb-1">{{ langText.achievements.totalPoints }}</p>
          <p class="text-4xl font-bold text-primary">{{ totalPoints }}</p>
        </div>
      </header>

      <!-- 等级进度条 -->
      <div class="bg-white/80 backdrop-blur-md p-6 border border-black/10 mb-8 relative overflow-hidden shadow-xl rounded-2xl">
        <div class="absolute top-4 right-4 font-mono text-xs opacity-20">
          LEVEL_{{ currentLevel }}
        </div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <el-icon class="text-primary"><Medal /></el-icon>
            {{ levelData[currentLevel].name }}
          </h3>
          <span class="text-xs font-mono opacity-50">{{ langText.achievements.level }} {{ currentLevel }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
          <div
            class="bg-gradient-to-r from-green-500 to-primary h-4 rounded-full transition-all duration-700 ease-out relative"
            :style="`width: ${progressPercent}%`"
          >
            <div class="absolute inset-0 bg-white/20 animate-shimmer"></div>
          </div>
        </div>
        <p class="text-sm text-gray-600 text-right">
          {{ totalPoints }} / {{ levelData[currentLevel].nextLevelPoints }}
          <span class="opacity-50"
            >{{ langText.achievements.nextLevel }}
            {{ Math.max(0, levelData[currentLevel].nextLevelPoints - totalPoints) }}
            {{ langText.achievements.pointsUnit }}</span
          >
        </p>
      </div>

      <!-- 筛选标签：全部/已解锁/未解锁 -->
      <div class="flex gap-4 mb-6 overflow-x-auto pb-2">
        <button
          v-for="filterKey in filterKeys"
          :key="filterKey.key"
          @click="activeFilter = filterKey.key"
          class="px-4 py-2 text-sm font-mono whitespace-nowrap border transition-colors rounded-sm"
          :class="
            activeFilter === filterKey.key
              ? 'bg-black text-white border-black'
              : 'bg-white border-black/10 hover:border-black/30'
          "
        >
          {{ filterKey.label }} ({{ getFilteredBadges(filterKey.key).length }})
        </button>
      </div>

      <!-- 徽章网格展示 -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        <transition-group name="badge-list">
          <div
            v-for="(badge, index) in filteredBadges"
            :key="badge.id"
            @click="openBadgeDetail(badge)"
            class="flex flex-col items-center p-4 bg-white/80 backdrop-blur-md border border-black/10 group hover:shadow-2xl transition-all duration-500 cursor-pointer relative rounded-2xl shadow-lg hover:-translate-y-1"
            :class="{ 'opacity-60 grayscale': !badge.unlocked }"
            :style="`transition-delay: ${index * 50}ms`"
          >
            <!-- Badge Icon Circle -->
            <div
              class="h-20 w-20 rounded-full flex items-center justify-center mb-3 relative group-hover:scale-110 transition-transform duration-300"
              :class="badge.unlocked ? badge.bgColor : 'bg-gray-100'"
            >
              <el-icon :size="32" :class="badge.unlocked ? badge.iconColor : 'text-gray-400'">
                <component :is="iconMap[badge.icon]" />
              </el-icon>

              <!-- Unlock Effect -->
              <div
                v-if="badge.unlocked"
                class="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/20 transition-colors"
              ></div>

              <!-- Lock Overlay -->
              <div
                v-else
                class="absolute inset-0 rounded-full bg-black/5 flex items-center justify-center"
              >
                <el-icon :size="16" class="text-gray-400"><Lock /></el-icon>
              </div>
            </div>

            <h4 class="font-bold text-sm text-center mb-1">{{ badge.name }}</h4>
            <p class="text-xs text-center text-gray-500 line-clamp-2 mb-2">
              {{ badge.description }}
            </p>

            <!-- Badge Points -->
            <div class="mt-auto pt-2 border-t border-black/5 w-full text-center">
              <span
                class="text-xs font-mono"
                :class="badge.unlocked ? 'text-primary' : 'text-gray-400'"
              >
                +{{ badge.points }} {{ langText.achievements.pointsUnit }}
              </span>
            </div>

            <!-- Progress Bar for locked badges with progress -->
            <div v-if="!badge.unlocked && badge.progress !== undefined" class="w-full mt-2">
              <div class="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary transition-all duration-500"
                  :style="`width: ${(badge.progress / badge.target) * 100}%`"
                ></div>
              </div>
              <p class="text-[10px] text-center text-gray-400 mt-1">
                {{ badge.progress }} / {{ badge.target }}
              </p>
            </div>
          </div>
        </transition-group>
      </div>

      <!-- 空状态提示 -->
      <div v-if="filteredBadges.length === 0" class="text-center py-16 col-span-full">
        <el-icon :size="64" class="text-gray-300 mb-4"><Box /></el-icon>
        <p class="text-gray-500">{{ langText.achievements.emptyPrefix }}{{ filterLabel(activeFilter) }}{{ langText.achievements.emptySuffix }}</p>
      </div>
    </div>

    <!-- 成就解锁庆祝动画 -->
    <transition name="celebrate">
      <div
        v-if="showCelebration && celebrateBadge"
        class="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
      >
        <div class="bg-white/90 backdrop-blur-md border-2 border-primary shadow-2xl p-10 rounded-2xl text-center max-w-sm mx-4 animate-bounce-in pointer-events-auto">
          <div
            class="h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            :class="celebrateBadge.bgColor"
          >
            <el-icon :size="48" :class="celebrateBadge.iconColor">
              <component :is="iconMap[celebrateBadge.icon]" />
            </el-icon>
          </div>
          <p class="text-xs font-mono uppercase tracking-widest text-primary mb-2">🎉 {{ langText.achievements.achievementUnlocked }}</p>
          <h3 class="text-2xl font-bold mb-2">{{ celebrateBadge.name }}</h3>
          <p class="text-sm text-gray-500 mb-4">{{ celebrateBadge.description }}</p>
          <span class="inline-block bg-primary text-white text-sm font-bold px-4 py-1 rounded-full">+{{ celebrateBadge.points }} {{ langText.achievements.pointsLabel }}</span>
        </div>
      </div>
    </transition>

    <!-- 徽章详情对话框 -->
    <el-dialog v-model="showBadgeDialog" :width="500" align-center>
      <template v-if="selectedBadge">
        <div class="text-center p-4">
          <div
            class="h-32 w-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
            :class="selectedBadge.unlocked ? selectedBadge.bgColor : 'bg-gray-100'"
          >
            <el-icon
              :size="64"
              :class="selectedBadge.unlocked ? selectedBadge.iconColor : 'text-gray-400'"
            >
              <component :is="iconMap[selectedBadge.icon]" />
            </el-icon>
          </div>

          <h2 class="text-2xl font-bold mb-2">{{ selectedBadge.name }}</h2>
          <p class="text-gray-600 mb-6">{{ selectedBadge.description }}</p>

          <div class="bg-gray-50 p-4 rounded mb-6 text-left border border-black/5">
            <h4 class="font-bold text-sm mb-2 text-black/70 uppercase tracking-wider font-mono">
              {{ langText.achievements.requirementTitle }}
            </h4>
            <p class="text-sm text-gray-600">{{ selectedBadge.requirement }}</p>
          </div>

          <div class="flex items-center justify-between border-t border-black/10 pt-4">
            <div class="text-left">
              <p class="text-xs text-gray-500 font-mono uppercase">{{ langText.achievements.rewardPoints }}</p>
              <p class="text-2xl font-bold text-primary">+{{ selectedBadge.points }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500 font-mono uppercase mb-1">{{ langText.achievements.status }}</p>
              <span
                class="inline-block px-3 py-1 rounded-full text-xs font-bold"
                :class="
                  selectedBadge.unlocked
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                "
              >
                {{ selectedBadge.unlocked ? langText.achievements.unlocked : langText.achievements.locked }}
              </span>
            </div>
          </div>

          <div
            v-if="selectedBadge.unlocked && selectedBadge.unlockedDate"
            class="mt-4 text-xs text-gray-400 font-mono"
          >
            {{ langText.achievements.unlockedAt }} {{ selectedBadge.unlockedDate }}
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// ============================================================
// views/achievements/AchievementsView.vue - 成就系统页面
// 展示等级进度条和徽章网格（已解锁/未解锁/全部 三种过滤视图）
// 监听全局 badge:unlocked 事件，触发庆祝动画并同步徽章状态
// ============================================================
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  Medal,
  Lock,
  Box,
  Sunrise,
  ChatDotSquare,
  Refresh,
  Compass,
  TrophyBase,
  Promotion,
  GoldMedal,
  Present,
  Share,
  Reading,
  Lightning,
  MagicStick,
  Star,
  Sunny,
  Trophy,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { fetchAchievements } from '@/services/achievementService'
import { langText } from '@/language'

// 图标名称 → Element Plus 图标组件 的映射（供徽章动态渲染使用）
const iconMap = {
  Medal,
  Sunrise,
  ChatDotSquare,
  Refresh,
  Compass,
  TrophyBase,
  Promotion,
  GoldMedal,
  Present,
  Share,
  Reading,
  Lightning,
  MagicStick,
  Star,
  Planet: Sunny,
  Trophy,
}

const userStore = useUserStore()
const activeFilter = ref('all')       // 当前筛选标签（all/unlocked/locked）
const showBadgeDialog = ref(false)   // 徽章详情对话框可见性
const selectedBadge = ref(null)      // 当前选中查看详情的徽章

/** 用户总积分（从 userStore 读取，fallback 为 0） */
const totalPoints = computed(() => {
  const points = Number(userStore.user?.points)
  return Number.isFinite(points) ? points : 0
})

/** 筛选标签键列表（带翻译显示名） */
const filterKeys = computed(() => {
  const t = langText.value.achievements
  return [
    { key: 'all', label: t.filterAll },
    { key: 'unlocked', label: t.filterUnlocked },
    { key: 'locked', label: t.filterLocked },
  ]
})

/** 根据筛选键返回翻译后的标签文本 */
const filterLabel = (key) => {
  const found = filterKeys.value.find(f => f.key === key)
  return found ? found.label : key
}

// ---- 等级系统配置 ----
// 每个等级的名称和升级所需积分阈值
const levelData = computed(() => ({
  1: { name: langText.value.achievements.levels[1], nextLevelPoints: 500 },
  2: { name: langText.value.achievements.levels[2], nextLevelPoints: 1000 },
  3: { name: langText.value.achievements.levels[3], nextLevelPoints: 2000 },
  4: { name: langText.value.achievements.levels[4], nextLevelPoints: 4000 },
  5: { name: langText.value.achievements.levels[5], nextLevelPoints: 10000 },
}))

/** 根据总积分计算当前等级（1~5） */
const currentLevel = computed(() => {
  const points = totalPoints.value
  if (points >= 4000) return 5
  if (points >= 2000) return 4
  if (points >= 1000) return 3
  if (points >= 500) return 2
  return 1
})

/** 当前等级的进度百分比（用于进度条宽度） */
const progressPercent = computed(() => {
  const level = currentLevel.value
  if (level === 5) return 100
  const levels = levelData.value
  const prev = level > 1 ? levels[level - 1].nextLevelPoints : 0
  const next = levels[level].nextLevelPoints
  return Math.min(100, Math.max(0, ((totalPoints.value - prev) / (next - prev)) * 100))
})

// ---- 徽章数据（默认值，初次加载时写入 userStore.badges） ----
// 非文本属性（icon, points, unlocked, bgColor, iconColor, progress, target, unlockedDate）按 id 索引
const badgeMeta = [
  { id: 1, icon: 'Sunrise', points: 50, unlocked: true, bgColor: 'bg-green-100', iconColor: 'text-green-600', unlockedDate: '2025-11-28' },
  { id: 2, icon: 'ChatDotSquare', points: 100, unlocked: true, bgColor: 'bg-blue-100', iconColor: 'text-blue-600', unlockedDate: '2025-11-30' },
  { id: 3, icon: 'Refresh', points: 200, unlocked: false, bgColor: 'bg-purple-100', iconColor: 'text-purple-600', progress: 3, target: 10 },
  { id: 4, icon: 'Compass', points: 300, unlocked: false, bgColor: 'bg-orange-100', iconColor: 'text-orange-600', progress: 150, target: 100 },
  { id: 5, icon: 'Share', points: 150, unlocked: true, bgColor: 'bg-pink-100', iconColor: 'text-pink-600', unlockedDate: '2025-12-01' },
  { id: 6, icon: 'Reading', points: 100, unlocked: false, bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600', progress: 15, target: 20 },
  { id: 7, icon: 'Lightning', points: 250, unlocked: false, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  { id: 8, icon: 'MagicStick', points: 200, unlocked: false, bgColor: 'bg-cyan-100', iconColor: 'text-cyan-600', progress: 45, target: 100 },
  { id: 9, icon: 'Star', points: 300, unlocked: false, bgColor: 'bg-rose-100', iconColor: 'text-rose-600' },
  { id: 10, icon: 'Trophy', points: 500, unlocked: false, bgColor: 'bg-amber-100', iconColor: 'text-amber-600', progress: 12, target: 30 },
  { id: 11, icon: 'Promotion', points: 400, unlocked: false, bgColor: 'bg-teal-100', iconColor: 'text-teal-600' },
  { id: 12, icon: 'GoldMedal', points: 1000, unlocked: false, bgColor: 'bg-yellow-200', iconColor: 'text-yellow-700', progress: 1250, target: 5000 },
  { id: 13, icon: 'Present', points: 200, unlocked: false, bgColor: 'bg-red-100', iconColor: 'text-red-600' },
  { id: 14, icon: 'Planet', points: 2000, unlocked: false, bgColor: 'bg-blue-200', iconColor: 'text-blue-700' },
  { id: 15, icon: 'TrophyBase', points: 5000, unlocked: false, bgColor: 'bg-gradient-to-br from-yellow-200 to-orange-300', iconColor: 'text-orange-700' },
]

const defaultBadges = computed(() => {
  const badges = langText.value.achievements.badges
  return badgeMeta.map((meta, i) => ({
    ...meta,
    ...(badges[i] || {}),
  }))
})

/** 当前过滤后的徽章列表（响应 activeFilter 变化） */
const filteredBadges = computed(() => {
  return getFilteredBadges(activeFilter.value)
})

/**
 * 按类别过滤徽章列表
 * 优先使用 userStore.badges，若为空则使用 defaultBadges
 * @param category - 'all' | 'unlocked' | 'locked'
 */
const getFilteredBadges = (category) => {
  const currentBadges = userStore.badges.length > 0 ? userStore.badges : defaultBadges.value
  if (category === 'unlocked') {
    return currentBadges.filter((b) => b.unlocked)
  } else if (category === 'locked') {
    return currentBadges.filter((b) => !b.unlocked)
  }
  return currentBadges
}

/** 打开徽章详情对话框 */
const openBadgeDetail = (badge) => {
  selectedBadge.value = badge
  showBadgeDialog.value = true
}

// ---- 成就解锁庆祝动画 ----
const celebrateBadge = ref(null)    // 触发庆祝的徽章对象
const showCelebration = ref(false)  // 庆祝动画可见性

/**
 * 处理全局 badge:unlocked 事件
 * 显示 3.5s 的庆祝弹窗并同步 userStore.badges 中的徽章状态
 */
const handleBadgeUnlocked = (event) => {
  const { badge } = event.detail
  celebrateBadge.value = badge
  showCelebration.value = true
  // 同步到本地 badges 数组
  const idx = userStore.badges.findIndex(b => b.id === badge.id)
  if (idx >= 0) userStore.badges[idx] = badge
  setTimeout(() => { showCelebration.value = false }, 3500)
}

// 组件挂载：初始化用户状态，优先拉取后端成就数据，失败时回退到本地默认数据
onMounted(async () => {
  await userStore.init()
  const result = await fetchAchievements()
  if (result.ok && result.items.length > 0) {
    userStore.badges = result.items.map((badge) => ({
      ...badge,
      icon: badge.icon || defaultBadges.value.find((item) => item.code === badge.code || item.id === badge.id)?.icon || 'Medal',
      bgColor:
        defaultBadges.value.find((item) => item.code === badge.code || item.id === badge.id)?.bgColor ||
        (badge.unlocked ? 'bg-green-100' : 'bg-gray-100'),
      iconColor:
        defaultBadges.value.find((item) => item.code === badge.code || item.id === badge.id)?.iconColor ||
        (badge.unlocked ? 'text-green-600' : 'text-gray-400'),
      unlockedDate: badge.unlockedAt ? String(badge.unlockedAt).slice(0, 10) : '',
    }))
    userStore.save()
  } else if (userStore.badges.length === 0) {
    userStore.badges = defaultBadges.value
    userStore.save()
  }
  window.addEventListener('badge:unlocked', handleBadgeUnlocked)
})

// 组件卸载时移除全局事件监听，防止内存泄漏
onUnmounted(() => {
  window.removeEventListener('badge:unlocked', handleBadgeUnlocked)
})

// 监听积分变化，自动同步有进度追踪的徽章进度条
// 黄金成就（id=12）和可持续冠军（id=15）的 progress 与积分同步
watch(
  () => userStore.user?.points,
  (newPoints) => {
    if (!newPoints) return
    // 更新有进度追踪的徽章进度
    const currentBadges = userStore.badges.length > 0 ? userStore.badges : defaultBadges.value
    const points = Number(newPoints)
    // 黄金成就：积分进度同步
    const goldBadge = currentBadges.find(b => b.id === 12)
    if (goldBadge && !goldBadge.unlocked) goldBadge.progress = Math.min(points, goldBadge.target)
    // 可持续冠军：积分进度同步
    const champBadge = currentBadges.find(b => b.id === 15)
    if (champBadge && !champBadge.unlocked) champBadge.progress = Math.min(points, champBadge.target)
  },
  { immediate: true }
)
</script>

<style scoped>
/* 进度条闪光动画 */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

/* 庆祝弹窗弹入动画 */
@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.08); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.animate-bounce-in {
  animation: bounceIn 0.6s cubic-bezier(0.215, 0.61, 0.355, 1) both;
}

.celebrate-enter-active {
  animation: bounceIn 0.5s ease;
}
.celebrate-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.celebrate-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

/* 徽章列表过渡动画 */
.badge-list-move,
.badge-list-enter-active,
.badge-list-leave-active {
  transition: all 0.5s ease;
}
.badge-list-enter-from {
  opacity: 0;
  transform: scale(0.8);
}
.badge-list-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

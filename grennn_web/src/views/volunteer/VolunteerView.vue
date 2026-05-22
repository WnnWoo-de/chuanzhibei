<template>
  <!-- 志愿活动页面根容器 -->
  <div class="vol-root bg-transparent min-h-screen text-[#1a1a1a] font-sans pt-24 px-6 pb-16">
    <!-- 背景装饰：蓝色光晕效果 -->
    <div class="fixed top-32 right-0 w-[28rem] h-[28rem] rounded-full pointer-events-none blur-3xl opacity-[0.04]" style="background:radial-gradient(circle,#3b82f6,transparent)"></div>
    <div class="fixed bottom-0 left-16 w-80 h-80 rounded-full pointer-events-none blur-3xl opacity-[0.05]" style="background:radial-gradient(circle,#93c5fd,transparent)"></div>
    <!-- 背景网格线装饰 -->
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-[0.06] z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-primary h-full"></div>
    </div>

    <!-- 主内容区域：12列网格布局 -->
    <div class="relative z-10 grid grid-cols-12 gap-6 lg:gap-10">
      <!-- 左侧边栏（3列宽） -->
      <aside class="col-span-12 md:col-span-3">
        <div class="sticky top-24 space-y-5">

          <!-- 页面标题区域 -->
          <div class="animate-fade-in-up">
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/60 mb-2">04. VOLUNTEER</p>
            <h1 class="text-5xl font-bold leading-none tracking-tighter mb-3">{{ langText.volunteer.titleLine1 }}<br>{{ langText.volunteer.titleLine2 }}</h1>
            <p class="text-sm text-gray-500 leading-relaxed max-w-[200px]">{{ langText.volunteer.subtitle }}</p>
          </div>

          <!-- 积分卡片：显示用户积分、志愿时长和参与次数 -->
          <div class="vol-points-card animate-fade-in-up delay-100">
            <!-- 卡片装饰光晕 -->
            <div class="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none" style="background:radial-gradient(circle,rgba(147,197,253,0.35),transparent)"></div>
            <div class="absolute right-4 bottom-4 w-20 h-20 rounded-full pointer-events-none" style="background:radial-gradient(circle,rgba(255,255,255,0.5),transparent)"></div>
            <div class="relative z-10 flex items-start justify-between mb-4">
              <div>
                <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-blue-500/60 mb-1">MY POINTS</p>
                <!-- 积分总数显示 -->
                <p class="text-5xl font-bold tabular-nums tracking-tighter text-blue-900">{{ totalPoints }}</p>
                <p class="font-mono text-[9px] text-blue-500/50 mt-0.5">{{ langText.volunteer.myPoints }}</p>
              </div>
              <!-- 积分进度环形图：以5000分为满值 -->
              <div class="relative w-14 h-14 shrink-0">
                <svg viewBox="0 0 40 40" class="w-14 h-14 -rotate-90">
                  <!-- 背景圆环 -->
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(96,165,250,0.2)" stroke-width="3"/>
                  <!-- 进度圆环：根据积分比例动态计算偏移量 -->
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#3b82f6" stroke-width="3"
                    stroke-dasharray="100.5"
                    :stroke-dashoffset="100.5 * (1 - Math.min(totalPoints / 5000, 1))"
                    stroke-linecap="round"
                    style="transition: stroke-dashoffset 1.2s cubic-bezier(0.19,1,0.22,1)"/>
                </svg>
                <!-- 中心百分比文字 -->
                <span class="absolute inset-0 flex items-center justify-center font-mono text-[9px] text-blue-700 font-bold">{{ Math.round(Math.min(totalPoints/5000,1)*100) }}%</span>
              </div>
            </div>
            <!-- 底部统计信息：志愿时长和参与次数 -->
            <div class="relative z-10 border-t border-blue-300/40 pt-4 grid grid-cols-2 gap-3">
              <div class="bg-white/50 rounded-xl p-3 backdrop-blur-sm">
                <p class="font-mono text-[8px] uppercase tracking-[0.18em] text-blue-500/60 mb-1">{{ langText.volunteer.volunteerHours }}</p>
                <p class="text-2xl font-bold text-blue-900">{{ myVolunteerHours }}<span class="text-xs text-blue-500/50 ml-1">h</span></p>
              </div>
              <div class="bg-white/50 rounded-xl p-3 backdrop-blur-sm">
                <p class="font-mono text-[8px] uppercase tracking-[0.18em] text-blue-500/60 mb-1">{{ langText.volunteer.joined }}</p>
                <p class="text-2xl font-bold text-blue-900">{{ myJoinedCount }}<span class="text-xs text-blue-500/50 ml-1">{{ langText.volunteer.times }}</span></p>
              </div>
            </div>
          </div>

          <!-- 我的活动列表：显示已报名的志愿活动 -->
          <div class="vol-sidebar-card animate-fade-in-up delay-200">
            <div class="vol-sidebar-card__header">
              <span>{{ langText.volunteer.myActivities }}</span>
              <div class="vol-sidebar-card__icon"><el-icon><Calendar /></el-icon></div>
            </div>
            <div v-if="myActivities.length === 0" class="text-center py-5">
              <div class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2"><span class="text-base">📋</span></div>
              <p class="text-xs text-gray-400 font-mono">{{ langText.volunteer.noActivities }}</p>
            </div>
            <ul v-else class="space-y-2">
              <li v-for="act in myActivities" :key="act.id"
                class="group flex items-start justify-between gap-2 p-2 rounded-xl hover:bg-black/[0.03] transition-colors">
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-xs truncate group-hover:text-primary transition-colors">{{ act.title }}</p>
                  <p class="font-mono text-[10px] text-gray-400 mt-0.5">{{ act.date }}</p>
                </div>
                <span class="shrink-0 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full" :class="statusClass(act.status)">{{ statusLabel(act.status) }}</span>
              </li>
            </ul>
          </div>

          <!-- 志愿者排行榜：按志愿时长排名 -->
          <div class="vol-sidebar-card animate-fade-in-up delay-300">
            <div class="vol-sidebar-card__header">
              <span>{{ langText.volunteer.leaderboard }}</span>
              <div class="vol-sidebar-card__icon vol-sidebar-card__icon--gold"><el-icon><TrophyBase /></el-icon></div>
            </div>
            <ul class="space-y-1">
              <li v-for="(u, i) in volunteerLeaderboard" :key="i"
                class="flex items-center justify-between text-xs hover:bg-black/[0.03] -mx-1 px-2 py-2 rounded-xl transition-colors cursor-default">
                <div class="flex items-center gap-2.5">
                  <span class="w-6 text-center shrink-0" :class="i < 3 ? 'text-sm' : 'font-mono text-[10px] text-gray-400'">
                    {{ i < 3 ? ['🥇','🥈','🥉'][i] : i + 1 }}
                  </span>
                  <span class="font-bold truncate max-w-[85px]">{{ u.name }}</span>
                </div>
                <span class="font-mono font-bold text-primary tabular-nums">{{ u.hours }}<span class="text-[9px] text-primary/50 ml-0.5">h</span></span>
              </li>
            </ul>
          </div>

          <!-- 积分规则说明 -->
          <div class="vol-rules-card animate-fade-in-up delay-400">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-1.5 h-1.5 rounded-full bg-primary animate-ping-slow"></div>
              <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-primary font-bold">{{ langText.volunteer.rules }}</p>
            </div>
            <ul class="space-y-2">
              <li class="flex items-start gap-2 text-xs text-gray-500"><span class="mt-1.5 w-1 h-1 rounded-full bg-primary/60 shrink-0"></span>{{ langText.volunteer.rule1 }}</li>
              <li class="flex items-start gap-2 text-xs text-gray-500"><span class="mt-1.5 w-1 h-1 rounded-full bg-primary/60 shrink-0"></span>{{ langText.volunteer.rule2 }}</li>
              <li class="flex items-start gap-2 text-xs text-gray-500"><span class="mt-1.5 w-1 h-1 rounded-full bg-primary/60 shrink-0"></span>{{ langText.volunteer.rule3 }}</li>
            </ul>
          </div>

        </div>
      </aside>
      <!-- 右侧主内容区域（9列宽） -->
      <main class="col-span-12 md:col-span-9">

        <!-- 搜索栏和分类筛选按钮 -->
        <div class="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in-up">
          <div class="flex-1">
            <el-input v-model="searchQuery" :placeholder="langText.volunteer.searchPlaceholder" clearable :prefix-icon="Search" />
          </div>
          <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button v-for="cat in categories" :key="cat.value" @click="activeCategory = cat.value"
              class="vol-filter-btn shrink-0" :class="activeCategory === cat.value ? 'vol-filter-btn--active' : ''">
              <span>{{ cat.icon }}</span><span>{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <!-- 积分兑换横幅：引导用户前往成就页面兑换奖励 -->
        <div class="vol-redeem-banner mb-8 animate-fade-in-up delay-200">
          <div class="absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-[0.12]" style="background:radial-gradient(circle,#4ADE80,transparent)"></div>
          <div class="absolute right-28 bottom-0 w-28 h-28 rounded-full opacity-[0.06]" style="background:radial-gradient(circle,#4ADE80,transparent)"></div>
          <div class="relative z-10">
            <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-blue-500/60 mb-1">{{ langText.volunteer.redeemTitle }}</p>
            <h3 class="text-lg font-bold text-blue-900 mb-1">{{ langText.volunteer.redeemHeading }}</h3>
            <p class="text-xs text-blue-700/60 max-w-xs leading-relaxed">{{ langText.volunteer.redeemDesc }}</p>
          </div>
          <router-link to="/achievements" class="vol-redeem-btn shrink-0 relative z-10">{{ langText.volunteer.redeemBtn }}</router-link>
        </div>

        <!-- 志愿活动卡片列表：带过渡动画效果 -->
        <transition-group name="card-list" tag="div" class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div v-for="activity in filteredActivities" :key="activity.id" class="vol-activity-card group">
            <div class="h-[3px] w-full absolute top-0 left-0 rounded-t-2xl" :class="categoryAccent(activity.category)"></div>
            <div class="p-6 flex flex-col flex-1">
              <div class="absolute top-5 right-5 font-mono text-[9px] text-primary/20 select-none">ACT #{{ String(activity.id).padStart(3,'0') }}</div>
              <div class="flex items-center gap-2 mb-4">
                <span class="vol-category-badge" :class="categoryBadgeClass(activity.category)">{{ activity.category }}</span>
                <span v-if="activity.urgent" class="vol-urgent-badge">⚡ {{ langText.volunteer.urgent }}</span>
              </div>
              <h3 class="text-base font-bold mb-2 group-hover:text-primary transition-colors duration-300 leading-snug pr-4">{{ activity.title }}</h3>
              <p class="text-sm text-gray-500 leading-relaxed mb-5 flex-1 line-clamp-2">{{ activity.description }}</p>
              <div class="grid grid-cols-2 gap-2 mb-4">
                <div class="vol-meta-cell">
                  <el-icon class="text-primary shrink-0" :size="11"><Calendar /></el-icon>
                  <span class="font-mono truncate text-[11px]">{{ activity.date }}</span>
                </div>
                <div class="vol-meta-cell">
                  <el-icon class="text-primary shrink-0" :size="11"><Location /></el-icon>
                  <span class="truncate text-[11px]">{{ activity.location }}</span>
                </div>
                <div class="vol-meta-cell">
                  <el-icon class="text-primary shrink-0" :size="11"><Timer /></el-icon>
                  <span class="text-[11px]">志愿 <strong class="text-black">{{ activity.hours }}</strong>h</span>
                </div>
                <div class="vol-meta-cell vol-meta-cell--points">
                  <span class="text-primary font-bold text-sm tabular-nums">+{{ activity.points }}</span>
                  <span class="font-mono text-[9px] text-primary/60">{{ langText.volunteer.pointsLabel }}</span>
                </div>
              </div>
              <div class="mb-5">
                <div class="flex justify-between font-mono text-[10px] mb-1.5">
                  <span class="text-gray-400">{{ langText.volunteer.enrollProgress }}</span>
                  <span :class="activity.enrolled >= activity.capacity ? 'text-red-400 font-bold' : 'text-gray-400'">{{ activity.enrolled }} / {{ activity.capacity }}</span>
                </div>
                <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700" :class="enrollmentColor(activity)"
                    :style="{width: Math.min(100,(activity.enrolled/activity.capacity)*100)+'%'}"></div>
                </div>
              </div>
              <div class="flex gap-2 pt-4 border-t border-primary/8">
                <button v-if="!isJoined(activity.id)" @click="openRegisterDialog(activity)"
                  :disabled="activity.enrolled >= activity.capacity"
                  class="flex-1 py-2.5 text-xs font-mono uppercase tracking-widest border rounded-xl transition-all duration-200"
                  :class="activity.enrolled >= activity.capacity
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                    : 'border-blue-400 text-blue-700 bg-blue-50/60 hover:bg-blue-400 hover:text-white hover:border-blue-400 shadow-sm hover:shadow-[0_4px_14px_rgba(96,165,250,0.4)]'"
                >{{ activity.enrolled >= activity.capacity ? langText.volunteer.full : langText.volunteer.registerNow }}</button>
                <button v-else @click="openLogHoursDialog(activity)"
                  class="flex-1 py-2.5 text-xs font-mono uppercase tracking-widest border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 rounded-xl"
                >{{ langText.volunteer.registered }}</button>
                <button @click="openDetailDialog(activity)"
                  class="px-4 py-2.5 text-xs font-mono uppercase tracking-widest border border-gray-200 text-gray-500 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-200 rounded-xl"
                >{{ langText.volunteer.detail }}</button>
              </div>
            </div>
          </div>
        </transition-group>

        <div v-if="filteredActivities.length === 0" class="text-center py-20">
          <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <el-icon :size="28" class="text-gray-300"><Sunrise /></el-icon>
          </div>
          <p class="text-gray-400 font-mono text-sm">{{ langText.volunteer.noMatch }}</p>
        </div>

      </main>
    </div>

    <!-- 报名对话框：填写手机号和备注信息进行志愿活动报名 -->
    <el-dialog v-model="showRegisterDialog" :title="langText.volunteer.registerDialog.title" :width="520" align-center>
      <div v-if="selectedActivity" class="space-y-5">
        <div class="bg-gray-50 border border-black/5 p-4 rounded-xl">
          <h4 class="font-bold mb-2 text-sm">{{ selectedActivity.title }}</h4>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-mono">
            <span>📅 {{ selectedActivity.date }}</span>
            <span>📍 {{ selectedActivity.location }}</span>
            <span>⏱ {{ selectedActivity.hours }}h</span>
            <span class="text-primary font-bold">+{{ selectedActivity.points }} {{ langText.volunteer.pointsLabel }}</span>
          </div>
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-mono uppercase tracking-widest opacity-50 mb-1">{{ langText.volunteer.registerDialog.phoneLabel }}</label>
            <el-input v-model="registerForm.phone" :placeholder="langText.volunteer.registerDialog.phonePlaceholder" />
          </div>
          <div>
            <label class="block text-xs font-mono uppercase tracking-widest opacity-50 mb-1">{{ langText.volunteer.registerDialog.noteLabel }}</label>
            <el-input v-model="registerForm.note" type="textarea" :rows="2" :placeholder="langText.volunteer.registerDialog.notePlaceholder" />
          </div>
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <el-checkbox v-model="registerForm.agreed" />
            <span>{{ langText.volunteer.registerDialog.agreement }}</span>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button @click="showRegisterDialog = false" class="border border-gray-200 px-6 py-2 text-sm hover:bg-gray-50 transition-colors rounded-lg">{{ langText.volunteer.registerDialog.cancel }}</button>
          <button @click="submitRegister" class="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-2 text-sm font-medium hover:from-blue-300 hover:to-blue-400 hover:shadow-[0_4px_14px_rgba(96,165,250,0.45)] hover:-translate-y-0.5 transition-all duration-200 rounded-lg">{{ langText.volunteer.registerDialog.confirm }}</button>
        </div>
      </div>
    </el-dialog>

    <!-- 记录时长对话框：记录实际志愿时长并计算获得积分 -->
    <el-dialog v-model="showLogHoursDialog" :title="langText.volunteer.logHoursDialog.title" :width="480" align-center>
      <div v-if="selectedActivity" class="space-y-5">
        <div class="bg-gray-50 border border-black/5 p-4 rounded-xl">
          <h4 class="font-bold text-sm mb-1">{{ selectedActivity.title }}</h4>
          <p class="text-xs text-gray-400 font-mono">{{ langText.volunteer.logHoursDialog.planHours }}{{ selectedActivity.hours }}h</p>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-mono uppercase tracking-widest opacity-50 mb-2">{{ langText.volunteer.logHoursDialog.actualLabel }}</label>
            <div class="flex items-center gap-4">
              <el-slider v-model="logForm.hours" :min="0.5" :max="selectedActivity.hours + 2" :step="0.5" class="flex-1" />
              <span class="font-bold text-xl w-12 text-right tabular-nums">{{ logForm.hours }}h</span>
            </div>
          </div>
          <div class="bg-primary/5 border border-primary/20 p-4 rounded-xl text-center">
            <p class="text-xs font-mono opacity-60 mb-1">{{ langText.volunteer.logHoursDialog.earnLabel }}</p>
            <p class="text-3xl font-bold text-primary tabular-nums">+{{ earnedPoints }}</p>
            <p class="text-xs opacity-50 mt-1 font-mono">{{ logForm.hours }}h × {{ selectedActivity.pointsPerHour }} {{ langText.volunteer.logHoursDialog.perHour }}</p>
          </div>
          <div>
            <label class="block text-xs font-mono uppercase tracking-widest opacity-50 mb-1">{{ langText.volunteer.logHoursDialog.reflectionLabel }}</label>
            <el-input v-model="logForm.reflection" type="textarea" :rows="3" :placeholder="langText.volunteer.logHoursDialog.reflectionPlaceholder" maxlength="200" show-word-limit />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button @click="showLogHoursDialog = false" class="border border-gray-200 px-6 py-2 text-sm hover:bg-gray-50 transition-colors rounded-lg">{{ langText.volunteer.logHoursDialog.cancel }}</button>
          <button @click="submitLogHours" class="bg-primary text-white px-6 py-2 text-sm hover:bg-green-700 transition-colors rounded-lg">{{ langText.volunteer.logHoursDialog.submit }}</button>
        </div>
      </div>
    </el-dialog>

    <!-- 活动详情对话框：显示活动完整信息 -->
    <el-dialog v-model="showDetailDialog" :title="langText.volunteer.detailDialog.title" :width="560" align-center>
      <div v-if="selectedActivity" class="space-y-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="vol-category-badge" :class="categoryBadgeClass(selectedActivity.category)">{{ selectedActivity.category }}</span>
              <span v-if="selectedActivity.urgent" class="text-[10px] font-mono uppercase px-2 py-1 rounded-full bg-red-100 text-red-600">{{ langText.volunteer.urgent }}</span>
            </div>
            <h3 class="text-xl font-bold">{{ selectedActivity.title }}</h3>
          </div>
          <div class="text-right shrink-0">
            <p class="text-2xl font-bold text-primary tabular-nums">+{{ selectedActivity.points }}</p>
            <p class="text-xs font-mono opacity-50">{{ langText.volunteer.detailDialog.pointsReward }}</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed">{{ selectedActivity.description }}</p>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-50 p-3 rounded-xl border border-black/5">
            <p class="text-[10px] font-mono uppercase opacity-40 mb-1">{{ langText.volunteer.detailDialog.activityTime }}</p>
            <p class="text-sm font-bold">{{ selectedActivity.date }}</p>
          </div>
          <div class="bg-gray-50 p-3 rounded-xl border border-black/5">
            <p class="text-[10px] font-mono uppercase opacity-40 mb-1">{{ langText.volunteer.detailDialog.activityLocation }}</p>
            <p class="text-sm font-bold">{{ selectedActivity.location }}</p>
          </div>
          <div class="bg-gray-50 p-3 rounded-xl border border-black/5">
            <p class="text-[10px] font-mono uppercase opacity-40 mb-1">{{ langText.volunteer.detailDialog.volunteerDuration }}</p>
            <p class="text-sm font-bold">{{ selectedActivity.hours }} {{ langText.volunteer.detailDialog.hours }}</p>
          </div>
          <div class="bg-gray-50 p-3 rounded-xl border border-black/5">
            <p class="text-[10px] font-mono uppercase opacity-40 mb-1">{{ langText.volunteer.detailDialog.remainingSlots }}</p>
            <p class="text-sm font-bold">{{ selectedActivity.capacity - selectedActivity.enrolled }} {{ langText.volunteer.detailDialog.people }}</p>
          </div>
        </div>
        <div class="bg-gray-50 p-3 rounded-xl border border-black/5">
          <p class="text-[10px] font-mono uppercase opacity-40 mb-1">{{ langText.volunteer.detailDialog.activityNotes }}</p>
          <p class="text-sm text-gray-600">{{ selectedActivity.notes || langText.volunteer.detailDialog.defaultNotes }}</p>
        </div>
        <div class="flex justify-end gap-2">
          <button @click="showDetailDialog = false" class="border border-gray-200 px-6 py-2 text-sm hover:bg-gray-50 transition-colors rounded-lg">{{ langText.volunteer.detailDialog.close }}</button>
          <button
            v-if="!isJoined(selectedActivity.id) && selectedActivity.enrolled < selectedActivity.capacity"
            @click="() => { showDetailDialog = false; openRegisterDialog(selectedActivity) }"
            class="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-2 text-sm font-medium hover:from-blue-300 hover:to-blue-400 hover:shadow-[0_4px_14px_rgba(96,165,250,0.45)] hover:-translate-y-0.5 transition-all duration-200 rounded-lg"
          >{{ langText.volunteer.registerNow }}</button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
// ============================================================
// views/volunteer/VolunteerView.vue - 志愿活动页面
// 功能：浏览志愿活动、报名参与、记录志愿时长并换取积分
// ============================================================
import { ref, computed, onMounted } from 'vue'
import { Calendar, Location, Timer, Sunrise, Search, TrophyBase } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { langText } from '@/language'

// 用户状态管理
const userStore = useUserStore()
// 搜索关键词
const searchQuery = ref('')
// 当前选中的活动分类
const activeCategory = ref('全部')
// 对话框显示状态
const showRegisterDialog = ref(false)
const showLogHoursDialog = ref(false)
const showDetailDialog = ref(false)
// 当前选中的活动
const selectedActivity = ref(null)
// 报名表单数据
const registerForm = ref({ phone: '', note: '', agreed: false })
// 记录时长表单数据
const logForm = ref({ hours: 2, reflection: '' })
// 已报名活动ID列表（从本地存储读取）
const joinedIds = ref(JSON.parse(localStorage.getItem('volunteer_joined') || '[]'))
// 志愿时长记录（从本地存储读取）
const volunteerLogs = ref(JSON.parse(localStorage.getItem('volunteer_logs') || '[]'))

// 计算属性：用户积分总数
const totalPoints = computed(() => Number(userStore.user?.points) || 0)
// 计算属性：累计志愿时长
const myVolunteerHours = computed(() => volunteerLogs.value.reduce((s, l) => s + (l.hours || 0), 0))
// 计算属性：已报名活动数量
const myJoinedCount = computed(() => joinedIds.value.length)
// 判断是否已报名某活动
const isJoined = (id) => joinedIds.value.includes(id)
// 计算属性：我报名的活动列表
const myActivities = computed(() => activities.value.filter(a => joinedIds.value.includes(a.id)))

// 活动分类列表
const categories = computed(() => [
  { label: langText.value.volunteer.categories.all, value: '全部', icon: '📋' },
  { label: langText.value.volunteer.categories.environment, value: '环境保护', icon: '🌳' },
  { label: langText.value.volunteer.categories.community, value: '社区清洁', icon: '🧹' },
  { label: langText.value.volunteer.categories.education, value: '教育支持', icon: '📚' },
  { label: langText.value.volunteer.categories.elderly, value: '关爱老人', icon: '🤝' },
])

// 活动数据：合并多语言文本和基础数据
const activities = computed(() => {
  const t = langText.value.volunteer
  // 活动基础数据（日期、时长、积分、报名人数等）
  const base = [
    { date:'2026-04-05 09:00', hours:3, points:90, pointsPerHour:30, enrolled:18, capacity:30, urgent:false, status:'confirmed' },
    { date:'2026-04-12 08:30', hours:4, points:160, pointsPerHour:40, enrolled:25, capacity:25, urgent:true, status:'confirmed' },
    { date:'2026-04-19 14:00', hours:2, points:80, pointsPerHour:40, enrolled:8, capacity:15, urgent:false, status:'pending' },
    { date:'2026-04-26 09:00', hours:3, points:90, pointsPerHour:30, enrolled:12, capacity:40, urgent:false, status:'pending' },
    { date:'2026-05-03 10:00', hours:2, points:60, pointsPerHour:30, enrolled:6, capacity:10, urgent:false, status:'pending' },
    { date:'2026-05-10 09:30', hours:2, points:50, pointsPerHour:25, enrolled:5, capacity:20, urgent:false, status:'pending' },
  ]
  // 将多语言文本与基础数据合并，生成完整活动对象
  return t.activities.map((item, i) => ({ id: i + 1, ...item, ...base[i] }))
})

// 志愿者排行榜数据
const volunteerLeaderboard = ref([
  { name: 'EcoWarrior', hours: 48 },
  { name: 'GreenStar', hours: 36 },
  { name: 'Sarah J.', hours: 29 },
  { name: 'Mike Chen', hours: 21 },
  { name: 'Emma W.', hours: 18 },
])

// 计算属性：根据分类和搜索关键词筛选活动
const filteredActivities = computed(() => {
  let list = activities.value
  // 按分类筛选
  if (activeCategory.value !== '全部') list = list.filter(a => a.category === activeCategory.value)
  // 按关键词搜索（匹配标题或地点）
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(a => a.title.toLowerCase().includes(q) || a.location.toLowerCase().includes(q))
  }
  return list
})

// 计算属性：根据时长计算获得积分
const earnedPoints = computed(() => !selectedActivity.value ? 0 : Math.round(logForm.value.hours * selectedActivity.value.pointsPerHour))

// 状态标签样式类
const statusClass = (s) => ({ pending:'bg-yellow-100 text-yellow-700', confirmed:'bg-green-100 text-green-700', completed:'bg-blue-100 text-blue-700' }[s] || 'bg-gray-100 text-gray-500')
// 状态标签文字（多语言）
const statusLabel = (s) => ({ pending: langText.value.volunteer.status.pending, confirmed: langText.value.volunteer.status.confirmed, completed: langText.value.volunteer.status.completed }[s] || s)
// 分类徽章样式类
const categoryBadgeClass = (c) => ({ '环境保护':'bg-green-100 text-green-700', '社区清洁':'bg-blue-100 text-blue-700', '教育支持':'bg-purple-100 text-purple-700', '关爱老人':'bg-orange-100 text-orange-700' }[c] || 'bg-gray-100 text-gray-600')
// 报名进度条颜色（满员红色，80%以上橙色，否则绿色）
const enrollmentColor = (a) => { const r = a.enrolled/a.capacity; return r>=1?'bg-red-400':r>=0.8?'bg-orange-400':'bg-primary' }
// 分类顶部装饰条渐变色
const categoryAccent = (cat) => ({ '环境保护':'bg-gradient-to-r from-green-400 to-emerald-500', '社区清洁':'bg-gradient-to-r from-blue-400 to-sky-500', '教育支持':'bg-gradient-to-r from-purple-400 to-violet-500', '关爱老人':'bg-gradient-to-r from-orange-400 to-amber-500' }[cat] || 'bg-gradient-to-r from-gray-300 to-gray-400')

// 打开报名对话框
const openRegisterDialog = (a) => { selectedActivity.value = a; registerForm.value = { phone:'', note:'', agreed:false }; showRegisterDialog.value = true }
// 打开记录时长对话框
const openLogHoursDialog = (a) => { selectedActivity.value = a; logForm.value = { hours: a.hours, reflection:'' }; showLogHoursDialog.value = true }
// 打开活动详情对话框
const openDetailDialog = (a) => { selectedActivity.value = a; showDetailDialog.value = true }

// 提交报名
const submitRegister = () => {
  // 表单验证：手机号必填
  if (!registerForm.value.phone.trim()) { ElMessage.warning(langText.value.volunteer.messages.phoneRequired); return }
  // 表单验证：必须同意协议
  if (!registerForm.value.agreed) { ElMessage.warning(langText.value.volunteer.messages.agreementRequired); return }
  const act = selectedActivity.value
  // 将活动添加到已报名列表
  if (!joinedIds.value.includes(act.id)) {
    joinedIds.value.push(act.id)
    act.enrolled = Math.min(act.enrolled + 1, act.capacity)
    act.status = 'confirmed'
    // 持久化到本地存储
    localStorage.setItem('volunteer_joined', JSON.stringify(joinedIds.value))
  }
  showRegisterDialog.value = false
  ElMessage.success(langText.value.volunteer.messages.registerSuccess)
}

// 提交志愿时长记录
const submitLogHours = () => {
  const pts = earnedPoints.value
  // 添加时长记录
  volunteerLogs.value.push({ activityId: selectedActivity.value.id, title: selectedActivity.value.title, hours: logForm.value.hours, points: pts, date: new Date().toISOString().split('T')[0] })
  localStorage.setItem('volunteer_logs', JSON.stringify(volunteerLogs.value))
  // 给用户增加积分
  userStore.addPoints(pts)
  // 更新排行榜数据
  const userName = userStore.user?.name || userStore.user?.username || '我'
  const idx = volunteerLeaderboard.value.findIndex(u => u.name === userName)
  if (idx >= 0) volunteerLeaderboard.value[idx].hours += logForm.value.hours
  else volunteerLeaderboard.value.push({ name: userName, hours: logForm.value.hours })
  volunteerLeaderboard.value.sort((a, b) => b.hours - a.hours)
  showLogHoursDialog.value = false
  ElMessage.success(langText.value.volunteer.messages.logSuccess.replace('{pts}', pts))
}

// 组件挂载时初始化用户数据
onMounted(async () => { await userStore.init() })
</script>

<style scoped>
.vol-root {
  position: relative;
  isolation: isolate;
}

/* 积分卡片样式：蓝色渐变背景，带阴影和圆角 */
.vol-points-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, #eff6ff 0%, #dbeafe 45%, #bfdbfe 100%);
  border: 1px solid rgba(96, 165, 250, 0.35);
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: 0 16px 40px rgba(96,165,250,0.18), 0 0 0 1px rgba(255,255,255,0.7) inset;
}

/* 侧边栏卡片：毛玻璃效果，白色半透明背景 */
.vol-sidebar-card {
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0,0,0,0.07);
  border-radius: 1.25rem;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}

.vol-sidebar-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  margin-bottom: 0.9rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(0,0,0,0.07);
}

.vol-sidebar-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.5rem;
  background: rgba(46,125,50,0.08);
  color: #2E7D32;
}

.vol-sidebar-card__icon--gold {
  background: rgba(234,179,8,0.1);
  color: #b45309;
}

/* 积分规则卡片：浅绿色边框和渐变背景 */
.vol-rules-card {
  border: 1px solid rgba(46,125,50,0.18);
  background: linear-gradient(135deg, rgba(46,125,50,0.04) 0%, rgba(74,222,128,0.03) 100%);
  border-radius: 1.25rem;
  padding: 1rem 1.1rem;
}

/* 分类筛选按钮：默认白色背景，选中蓝色渐变 */
.vol-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 0.6rem;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(8px);
  transition: all 0.2s var(--ease-expo);
  color: #555;
}
.vol-filter-btn:hover {
  border-color: rgba(0,0,0,0.3);
  background: rgba(255,255,255,1);
  color: #111;
  transform: translateY(-1px);
}
.vol-filter-btn--active {
  background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%);
  border-color: #60a5fa;
  color: #1e3a8a;
  box-shadow: 0 4px 14px rgba(96,165,250,0.4);
}
.vol-filter-btn--active:hover {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  color: #1e3a8a;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(96,165,250,0.45);
}

/* 积分兑换横幅：蓝色渐变背景，响应式布局 */
.vol-redeem-banner {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #bfdbfe 100%);
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow: 0 12px 32px rgba(96,165,250,0.15), 0 0 0 1px rgba(255,255,255,0.9) inset;
  border: 1px solid rgba(96,165,250,0.3);
}
@media (min-width: 640px) {
  .vol-redeem-banner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.vol-redeem-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.6rem 1.25rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  border: 1px solid rgba(59,130,246,0.4);
  border-radius: 0.75rem;
  background: rgba(255,255,255,0.75);
  color: #1d4ed8;
  white-space: nowrap;
  backdrop-filter: blur(8px);
  transition: all 0.25s var(--ease-expo);
  box-shadow: 0 2px 8px rgba(59,130,246,0.1);
}
.vol-redeem-btn:hover {
  background: rgba(255,255,255,0.98);
  border-color: rgba(59,130,246,0.7);
  box-shadow: 0 6px 18px rgba(59,130,246,0.2);
  transform: translateY(-1px);
  color: #1e40af;
}

/* 志愿活动卡片：毛玻璃效果，悬停上浮动画 */
.vol-activity-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0,0,0,0.07);
  border-radius: 1.25rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  overflow: hidden;
  transition: transform 0.4s var(--ease-expo), box-shadow 0.4s ease, border-color 0.3s ease;
}
.vol-activity-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 48px rgba(46,125,50,0.12), 0 4px 16px rgba(0,0,0,0.06);
  border-color: rgba(46,125,50,0.25);
}

/* 分类徽章：小标签样式，等宽字体 */
.vol-category-badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
}

.vol-urgent-badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
  animation: pulse 2s cubic-bezier(0,0,0.2,1) infinite;
}

/* 活动元信息单元格：日期、地点、时长等 */
.vol-meta-cell {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #f9fafb;
  border-radius: 0.6rem;
  padding: 0.45rem 0.6rem;
  font-size: 0.75rem;
  color: #6b7280;
}
.vol-meta-cell--points {
  justify-content: center;
  background: rgba(46,125,50,0.07);
}

/* 暗色主题适配：深色背景、浅色文字 */
/* 卡片列表过渡动画：进入、离开和排序变化 */
.card-list-move,
.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.4s var(--ease-expo);
}
.card-list-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}
.card-list-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

:global(html.theme-dark .vol-root) {
  --vol-dark-text: #f2fff5;
  --vol-dark-muted: rgba(191, 211, 199, 0.76);
  --vol-dark-soft: rgba(148, 168, 156, 0.62);
  --vol-dark-line: rgba(213, 245, 224, 0.14);
  --vol-dark-accent: #18dd7a;
  color: var(--vol-dark-text);
  background:
    linear-gradient(90deg, rgba(3, 13, 9, 0.24), rgba(12, 54, 38, 0.16) 48%, rgba(3, 12, 9, 0.28)),
    linear-gradient(180deg, rgba(3, 15, 10, 0.72), rgba(2, 10, 7, 0.9));
}

:global(html.theme-dark .vol-root > .fixed) {
  opacity: 0.09 !important;
}

:global(html.theme-dark .vol-root > .fixed .border-primary) {
  border-color: rgba(191, 244, 213, 0.16) !important;
}

:global(html.theme-dark .vol-root h1),
:global(html.theme-dark .vol-root h2),
:global(html.theme-dark .vol-root h3),
:global(html.theme-dark .vol-root h4),
:global(html.theme-dark .vol-root strong),
:global(html.theme-dark .vol-root .text-black),
:global(html.theme-dark .vol-root .text-blue-900) {
  color: var(--vol-dark-text) !important;
}

:global(html.theme-dark .vol-root p),
:global(html.theme-dark .vol-root li),
:global(html.theme-dark .vol-root .text-gray-400),
:global(html.theme-dark .vol-root .text-gray-500),
:global(html.theme-dark .vol-root .text-gray-600),
:global(html.theme-dark .vol-root .text-blue-700\/60),
:global(html.theme-dark .vol-root .text-blue-500\/60),
:global(html.theme-dark .vol-root .text-blue-500\/50) {
  color: var(--vol-dark-muted) !important;
}

:global(html.theme-dark .vol-root .text-primary),
:global(html.theme-dark .vol-root .text-primary\/50),
:global(html.theme-dark .vol-root .text-primary\/60),
:global(html.theme-dark .vol-root .text-primary\/20) {
  color: var(--vol-dark-accent) !important;
}

:global(html.theme-dark .vol-sidebar-card),
:global(html.theme-dark .vol-rules-card),
:global(html.theme-dark .vol-activity-card) {
  background:
    linear-gradient(145deg, rgba(16, 37, 27, 0.9), rgba(9, 26, 19, 0.84) 55%, rgba(7, 18, 14, 0.92)) !important;
  border-color: var(--vol-dark-line) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 30px 82px rgba(0, 0, 0, 0.38) !important;
}

:global(html.theme-dark .vol-points-card),
:global(html.theme-dark .vol-redeem-banner),
:global(html.theme-dark .vol-activity-card:nth-child(2n)) {
  background:
    linear-gradient(135deg, rgba(47, 48, 26, 0.9), rgba(45, 38, 34, 0.86) 50%, rgba(31, 29, 29, 0.92)) !important;
  border-color: rgba(240, 230, 196, 0.14) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 24px 68px rgba(0, 0, 0, 0.36) !important;
}

:global(html.theme-dark .vol-sidebar-card__header) {
  border-bottom-color: rgba(213, 245, 224, 0.16) !important;
  color: var(--vol-dark-text);
}

:global(html.theme-dark .vol-sidebar-card__icon),
:global(html.theme-dark .vol-root .bg-gray-100),
:global(html.theme-dark .vol-root .bg-white\/50),
:global(html.theme-dark .vol-meta-cell),
:global(html.theme-dark .vol-filter-btn),
:global(html.theme-dark .vol-root .bg-gray-50),
:global(html.theme-dark .vol-root .bg-primary\/5) {
  background: rgba(3, 13, 9, 0.56) !important;
  border-color: rgba(213, 245, 224, 0.12) !important;
  color: var(--vol-dark-muted) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
}

:global(html.theme-dark .vol-sidebar-card li:hover),
:global(html.theme-dark .vol-filter-btn:hover),
:global(html.theme-dark .vol-activity-card:hover) {
  background: rgba(24, 221, 122, 0.09) !important;
  border-color: rgba(24, 221, 122, 0.34) !important;
}

:global(html.theme-dark .vol-filter-btn--active),
:global(html.theme-dark .vol-redeem-btn),
:global(html.theme-dark .vol-root button.bg-primary),
:global(html.theme-dark .vol-root .border-primary.text-primary:hover) {
  background: linear-gradient(90deg, #21df7e, #47d59a) !important;
  border-color: rgba(24, 221, 122, 0.46) !important;
  color: #04140b !important;
  box-shadow: 0 12px 30px rgba(24, 221, 122, 0.18) !important;
}

:global(html.theme-dark .vol-root .border-primary),
:global(html.theme-dark .vol-root .border-primary\/8),
:global(html.theme-dark .vol-root .border-primary\/20),
:global(html.theme-dark .vol-root .border-gray-200),
:global(html.theme-dark .vol-root .border-black\/5) {
  border-color: rgba(213, 245, 224, 0.14) !important;
}

:global(html.theme-dark .vol-root .border-blue-400),
:global(html.theme-dark .vol-root .text-blue-700) {
  border-color: rgba(24, 221, 122, 0.38) !important;
  color: var(--vol-dark-accent) !important;
}

:global(html.theme-dark .vol-root .bg-blue-50\/60),
:global(html.theme-dark .vol-root .hover\:bg-primary\/5:hover) {
  background: rgba(24, 221, 122, 0.09) !important;
}

:global(html.theme-dark .vol-root .bg-gray-100 .text-gray-300),
:global(html.theme-dark .vol-root .text-gray-300) {
  color: rgba(191, 211, 199, 0.38) !important;
}

:global(html.theme-dark .vol-meta-cell--points) {
  background: rgba(24, 221, 122, 0.1) !important;
}

:global(html.theme-dark .vol-category-badge) {
  background: rgba(24, 221, 122, 0.12) !important;
  border: 1px solid rgba(24, 221, 122, 0.22);
  color: var(--vol-dark-accent) !important;
}

:global(html.theme-dark .vol-urgent-badge) {
  background: rgba(248, 113, 113, 0.12) !important;
  border-color: rgba(248, 113, 113, 0.28) !important;
  color: #fca5a5 !important;
}

:global(html.theme-dark .vol-root .h-1\.5.bg-gray-100) {
  background: rgba(213, 245, 224, 0.1) !important;
}

:global(html.theme-dark .vol-root .el-input__wrapper),
:global(html.theme-dark .vol-root .el-textarea__inner) {
  background: rgba(4, 16, 11, 0.68) !important;
  border-color: rgba(213, 245, 224, 0.14) !important;
  box-shadow:
    inset 0 0 0 1px rgba(213, 245, 224, 0.14),
    0 8px 20px rgba(0, 0, 0, 0.18) !important;
}

:global(html.theme-dark .vol-root .el-input__inner),
:global(html.theme-dark .vol-root .el-textarea__inner) {
  color: var(--vol-dark-text) !important;
}

:global(html.theme-dark .vol-root .el-input__inner::placeholder),
:global(html.theme-dark .vol-root .el-textarea__inner::placeholder) {
  color: rgba(191, 211, 199, 0.62) !important;
}
</style>

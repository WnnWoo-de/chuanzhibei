<template>
  <div class="vol-root bg-transparent min-h-screen text-[#1a1a1a] font-sans pt-24 px-6 pb-16">
    <!-- Ambient glows -->
    <div class="fixed top-32 right-0 w-[28rem] h-[28rem] rounded-full pointer-events-none blur-3xl opacity-[0.04]" style="background:radial-gradient(circle,#3b82f6,transparent)"></div>
    <div class="fixed bottom-0 left-16 w-80 h-80 rounded-full pointer-events-none blur-3xl opacity-[0.05]" style="background:radial-gradient(circle,#93c5fd,transparent)"></div>
    <!-- Grid background -->
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-[0.06] z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-primary h-full"></div>
    </div>

    <div class="relative z-10 grid grid-cols-12 gap-6 lg:gap-10">
      <!-- ══════ LEFT SIDEBAR ══════ -->
      <aside class="col-span-12 md:col-span-3">
        <div class="sticky top-24 space-y-5">

          <!-- Page header -->
          <div class="animate-fade-in-up">
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/60 mb-2">  VOLUNTEER</p>
            <h1 class="text-5xl font-bold leading-none tracking-tighter mb-3">志愿<br>活动</h1>
            <p class="text-sm text-gray-500 leading-relaxed max-w-[200px]">参与志愿活动，记录志愿时长，<br>兑换环保积分。</p>
          </div>

          <!-- Points card -->
          <div class="vol-points-card animate-fade-in-up delay-100">
            <div class="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none" style="background:radial-gradient(circle,rgba(147,197,253,0.35),transparent)"></div>
            <div class="absolute right-4 bottom-4 w-20 h-20 rounded-full pointer-events-none" style="background:radial-gradient(circle,rgba(255,255,255,0.5),transparent)"></div>
            <div class="relative z-10 flex items-start justify-between mb-4">
              <div>
                <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-blue-500/60 mb-1">MY POINTS</p>
                <p class="text-5xl font-bold tabular-nums tracking-tighter text-blue-900">{{ totalPoints }}</p>
                <p class="font-mono text-[9px] text-blue-500/50 mt-0.5">环保积分</p>
              </div>
              <div class="relative w-14 h-14 shrink-0">
                <svg viewBox="0 0 40 40" class="w-14 h-14 -rotate-90">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(96,165,250,0.2)" stroke-width="3"/>
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#3b82f6" stroke-width="3"
                    stroke-dasharray="100.5"
                    :stroke-dashoffset="100.5 * (1 - Math.min(totalPoints / 5000, 1))"
                    stroke-linecap="round"
                    style="transition: stroke-dashoffset 1.2s cubic-bezier(0.19,1,0.22,1)"/>
                </svg>
                <span class="absolute inset-0 flex items-center justify-center font-mono text-[9px] text-blue-700 font-bold">{{ Math.round(Math.min(totalPoints/5000,1)*100) }}%</span>
              </div>
            </div>
            <div class="relative z-10 border-t border-blue-300/40 pt-4 grid grid-cols-2 gap-3">
              <div class="bg-white/50 rounded-xl p-3 backdrop-blur-sm">
                <p class="font-mono text-[8px] uppercase tracking-[0.18em] text-blue-500/60 mb-1">志愿时长</p>
                <p class="text-2xl font-bold text-blue-900">{{ myVolunteerHours }}<span class="text-xs text-blue-500/50 ml-1">h</span></p>
              </div>
              <div class="bg-white/50 rounded-xl p-3 backdrop-blur-sm">
                <p class="font-mono text-[8px] uppercase tracking-[0.18em] text-blue-500/60 mb-1">已参与</p>
                <p class="text-2xl font-bold text-blue-900">{{ myJoinedCount }}<span class="text-xs text-blue-500/50 ml-1">次</span></p>
              </div>
            </div>
          </div>

          <!-- My Activities -->
          <div class="vol-sidebar-card animate-fade-in-up delay-200">
            <div class="vol-sidebar-card__header">
              <span>我的活动</span>
              <div class="vol-sidebar-card__icon"><el-icon><Calendar /></el-icon></div>
            </div>
            <div v-if="myActivities.length === 0" class="text-center py-5">
              <div class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2"><span class="text-base">📋</span></div>
              <p class="text-xs text-gray-400 font-mono">暂未报名任何活动</p>
            </div>
            <ul v-else class="space-y-2">
              <li v-for="act in myActivities" :key="act.id"
                @click="openDetailDialog(act)"
                class="group flex items-start justify-between gap-2 p-2 rounded-xl hover:bg-black/[0.03] transition-colors cursor-pointer">
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-xs truncate group-hover:text-primary transition-colors">{{ act.title }}</p>
                  <p class="font-mono text-[10px] text-gray-400 mt-0.5">{{ act.date }}</p>
                </div>
                <span class="shrink-0 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full" :class="statusClass(act.enrollment?.status || act.status)">{{ statusLabel(act.enrollment?.status || act.status) }}</span>
              </li>
            </ul>
          </div>

          <!-- Volunteer Leaderboard -->
          <div class="vol-sidebar-card animate-fade-in-up delay-300">
            <div class="vol-sidebar-card__header">
              <span>志愿榜</span>
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

          <!-- Points rules -->
          <div class="vol-rules-card animate-fade-in-up delay-400">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-1.5 h-1.5 rounded-full bg-primary animate-ping-slow"></div>
              <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-primary font-bold">积分规则</p>
            </div>
            <ul class="space-y-2">
              <li class="flex items-start gap-2 text-xs text-gray-500"><span class="mt-1.5 w-1 h-1 rounded-full bg-primary/60 shrink-0"></span>每参与 1 小时约获得 25–40 积分</li>
              <li class="flex items-start gap-2 text-xs text-gray-500"><span class="mt-1.5 w-1 h-1 rounded-full bg-primary/60 shrink-0"></span>积分可在成就页兑换专属徽章</li>
              <li class="flex items-start gap-2 text-xs text-gray-500"><span class="mt-1.5 w-1 h-1 rounded-full bg-primary/60 shrink-0"></span>志愿榜每日 0 点实时更新</li>
            </ul>
          </div>

        </div>
      </aside>
      <!-- ══════ RIGHT MAIN CONTENT ══════ -->
      <main class="col-span-12 md:col-span-9">

        <!-- Search + Filter bar -->
        <div class="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in-up">
          <div class="flex-1">
            <el-input v-model="searchQuery" placeholder="搜索活动名称或地点..." clearable :prefix-icon="Search" />
          </div>
          <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button v-for="cat in categories" :key="cat.value" @click="activeCategory = cat.value"
              class="vol-filter-btn shrink-0" :class="activeCategory === cat.value ? 'vol-filter-btn--active' : ''">
              <span>{{ cat.icon }}</span><span>{{ cat.label }}</span>
            </button>
          </div>
        </div>



        <!-- Redeem banner -->
        <div class="vol-redeem-banner mb-8 animate-fade-in-up delay-200">
          <div class="absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-[0.12]" style="background:radial-gradient(circle,#4ADE80,transparent)"></div>
          <div class="absolute right-28 bottom-0 w-28 h-28 rounded-full opacity-[0.06]" style="background:radial-gradient(circle,#4ADE80,transparent)"></div>
          <div class="relative z-10">
            <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-blue-500/60 mb-1">积分兑换</p>
            <h3 class="text-lg font-bold text-blue-900 mb-1">用积分兑换成就徽章</h3>
            <p class="text-xs text-blue-700/60 max-w-xs leading-relaxed">累计志愿时长，获取积分后可前往成就页面兑换专属徽章与荣誉称号。</p>
          </div>
          <router-link to="/achievements" class="vol-redeem-btn shrink-0 relative z-10">前往兑换 →</router-link>
        </div>

        <!-- Activity cards -->
        <transition-group name="card-list" tag="div" class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div v-for="activity in filteredActivities" :key="activity.id" class="vol-activity-card group">
            <div class="h-[3px] w-full absolute top-0 left-0 rounded-t-2xl" :class="categoryAccent(activity.category)"></div>
            <div class="p-6 flex flex-col flex-1">
              <div class="absolute top-5 right-5 font-mono text-[9px] text-primary/20 select-none">ACT #{{ String(activity.id).padStart(3,'0') }}</div>
              <div class="flex items-center gap-2 mb-4">
                <span class="vol-category-badge" :class="categoryBadgeClass(activity.category)">{{ activity.category }}</span>
                <span v-if="activity.urgent" class="vol-urgent-badge">⚡ 急需</span>
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
                  <span class="font-mono text-[9px] text-primary/60">积分</span>
                </div>
              </div>
              <div class="mb-5">
                <div class="flex justify-between font-mono text-[10px] mb-1.5">
                  <span class="text-gray-400">报名进度</span>
                  <span :class="activity.enrolled >= activity.capacity ? 'text-red-400 font-bold' : 'text-gray-400'">{{ activity.enrolled }} / {{ activity.capacity }}</span>
                </div>
                <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700" :class="enrollmentColor(activity)"
                    :style="{width: Math.min(100,(activity.enrolled/activity.capacity)*100)+'%'}"></div>
                </div>
              </div>
              <div class="flex gap-2 pt-4 border-t border-primary/8">
                <button v-if="!isJoined(activity.id)" @click="openRegisterDialog(activity)"
                  :disabled="activity.enrolled >= activity.capacity || isActivityExpired(activity)"
                  class="flex-1 py-2.5 text-xs font-mono uppercase tracking-widest border rounded-xl transition-all duration-200"
                  :class="activity.enrolled >= activity.capacity
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                    : isActivityExpired(activity)
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                      : 'border-blue-400 text-blue-700 bg-blue-50/60 hover:bg-blue-400 hover:text-white hover:border-blue-400 shadow-sm hover:shadow-[0_4px_14px_rgba(96,165,250,0.4)]'"
                >{{ activity.enrolled >= activity.capacity ? '名额已满' : isActivityExpired(activity) ? '活动已结束' : '立即报名' }}</button>
                <button v-else-if="activity.enrollment?.status === 'completed'"
                  class="flex-1 py-2.5 text-xs font-mono uppercase tracking-widest border border-green-300 text-green-600 bg-green-50/60 hover:bg-green-400 hover:text-white hover:border-green-400 transition-all duration-200 rounded-xl cursor-not-allowed"
                >✓ 已完成</button>
                <button v-else-if="canCancelActivity(activity)" @click="openCancelDialog(activity)"
                  class="flex-1 py-2.5 text-xs font-mono uppercase tracking-widest border border-red-300 text-red-600 bg-red-50/60 hover:bg-red-400 hover:text-white hover:border-red-400 transition-all duration-200 rounded-xl"
                >取消报名</button>
                <button v-else @click="openLogHoursDialog(activity)"
                  class="flex-1 py-2.5 text-xs font-mono uppercase tracking-widest border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 rounded-xl"
                >✓ 已报名 · 记录时长</button>
                <button @click="openDetailDialog(activity)"
                  class="px-4 py-2.5 text-xs font-mono uppercase tracking-widest border border-gray-200 text-gray-500 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-200 rounded-xl"
                >详情</button>
              </div>
            </div>
          </div>
        </transition-group>

        <div v-if="filteredActivities.length === 0" class="text-center py-20">
          <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <el-icon :size="28" class="text-gray-300"><Sunrise /></el-icon>
          </div>
          <p class="text-gray-400 font-mono text-sm">暂无匹配活动</p>
        </div>

      </main>
    </div>

    <!-- ══════ REGISTER DIALOG ══════ -->
    <el-dialog v-model="showRegisterDialog" title="活动报名" :width="520" align-center>
      <div v-if="selectedActivity" class="space-y-5">
        <div class="bg-gray-50 border border-black/5 p-4 rounded-xl">
          <h4 class="font-bold mb-2 text-sm">{{ selectedActivity.title }}</h4>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-mono">
            <span>📅 {{ selectedActivity.date }}</span>
            <span>📍 {{ selectedActivity.location }}</span>
            <span>⏱ {{ selectedActivity.hours }}h</span>
            <span class="text-primary font-bold">+{{ selectedActivity.points }} 积分</span>
          </div>
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-mono uppercase tracking-widest opacity-50 mb-1">联系电话</label>
            <el-input v-model="registerForm.phone" placeholder="请输入您的联系电话" />
          </div>
          <div>
            <label class="block text-xs font-mono uppercase tracking-widest opacity-50 mb-1">备注信息（选填）</label>
            <el-input v-model="registerForm.note" type="textarea" :rows="2" placeholder="有什么想对组织方说的？" />
          </div>
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <el-checkbox v-model="registerForm.agreed" />
            <span>我已阅读并同意遵守活动规则，按时参加活动</span>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button @click="showRegisterDialog = false" class="border border-gray-200 px-6 py-2 text-sm hover:bg-gray-50 transition-colors rounded-lg">取消</button>
          <button
            @click="submitRegister"
            :loading="loading.register"
            class="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-2 text-sm font-medium hover:from-blue-300 hover:to-blue-400 hover:shadow-[0_4px_14px_rgba(96,165,250,0.45)] hover:-translate-y-0.5 transition-all duration-200 rounded-lg"
          >确认报名</button>
        </div>
      </div>
    </el-dialog>

    <!-- ══════ LOG HOURS DIALOG ══════ -->
    <el-dialog v-model="showLogHoursDialog" title="记录志愿时长" :width="480" align-center>
      <div v-if="selectedActivity" class="space-y-5">
        <div class="bg-gray-50 border border-black/5 p-4 rounded-xl">
          <h4 class="font-bold text-sm mb-1">{{ selectedActivity.title }}</h4>
          <p class="text-xs text-gray-400 font-mono">计划时长：{{ selectedActivity.hours }}h</p>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-mono uppercase tracking-widest opacity-50 mb-2">实际参与时长（小时）</label>
            <div class="flex items-center gap-4">
              <el-slider v-model="logForm.hours" :min="0.5" :max="selectedActivity.hours + 2" :step="0.5" class="flex-1" />
              <span class="font-bold text-xl w-12 text-right tabular-nums">{{ logForm.hours }}h</span>
            </div>
          </div>
          <div class="bg-primary/5 border border-primary/20 p-4 rounded-xl text-center">
            <p class="text-xs font-mono opacity-60 mb-1">本次将获得积分</p>
            <p class="text-3xl font-bold text-primary tabular-nums">+{{ earnedPoints }}</p>
            <p class="text-xs opacity-50 mt-1 font-mono">{{ logForm.hours }}h × {{ selectedActivity.pointsPerHour }} 分/小时</p>
          </div>
          <div>
            <label class="block text-xs font-mono uppercase tracking-widest opacity-50 mb-1">活动感想（选填）</label>
            <el-input v-model="logForm.reflection" type="textarea" :rows="3" placeholder="记录一下这次志愿活动的感想吧..." maxlength="200" show-word-limit />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button @click="showLogHoursDialog = false" class="border border-gray-200 px-6 py-2 text-sm hover:bg-gray-50 transition-colors rounded-lg">取消</button>
          <button
            @click="submitLogHours"
            :loading="loading.logHours"
            class="bg-primary text-white px-6 py-2 text-sm hover:bg-green-700 transition-colors rounded-lg"
          >提交并获取积分</button>
        </div>
      </div>
    </el-dialog>

    <!-- ══════ DETAIL DIALOG ══════ -->
    <el-dialog v-model="showDetailDialog" title="活动详情" :width="560" align-center>
      <div v-if="selectedActivity" class="space-y-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="vol-category-badge" :class="categoryBadgeClass(selectedActivity.category)">{{ selectedActivity.category }}</span>
              <span v-if="selectedActivity.urgent" class="text-[10px] font-mono uppercase px-2 py-1 rounded-full bg-red-100 text-red-600">急需</span>
            </div>
            <h3 class="text-xl font-bold">{{ selectedActivity.title }}</h3>
          </div>
          <div class="text-right shrink-0">
            <p class="text-2xl font-bold text-primary tabular-nums">+{{ selectedActivity.points }}</p>
            <p class="text-xs font-mono opacity-50">积分奖励</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed">{{ selectedActivity.description }}</p>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-50 p-3 rounded-xl border border-black/5">
            <p class="text-[10px] font-mono uppercase opacity-40 mb-1">活动时间</p>
            <p class="text-sm font-bold">{{ selectedActivity.date }}</p>
          </div>
          <div class="bg-gray-50 p-3 rounded-xl border border-black/5">
            <p class="text-[10px] font-mono uppercase opacity-40 mb-1">活动地点</p>
            <p class="text-sm font-bold">{{ selectedActivity.location }}</p>
          </div>
          <div class="bg-gray-50 p-3 rounded-xl border border-black/5">
            <p class="text-[10px] font-mono uppercase opacity-40 mb-1">志愿时长</p>
            <p class="text-sm font-bold">{{ selectedActivity.hours }} 小时</p>
          </div>
          <div class="bg-gray-50 p-3 rounded-xl border border-black/5">
            <p class="text-[10px] font-mono uppercase opacity-40 mb-1">剩余名额</p>
            <p class="text-sm font-bold">{{ selectedActivity.capacity - selectedActivity.enrolled }} 人</p>
          </div>
        </div>
        <div class="bg-gray-50 p-3 rounded-xl border border-black/5">
          <p class="text-[10px] font-mono uppercase opacity-40 mb-1">活动须知</p>
          <p class="text-sm text-gray-600">{{ selectedActivity.notes || '请准时到达集合地点，携带身份证件，穿着舒适便于活动的服装。' }}</p>
        </div>
        <div class="flex justify-end gap-2">
          <button @click="showDetailDialog = false" class="border border-gray-200 px-6 py-2 text-sm hover:bg-gray-50 transition-colors rounded-lg">关闭</button>
          <button
            v-if="!isJoined(selectedActivity.id) && selectedActivity.enrolled < selectedActivity.capacity"
            @click="() => { showDetailDialog = false; openRegisterDialog(selectedActivity) }"
            class="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-2 text-sm font-medium hover:from-blue-300 hover:to-blue-400 hover:shadow-[0_4px_14px_rgba(96,165,250,0.45)] hover:-translate-y-0.5 transition-all duration-200 rounded-lg"
          >立即报名</button>
          <button
            v-else-if="canCancelActivity(selectedActivity)"
            @click="() => { showDetailDialog = false; openCancelDialog(selectedActivity) }"
            class="border border-red-300 text-red-600 hover:bg-red-50 px-6 py-2 text-sm transition-colors rounded-lg"
          >取消报名</button>
        </div>
      </div>
    </el-dialog>

    <!-- ══════ CANCEL DIALOG ══════ -->
    <el-dialog v-model="showCancelDialog" title="取消报名" :width="420" align-center>
      <div v-if="selectedActivity" class="space-y-4">
        <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
          <div class="flex items-center gap-2 mb-2">
            <el-icon class="text-yellow-600"><Warning /></el-icon>
            <h4 class="font-bold text-sm text-yellow-800">确认取消报名？</h4>
          </div>
          <p class="text-xs text-yellow-700">
            您确定要取消 <strong>{{ selectedActivity.title }}</strong> 的报名吗？
            取消后将无法恢复，名额会重新开放给其他志愿者。
          </p>
        </div>
        <div class="bg-gray-50 border border-gray-200 p-3 rounded-xl">
          <p class="text-xs text-gray-500 mb-2">活动信息：</p>
          <div class="flex flex-wrap gap-2 text-[10px] font-mono text-gray-600">
            <span>📅 {{ selectedActivity.date }}</span>
            <span>📍 {{ selectedActivity.location }}</span>
            <span>⏱ {{ selectedActivity.hours }}h</span>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button @click="showCancelDialog = false" class="border border-gray-200 px-6 py-2 text-sm hover:bg-gray-50 transition-colors rounded-lg">取消</button>
          <button
            @click="submitCancelEnrollment"
            :loading="loading.cancel"
            class="bg-red-500 text-white px-6 py-2 text-sm hover:bg-red-600 transition-colors rounded-lg"
          >确认取消</button>
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
import { Calendar, Location, Timer, Sunrise, Search, TrophyBase, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  fetchVolunteerActivities,
  enrollVolunteerActivity,
  logVolunteerHours,
  cancelVolunteerEnrollment,
} from '@/services/volunteerService'

const userStore = useUserStore()
const searchQuery = ref('')
const activeCategory = ref('全部')
const showRegisterDialog = ref(false)
const showLogHoursDialog = ref(false)
const showDetailDialog = ref(false)
const showCancelDialog = ref(false)
const selectedActivity = ref(null)
const registerForm = ref({ phone: '', note: '', agreed: false })
const logForm = ref({ hours: 2, reflection: '' })
const activities = ref([])
const loading = ref({ register: false, logHours: false, cancel: false })

const totalPoints = computed(() => Number(userStore.user?.points) || 0)
const myVolunteerHours = computed(() =>
  activities.value.reduce((sum, activity) => sum + Number(activity.enrollment?.loggedHours || 0), 0),
)
const myJoinedCount = computed(() => activities.value.filter((activity) => Boolean(activity.enrollment)).length)
const isJoined = (id) => activities.value.some((activity) => activity.id === id && activity.enrollment)
const myActivities = computed(() => activities.value.filter((activity) => activity.enrollment))

const categories = [
  { label: '全部', value: '全部', icon: '📋' },
  { label: '环境保护', value: '环境保护', icon: '🌳' },
  { label: '社区清洁', value: '社区清洁', icon: '🧹' },
  { label: '教育支持', value: '教育支持', icon: '📚' },
  { label: '关爱老人', value: '关爱老人', icon: '🤝' },
]

const baseLeaderboard = [
  { name: 'EcoWarrior', hours: 48 },
  { name: 'GreenStar', hours: 36 },
  { name: 'Sarah J.', hours: 29 },
  { name: 'Mike Chen', hours: 21 },
  { name: 'Emma W.', hours: 18 },
]

const volunteerLeaderboard = computed(() => {
  const list = [...baseLeaderboard]
  const userName = userStore.user?.name || userStore.user?.username
  const hours = myVolunteerHours.value
  if (userName && hours > 0) {
    const idx = list.findIndex((item) => item.name === userName)
    if (idx >= 0) list[idx] = { ...list[idx], hours }
    else list.push({ name: userName, hours })
  }
  return list.sort((a, b) => b.hours - a.hours).slice(0, 5)
})

const filteredActivities = computed(() => {
  let list = activities.value
  if (activeCategory.value !== '全部') list = list.filter((a) => a.category === activeCategory.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (a) => a.title.toLowerCase().includes(q) || String(a.location || '').toLowerCase().includes(q),
    )
  }
  return list
})

const earnedPoints = computed(() =>
  !selectedActivity.value ? 0 : Math.round(logForm.value.hours * Number(selectedActivity.value.pointsPerHour || 0)),
)

const statusClass = (s) =>
  ({
    pending: 'bg-yellow-100 text-yellow-700',
    registered: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-gray-100 text-gray-500',
  }[s] || 'bg-gray-100 text-gray-500')
const statusLabel = (s) =>
  ({
    pending: '待确认',
    registered: '已报名',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消',
  }[s] || s)
const categoryBadgeClass = (c) =>
  ({
    环境保护: 'bg-green-100 text-green-700',
    社区清洁: 'bg-blue-100 text-blue-700',
    教育支持: 'bg-purple-100 text-purple-700',
    关爱老人: 'bg-orange-100 text-orange-700',
  }[c] || 'bg-gray-100 text-gray-600')
const enrollmentColor = (a) => {
  const capacity = Math.max(1, Number(a.capacity || 1))
  const ratio = Number(a.enrolled || 0) / capacity
  return ratio >= 1 ? 'bg-red-400' : ratio >= 0.8 ? 'bg-orange-400' : 'bg-primary'
}
const categoryAccent = (cat) =>
  ({
    环境保护: 'bg-gradient-to-r from-green-400 to-emerald-500',
    社区清洁: 'bg-gradient-to-r from-blue-400 to-sky-500',
    教育支持: 'bg-gradient-to-r from-purple-400 to-violet-500',
    关爱老人: 'bg-gradient-to-r from-orange-400 to-amber-500',
  }[cat] || 'bg-gradient-to-r from-gray-300 to-gray-400')

const isActivityExpired = (activity) => {
  if (!activity.date) return false
  try {
    const activityDate = new Date(activity.date)
    const now = new Date()
    return activityDate < now
  } catch {
    return false
  }
}

const canCancelActivity = (activity) => {
  if (!activity.enrollment) return false
  if (activity.enrollment.status === 'completed') return false
  if (activity.enrollment.status === 'cancelled') return false
  return !isActivityExpired(activity)
}

const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

const replaceActivity = (nextActivity) => {
  const idx = activities.value.findIndex((item) => item.id === nextActivity.id)
  if (idx >= 0) activities.value[idx] = { ...activities.value[idx], ...nextActivity }
}

const loadActivities = async () => {
  const result = await fetchVolunteerActivities()
  if (!result.ok) {
    ElMessage.error(result.message || '加载活动失败')
    return
  }
  activities.value = result.items
}

const openRegisterDialog = (a) => {
  selectedActivity.value = a
  registerForm.value = { phone: '', note: '', agreed: false }
  showRegisterDialog.value = true
}
const openLogHoursDialog = (a) => {
  selectedActivity.value = a
  logForm.value = { hours: a.hours, reflection: '' }
  showLogHoursDialog.value = true
}
const openDetailDialog = (a) => {
  selectedActivity.value = a
  showDetailDialog.value = true
}

const openCancelDialog = (a) => {
  selectedActivity.value = a
  showCancelDialog.value = true
}

const submitRegister = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再报名活动')
    return
  }
  if (!registerForm.value.phone.trim()) {
    ElMessage.warning('请填写联系电话')
    return
  }
  if (!validatePhone(registerForm.value.phone)) {
    ElMessage.warning('请输入正确的手机号格式')
    return
  }
  if (!registerForm.value.agreed) {
    ElMessage.warning('请同意活动规则')
    return
  }
  if (!selectedActivity.value) return

  if (isActivityExpired(selectedActivity.value)) {
    ElMessage.warning('该活动已结束，无法报名')
    return
  }

  loading.value.register = true
  try {
    const act = selectedActivity.value
    const result = await enrollVolunteerActivity(act.id, {
      phone: registerForm.value.phone,
      remark: registerForm.value.note,
      agreedRules: registerForm.value.agreed,
    })

    if (!result.ok || !result.item) {
      ElMessage.error(result.message || '报名失败')
      return
    }

    replaceActivity(result.item)
    selectedActivity.value = result.item
    showRegisterDialog.value = false
    ElMessage.success('报名成功！期待您的参与 🌱')
  } finally {
    loading.value.register = false
  }
}

const submitCancelEnrollment = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  if (!selectedActivity.value) return

  loading.value.cancel = true
  try {
    const result = await cancelVolunteerEnrollment(selectedActivity.value.id)

    if (!result.ok || !result.item) {
      ElMessage.error(result.message || '取消报名失败')
      return
    }

    replaceActivity(result.item)
    selectedActivity.value = result.item
    showCancelDialog.value = false
    ElMessage.success('已取消报名')
  } finally {
    loading.value.cancel = false
  }
}

const submitLogHours = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再记录志愿时长')
    return
  }

  loading.value.logHours = true
  try {
    const result = await logVolunteerHours(selectedActivity.value.id, {
      hours: logForm.value.hours,
      reflection: logForm.value.reflection,
    })

    if (!result.ok || !result.data) {
      ElMessage.error(result.message || '提交失败')
      return
    }

    const pts = Number(result.data.pointsAwarded || 0)
    replaceActivity({
      ...selectedActivity.value,
      status: 'completed',
      enrollment: {
        ...(selectedActivity.value.enrollment || {}),
        status: 'completed',
        loggedHours: Number(result.data.hours || 0),
        pointsAwarded: pts,
        completedAt: result.data.completedAt,
      },
    })
    selectedActivity.value = activities.value.find((item) => item.id === selectedActivity.value.id) || null
    if (pts > 0) await userStore.addPoints(pts)
    showLogHoursDialog.value = false
    ElMessage.success(`志愿时长记录成功！获得 +${pts} 积分`)
  } finally {
    loading.value.logHours = false
  }
}

onMounted(async () => {
  await userStore.init()
  await loadActivities()
})
</script>

<style scoped>
/* ── Points Card ── */
.vol-points-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, #eff6ff 0%, #dbeafe 45%, #bfdbfe 100%);
  border: 1px solid rgba(96, 165, 250, 0.35);
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: 0 16px 40px rgba(96,165,250,0.18), 0 0 0 1px rgba(255,255,255,0.7) inset;
}

/* ── Sidebar Card ── */
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

/* ── Rules Card ── */
.vol-rules-card {
  border: 1px solid rgba(46,125,50,0.18);
  background: linear-gradient(135deg, rgba(46,125,50,0.04) 0%, rgba(74,222,128,0.03) 100%);
  border-radius: 1.25rem;
  padding: 1rem 1.1rem;
}

/* ── Filter Buttons ── */
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

/* ── Redeem Banner ── */
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

/* ── Activity Card ── */
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

/* ── Category Badge ── */
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

/* ── Meta cell ── */
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

/* ── Card list transition ── */
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
</style>

<template>
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans pt-24 px-6 relative overflow-x-hidden">
    <!-- Grid Background -->
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
      <div v-for="n in 4" :key="`m-${n}`" class="border-r border-black h-full block md:hidden col-span-3"></div>
    </div>

    <!-- Main Container -->
    <div class="max-w-4xl mx-auto relative z-10 w-full pb-24">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
        <!-- Left Column: Title -->
        <div class="lg:col-span-1 mb-12 lg:mb-0">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-tighter text-primary">个人中心</h1>
          <p class="font-mono text-xs uppercase tracking-widest text-gray-600">User Profile / Overview</p>

          <!-- Sidebar Navigation (below title on mobile, same row on desktop) -->
          <nav class="space-y-2 mt-8 lg:mt-12">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="w-full text-left px-4 py-3 flex items-center justify-between group transition-all duration-200 border-l-2"
              :class="activeTab === tab.id ? 'border-primary bg-white shadow-sm font-bold' : 'border-transparent hover:border-black/20 text-gray-600 hover:text-black'"
            >
              <span class="text-sm font-mono tracking-widest">{{ tab.name }}</span>
              <span class="opacity-0 group-hover:opacity-100 transition-opacity text-xs" :class="activeTab === tab.id ? 'opacity-100 text-primary' : ''">→</span>
            </button>
          </nav>
        </div>

        <!-- Profile Content -->
        <div class="lg:col-span-3 lg:mt-12">
          <div class="bg-white/95 backdrop-blur-md border border-primary/20 shadow-xl rounded-2xl min-h-[600px]">
            <!-- Profile Overview -->
            <div v-if="activeTab === 'overview'" class="p-6 md:p-8 lg:p-8 animate-[fade-in_0.3s_ease]">
              <div class="mb-6 pb-3 border-b border-primary/10">
                <h2 class="text-xl font-bold mb-1">个人概览</h2>
                <p class="text-xs text-gray-600 font-mono uppercase">Profile Overview</p>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Profile Info Card -->
                <div class="lg:col-span-1">
                  <div class="bg-white/95 backdrop-blur-md border border-primary/20 p-5 lg:p-5 relative group overflow-hidden rounded-2xl shadow-lg h-full">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>

                    <div class="flex flex-col items-center text-center">
                      <div class="relative mb-4">
                        <!-- Avatar -->
                        <img
                          :src="previewAvatar"
                          alt="User Avatar"
                          class="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover relative z-10"
                        />
                        <!-- Decorative rings -->
                        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-primary/20 rounded-full animate-[spin-slow_8s_linear_infinite]"></div>
                      </div>

                      <h2 class="text-lg font-bold mb-1">{{ userStore.user?.username || '未命名用户' }}</h2>
                      <p class="text-xs text-gray-500 font-mono mb-4">{{ userStore.user?.email || 'N/A' }}</p>

                      <div class="w-full flex justify-between items-center px-3 py-2 bg-green-50 border border-primary/10 rounded-lg mb-4">
                        <span class="text-[10px] font-bold uppercase tracking-widest text-gray-600">环保积分</span>
                        <span class="text-lg font-mono font-bold text-primary">{{ userStore.user?.points || 0 }}</span>
                      </div>

                      <button
                        type="button"
                        class="w-full py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 hover:shadow-glow transition-colors flex items-center justify-center gap-2"
                        @click="openEditDialog"
                      >
                        编辑资料 <span class="text-[8px]">→</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Right Column: Stats -->
                <div class="lg:col-span-2 space-y-5">
                  <!-- Overview Cards - First Row -->
                  <div class="grid grid-cols-2 gap-5">
                    <div class="bg-white/95 backdrop-blur-md border border-primary/20 p-5 relative overflow-hidden group rounded-2xl shadow-lg hover:shadow-glow transition-all duration-500">
                      <div class="font-mono text-[10px] text-gray-500 mb-3 tracking-widest uppercase">累计减排 / CO₂e</div>
                      <div class="text-3xl font-bold mb-1 group-hover:text-primary transition-colors">{{ (userStore.user?.points * 0.15).toFixed(1) || '0.0' }}<span class="text-base text-gray-400 ml-1">kg</span></div>
                      <p class="text-xs text-gray-600 mt-2 line-clamp-1">相当于种植了 {{ Math.floor((userStore.user?.points || 0) / 100) }} 棵树</p>
                    </div>

                    <div class="bg-white/95 backdrop-blur-md border border-primary/20 p-5 relative overflow-hidden group rounded-2xl shadow-lg hover:shadow-glow transition-all duration-500">
                      <div class="font-mono text-[10px] text-gray-500 mb-3 tracking-widest uppercase">已解锁成就 / Badges</div>
                      <div class="text-3xl font-bold mb-1 group-hover:text-primary transition-colors">{{ userStore.badges?.filter(b => b.unlocked).length || 0 }}<span class="text-base text-gray-400 ml-1 opacity-50">/ {{ userStore.badges?.length || 15 }}</span></div>
                      <router-link to="/achievements" class="inline-flex text-xs text-primary border-b border-primary mt-2 font-bold hover:text-primary/80 hover:border-primary/80 transition-colors">
                        查看所有徽章
                      </router-link>
                    </div>
                  </div>

                  <!-- Overview Cards - Second Row -->
                  <div class="grid grid-cols-2 gap-5">
                    <div class="bg-white/95 backdrop-blur-md border border-primary/20 p-5 rounded-2xl shadow-lg">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                        </div>
                        <h3 class="font-bold text-sm text-gray-800">用户等级</h3>
                      </div>
                      <p class="text-lg font-mono text-primary">Lv. {{ getUserLevel(userStore.user?.points || 0) }}</p>
                      <p class="text-xs text-gray-600 mt-1">继续积累积分提升等级</p>
                    </div>

                    <div class="bg-white/95 backdrop-blur-md border border-primary/20 p-5 rounded-2xl shadow-lg">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 class="font-bold text-sm text-gray-800">社区贡献</h3>
                      </div>
                      <p class="text-lg font-mono text-primary">{{ userStore.chatHistory?.length || 0 }}</p>
                      <p class="text-xs text-gray-600 mt-1">参与环保话题讨论</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Activity -->
            <div v-if="activeTab === 'activity'" class="p-6 md:p-10 animate-[fade-in_0.3s_ease]">
              <div class="mb-8 pb-4 border-b border-primary/10">
                <h2 class="text-2xl font-bold mb-1">近期活动</h2>
                <p class="text-xs text-gray-600 font-mono uppercase">Recent Activity</p>
              </div>

              <div v-if="userStore.chatHistory && userStore.chatHistory.length > 0" class="space-y-4">
                <div v-for="(chat, i) in userStore.chatHistory.slice(-3)" :key="i" class="flex gap-4 p-4 border border-primary/10 hover:border-primary/30 transition-colors bg-green-50/50 rounded-lg">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-sm mb-1 text-gray-800">AI 环保咨询</h4>
                    <p class="text-xs text-gray-600 line-clamp-1">{{ chat.content }}</p>
                    <p class="text-[10px] font-mono text-gray-500 mt-2">{{ new Date(chat.timestamp || Date.now()).toLocaleDateString() }}</p>
                  </div>
                </div>
                <div class="text-center pt-2">
                  <router-link to="/chat" class="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
                    进入 AI 助手查看更多 →
                  </router-link>
                </div>
              </div>

              <div v-else class="text-center py-12 px-4 border border-dashed border-primary/20 bg-green-50/30 rounded-lg">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <svg viewBox="0 0 24 24" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-sm text-gray-600 mb-4">暂无活动记录，快去探索平台功能吧！</p>
                <router-link to="/chat" class="inline-flex px-4 py-2 bg-primary text-white text-xs font-bold uppercase hover:bg-primary/90 transition-colors rounded-lg">
                  探索功能
                </router-link>
              </div>
            </div>

            <!-- Account Settings -->
            <div v-if="activeTab === 'settings'" class="p-6 md:p-10 animate-[fade-in_0.3s_ease]">
              <div class="mb-8 pb-4 border-b border-primary/10">
                <h2 class="text-2xl font-bold mb-1">账号设置</h2>
                <p class="text-xs text-gray-600 font-mono uppercase">Account Settings</p>
              </div>

              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="block text-xs font-bold uppercase tracking-widest text-gray-600">用户名</label>
                    <input
                      type="text"
                      :value="userStore.user?.username || ''"
                      disabled
                      class="w-full bg-green-50 border border-primary/10 px-4 py-3 text-sm text-gray-500 cursor-not-allowed rounded-lg"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-xs font-bold uppercase tracking-widest text-gray-600">邮箱</label>
                    <input
                      type="email"
                      :value="userStore.user?.email || ''"
                      disabled
                      class="w-full bg-green-50 border border-primary/10 px-4 py-3 text-sm text-gray-500 cursor-not-allowed rounded-lg"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-xs font-bold uppercase tracking-widest text-gray-600">环保积分</label>
                  <div class="w-full bg-green-50 border border-primary/10 px-4 py-3 text-sm rounded-lg">
                    <span class="font-mono font-bold text-primary">{{ userStore.user?.points || 0 }}</span>
                  </div>
                </div>

                <div class="pt-6">
                  <button
                    type="button"
                    class="px-6 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors rounded-lg"
                    @click="openEditDialog"
                  >
                    编辑个人资料
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showEditDialog"
      title="编辑资料"
      :width="560"
      align-center
      class="profile-edit-dialog"
      :close-on-click-modal="!isSaving"
      :close-on-press-escape="!isSaving"
      :show-close="!isSaving"
      @closed="handleDialogClosed"
    >
      <div class="space-y-5">
        <BaseInput
          id="username"
          v-model="form.username"
          type="text"
          label="用户名"
          placeholder="请输入用户名"
          :error="errors.username"
          :success="touched.username && Boolean(form.username) && !errors.username"
          required
          @blur="validateUsername"
        />

        <div>
          <label for="email" class="block text-xs font-mono uppercase mb-2 text-gray-600">邮箱</label>
          <input
            id="email"
            :value="userStore.user?.email || ''"
            type="email"
            disabled
            class="w-full bg-green-50 border border-primary/10 px-4 py-3 text-sm text-gray-500 cursor-not-allowed rounded-lg"
          >
        </div>

        <div>
          <label for="avatar" class="block text-xs font-mono uppercase mb-2 text-gray-600">头像链接</label>
          <input
            id="avatar"
            v-model="form.avatar"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            class="w-full bg-green-50 border border-primary/10 px-4 py-3 text-sm transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-lg"
            :class="errors.avatar ? 'border-red-500 text-red-900 placeholder-red-300' : ''"
            @blur="validateAvatar"
          >
          <p v-if="errors.avatar" class="mt-1 text-xs text-red-500 font-mono">{{ errors.avatar }}</p>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label for="bio" class="block text-xs font-mono uppercase text-gray-600">个人简介</label>
            <span class="text-xs text-gray-500">{{ form.bio.length }}/500</span>
          </div>
          <textarea
            id="bio"
            v-model="form.bio"
            rows="4"
            placeholder="向社区介绍一下你的环保理念..."
            class="w-full bg-green-50 border border-primary/10 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all resize-none rounded-lg"
            :class="errors.bio ? 'border-red-500 text-red-900 placeholder-red-300' : ''"
            @blur="validateBio"
          ></textarea>
          <p v-if="errors.bio" class="mt-1 text-xs text-red-500 font-mono">{{ errors.bio }}</p>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            class="px-5 py-2.5 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/10 transition-colors rounded-lg"
            :disabled="isSaving"
            @click="resetForm"
          >
            重置
          </button>
          <button
            type="button"
            class="px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed rounded-lg"
            :disabled="isSaving"
            @click="handleSubmit"
          >
            {{ isSaving ? '保存中...' : '保存资料' }}
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isSaving = ref(false)
const showEditDialog = ref(false)
const activeTab = ref('overview')

/**
 * 左侧导航标签配置
 */
const tabs = [
  { id: 'overview', name: '概览' },
  { id: 'activity', name: '活动记录' },
  { id: 'settings', name: '账号设置' }
]

/**
 * 根据积分计算用户等级
 */
const getUserLevel = (points) => {
  const p = Number(points) || 0
  if (p >= 4000) return 5
  if (p >= 2000) return 4
  if (p >= 1000) return 3
  if (p >= 500) return 2
  return 1
}

const form = reactive({
  username: '',
  avatar: '',
  bio: '',
})

const errors = reactive({
  username: '',
  avatar: '',
  bio: '',
})

const touched = reactive({
  username: false,
  avatar: false,
  bio: false,
})

const buildFallbackAvatar = (name) => {
  const safeName = encodeURIComponent(name || 'U')
  return `https://ui-avatars.com/api/?name=${safeName}&background=1a1a1a&color=fff&size=150&rounded=true&bold=true`
}

const syncForm = () => {
  form.username = userStore.user?.username || ''
  form.avatar = userStore.user?.avatar || ''
  form.bio = userStore.user?.bio || ''
  errors.username = ''
  errors.avatar = ''
  errors.bio = ''
  touched.username = false
  touched.avatar = false
  touched.bio = false
}

const validateUsername = (options) => {
  const shouldTrim = Boolean(options?.shouldTrim) || Boolean(options?.target)
  touched.username = true
  if (shouldTrim) form.username = form.username.trim()
  if (!form.username) {
    errors.username = '请输入用户名'
    return false
  }
  if (form.username.length < 2) {
    errors.username = '用户名至少 2 个字符'
    return false
  }
  if (form.username.length > 20) {
    errors.username = '用户名最多 20 个字符'
    return false
  }
  errors.username = ''
  return true
}

const validateAvatar = (options) => {
  const shouldTrim = Boolean(options?.shouldTrim) || Boolean(options?.target)
  touched.avatar = true
  if (shouldTrim) form.avatar = form.avatar.trim()
  if (!form.avatar) {
    errors.avatar = ''
    return true
  }
  if (!/^https?:\/\//i.test(form.avatar)) {
    errors.avatar = '请输入有效的 http 或 https 图片链接'
    return false
  }
  errors.avatar = ''
  return true
}

const validateBio = () => {
  touched.bio = true
  if (form.bio.length > 500) {
    errors.bio = '个人简介最多 500 个字符'
    return false
  }
  errors.bio = ''
  return true
}

const focusFirstInvalid = () => {
  if (errors.username) return document.getElementById('username')?.focus?.()
  if (errors.avatar) return document.getElementById('avatar')?.focus?.()
  if (errors.bio) return document.getElementById('bio')?.focus?.()
}

const resetForm = () => {
  syncForm()
  ElMessage.info('已恢复为当前保存的资料')
}

const openEditDialog = () => {
  syncForm()
  showEditDialog.value = true
}

const handleDialogClosed = () => {
  if (!isSaving.value) syncForm()
}

const handleSubmit = async () => {
  if (isSaving.value) return

  const okUsername = validateUsername({ shouldTrim: true })
  const okAvatar = validateAvatar({ shouldTrim: true })
  const okBio = validateBio()
  if (!okUsername || !okAvatar || !okBio) {
    ElMessage.warning('请先修正表单错误')
    focusFirstInvalid()
    return
  }

  isSaving.value = true
  const result = await userStore.updateProfile({
    username: form.username.trim(),
    avatar: form.avatar.trim(),
    bio: form.bio.trim(),
  })
  isSaving.value = false

  if (!result.ok) {
    const fieldErrors = result.fieldErrors || {}
    if (fieldErrors.username) errors.username = fieldErrors.username
    if (fieldErrors.avatar) errors.avatar = fieldErrors.avatar
    if (fieldErrors.bio) errors.bio = fieldErrors.bio
    focusFirstInvalid()
    return
  }

  syncForm()
}

const previewAvatar = computed(() => {
  if (form.avatar && /^https?:\/\//i.test(form.avatar)) return form.avatar
  return buildFallbackAvatar(form.username || userStore.user?.username)
})

watch(() => userStore.user, syncForm, { immediate: true, deep: true })
watch(() => form.username, () => { if (touched.username) validateUsername() })
watch(() => form.avatar, () => { if (touched.avatar) validateAvatar() })
watch(() => form.bio, () => { if (touched.bio) validateBio() })
</script>

<style scoped>
:deep(.profile-edit-dialog .el-dialog) {
  border-radius: 20px;
  overflow: hidden;
}

:deep(.profile-edit-dialog .el-dialog__header) {
  background: linear-gradient(to right, #2e7d32, #4caf50);
  padding: 20px 24px;
}

:deep(.profile-edit-dialog .el-dialog__title) {
  color: white;
  font-weight: bold;
}

:deep(.profile-edit-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

:deep(.profile-edit-dialog .el-dialog__body) {
  padding: 30px 24px;
}

:deep(.profile-edit-dialog .el-dialog__footer) {
  padding: 20px 24px 30px;
}
</style>

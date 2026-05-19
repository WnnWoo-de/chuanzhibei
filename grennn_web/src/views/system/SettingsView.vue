<template>
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans pt-24 px-6 relative overflow-x-hidden">
    <!-- Grid Background -->
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
      <div v-for="n in 4" :key="`m-${n}`" class="border-r border-black h-full block md:hidden col-span-3"></div>
    </div>

    <!-- Main Container -->
    <div class="max-w-4xl mx-auto relative z-10 w-full pb-24">
      <div class="mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-tighter">{{ langText.settings.title }}</h1>
        <p class="font-mono text-xs uppercase tracking-widest opacity-50">{{ langText.settings.subtitle }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <nav class="space-y-2 sticky top-24">
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

        <!-- Settings Content -->
        <div class="lg:col-span-3">
          <div class="bg-white/90 backdrop-blur-md border border-black/10 shadow-xl rounded-2xl min-h-[500px]">
            
            <!-- Account Settings -->
            <div v-if="activeTab === 'account'" class="p-6 md:p-10 animate-[fade-in_0.3s_ease]">
              <div class="mb-8 pb-4 border-b border-black/10">
                <h2 class="text-2xl font-bold mb-1">{{ langText.settings.accountSettings }}</h2>
                <p class="text-xs text-gray-500 font-mono uppercase">{{ langText.settings.accountInfo }}</p>
              </div>
              
              <form @submit.prevent="saveSettings" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="block text-xs font-bold uppercase tracking-widest text-gray-500">{{ langText.settings.username }}</label>
                    <input type="text" v-model="form.username" class="w-full bg-neutral-50 border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-xs font-bold uppercase tracking-widest text-gray-500">{{ langText.settings.email }}</label>
                    <input type="email" v-model="form.email" disabled class="w-full bg-neutral-100 text-gray-500 cursor-not-allowed border border-black/10 px-4 py-3 text-sm" />
                    <p class="text-[10px] text-gray-400 font-mono mt-1">{{ langText.settings.emailNotEditable }}</p>
                  </div>
                </div>
                
                <div class="pt-4 space-y-2">
                  <label class="block text-xs font-bold uppercase tracking-widest text-gray-500">{{ langText.settings.bio }}</label>
                  <textarea rows="4" v-model="form.bio" :placeholder="langText.settings.enterBio" class="w-full bg-neutral-50 border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"></textarea>
                </div>

                <div class="pt-8 flex justify-end gap-4">
                  <button type="button" @click="resetForm" class="px-6 py-3 border border-black/20 text-sm font-bold hover:bg-neutral-100 transition-colors">{{ langText.settings.cancel }}</button>
                  <button type="submit" class="px-8 py-3 bg-black text-white text-sm font-bold hover:bg-primary transition-colors flex items-center gap-2">
                    {{ langText.settings.saveChanges }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Notifications Settings -->
            <div v-if="activeTab === 'notifications'" class="p-6 md:p-10 animate-[fade-in_0.3s_ease]">
              <div class="mb-8 pb-4 border-b border-black/10">
                <h2 class="text-2xl font-bold mb-1">{{ langText.settings.notifications }}</h2>
                <p class="text-xs text-gray-500 font-mono uppercase">{{ langText.settings.notificationPrefs }}</p>
              </div>

              <div class="space-y-6">
                <!-- Toggle Item -->
                <div v-for="(item, index) in notifSettings" :key="index" class="flex items-start justify-between py-4 border-b border-black/5 last:border-0">
                  <div>
                    <h4 class="font-bold text-sm mb-1">{{ item.title }}</h4>
                    <p class="text-xs text-gray-500">{{ item.desc }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="item.enabled" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div class="pt-6">
                  <button class="px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors">
                    {{ langText.settings.saveNotifPrefs }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Security Settings -->
            <div v-if="activeTab === 'security'" class="p-6 md:p-10 animate-[fade-in_0.3s_ease]">
              <div class="mb-8 pb-4 border-b border-black/10">
                <h2 class="text-2xl font-bold mb-1">{{ langText.settings.security }}</h2>
                <p class="text-xs text-gray-500 font-mono uppercase">{{ langText.settings.securityEn }}</p>
              </div>

              <div class="space-y-8">
                <div>
                  <h3 class="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span class="w-1 h-4 bg-primary inline-block"></span> {{ langText.settings.passwordManage }}
                  </h3>
                  <button class="px-6 py-3 border border-black text-sm font-bold hover:bg-black hover:text-white transition-colors">
                    {{ langText.settings.changePassword }}
                  </button>
                </div>

                <div class="pt-6 border-t border-black/10">
                  <h3 class="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-red-600">
                    <span class="w-1 h-4 bg-red-600 inline-block"></span> {{ langText.settings.dangerZone }}
                  </h3>
                  <p class="text-xs text-gray-500 mb-4 line-relaxed max-w-lg">
                    {{ langText.settings.deleteAccountWarning }}
                  </p>
                  <button class="px-6 py-3 border border-red-200 text-red-600 bg-red-50 text-sm font-bold hover:bg-red-600 hover:text-white transition-colors">
                    {{ langText.settings.deleteAccount }}
                  </button>
                </div>
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
// views/SettingsView.vue - 系统设置页面
// 包含账号信息编辑、消息通知偏好、安全与隐私三个分组
// 通过 activeTab 切换左侧导航对应的内容区域
// ============================================================
import { ref, reactive, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { langText } from '@/language'

const userStore = useUserStore()
// 当前激活的设置分组（account / notifications / security）
const activeTab = ref('account')

// 左侧导航标签配置
const tabs = computed(() => [
  { id: 'account', name: 'ACCOUNT' },
  { id: 'notifications', name: 'NOTIFICATIONS' },
  { id: 'security', name: 'SECURITY' }
])

// 账号信息表单数据
const form = reactive({
  username: '',
  email: '',
  bio: ''
})

// 消息通知设置项列表（每项包含标题、描述和开关状态）
const notifSettings = reactive([
  { title: computed(() => langText.value.settings.platformNotice), desc: computed(() => langText.value.settings.platformNoticeDesc), enabled: true },
  { title: computed(() => langText.value.settings.interactionReminder), desc: computed(() => langText.value.settings.interactionReminderDesc), enabled: true },
  { title: computed(() => langText.value.settings.achievementUnlock), desc: computed(() => langText.value.settings.achievementUnlockDesc), enabled: true },
  { title: computed(() => langText.value.settings.weeklyReport), desc: computed(() => langText.value.settings.weeklyReportDesc), enabled: false }
])

// 组件挂载时，将 userStore 中的用户信息填充到表单
onMounted(() => {
  if (userStore.user) {
    resetForm()
  }
})

/**
 * 重置表单为当前用户信息
 * 取消编辑或重新挂载时调用
 */
const resetForm = () => {
  form.username = userStore.user?.username || ''
  form.email = userStore.user?.email || ''
  form.bio = ''
}

/**
 * 保存账号设置
 * 当前为本地 mock，后续可替换为 PATCH /api/v1/users/me 接口
 */
const saveSettings = () => {
  // Mock save — TODO: 接入后端接口
  ElMessage.success(langText.value.settings.saveSuccess)
  if (userStore.user) {
    userStore.user.username = form.username
  }
}
</script>

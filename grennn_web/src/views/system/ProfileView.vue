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
        <h1 class="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-tighter">个人中心</h1>
        <p class="font-mono text-xs uppercase tracking-widest opacity-50">User Profile / Overview</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Left Col: Profile info -->
        <div class="md:col-span-1 space-y-6">
          <div class="bg-white/90 backdrop-blur-md border border-black/10 p-6 md:p-8 relative group overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500">
            <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
            
            <div class="flex flex-col items-center text-center">
              <div class="relative mb-6">
                <!-- Avatar -->
                <img 
                  :src="userAvatar" 
                  alt="User Avatar"
                  class="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover relative z-10"
                />
                <!-- Decorative rings -->
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-black/10 rounded-full animate-[spin-slow_8s_linear_infinite]"></div>
              </div>
              
              <h2 class="text-2xl font-bold mb-1">{{ userStore.user?.username || '未命名用户' }}</h2>
              <p class="text-sm text-gray-500 font-mono mb-6">{{ userStore.user?.email || 'N/A' }}</p>
              
              <div class="w-full flex justify-between items-center px-4 py-3 bg-neutral-50 border border-black/5 rounded-lg mb-6">
                <span class="text-xs font-bold uppercase tracking-widest text-gray-500">环保积分</span>
                <span class="text-xl font-mono font-bold text-primary">{{ userStore.user?.points || 0 }}</span>
              </div>
              
              <button 
                class="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors flex items-center justify-center gap-2"
              >
                编辑资料 <span class="text-[10px]">→</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Col: Stats and Activities -->
        <div class="md:col-span-2 space-y-6">
          <!-- Overview Cards -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white/90 backdrop-blur-md border border-black/10 p-6 relative overflow-hidden group rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
              <div class="font-mono text-[10px] text-gray-400 mb-4 tracking-widest uppercase">累计减排 / CO₂e</div>
              <div class="text-3xl font-bold mb-1 group-hover:text-primary transition-colors">{{ (userStore.user?.points * 0.15).toFixed(1) || '0.0' }}<span class="text-base text-gray-400 ml-1">kg</span></div>
              <p class="text-xs text-gray-500 mt-2 line-clamp-1">相当于种植了 {{ Math.floor((userStore.user?.points || 0) / 100) }} 棵树</p>
            </div>
            
            <div class="bg-white/90 backdrop-blur-md border border-black/10 p-6 relative overflow-hidden group rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
              <div class="font-mono text-[10px] text-gray-400 mb-4 tracking-widest uppercase">已解锁成就 / Badges</div>
              <div class="text-3xl font-bold mb-1 group-hover:text-primary transition-colors">{{ userStore.badges?.filter(b => b.unlocked).length || 0 }}<span class="text-base text-gray-400 ml-1 opacity-50">/ {{ userStore.badges?.length || 15 }}</span></div>
              <router-link to="/achievements" class="inline-flex text-xs text-black border-b border-black mt-2 font-bold hover:text-primary hover:border-primary transition-colors">
                查看所有徽章
              </router-link>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white/90 backdrop-blur-md border border-black/10 p-6 md:p-8 rounded-2xl shadow-xl">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-bold">近期活动</h3>
              <span class="text-xs font-mono px-2 py-1 bg-neutral-100 text-gray-500 uppercase">Activity Log</span>
            </div>
            
            <div v-if="userStore.chatHistory && userStore.chatHistory.length > 0" class="space-y-4">
              <div v-for="(chat, i) in userStore.chatHistory.slice(-3)" :key="i" class="flex gap-4 p-4 border border-black/5 hover:border-primary/30 transition-colors bg-neutral-50/50">
                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-sm mb-1 line-clamp-1">AI 环保咨询</h4>
                  <p class="text-xs text-gray-500 line-clamp-1">{{ chat.content }}</p>
                  <p class="text-[10px] font-mono text-gray-400 mt-2">{{ new Date(chat.timestamp || Date.now()).toLocaleDateString() }}</p>
                </div>
              </div>
              <div class="text-center pt-2">
                <router-link to="/chat" class="text-xs font-bold uppercase tracking-widest text-primary hover:text-black transition-colors">
                  进入 AI 助手查看更多 →
                </router-link>
              </div>
            </div>
            
            <div v-else class="text-center py-12 px-4 border border-dashed border-black/20">
              <div class="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-sm text-gray-500 mb-4">暂无活动记录，快去探索平台功能吧！</p>
              <router-link to="/features" class="inline-flex px-4 py-2 border border-black text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors">
                探索功能
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// views/ProfileView.vue - 个人中心页面
// 展示用户头像、积分、已解锁成就数量及近期 AI 聊天记录
// 数据均从 userStore 读取，无需单独的接口请求
// ============================================================
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

/**
 * 用户头像 URL
 * 优先使用后端返回的 avatar 字段
 * 若无自定义头像，则通过 ui-avatars 服务根据用户名自动生成字母头像
 */
const userAvatar = computed(() => {
  if (userStore.user?.avatar) return userStore.user.avatar
  const name = encodeURIComponent(userStore.user?.username || 'U')
  return `https://ui-avatars.com/api/?name=${name}&background=1a1a1a&color=fff&size=150&rounded=true&bold=true`
})
</script>

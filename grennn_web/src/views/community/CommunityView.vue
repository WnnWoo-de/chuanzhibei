<template>
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans pt-24 px-6 pb-12">
    <!-- Grid Background -->
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-black h-full"></div>
    </div>

    <div class="relative z-10 grid grid-cols-12 gap-8">
      <!-- Header / Sidebar -->
      <div class="col-span-12 md:col-span-3">
        <div class="sticky top-24">
          <h1 class="text-4xl md:text-5xl font-bold mt-2 mb-6">社区活动</h1>
          <p class="text-sm opacity-60 max-w-[200px] mb-8">
            社区与排行<br>
            探索社区动态，查看环保先锋排行榜。
          </p>

          <button @click="showPostDialog = true" class="w-full mb-8 border border-black px-4 py-3 text-sm font-mono uppercase hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
            <el-icon><Edit /></el-icon>
            发布动态
          </button>

          <!-- Leaderboard (Sidebar Style - Desktop) -->
          <div class="bg-white/80 backdrop-blur-md border border-black/10 p-6 hidden md:block rounded-2xl shadow-xl">
            <h3 class="font-mono text-xs uppercase tracking-widest mb-4 border-b border-black/10 pb-2 flex items-center justify-between">
              <span>贡献榜</span>
              <el-icon class="text-primary"><TrophyBase /></el-icon>
            </h3>

            <div v-if="isLoading" class="space-y-4">
              <div v-for="n in 5" :key="n" class="flex justify-between items-center">
                 <div class="flex items-center gap-3 w-full">
                   <div class="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                   <div class="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
                 </div>
                 <div class="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            <ul v-else class="space-y-4">
              <li v-for="(user, i) in leaderboard" :key="i" class="flex justify-between items-center text-sm group hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
                <div class="flex items-center gap-3">
                  <span class="font-mono opacity-40 w-6" :class="{ 'text-yellow-600 opacity-100 font-bold': i < 3 }">
                    {{ i < 3 ? ['🥇', '🥈', '🥉'][i] : `0${i + 1}` }}
                  </span>
                  <span class="font-bold">{{ user.name }}</span>
                </div>
                <span class="font-mono text-primary">{{ user.points }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Feed Area -->
      <div class="col-span-12 md:col-span-9">

        <!-- Mobile Leaderboard Summary -->
        <div class="md:hidden mb-8 bg-white/80 backdrop-blur-md border border-black/10 p-4 rounded-2xl shadow-xl">
           <div class="flex items-center justify-between mb-2">
              <h3 class="font-mono text-xs uppercase font-bold">贡献榜 TOP 3</h3>
              <router-link to="/achievements" class="text-xs text-primary">查看全部</router-link>
           </div>
           <div class="flex justify-between gap-2 text-xs">
              <div v-for="(user, i) in leaderboard.slice(0, 3)" :key="i" class="flex flex-col items-center">
                 <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-1 font-bold">
                    {{ ['🥇', '🥈', '🥉'][i] }}
                 </div>
                 <span class="truncate max-w-[60px]">{{ user.name }}</span>
              </div>
           </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">

          <!-- Loading Skeletons -->
          <template v-if="isLoading">
             <div v-for="n in 4" :key="n" class="bg-white/80 backdrop-blur-md border border-black/10 p-6 rounded-2xl shadow-lg">
               <div class="flex items-center gap-4 mb-4">
                 <div class="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                 <div class="flex-1">
                   <div class="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                   <div class="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                 </div>
               </div>
               <div class="h-16 bg-gray-200 rounded mb-4 animate-pulse"></div>
               <div class="h-48 bg-gray-200 rounded mb-4 animate-pulse"></div>
               <div class="flex justify-between pt-4 border-t border-black/10">
                 <div class="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                 <div class="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
               </div>
             </div>
          </template>

          <!-- Feed Item -->
          <template v-else>
            <div v-for="(post, i) in posts" :key="i" class="bg-white/80 backdrop-blur-md border border-black/10 p-6 group hover:shadow-2xl transition-all duration-500 relative rounded-2xl shadow-lg hover:-translate-y-1">
              <!-- Decorative Index -->
              <div class="absolute top-4 right-4 font-mono text-xs opacity-20">LOG #{{ 1024 + i }}</div>

              <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-black/5">
                  <img
                    :src="getAvatarUrl(post.user, post.avatarColor1)"
                    :alt="post.user"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h4 class="font-bold text-sm">{{ post.user }}</h4>
                  <p class="font-mono text-xs opacity-50">{{ post.time }}</p>
                </div>
              </div>

              <p class="text-sm leading-relaxed mb-4 min-h-[3rem]">
                {{ post.expanded ? post.fullContent : post.content }}
              </p>

              <div v-if="post.image" class="h-48 bg-gray-100 mb-4 overflow-hidden relative rounded cursor-zoom-in" @click.stop="openLightbox(post.image)">
                <img :src="post.image" :alt="post.user" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>

              <div class="flex justify-between items-center border-t border-black/10 pt-4">
                <div class="flex gap-4 text-xs font-mono">
                  <button
                    @click="toggleLike(post)"
                    class="hover:text-primary transition-colors flex items-center gap-1 group/like"
                    :class="{ 'text-primary': post.liked }"
                  >
                    <el-icon class="transition-transform duration-300 group-active/like:scale-150">
                      <StarFilled v-if="post.liked" />
                      <Star v-else />
                    </el-icon>
                    <span>{{ post.likes }}</span>
                  </button>
                  <button @click="openComments(post)" class="hover:text-primary transition-colors flex items-center gap-1">
                    <el-icon><ChatDotRound /></el-icon>
                    {{ post.comments }}
                  </button>
                  <button @click="sharePost(post)" class="hover:text-primary transition-colors flex items-center gap-1">
                    <el-icon><Share /></el-icon>
                    分享
                  </button>
                </div>
                <button @click="toggleExpand(post)" class="text-xs font-mono uppercase hover:text-primary transition-colors">
                  {{ post.expanded ? '收起全文' : '阅读全文 →' }}
                </button>
              </div>
            </div>

            <!-- Load More Button -->
            <div class="col-span-1 md:col-span-2 flex justify-center pt-4">
              <button
                @click="loadMore"
                :disabled="isLoadingMore"
                class="border border-black px-8 py-3 text-sm font-mono uppercase hover:bg-black hover:text-white transition-colors disabled:opacity-50"
              >
                <span v-if="!isLoadingMore">加载更多</span>
                <span v-else class="flex items-center gap-2">
                  <span class="inline-block w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin"></span>
                  加载中...
                </span>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Post Dialog -->
    <el-dialog
      v-model="showPostDialog"
      title="发布动态"
      :width="600"
      align-center
    >
      <div class="space-y-4">
        <el-input
          v-model="newPost.content"
          type="textarea"
          :rows="4"
          placeholder="分享您的环保心得或活动..."
          maxlength="500"
          show-word-limit
        />
        <div class="flex justify-end gap-2">
          <button @click="showPostDialog = false" class="border border-gray-300 px-6 py-2 text-sm hover:bg-gray-50 transition-colors">
            取消
          </button>
          <button @click="publishPost" class="bg-black text-white px-6 py-2 text-sm hover:bg-gray-800 transition-colors">
            发布
          </button>
        </div>
      </div>
    </el-dialog>

    <!-- Comment Dialog -->
    <el-dialog
      v-model="showCommentDialog"
      title="评论列表"
      :width="500"
      align-center
    >
      <div v-if="activePost" class="space-y-4">
        <div v-if="activePost.commentList && activePost.commentList.length > 0" class="max-h-60 overflow-y-auto space-y-3">
          <div v-for="(comment, idx) in activePost.commentList" :key="idx" class="bg-gray-50 p-3 rounded">
            <p class="text-xs font-bold mb-1">{{ comment.user }}</p>
            <p class="text-sm text-gray-700">{{ comment.content }}</p>
          </div>
        </div>
        <div v-else class="text-center text-gray-400 py-4 text-sm">
          暂无评论，快来抢沙发吧！
        </div>

        <div class="flex gap-2 pt-2 border-t border-gray-100">
           <el-input v-model="newComment" placeholder="写下你的评论..." size="small" />
           <button @click="submitComment" class="bg-black text-white px-4 py-1 text-xs rounded hover:bg-gray-800 transition-colors whitespace-nowrap">
             发送
           </button>
        </div>
      </div>
    </el-dialog>

    <!-- Image Lightbox -->
    <div v-if="showLightbox" class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" @click="showLightbox = false">
      <div class="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
        <button
          @click="showLightbox = false"
          class="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors"
        >
          <el-icon :size="32"><Close /></el-icon>
        </button>
        <img
          :src="lightboxImage"
          class="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm"
          @click.stop
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// views/community/CommunityView.vue - 社区活动页面
// 功能：帖子列表（远程/本地双模式）、发帖、点赞、评论、图片灯箱、排行榜
// 数据来源：communityService，失败时降级为本地静态数据
// ============================================================
import { ref, onMounted, computed } from 'vue'
import { Edit, TrophyBase, Star, StarFilled, ChatDotRound, Share, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { createCommunityPost, fetchCommunityPosts, likeCommunityPost } from '@/services/communityService'

// Import community images
import communityImage1 from '@/assets/images/community_1.png'
import communityImage2 from '@/assets/images/case_2.png'
import communityImage3 from '@/assets/images/community_3.png'

const userStore = useUserStore()
const isLoading = ref(true)           // 初始加载状态
const isLoadingMore = ref(false)       // 加载更多状态
const showPostDialog = ref(false)      // 发帖对话框可见性
const showCommentDialog = ref(false)   // 评论对话框可见性
const showLightbox = ref(false)        // 图片灯箱可见性
const lightboxImage = ref('')          // 灯箱展示的图片 URL
const activePost = ref(null)           // 当前操作的帖子（评论/灯箱）
const newComment = ref('')             // 评论输入内容
const newPost = ref({ content: '' })   // 新帖子内容
const isRemoteFeed = ref(false)        // 是否已切换到远程数据模式
const page = ref(1)                    // 当前分页页码
const canLoadMore = ref(true)          // 是否还有更多数据可加载

/** 当前登录用户的显示名称（fallback 为「我」） */
const currentUserName = computed(() => {
  const name = userStore.user?.name || userStore.user?.username
  return typeof name === 'string' && name.trim() ? name.trim() : '我'
})

/** 当前登录用户的积分数 */
const currentUserPoints = computed(() => {
  const points = Number(userStore.user?.points)
  return Number.isFinite(points) ? points : 0
})

// 贡献榜：将静态基础数据与当前用户积分合并后按积分降序排列
const leaderboard = computed(() => {
  const baseList = [
    { name: 'Alex Chen', points: 2450 },
    { name: 'Sarah J.', points: 2100 },
    { name: 'Mike Ross', points: 1890 },
    { name: 'Emma W.', points: 1650 },
  ]

  // Insert current user and sort
  const list = [...baseList]
  if (userStore.user) list.push({ name: currentUserName.value, points: currentUserPoints.value })
  return list.sort((a, b) => b.points - a.points)
})

const posts = ref([
  {
    id: 1,
    user: 'Sarah Jenkins',
    time: '2 HOURS AGO',
    content: '刚刚把旧牛仔裤改造成托特包，AI 的建议非常棒！缝纫过程比想象中简单，成品很满意~',
    fullContent: '刚刚把旧牛仔裤改造成托特包，AI 的建议非常棒！缝纫过程比想象中简单，成品很满意~ 真的推荐大家试试，不要把旧衣服扔了。我还加了一些刺绣装饰，感觉独一无二。下次准备挑战改造成围裙！',
    expanded: false,
    image: communityImage2,
    likes: 24,
    comments: 5,
    liked: false,
    avatarColor1: '#4F46E5',
    avatarColor2: '#7C3AED',
    commentList: [
        { user: 'GreenLife', content: '太棒了！求教程链接。' },
        { user: 'EcoWarrior', content: '颜色搭配很好看！' }
    ]
  },
  {
    id: 2,
    user: 'David Li',
    time: '5 HOURS AGO',
    content: '完成了本周的回收挑战！成功将家庭塑料垃圾减少了40%。小改变，大影响！💚',
    fullContent: '完成了本周的回收挑战！成功将家庭塑料垃圾减少了40%。小改变，大影响！💚 主要通过自带购物袋、购买散装蔬菜、使用玻璃保鲜盒替代塑料袋来实现。其实并不难，习惯了就很自然。大家一起加油！',
    expanded: false,
    image: null,
    likes: 156,
    comments: 12,
    liked: true,
    avatarColor1: '#10B981',
    avatarColor2: '#059669',
    commentList: []
  },
  {
    id: 3,
    user: 'Green Community',
    time: '1 DAY AGO',
    content: '周末清洁活动招募志愿者！地点：中央公园。让我们一起为环境做贡献！🌍',
    fullContent: '周末清洁活动招募志愿者！地点：中央公园。让我们一起为环境做贡献！🌍 集合时间：周六上午9点。请自带水壶和手套。我们会提供垃圾袋和工具。报名请私信或评论！',
    expanded: false,
    image: communityImage1,
    likes: 89,
    comments: 34,
    liked: false,
    avatarColor1: '#F59E0B',
    avatarColor2: '#D97706',
    commentList: []
  },
  {
    id: 4,
    user: 'Emma Watson',
    time: '2 DAYS AGO',
    content: '分享我的零废弃生活必备工具！已经坚持使用可重复用品三个月了，感觉太好了~',
    fullContent: '分享我的零废弃生活必备工具！已经坚持使用可重复用品三个月了，感觉太好了~ 1. 不锈钢吸管 2. 蜂蜡保鲜布 3. 硅胶折叠杯 4. 竹制牙刷。这些小东西不仅环保，而且更有质感。',
    expanded: false,
    image: communityImage3,
    likes: 234,
    comments: 67,
    liked: false,
    avatarColor1: '#EC4899',
    avatarColor2: '#DB2777',
    commentList: []
  }
])

/**
 * 根据用户名和颜色生成头像 URL
 * 使用 ui-avatars.com 服务自动生成字母头像
 */
const getAvatarUrl = (name, colorHex) => {
  const bg = (colorHex || '#2E7D32').replace('#', '')
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=${bg}&color=fff&size=80&rounded=true&bold=true`
}

/** 打开图片灯箱 */
const openLightbox = (image) => {
  lightboxImage.value = image
  showLightbox.value = true
}

/**
 * 切换帖子点赞状态
 * 乐观更新：先本地更新，再调用接口，失败时回滚
 * @param post - 要操作的帖子对象
 */
const toggleLike = async (post) => {
  const prevLiked = Boolean(post.liked)
  const prevLikes = Number(post.likes || 0)
  post.liked = !post.liked
  post.likes += post.liked ? 1 : -1
  if (post.liked) {
    ElMessage.success({
      message: '点赞成功',
      duration: 1000,
      icon: StarFilled
    })
  }
  if (!post.remote) return
  const result = await likeCommunityPost(post.id, post.liked)
  if (!result.ok) {
    post.liked = prevLiked
    post.likes = prevLikes
    ElMessage.error(result.message)
    return
  }
  if (typeof result.count === 'number') post.likes = result.count
  if (result.status === 'liked') post.liked = true
  if (result.status === 'unliked') post.liked = false
}

/** 打开评论对话框并设置当前活跃帖子 */
const openComments = (post) => {
    activePost.value = post
    showCommentDialog.value = true
}

/** 提交评论（本地更新，未调用后端接口） */
const submitComment = () => {
    if (!newComment.value.trim()) return
    if (!userStore.user) {
        ElMessage.error('登录状态无效，请重新登录')
        return
    }

    if (activePost.value) {
        if (!activePost.value.commentList) activePost.value.commentList = []
        activePost.value.commentList.push({
            user: currentUserName.value,
            content: newComment.value
        })
        activePost.value.comments++
        ElMessage.success('评论成功')
        newComment.value = ''
    }
}

/** 切换帖子全文展开/收起状态 */
const toggleExpand = (post) => {
    post.expanded = !post.expanded
}

/**
 * 复制帖子分享链接到剪贴板
 * @param post - 要分享的帖子
 */
const sharePost = async (post) => {
  const url = `${window.location.origin}/community?post=${post.id}`
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
  } catch (err) {
    console.error(err)
    ElMessage.error('复制失败')
  }
}

/**
 * 加载更多帖子
 * 远程模式：请求下一页接口；本地模式：追加 mock 数据
 */
const loadMore = async () => {
  if (!canLoadMore.value) return
  isLoadingMore.value = true
  if (isRemoteFeed.value) {
    const nextPage = page.value + 1
    const result = await fetchCommunityPosts({ page: nextPage, limit: 10, sort: 'latest' })
    if (result.ok) {
      if (result.items.length === 0) {
        canLoadMore.value = false
      } else {
        posts.value.push(...result.items)
        page.value = nextPage
      }
    } else {
      ElMessage.error(result.message)
    }
    isLoadingMore.value = false
    return
  }

  setTimeout(() => {
    posts.value.push({
      id: Date.now(),
      user: 'Mike Johnson',
      time: '3 DAYS AGO',
      content: '今天学习了如何制作环保酵素，过程很简单，而且对环境友好！',
      fullContent:
        '今天学习了如何制作环保酵素，过程很简单，而且对环境友好！只需要果皮、红糖和水。比例是3:1:10。发酵三个月就可以用了，可以用来洗碗、浇花，甚至疏通下水道。',
      expanded: false,
      image: null,
      likes: 45,
      comments: 8,
      liked: false,
      avatarColor1: '#3B82F6',
      avatarColor2: '#2563EB',
      commentList: [],
      remote: false,
    })
    isLoadingMore.value = false
    ElMessage.success('加载成功')
  }, 1000)
}

/**
 * 发布新帖子
 * 优先调用后端接口，失败时降级为本地 mock 数据
 * 发帖成功后奖励用户 10 积分
 */
const publishPost = async () => {
  if (!newPost.value.content.trim()) {
    ElMessage.warning('请输入动态内容')
    return
  }
  if (!userStore.user) {
    ElMessage.error('登录状态无效，请重新登录')
    return
  }

  const content = newPost.value.content
  const result = await createCommunityPost({ content, imageUrls: [] })
  if (result.ok) {
    posts.value.unshift(result.post)
    isRemoteFeed.value = true
    newPost.value.content = ''
    showPostDialog.value = false
    ElMessage.success('发布成功')
    return
  }

  posts.value.unshift({
    id: Date.now(),
    user: currentUserName.value,
    time: 'JUST NOW',
    content: newPost.value.content,
    fullContent: newPost.value.content,
    expanded: false,
    image: null,
    likes: 0,
    comments: 0,
    liked: false,
    avatarColor1: '#6366F1',
    avatarColor2: '#8B5CF6',
    commentList: [],
    remote: false,
  })

  userStore.addPoints(10) // Reward for posting

  newPost.value.content = ''
  showPostDialog.value = false
  ElMessage.success('发布成功！获得 10 积分')
}

// 组件挂载：初始化用户状态，尝试从后端加载帖子列表
// 若接口失败或无数据则保留本地静态帖子
onMounted(async () => {
  await userStore.init()
  const result = await fetchCommunityPosts({ page: 1, limit: 10, sort: 'latest' })
  if (result.ok) {
    if (result.items.length > 0) {
      posts.value = result.items
      isRemoteFeed.value = true
      page.value = 1
      canLoadMore.value = true
    }
  }
  isLoading.value = false
})
</script>

<style scoped>
/* Keep it minimal */
</style>

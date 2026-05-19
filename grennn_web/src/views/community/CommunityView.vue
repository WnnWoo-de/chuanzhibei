<template>
  <div class="community-page min-h-screen bg-transparent text-[#1a1a1a] font-sans pt-6 md:pt-8 px-6 pb-14">
    <div class="fixed top-20 right-[-6rem] h-80 w-80 rounded-full blur-3xl opacity-[0.12] pointer-events-none" style="background: radial-gradient(circle, rgba(74,222,128,0.7), transparent 70%)"></div>
    <div class="fixed bottom-10 left-10 h-72 w-72 rounded-full blur-3xl opacity-[0.08] pointer-events-none" style="background: radial-gradient(circle, rgba(59,130,246,0.55), transparent 72%)"></div>
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-[0.07] z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-black h-full"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto space-y-6">
      <section class="community-hero">
        <div class="grid grid-cols-12 gap-3 lg:gap-4 items-start lg:items-center">
          <div class="col-span-12 lg:col-span-8">
            <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-3">
              <div>
                <p class="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/70 mb-2">05. COMMUNITY FEED</p>
                <h1 class="text-[2rem] md:text-[2.35rem] lg:text-[2.7rem] font-bold leading-[0.98] tracking-tight">{{ langText.community.title }}</h1>
                <p class="text-[13px] text-gray-500 mt-1">{{ langText.community.subtitle }}</p>
              </div>

              <div class="flex flex-wrap gap-2">
                <button @click="showPostDialog = true" class="community-hero__cta community-hero__cta--primary">
                  <el-icon><Edit /></el-icon>
                  {{ langText.community.publishPost }}
                </button>
                <router-link to="/volunteer" class="community-hero__cta community-hero__cta--secondary">
                  <el-icon><ArrowRight /></el-icon>
                  {{ langText.community.volunteerActivity }}
                </router-link>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
              <div v-for="item in heroStats" :key="item.label" class="community-metric">
                <p class="community-metric__label">{{ item.label }}</p>
                <div class="flex items-end justify-between gap-2">
                  <p class="community-metric__value">{{ item.value }}</p>
                  <p class="community-metric__hint">{{ item.hint }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="col-span-12 lg:col-span-4">
            <div class="community-pulse-card">
              <div class="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/65 mb-1">COMMUNITY PULSE</p>
                  <h2 class="text-base font-bold leading-tight">{{ langText.community.pulse.title }}</h2>
                </div>
                <div class="w-8 h-8 rounded-lg bg-white/75 border border-white/60 shadow-sm flex items-center justify-center text-primary">
                  <el-icon :size="16"><DataAnalysis /></el-icon>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                <div class="community-pulse-row">
                  <span>{{ langText.community.pulse.hotTopic }}</span>
                  <strong>{{ hottestTopic }}</strong>
                </div>
                <div class="community-pulse-row">
                  <span>{{ langText.community.pulse.featured }}</span>
                  <strong>{{ featuredPosts.length }} {{ langText.community.pulse.postsCount }}</strong>
                </div>
                <div class="community-pulse-row">
                  <span>{{ langText.community.pulse.weeklyChallenge }}</span>
                  <strong>{{ weeklyChallenge.reward }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-12 gap-5">
        <aside class="col-span-12 xl:col-span-4 order-2 xl:order-1">
          <div class="sticky top-24 space-y-4">
            <div class="community-glass">
              <div class="flex items-center justify-between gap-4 mb-3">
                <div>
                  <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/65 mb-1">MY COMMUNITY</p>
                  <h3 class="text-lg font-bold">{{ langText.community.myPanel.title }}</h3>
                </div>
                <div class="community-avatar-badge">{{ currentUserName.slice(0, 1) }}</div>
              </div>
              <div class="grid grid-cols-3 gap-2.5 mb-3">
                <div class="community-side-stat">
                  <span>{{ langText.community.myPanel.points }}</span>
                  <strong>{{ currentUserPoints }}</strong>
                </div>
                <div class="community-side-stat">
                  <span>{{ langText.community.myPanel.posts }}</span>
                  <strong>{{ myPostCount }}</strong>
                </div>
                <div class="community-side-stat">
                  <span>{{ langText.community.myPanel.interactions }}</span>
                  <strong>{{ myInteractionCount }}</strong>
                </div>
              </div>
              <p class="text-[13px] text-gray-600 leading-relaxed">
                {{ langText.community.myPanel.description }}
              </p>
            </div>

            <div class="community-glass">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-mono text-xs uppercase tracking-[0.22em] text-black/70">{{ langText.community.leaderboard.title }}</h3>
                <el-icon class="text-primary"><TrophyBase /></el-icon>
              </div>

              <div v-if="isLoading" class="space-y-3">
                <div v-for="n in 5" :key="n" class="h-11 rounded-2xl bg-gray-100 animate-pulse"></div>
              </div>

              <ul v-else class="space-y-2">
                <li v-for="(user, index) in leaderboard" :key="`${user.name}-${index}`" class="community-rank-row">
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="community-rank-row__index" :class="{ 'community-rank-row__index--top': index < 3 }">
                      {{ index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}`.padStart(2, '0') }}
                    </span>
                    <div class="min-w-0">
                      <p class="truncate font-semibold text-sm">{{ user.name }}</p>
                      <p class="text-[11px] text-gray-400 font-mono">{{ index === 0 ? langText.community.leaderboard.pioneer : langText.community.leaderboard.participant }}</p>
                    </div>
                  </div>
                  <span class="font-mono font-bold text-primary">{{ user.points }}</span>
                </li>
              </ul>
            </div>

            <div class="community-challenge-card">
              <div class="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-800/65 mb-1">WEEKLY CHALLENGE</p>
                  <h3 class="text-lg font-bold text-emerald-950">{{ weeklyChallenge.title }}</h3>
                </div>
                <div class="w-10 h-10 rounded-xl bg-white/75 text-emerald-700 flex items-center justify-center border border-white/70">
                  <el-icon :size="18"><Opportunity /></el-icon>
                </div>
              </div>
              <p class="text-[13px] text-emerald-900/75 leading-relaxed mb-3">{{ weeklyChallenge.description }}</p>
              <div class="community-progress-track mb-2">
                <div class="community-progress-bar" :style="{ width: `${weeklyChallenge.progress}%` }"></div>
              </div>
              <div class="flex items-center justify-between text-xs font-mono text-emerald-900/70">
                <span>{{ langText.community.challenge.completionLabel }} {{ weeklyChallenge.progress }}%</span>
                <span>{{ langText.community.challenge.rewardLabel }} {{ weeklyChallenge.reward }}</span>
              </div>
            </div>

            <div class="community-glass">
              <div class="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/65 mb-1">UPCOMING EVENT</p>
                  <h3 class="text-lg font-bold">{{ upcomingEvent.title }}</h3>
                </div>
                <el-icon class="text-primary" :size="18"><Calendar /></el-icon>
              </div>
              <div class="space-y-1.5 text-[13px] text-gray-600 mb-3">
                <p>{{ upcomingEvent.time }}</p>
                <p>{{ upcomingEvent.location }}</p>
                <p>{{ upcomingEvent.description }}</p>
              </div>
              <router-link to="/volunteer" class="community-inline-link">{{ langText.community.upcomingEvent.registerLink }} <el-icon><ArrowRight /></el-icon></router-link>
            </div>
          </div>
        </aside>

        <main class="col-span-12 xl:col-span-8 order-1 xl:order-2 space-y-5">
          <section class="community-glass">
            <div class="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between mb-3">
              <div class="flex-1">
                <el-input v-model="searchQuery" :placeholder="langText.community.searchPlaceholder" clearable :prefix-icon="Search" />
              </div>
              <div class="community-segment">
                <button
                  v-for="mode in feedModes"
                  :key="mode.value"
                  @click="feedMode = mode.value"
                  class="community-segment__item"
                  :class="{ 'community-segment__item--active': feedMode === mode.value }"
                >
                  {{ mode.label }}
                </button>
              </div>
            </div>

            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="topic in topicOptions"
                :key="topic"
                @click="activeTopic = topic"
                class="community-topic-pill"
                :class="{ 'community-topic-pill--active': activeTopic === topic }"
              >
                {{ topic }}
              </button>
            </div>
          </section>

          <section class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <article v-for="post in featuredPosts" :key="`featured-${post.id}`" class="community-highlight-card">
              <div class="flex items-center justify-between gap-3 mb-3">
                <span class="community-highlight-card__tag">{{ langText.community.featuredTag }}</span>
                <span class="text-xs font-mono text-black/35">HOT</span>
              </div>
              <div class="flex items-center gap-3 mb-3">
                <img :src="getAvatarUrl(post.user, post.avatarColor1)" :alt="post.user" class="w-10 h-10 rounded-xl object-cover ring-2 ring-white/80" loading="lazy" />
                <div class="min-w-0">
                  <p class="font-semibold text-sm truncate">{{ post.user }}</p>
                  <p class="text-xs font-mono text-gray-400">{{ post.topic }}</p>
                </div>
              </div>
              <p class="text-[15px] font-semibold leading-6 mb-2.5 line-clamp-3">{{ post.content }}</p>
              <div class="flex flex-wrap gap-1.5 text-xs">
                <span class="community-chip">{{ post.impact }}</span>
                <span class="community-chip">{{ post.likes }} {{ langText.community.likes }}</span>
                <span class="community-chip">{{ post.comments }} {{ langText.community.commentsLabel }}</span>
              </div>
            </article>
          </section>

          <section class="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div v-for="item in topicOverview" :key="item.label" class="community-overview-card">
              <p class="community-overview-card__label">{{ item.label }}</p>
              <p class="community-overview-card__value">{{ item.value }}</p>
              <p class="community-overview-card__hint">{{ item.hint }}</p>
            </div>
          </section>

          <section class="space-y-3">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/65 mb-1">COMMUNITY LOGS</p>
                <h2 class="text-xl md:text-2xl font-bold">{{ langText.community.feedTitle }}</h2>
              </div>
              <p class="text-xs md:text-sm text-gray-500">{{ filteredPosts.length }} {{ langText.community.visibleCount }}</p>
            </div>

            <template v-if="isLoading">
              <div v-for="n in 4" :key="n" class="community-post community-post--skeleton">
                <div class="flex items-center gap-4 mb-5">
                  <div class="w-12 h-12 rounded-2xl bg-gray-200 animate-pulse"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 rounded bg-gray-200 animate-pulse w-40"></div>
                    <div class="h-3 rounded bg-gray-100 animate-pulse w-28"></div>
                  </div>
                </div>
                <div class="h-5 rounded bg-gray-100 animate-pulse mb-3 w-24"></div>
                <div class="space-y-2 mb-4">
                  <div class="h-4 rounded bg-gray-100 animate-pulse"></div>
                  <div class="h-4 rounded bg-gray-100 animate-pulse w-11/12"></div>
                  <div class="h-4 rounded bg-gray-100 animate-pulse w-9/12"></div>
                </div>
                <div class="h-52 rounded-3xl bg-gray-100 animate-pulse"></div>
              </div>
            </template>

            <template v-else-if="filteredPosts.length > 0">
              <article v-for="(post, index) in filteredPosts" :key="post.id || index" class="community-post">
                <div class="flex items-start justify-between gap-4 mb-4">
                  <div class="flex items-center gap-4 min-w-0">
                    <img
                      :src="getAvatarUrl(post.user, post.avatarColor1)"
                      :alt="post.user"
                      class="w-10 h-10 rounded-xl object-cover ring-2 ring-white/90 shadow-sm"
                      loading="lazy"
                    />
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2 mb-1">
                        <h3 class="font-bold truncate">{{ post.user }}</h3>
                        <span class="community-post__topic">{{ post.topic }}</span>
                      </div>
                      <p class="text-xs font-mono text-gray-400">{{ post.time }} · {{ langText.community.readMinutes.replace('{min}', post.readMinutes) }}</p>
                    </div>
                  </div>
                  <span class="font-mono text-[11px] text-black/25 shrink-0">LOG #{{ String(index + 1).padStart(2, '0') }}</span>
                </div>

                <div class="flex flex-wrap gap-1.5 mb-3">
                  <span class="community-chip">{{ post.badge }}</span>
                  <span class="community-chip">{{ post.impact }}</span>
                  <span class="community-chip">{{ post.mission }}</span>
                </div>

                <p class="text-[14px] leading-6 text-gray-700 mb-3 whitespace-pre-line">
                  {{ post.expanded ? post.fullContent : post.content }}
                </p>

                <div
                  v-if="post.image"
                  class="mb-4 overflow-hidden rounded-[1.25rem] border border-black/5 bg-gray-100 shadow-inner cursor-zoom-in"
                  @click.stop="openLightbox(post.image)"
                >
                  <img :src="post.image" :alt="post.user" class="w-full h-[220px] md:h-[260px] object-cover transition-transform duration-700 hover:scale-[1.03]" />
                </div>

                <div v-if="post.commentList && post.commentList.length > 0" class="community-quote mb-4">
                  <p class="text-xs font-mono uppercase tracking-[0.16em] text-black/40 mb-2">{{ langText.community.latestComment }}</p>
                  <p class="text-sm text-gray-600 leading-relaxed">
                    <strong class="text-black">{{ post.commentList[post.commentList.length - 1].user }}</strong>
                    ：{{ post.commentList[post.commentList.length - 1].content }}
                  </p>
                </div>

                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-black/8 pt-3">
                  <div class="flex flex-wrap items-center gap-3 text-xs font-mono">
                    <button
                      @click="toggleLike(post)"
                      class="community-action-btn"
                      :class="{ 'community-action-btn--active': post.liked }"
                    >
                      <el-icon>
                        <StarFilled v-if="post.liked" />
                        <Star v-else />
                      </el-icon>
                      <span>{{ post.likes }}</span>
                    </button>
                    <button @click="openComments(post)" class="community-action-btn">
                      <el-icon><ChatDotRound /></el-icon>
                      <span>{{ post.comments }}</span>
                    </button>
                    <button @click="sharePost(post)" class="community-action-btn">
                      <el-icon><Share /></el-icon>
                      <span>{{ langText.community.share }}</span>
                    </button>
                  </div>

                  <button @click="toggleExpand(post)" class="community-inline-link shrink-0">
                    {{ post.expanded ? langText.community.collapse : langText.community.readMore }}
                    <el-icon><ArrowRight /></el-icon>
                  </button>
                </div>
              </article>

              <div class="flex justify-center pt-2" v-if="canLoadMore">
                <button
                  @click="loadMore"
                  :disabled="isLoadingMore"
                  class="community-load-more"
                >
                  <span v-if="!isLoadingMore">{{ langText.community.loadMore }}</span>
                  <span v-else class="inline-flex items-center gap-2">
                    <span class="inline-block w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin"></span>
                    {{ langText.community.loading }}
                  </span>
                </button>
              </div>
            </template>

            <div v-else class="community-empty">
              <div class="community-empty__icon">
                <el-icon :size="28"><Search /></el-icon>
              </div>
              <h3 class=”text-lg font-bold mb-2”>{{ langText.community.emptyTitle }}</h3>
              <p class=”text-sm text-gray-500 max-w-md mx-auto leading-relaxed”>
                {{ langText.community.emptyDesc }}
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>

    <el-dialog v-model="showPostDialog" :title="langText.community.postDialog.title" :width="560" align-center>
      <div class="space-y-4">
        <div>
          <p class="text-xs font-mono uppercase tracking-[0.16em] text-black/45 mb-2">{{ langText.community.postDialog.selectTopic }}</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="topic in topicOptions.filter((item) => item !== langText.community.topics.all)"
              :key="`new-${topic}`"
              @click="newPost.topic = topic"
              class="community-topic-pill"
              :class="{ 'community-topic-pill--active': newPost.topic === topic }"
            >
              {{ topic }}
            </button>
          </div>
        </div>
        <el-input
          v-model="newPost.content"
          type="textarea"
          :rows="4"
          :placeholder="langText.community.postDialog.placeholder"
          maxlength="500"
          show-word-limit
        />
        <div class="community-quote">
          <p class="text-xs font-mono uppercase tracking-[0.16em] text-black/40 mb-2">{{ langText.community.postDialog.tipTitle }}</p>
          <p class="text-sm text-gray-600 leading-relaxed">
            {{ langText.community.postDialog.tip }}
          </p>
        </div>
        <div class="flex justify-end gap-3">
          <button @click="resetPostDialog" class="community-dialog-btn community-dialog-btn--secondary">{{ langText.community.postDialog.cancel }}</button>
          <button @click="publishPost" class="community-dialog-btn community-dialog-btn--primary">{{ langText.community.postDialog.publish }}</button>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="showCommentDialog" :title="langText.community.commentDialog.title" :width="560" align-center>
      <div v-if="activePost" class="space-y-4">
        <div class="community-quote">
          <p class="text-sm font-semibold mb-1">{{ activePost.user }}</p>
          <p class="text-sm text-gray-600 line-clamp-3">{{ activePost.content }}</p>
        </div>

        <div v-if="activePost.commentList && activePost.commentList.length > 0" class="max-h-72 overflow-y-auto space-y-3 pr-1">
          <div v-for="(comment, idx) in activePost.commentList" :key="idx" class="rounded-2xl border border-black/6 bg-gray-50 px-4 py-3">
            <p class="text-xs font-bold mb-1">{{ comment.user }}</p>
            <p class="text-sm text-gray-700 leading-relaxed">{{ comment.content }}</p>
          </div>
        </div>
        <div v-else class="text-center text-gray-400 py-5 text-sm">
          {{ langText.community.commentDialog.noComments }}
        </div>

        <div class="flex gap-2 pt-2 border-t border-gray-100">
          <el-input v-model="newComment" :placeholder="langText.community.commentDialog.placeholder" size="small" />
          <button @click="submitComment" class="community-dialog-btn community-dialog-btn--primary whitespace-nowrap">{{ langText.community.commentDialog.send }}</button>
        </div>
      </div>
    </el-dialog>

    <div v-if="showLightbox" class="fixed inset-0 z-[100] bg-black/92 backdrop-blur-sm flex items-center justify-center p-4" @click="showLightbox = false">
      <div class="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
        <button @click="showLightbox = false" class="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors">
          <el-icon :size="32"><Close /></el-icon>
        </button>
        <img :src="lightboxImage" class="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-2xl" @click.stop />
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
import {
  Edit,
  TrophyBase,
  Star,
  StarFilled,
  ChatDotRound,
  Share,
  Close,
  Search,
  Calendar,
  Opportunity,
  DataAnalysis,
  ArrowRight,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { langText } from '@/language'
import { createCommunityPost, fetchCommunityPosts, likeCommunityPost } from '@/services/communityService'

import communityImage1 from '@/assets/images/community_1.png'
import communityImage2 from '@/assets/images/case_2.png'
import communityImage3 from '@/assets/images/community_3.png'

const userStore = useUserStore()
const isLoading = ref(true)
const isLoadingMore = ref(false)
const showPostDialog = ref(false)
const showCommentDialog = ref(false)
const showLightbox = ref(false)
const lightboxImage = ref('')
const activePost = ref(null)
const newComment = ref('')
const newPost = ref({ content: '', topic: langText.value.community.topics.communityActivity })
const isRemoteFeed = ref(false)
const page = ref(1)
const canLoadMore = ref(true)
const searchQuery = ref('')
const activeTopic = ref(langText.value.community.topics.all)
const feedMode = ref('latest')

const topicOptions = computed(() => [
  langText.value.community.topics.all,
  langText.value.community.topics.wasteSorting,
  langText.value.community.topics.lowCarbon,
  langText.value.community.topics.upcycling,
  langText.value.community.topics.communityActivity,
  langText.value.community.topics.greenDiet,
])
const feedModes = computed(() => [
  { label: langText.value.community.feedModes.latest, value: 'latest' },
  { label: langText.value.community.feedModes.hot, value: 'hot' },
])

const weeklyChallenge = computed(() => ({
  title: langText.value.community.challenge.title,
  description: langText.value.community.challenge.description,
  reward: langText.value.community.challenge.reward,
  progress: 68,
}))

const upcomingEvent = computed(() => ({
  title: langText.value.community.upcomingEvent.title,
  time: langText.value.community.upcomingEvent.time,
  location: langText.value.community.upcomingEvent.location,
  description: langText.value.community.upcomingEvent.description,
}))

const currentUserName = computed(() => {
  const name = userStore.user?.name || userStore.user?.username
  return typeof name === 'string' && name.trim() ? name.trim() : ''
})

const currentUserPoints = computed(() => {
  const points = Number(userStore.user?.points)
  return Number.isFinite(points) ? points : 0
})

const leaderboard = computed(() => {
  const baseList = [
    { name: 'Alex Chen', points: 2450 },
    { name: 'Sarah J.', points: 2100 },
    { name: 'Mike Ross', points: 1890 },
    { name: 'Emma W.', points: 1650 },
  ]

  const list = [...baseList]
  if (userStore.user) list.push({ name: currentUserName.value, points: currentUserPoints.value })
  return list.sort((a, b) => b.points - a.points)
})

const inferTopic = (content = '') => {
  const text = String(content)
  const t = langText.value.community.topics
  if (/牛仔|改造|旧物|缝纫|托特|围裙|手作|jeans|upcycle|old/i.test(text)) return t.upcycling
  if (/回收|垃圾|分类|塑料|电池|recycl|waste|sort/i.test(text)) return t.wasteSorting
  if (/骑行|步行|公交|低碳|通勤|bike|walk|low.carbon/i.test(text)) return t.lowCarbon
  if (/饮食|剩饭|餐具|食物|打包|diet|food|meal/i.test(text)) return t.greenDiet
  return t.communityActivity
}

const topicMetaMap = computed(() => ({
  [langText.value.community.topics.wasteSorting]: langText.value.community.topicMeta.wasteSorting,
  [langText.value.community.topics.lowCarbon]: langText.value.community.topicMeta.lowCarbon,
  [langText.value.community.topics.upcycling]: langText.value.community.topicMeta.upcycling,
  [langText.value.community.topics.communityActivity]: langText.value.community.topicMeta.communityActivity,
  [langText.value.community.topics.greenDiet]: langText.value.community.topicMeta.greenDiet,
}))

const decoratePost = (rawPost = {}) => {
  const topic = rawPost.topic || inferTopic(rawPost.fullContent || rawPost.content)
  const meta = topicMetaMap.value[topic] || topicMetaMap.value[langText.value.community.topics.communityActivity]
  const fullContent = rawPost.fullContent || rawPost.content || ''
  const content = rawPost.content || fullContent

  return {
    ...rawPost,
    topic,
    badge: rawPost.badge || meta.badge,
    impact: rawPost.impact || meta.impact,
    mission: rawPost.mission || meta.mission,
    content,
    fullContent,
    expanded: Boolean(rawPost.expanded),
    likes: Number(rawPost.likes || 0),
    comments: Number(rawPost.comments || 0),
    commentList: Array.isArray(rawPost.commentList) ? rawPost.commentList : [],
    readMinutes: Math.max(1, Math.ceil(fullContent.length / 80)),
  }
}

const sampleImages = [communityImage2, null, communityImage1, communityImage3]
const sampleColors = [
  { avatarColor1: '#4F46E5', avatarColor2: '#7C3AED' },
  { avatarColor1: '#10B981', avatarColor2: '#059669' },
  { avatarColor1: '#F59E0B', avatarColor2: '#D97706' },
  { avatarColor1: '#EC4899', avatarColor2: '#DB2777' },
]
const sampleExtras = [
  { id: 1, time: '2 HOURS AGO', likes: 24, comments: 5, liked: false },
  { id: 2, time: '5 HOURS AGO', likes: 156, comments: 12, liked: true },
  { id: 3, time: '1 DAY AGO', likes: 89, comments: 34, liked: false },
  { id: 4, time: '2 DAYS AGO', likes: 234, comments: 67, liked: false },
]

const posts = ref(
  langText.value.community.samplePosts.map((item, i) =>
    decoratePost({
      ...item,
      ...sampleExtras[i],
      image: sampleImages[i],
      ...sampleColors[i],
    }),
  ),
)

const heroStats = computed(() => {
  const t = langText.value.community.stats
  const totalLikes = posts.value.reduce((sum, post) => sum + Number(post.likes || 0), 0)
  const totalComments = posts.value.reduce((sum, post) => sum + Number(post.comments || 0), 0)

  return [
    { label: t.dailyLogs, value: posts.value.length, hint: t.dailyLogsHint },
    { label: t.interactions, value: totalLikes + totalComments, hint: t.interactionsHint },
    { label: t.activeTopics, value: topicOptions.value.length - 1, hint: t.activeTopicsHint },
  ]
})

const hottestTopic = computed(() => {
  const allLabel = langText.value.community.topics.all
  const stats = topicOptions.value
    .filter((topic) => topic !== allLabel)
    .map((topic) => ({
      topic,
      score: posts.value
        .filter((post) => post.topic === topic)
        .reduce((sum, post) => sum + post.likes + post.comments, 0),
    }))
    .sort((a, b) => b.score - a.score)

  return stats[0]?.topic || langText.value.community.topics.communityActivity
})

const featuredPosts = computed(() => {
  return [...posts.value]
    .sort((a, b) => b.likes + b.comments - (a.likes + a.comments))
    .slice(0, 2)
})

const topicOverview = computed(() => {
  const allLabel = langText.value.community.topics.all
  return topicOptions.value
    .filter((topic) => topic !== allLabel)
    .slice(0, 4)
    .map((topic) => {
      const related = posts.value.filter((post) => post.topic === topic)
      const likes = related.reduce((sum, post) => sum + post.likes, 0)
      return {
        label: topic,
        value: related.length,
        hint: related.length > 0
          ? langText.value.community.overviewLikes.replace('{count}', likes)
          : langText.value.community.overviewEmpty,
      }
    })
})

const myPostCount = computed(() => {
  return posts.value.filter((post) => post.user === currentUserName.value).length
})

const myInteractionCount = computed(() => {
  return posts.value
    .filter((post) => post.user === currentUserName.value)
    .reduce((sum, post) => sum + post.likes + post.comments, 0)
})

const filteredPosts = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  let list = [...posts.value]

  if (activeTopic.value !== langText.value.community.topics.all) {
    list = list.filter((post) => post.topic === activeTopic.value)
  }

  if (keyword) {
    list = list.filter((post) => {
      return [post.user, post.content, post.fullContent, post.topic, post.badge, post.impact]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(keyword))
    })
  }

  if (feedMode.value === 'hot') {
    list.sort((a, b) => b.likes + b.comments - (a.likes + a.comments))
  }

  return list
})

const getAvatarUrl = (name, colorHex) => {
  const bg = String(colorHex || '#2E7D32').replace('#', '')
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=${bg}&color=fff&size=80&rounded=true&bold=true`
}

const openLightbox = (image) => {
  lightboxImage.value = image
  showLightbox.value = true
}

const toggleLike = async (post) => {
  const prevLiked = Boolean(post.liked)
  const prevLikes = Number(post.likes || 0)
  post.liked = !post.liked
  post.likes += post.liked ? 1 : -1

  if (post.liked) {
    ElMessage.success({
      message: langText.value.community.messages.likeSuccess,
      duration: 1000,
      icon: StarFilled,
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

const openComments = (post) => {
  activePost.value = post
  showCommentDialog.value = true
}

const submitComment = () => {
  if (!newComment.value.trim()) return
  if (!userStore.user) {
    ElMessage.error(langText.value.community.messages.loginInvalid)
    return
  }

  if (activePost.value) {
    if (!activePost.value.commentList) activePost.value.commentList = []
    activePost.value.commentList.push({
      user: currentUserName.value,
      content: newComment.value,
    })
    activePost.value.comments += 1
    ElMessage.success(langText.value.community.messages.commentSuccess)
    newComment.value = ''
  }
}

const toggleExpand = (post) => {
  post.expanded = !post.expanded
}

const sharePost = async (post) => {
  const url = `${window.location.origin}/community?post=${post.id}`
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success(langText.value.community.messages.linkCopied)
  } catch (err) {
    console.error(err)
    ElMessage.error(langText.value.community.messages.copyFailed)
  }
}

const resetPostDialog = () => {
  showPostDialog.value = false
  newPost.value = { content: '', topic: langText.value.community.topics.communityActivity }
}

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
        posts.value.push(...result.items.map(decoratePost))
        page.value = nextPage
      }
    } else {
      ElMessage.error(result.message)
    }
    isLoadingMore.value = false
    return
  }

  setTimeout(() => {
    const lm = langText.value.community.loadMorePost
    posts.value.push(
      decoratePost({
        id: Date.now(),
        user: 'Mike Johnson',
        time: '3 DAYS AGO',
        topic: lm.topic,
        content: lm.content,
        fullContent: lm.fullContent,
        image: null,
        likes: 45,
        comments: 8,
        liked: false,
        avatarColor1: '#3B82F6',
        avatarColor2: '#2563EB',
        commentList: [],
        remote: false,
      }),
    )
    isLoadingMore.value = false
    ElMessage.success(langText.value.community.messages.loadSuccess)
  }, 1000)
}

const publishPost = async () => {
  if (!newPost.value.content.trim()) {
    ElMessage.warning(langText.value.community.messages.contentRequired)
    return
  }
  if (!userStore.user) {
    ElMessage.error(langText.value.community.messages.loginInvalid)
    return
  }

  const content = newPost.value.content
  const topic = newPost.value.topic || langText.value.community.topics.communityActivity
  const result = await createCommunityPost({ content, imageUrls: [] })
  if (result.ok) {
    posts.value.unshift(
      decoratePost({
        ...result.post,
        topic,
        content,
        fullContent: content,
      }),
    )
    isRemoteFeed.value = true
    resetPostDialog()
    ElMessage.success(langText.value.community.messages.publishSuccess)
    return
  }

  posts.value.unshift(
    decoratePost({
      id: Date.now(),
      user: currentUserName.value,
      time: 'JUST NOW',
      topic,
      content,
      fullContent: content,
      image: null,
      likes: 0,
      comments: 0,
      liked: false,
      avatarColor1: '#6366F1',
      avatarColor2: '#8B5CF6',
      commentList: [],
      remote: false,
    }),
  )

  userStore.addPoints(10)
  resetPostDialog()
  ElMessage.success(langText.value.community.messages.publishSuccessPoints)
}

onMounted(async () => {
  await userStore.init()
  const result = await fetchCommunityPosts({ page: 1, limit: 10, sort: 'latest' })
  if (result.ok && result.items.length > 0) {
    posts.value = result.items.map(decoratePost)
    isRemoteFeed.value = true
    page.value = 1
    canLoadMore.value = true
  }
  isLoading.value = false
})
</script>

<style scoped>
.community-hero,
.community-glass,
.community-pulse-card,
.community-post,
.community-highlight-card,
.community-overview-card,
.community-empty {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
}

.community-hero {
  padding: 0.95rem 1rem;
  border-radius: 1.3rem;
}

.community-glass {
  padding: 1rem;
  border-radius: 1.3rem;
}

.community-pulse-card {
  padding: 0.85rem 0.9rem;
  border-radius: 1.15rem;
}

.community-hero__cta,
.community-inline-link,
.community-load-more,
.community-dialog-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: all 0.25s var(--ease-expo);
}

.community-hero__cta {
  min-height: 2.45rem;
  padding: 0 0.95rem;
  border-radius: 999px;
}

.community-hero__cta--primary {
  background: linear-gradient(135deg, #111827 0%, #2e7d32 100%);
  color: white;
  box-shadow: 0 14px 28px rgba(46, 125, 50, 0.22);
}

.community-hero__cta--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(46, 125, 50, 0.28);
}

.community-hero__cta--secondary {
  border: 1px solid rgba(0, 0, 0, 0.12);
  color: #111827;
  background: rgba(255, 255, 255, 0.8);
}

.community-hero__cta--secondary:hover {
  border-color: rgba(46, 125, 50, 0.35);
  color: #2e7d32;
  transform: translateY(-1px);
}

.community-metric,
.community-mini-panel,
.community-side-stat,
.community-overview-card {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.community-metric {
  padding: 0.62rem 0.72rem;
  border-radius: 0.9rem;
}

.community-metric__label,
.community-mini-panel__label,
.community-overview-card__label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(17, 24, 39, 0.45);
  margin-bottom: 0.25rem;
}

.community-metric__value,
.community-mini-panel__value,
.community-overview-card__value {
  font-size: 1.2rem;
  line-height: 1;
  font-weight: 800;
  color: #111827;
}

.community-metric__hint,
.community-mini-panel__hint,
.community-overview-card__hint {
  font-size: 0.66rem;
  line-height: 1.3;
  color: #6b7280;
}

.community-pulse-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.58rem 0.68rem;
  border-radius: 0.82rem;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.7);
  font-size: 0.74rem;
  color: #4b5563;
}

.community-pulse-row strong {
  color: #111827;
  font-size: 0.7rem;
  font-family: var(--font-mono);
  text-transform: uppercase;
}

.community-mini-panel {
  border-radius: 1rem;
  padding: 0.75rem 0.8rem;
}

.community-avatar-badge {
  width: 2.4rem;
  height: 2.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.8rem;
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #166534;
  font-weight: 800;
  font-size: 0.95rem;
  border: 1px solid rgba(22, 101, 52, 0.08);
}

.community-side-stat {
  padding: 0.68rem 0.45rem;
  text-align: center;
  border-radius: 0.9rem;
}

.community-side-stat span {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(17, 24, 39, 0.45);
  margin-bottom: 0.18rem;
}

.community-side-stat strong {
  font-size: 1rem;
  font-weight: 800;
  color: #111827;
}

.community-rank-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.65rem;
  border-radius: 0.9rem;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.community-rank-row:hover {
  background: rgba(0, 0, 0, 0.03);
  transform: translateX(2px);
}

.community-rank-row__index {
  width: 1.7rem;
  flex-shrink: 0;
  text-align: center;
  font-family: var(--font-mono);
  color: rgba(17, 24, 39, 0.35);
}

.community-rank-row__index--top {
  color: #a16207;
}

.community-challenge-card {
  padding: 1rem;
  border-radius: 1.3rem;
  background: linear-gradient(145deg, rgba(236, 253, 245, 0.95) 0%, rgba(209, 250, 229, 0.95) 100%);
  border: 1px solid rgba(16, 185, 129, 0.15);
  box-shadow: 0 18px 40px rgba(16, 185, 129, 0.12);
}

.community-progress-track {
  height: 0.45rem;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  overflow: hidden;
}

.community-progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #22c55e 0%, #059669 100%);
}

.community-inline-link {
  color: #166534;
}

.community-inline-link:hover {
  color: #2e7d32;
}

.community-segment {
  display: inline-flex;
  padding: 0.2rem;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.05);
  border: 1px solid rgba(17, 24, 39, 0.06);
}

.community-segment__item {
  min-width: 3.65rem;
  height: 2rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b7280;
  transition: all 0.2s ease;
}

.community-segment__item--active {
  background: #111827;
  color: white;
  box-shadow: 0 8px 18px rgba(17, 24, 39, 0.14);
}

.community-topic-pill {
  padding: 0.42rem 0.78rem;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.09);
  background: rgba(255, 255, 255, 0.82);
  font-size: 0.72rem;
  font-weight: 600;
  color: #4b5563;
  transition: all 0.2s ease;
}

.community-topic-pill:hover {
  border-color: rgba(46, 125, 50, 0.25);
  color: #166534;
}

.community-topic-pill--active {
  border-color: rgba(46, 125, 50, 0.3);
  color: #166534;
  background: rgba(220, 252, 231, 0.9);
}

.community-highlight-card {
  position: relative;
  padding: 1rem;
  border-radius: 1.25rem;
  overflow: hidden;
}

.community-highlight-card__tag {
  display: inline-flex;
  align-items: center;
  height: 1.5rem;
  padding: 0 0.62rem;
  border-radius: 999px;
  background: rgba(220, 252, 231, 0.95);
  color: #166534;
  font-size: 0.65rem;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.community-chip {
  display: inline-flex;
  align-items: center;
  min-height: 1.55rem;
  padding: 0 0.62rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.05);
  color: #4b5563;
  font-size: 0.65rem;
  font-family: var(--font-mono);
}

.community-overview-card {
  border-radius: 1.1rem;
  padding: 0.8rem 0.85rem;
}

.community-post {
  border-radius: 1.35rem;
  padding: 1rem;
}

.community-post--skeleton {
  overflow: hidden;
}

.community-post__topic {
  display: inline-flex;
  align-items: center;
  height: 1.4rem;
  padding: 0 0.48rem;
  border-radius: 999px;
  background: rgba(46, 125, 50, 0.08);
  color: #2e7d32;
  font-size: 0.62rem;
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.community-quote {
  border-radius: 0.95rem;
  padding: 0.75rem 0.85rem;
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.05);
}

.community-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  min-height: 1.75rem;
  padding: 0 0.68rem;
  border-radius: 999px;
  color: #4b5563;
  transition: all 0.2s ease;
}

.community-action-btn:hover {
  color: #166534;
  background: rgba(46, 125, 50, 0.08);
}

.community-action-btn--active {
  color: #166534;
  background: rgba(220, 252, 231, 0.9);
}

.community-load-more,
.community-dialog-btn {
  min-height: 2.45rem;
  padding: 0 1rem;
  border-radius: 999px;
}

.community-load-more {
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.8);
  color: #111827;
}

.community-load-more:hover {
  background: #111827;
  color: white;
}

.community-dialog-btn--secondary {
  border: 1px solid rgba(0, 0, 0, 0.12);
  color: #374151;
}

.community-dialog-btn--secondary:hover {
  background: rgba(0, 0, 0, 0.04);
}

.community-dialog-btn--primary {
  background: #111827;
  color: white;
}

.community-dialog-btn--primary:hover {
  background: #2e7d32;
}

.community-empty {
  border-radius: 1.35rem;
  padding: 2.2rem 1.25rem;
  text-align: center;
}

.community-empty__icon {
  width: 3.2rem;
  height: 3.2rem;
  margin: 0 auto 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.05);
  color: #9ca3af;
}

:global(:root[data-theme='dark']) .community-page {
  color: var(--color-text) !important;
}

:global(:root[data-theme='dark']) .community-page .fixed.grid,
:global(:root[data-theme='dark']) .community-page .border-r {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:global(:root[data-theme='dark']) .community-hero,
:global(:root[data-theme='dark']) .community-glass,
:global(:root[data-theme='dark']) .community-pulse-card,
:global(:root[data-theme='dark']) .community-post,
:global(:root[data-theme='dark']) .community-highlight-card,
:global(:root[data-theme='dark']) .community-overview-card,
:global(:root[data-theme='dark']) .community-empty {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(17, 24, 20, 0.9);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.28);
}

:global(:root[data-theme='dark']) .community-metric,
:global(:root[data-theme='dark']) .community-mini-panel,
:global(:root[data-theme='dark']) .community-side-stat,
:global(:root[data-theme='dark']) .community-pulse-row,
:global(:root[data-theme='dark']) .community-topic-pill,
:global(:root[data-theme='dark']) .community-quote,
:global(:root[data-theme='dark']) .community-load-more,
:global(:root[data-theme='dark']) .community-dialog-btn--secondary {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.055);
  color: var(--color-text-muted);
}

:global(:root[data-theme='dark']) .community-challenge-card {
  border-color: rgba(110, 231, 123, 0.18);
  background: linear-gradient(145deg, rgba(18, 56, 34, 0.9) 0%, rgba(10, 28, 18, 0.94) 100%);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.26);
}

:global(:root[data-theme='dark']) .community-metric__label,
:global(:root[data-theme='dark']) .community-mini-panel__label,
:global(:root[data-theme='dark']) .community-overview-card__label,
:global(:root[data-theme='dark']) .community-side-stat span,
:global(:root[data-theme='dark']) .community-rank-row__index,
:global(:root[data-theme='dark']) .community-post .text-gray-400,
:global(:root[data-theme='dark']) .community-post .text-gray-500,
:global(:root[data-theme='dark']) .community-page .text-gray-500,
:global(:root[data-theme='dark']) .community-page .text-gray-600,
:global(:root[data-theme='dark']) .community-page .text-gray-700 {
  color: var(--color-text-muted) !important;
}

:global(:root[data-theme='dark']) .community-metric__value,
:global(:root[data-theme='dark']) .community-mini-panel__value,
:global(:root[data-theme='dark']) .community-overview-card__value,
:global(:root[data-theme='dark']) .community-pulse-row strong,
:global(:root[data-theme='dark']) .community-side-stat strong,
:global(:root[data-theme='dark']) .community-page .text-black,
:global(:root[data-theme='dark']) .community-page h1,
:global(:root[data-theme='dark']) .community-page h2,
:global(:root[data-theme='dark']) .community-page h3,
:global(:root[data-theme='dark']) .community-page h4 {
  color: var(--color-text) !important;
}

:global(:root[data-theme='dark']) .community-hero__cta--secondary,
:global(:root[data-theme='dark']) .community-segment,
:global(:root[data-theme='dark']) .community-chip,
:global(:root[data-theme='dark']) .community-empty__icon {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.07);
  color: var(--color-text-muted);
}

:global(:root[data-theme='dark']) .community-segment__item {
  color: var(--color-text-muted);
}

:global(:root[data-theme='dark']) .community-segment__item--active {
  background: var(--color-primary);
  color: #07110c;
}

:global(:root[data-theme='dark']) .community-topic-pill--active,
:global(:root[data-theme='dark']) .community-highlight-card__tag,
:global(:root[data-theme='dark']) .community-action-btn--active {
  background: rgba(110, 231, 123, 0.16);
  color: var(--color-primary);
}

@media (max-width: 767px) {
  .community-page {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .community-hero,
  .community-glass,
  .community-pulse-card,
  .community-post,
  .community-highlight-card,
  .community-empty {
    border-radius: 1.1rem;
  }
}
</style>

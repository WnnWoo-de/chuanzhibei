<template>
  <div>
    <!-- ============================================================
         固定顶部导航栏
         - z-[150] 保证在所有内容（含侧边栏 z-40、抽屉 z-999）之上
         - backdrop-blur-md + bg-white/90 实现半透明磨砂玻璃效果
         - h-16 与侧边栏 Logo 区域高度对齐
         ============================================================ -->
    <nav
      class="app-navbar fixed top-0 left-0 w-full z-[150] backdrop-blur-md px-3 md:px-6 h-14 md:h-16 flex justify-between items-center text-[10px] md:text-xs uppercase tracking-widest"
      style="font-family: var(--font-mono)"
    >
      <!-- 左侧占位区：为侧边栏汉堡按钮（固定定位 left=0）预留空间，避免遮挡 Logo -->
      <div class="w-9 md:w-10"></div>

      <!-- 中间：品牌 Logo + 站点名称（绝对居中） -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10">
        <router-link to="/" class="flex items-center gap-2">
          <img src="@/assets/logo.png" alt="Logo" class="w-7 h-7 md:w-8 md:h-8 object-contain" />
          <div class="hidden sm:flex flex-col items-center relative">
            <!-- 主标题：悬停时变为主色调 -->
            <span class="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">{{ langText.nav.brand }}</span>
            <!-- 版本号：悬停时从下方淡入 -->
            <span class="absolute top-full left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-1 group-hover:translate-y-0 text-gray-500 whitespace-nowrap">v2.0.5</span>
          </div>
        </router-link>
      </div>

      <!-- 右侧：用户登录状态 + 全局菜单按钮 -->
      <div class="flex items-center gap-2 md:gap-4 relative z-20">

        <div ref="accountMenuRef" class="relative">
          <button
            type="button"
            class="account-trigger"
            :class="{ 'account-trigger--open': isAccountOpen }"
            @click.stop="toggleAccountMenu"
          >
            <img
              v-if="userStore.user"
              :src="userAvatarUrl"
              class="account-trigger__avatar"
              :alt="userStore.user.username"
            />
            <span v-else class="account-trigger__avatar account-trigger__avatar--guest">
              <span class="guest-avatar__mark" aria-hidden="true"></span>
              <span class="guest-avatar__initials">{{ userInitials }}</span>
            </span>
            <span class="hidden sm:block normal-case">{{ accountDisplayName }}</span>
            <span class="account-trigger__chevron">›</span>
          </button>

          <Transition name="account-menu">
            <div v-if="isAccountOpen" class="account-menu-panel" @click.stop>
              <div class="account-menu-profile">
                <img
                  v-if="userStore.user"
                  :src="userAvatarUrl"
                  class="account-menu-profile__avatar"
                  :alt="userStore.user.username"
                />
                <span v-else class="account-menu-profile__avatar account-menu-profile__avatar--guest">
                  <span class="guest-avatar__mark" aria-hidden="true"></span>
                  <span class="guest-avatar__initials">{{ userInitials }}</span>
                </span>
                <div>
                  <p>{{ accountDisplayName }}</p>
                  <span>{{ userStore.isLoggedIn ? langText.account.signedIn : langText.account.signedOut }}</span>
                </div>
              </div>

              <div class="account-menu-section">
                <router-link to="/profile" class="account-menu-row" @click="closeAccountMenu">
                  <span>{{ langText.account.profile }}</span>
                  <em>Ctrl+P</em>
                </router-link>
                <router-link to="/settings" class="account-menu-row" @click="closeAccountMenu">
                  <span>{{ langText.account.settings }}</span>
                  <em>Ctrl+,</em>
                </router-link>
                <div class="account-menu-row account-menu-row--muted">
                  <span>{{ langText.account.overview }}</span>
                  <em>{{ userStore.user?.points || 0 }} {{ langText.common.points }}</em>
                </div>
              </div>

              <div class="account-menu-divider"></div>

              <div class="account-menu-section">
                <button type="button" class="account-menu-row" @click="toggleAccountSection('language')">
                  <span>{{ langText.account.language }}</span>
                  <em>{{ currentLanguageName }}</em>
                  <b :class="{ 'is-expanded': expandedAccountSections.language }">›</b>
                </button>
                <div v-if="expandedAccountSections.language" class="account-submenu">
                  <button
                    v-for="(item, key) in langTemplate"
                    :key="key"
                    type="button"
                    class="account-menu-row account-menu-row--sub"
                    :class="{ 'is-active': lang === key }"
                    @click="changeLanguage(key)"
                  >
                    <span>{{ item.name }}</span>
                    <em>{{ item.description }}</em>
                  </button>
                </div>

                <button type="button" class="account-menu-row" @click="toggleAccountSection('theme')">
                  <span>{{ langText.account.theme }}</span>
                  <em>{{ currentThemeName }}</em>
                  <b :class="{ 'is-expanded': expandedAccountSections.theme }">›</b>
                </button>
                <div v-if="expandedAccountSections.theme" class="account-submenu">
                  <button
                    type="button"
                    class="account-menu-row account-menu-row--sub"
                    :class="{ 'is-active': theme === 'light' }"
                    @click="changeTheme('light')"
                  >
                    <span>{{ langText.account.lightTheme }}</span>
                    <em>Light</em>
                  </button>
                  <button
                    type="button"
                    class="account-menu-row account-menu-row--sub"
                    :class="{ 'is-active': theme === 'dark' }"
                    @click="changeTheme('dark')"
                  >
                    <span>{{ langText.account.darkTheme }}</span>
                    <em>Dark</em>
                  </button>
                </div>

                <button type="button" class="account-menu-row" @click="toggleAccountSection('features')">
                  <span>{{ langText.account.featurePanel }}</span>
                  <em>{{ langText.account.featureHint }}</em>
                  <b :class="{ 'is-expanded': expandedAccountSections.features }">›</b>
                </button>
                <div v-if="expandedAccountSections.features" class="account-submenu">
                  <router-link to="/chat" class="account-menu-row account-menu-row--sub" @click="closeAccountMenu">
                    <span>{{ langText.account.gsAssistant }}</span>
                    <em>Alt+G</em>
                  </router-link>
                  <router-link to="/quiz" class="account-menu-row account-menu-row--sub" @click="closeAccountMenu">
                    <span>{{ langText.account.quiz }}</span>
                    <em>Alt+Q</em>
                  </router-link>
                  <router-link to="/store" class="account-menu-row account-menu-row--sub" @click="closeAccountMenu">
                    <span>{{ langText.account.store }}</span>
                    <em>Alt+S</em>
                  </router-link>
                  <router-link to="/achievements" class="account-menu-row account-menu-row--sub" @click="closeAccountMenu">
                    <span>{{ langText.account.badges }}</span>
                    <em>Alt+B</em>
                  </router-link>
                </div>
              </div>

              <div class="account-menu-divider"></div>

              <div class="account-menu-section">
                <button
                  v-if="userStore.isLoggedIn && !userStore.isGuest"
                  type="button"
                  class="account-menu-row account-menu-row--danger"
                  @click="handleLogout"
                >
                  <span>{{ langText.common.logout }}</span>
                  <em>Ctrl+Shift+Q</em>
                </button>
                <template v-else>
                  <router-link to="/auth/login" class="account-menu-row" @click="closeAccountMenu">
                    <span>{{ langText.common.login }}</span>
                    <em>Enter</em>
                  </router-link>
                  <router-link to="/auth/register" class="account-menu-row" @click="closeAccountMenu">
                    <span>{{ langText.common.register }}</span>
                    <em>Ctrl+N</em>
                  </router-link>
                </template>
              </div>
            </div>
          </Transition>
        </div>

        <!-- 全局菜单触发按钮：点击展开/收起全屏抽屉菜单 -->
        <button @click="toggleMenu" class="global-menu-button group flex items-center gap-1.5 md:gap-2 hover:text-[#2E7D32] transition-colors">
          <div class="global-menu-button__inner border border-current px-2.5 py-1 md:px-3 md:py-1.5 transition-all duration-300 group-hover:bg-[#2E7D32] group-hover:text-white group-hover:border-[#2E7D32] flex items-center gap-1.5">
            <span>{{ langText.common.menu }}</span>
            <!-- 开关状态指示符：展开时旋转 90° -->
            <span class="inline-block transition-transform duration-300 text-[10px]" :class="{ 'rotate-90': isOpen }">
              {{ isOpen ? '[ - ]' : '[ + ]' }}
            </span>
          </div>
        </button>
      </div>
    </nav>

    <!-- ============================================================
         使用 Teleport 将全屏抽屉菜单渲染到 body 根节点
         目的：彻底脱离父级 stacking context，避免 z-index 失效
         ============================================================ -->
    <Teleport to="body">
      <!-- 背景遮罩：点击关闭菜单，抽屉打开时半透明可见 -->
      <div
        class="drawer-overlay"
        :class="{ 'drawer-overlay--visible': isOpen }"
        @click="toggleMenu"
      ></div>

      <!-- 抽屉主面板：从顶部完整滑入，覆盖全屏 -->
      <div
        class="drawer-panel"
        :class="{ 'drawer-panel--open': isOpen }"
      >
        <!-- 抽屉头部：版权信息 + 关闭按钮 -->
        <div
          class="px-4 md:px-6 py-4 flex justify-between items-center text-xs uppercase tracking-widest border-b border-black/10 h-14 md:h-16 flex-shrink-0"
          style="font-family: var(--font-mono)"
        >
          <div><span class="font-bold">©GAW · GreenSight</span></div>
          <button @click="toggleMenu" class="hover:opacity-70 transition-opacity flex items-center gap-2 text-sm">
            {{ langText.common.close }} <span class="text-lg leading-none">✕</span>
          </button>
        </div>

        <!-- 抽屉内容区：主菜单导航 + 用户信息 -->
        <div class="flex-1 px-4 md:px-6 py-8 md:py-10 relative overflow-y-auto">
          <!-- 背景网格装饰（纯视觉，不可交互） -->
          <div class="absolute inset-0 grid grid-cols-12 gap-4 px-6 pointer-events-none opacity-[0.04] h-full">
            <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
          </div>

          <!-- 主菜单导航链接列表 -->
          <div class="relative z-10 flex flex-col justify-center space-y-4 md:space-y-6 min-h-full">
            <!-- 逐项延迟动画：isOpen 时依次淡入上移 -->
            <div
              v-for="(item, i) in navItems"
              :key="item.path"
              class="menu-item"
              :style="isOpen ? `transition-delay: ${i * 60}ms` : 'transition-delay: 0ms'"
              :class="{ 'menu-item--visible': isOpen }"
            >
              <router-link
                :to="item.path"
                @click="toggleMenu"
                class="drawer-nav-link group/link flex items-center gap-3 md:gap-4 font-bold tracking-tighter transition-colors duration-200 text-2xl sm:text-3xl md:text-6xl"
                :class="{ 'drawer-nav-link--active': isActive(item.path) }"
              >
                <!-- 菜单图标：悬停时从半透明变为完全可见 -->
                <NavIcons :name="item.iconName" size="48" class="w-9 h-9 md:w-16 md:h-16 opacity-50 group-hover/link:opacity-100 transition-opacity" />
                  {{ langText.nav[item.labelKey] }}
                <!-- 当前页面标识 -->
                <span
                  v-if="isActive(item.path)"
                  class="text-xs align-middle opacity-50 ml-2"
                  style="font-family: var(--font-mono)"
                >← {{ langText.common.current }}</span>
              </router-link>
              <!-- 分割线：当前项完全不透明，其余半透明 -->
              <div
                class="h-px mt-3 bg-black/10 transition-all duration-500"
                :class="isActive(item.path) ? 'opacity-100' : 'opacity-50'"
              ></div>
            </div>

            <!-- 用户信息区域（菜单底部） -->
            <div
              class="menu-item pt-6"
              :style="isOpen ? `transition-delay: ${navItems.length * 60 + 60}ms` : 'transition-delay: 0ms'"
              :class="{ 'menu-item--visible': isOpen }"
            >
              <!-- 已登录：显示头像、用户名、积分和退出按钮 -->
              <div v-if="userStore.user" class="flex items-center gap-4">
                <img
                  :src="userAvatarUrl"
                  class="w-10 h-10 rounded-full border-2 border-black/10 object-cover"
                  :alt="userStore.user.username"
                />
                <div style="font-family: var(--font-mono)">
                  <p class="font-bold text-base">{{ userStore.user.username }}</p>
                  <p class="opacity-50 text-xs">{{ langText.common.points }}: {{ userStore.user.points || 0 }}</p>
                </div>
                <button
                  @click="handleLogout"
                  class="ml-4 text-xs border border-black/20 px-4 py-2 hover:bg-black hover:text-white transition-colors"
                  style="font-family: var(--font-mono)"
                >
                  {{ langText.common.logout }}
                </button>
              </div>

              <!-- 未登录：显示登录/注册入口 -->
              <router-link
                v-else
                to="/auth/login"
                @click="toggleMenu"
                class="text-sm border border-black/20 px-6 py-3 hover:bg-black hover:text-white transition-colors inline-block"
                style="font-family: var(--font-mono)"
              >
                {{ langText.common.loginRegister }} →
              </router-link>
            </div>
          </div>
        </div>

        <!-- 抽屉底部：版权信息 -->
        <div class="px-6 py-3 border-t border-black/10 flex justify-between items-center opacity-30 flex-shrink-0" style="font-family: var(--font-mono); font-size: 10px">
          <span>{{ langText.nav.footerTitle }}</span>
          <span>{{ langText.nav.footerSlogan }}</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import { useUserStore } from '@/stores/user'
import NavIcons from '@/components/icons/NavIcons.vue'
import { changeLang, lang, langTemplate, langText } from '@/language'
import { setTheme, theme } from '@/theme'

// 控制全屏抽屉菜单的展开/收起状态
const isOpen = ref(false)
const isAccountOpen = ref(false)
const accountMenuRef = ref(null)
const expandedAccountSections = reactive({
  language: false,
  theme: false,
  features: false,
})
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

// 全局菜单导航项配置
const navItems = [
  { path: '/', labelKey: 'about', iconName: 'about' },
  { path: '/reconstruction', labelKey: 'reconstruction', iconName: 'reconstruction' },
  { path: '/chat', labelKey: 'chat', iconName: 'chat' },
  { path: '/community', labelKey: 'community', iconName: 'community' },
  { path: '/volunteer', labelKey: 'volunteer', iconName: 'volunteer' },
  { path: '/weather', labelKey: 'weather', iconName: 'weather' },
  { path: '/achievements', labelKey: 'achievements', iconName: 'achievements' },
]

const accountDisplayName = computed(() => userStore.user?.username || langText.value.account.guest)
const currentLanguageName = computed(() => langTemplate[lang.value]?.name || langTemplate.CN.name)
const currentThemeName = computed(() => (
  theme.value === 'dark' ? langText.value.account.darkTheme : langText.value.account.lightTheme
))
const userInitials = computed(() => {
  const source = String(userStore.user?.username || userStore.user?.email || 'G').trim()
  return (source.match(/[a-zA-Z0-9]/g)?.join('') || source || 'G').slice(0, 2).toUpperCase()
})

/**
 * 判断给定路径是否为当前激活路由
 * 首页精确匹配，其他路由前缀匹配
 * @param {string} path - 路由路径
 */
const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

/**
 * 用户头像 URL
 * 优先使用用户上传的头像，否则使用 ui-avatars 服务动态生成
 */
const userAvatarUrl = computed(() => {
  if (userStore.user?.avatar) return userStore.user.avatar
  const name = encodeURIComponent(userStore.user?.username || 'U')
  return `https://ui-avatars.com/api/?name=${name}&background=2E7D32&color=fff&size=96&rounded=true&bold=true`
})

/**
 * 切换全屏抽屉菜单
 * 打开时禁止 body 滚动，关闭时恢复
 */
const toggleMenu = () => {
  closeAccountMenu()
  isOpen.value = !isOpen.value
  document.body.style.overflow = isOpen.value ? 'hidden' : ''
}

const toggleAccountMenu = () => {
  isAccountOpen.value = !isAccountOpen.value
}

const closeAccountMenu = () => {
  isAccountOpen.value = false
}

const toggleAccountSection = (section) => {
  expandedAccountSections[section] = !expandedAccountSections[section]
}

const changeLanguage = (key) => {
  changeLang(key)
}

const changeTheme = (key) => {
  setTheme(key)
}

const handleDocumentClick = (event) => {
  if (!isAccountOpen.value) return
  if (accountMenuRef.value?.contains?.(event.target)) return
  closeAccountMenu()
}

/**
 * 退出登录并关闭菜单，跳转到首页
 */
const handleLogout = () => {
  userStore.logout()
  closeAccountMenu()
  if (isOpen.value) toggleMenu()
  router.push('/')
}

// 组件挂载时：使用 GSAP 对导航栏做从上方淡入的动画
onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  gsap.from('nav', {
    y: -50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0.5,
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
nav {
  font-family: var(--font-mono);
}

.app-navbar {
  border-bottom: 1px solid var(--navbar-border);
  background: var(--navbar-bg);
  color: var(--navbar-text);
}

.app-navbar :deep(a),
.app-navbar button {
  color: inherit;
}

.account-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 2.25rem;
  border: 1px solid var(--color-border-soft);
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-surface) 78%, transparent);
  padding: 0.2rem 0.55rem 0.2rem 0.25rem;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  color: var(--navbar-text);
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.account-trigger:focus-visible,
.global-menu-button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-primary) 58%, transparent);
  outline-offset: 3px;
}

.account-trigger:hover,
.account-trigger--open {
  border-color: rgba(46, 125, 50, 0.42);
  background: var(--color-surface);
  color: var(--color-primary);
}

.account-trigger__avatar,
.account-menu-profile__avatar {
  position: relative;
  display: grid;
  place-items: center;
  border-radius: 999px;
  object-fit: cover;
  overflow: hidden;
  background: #111;
  color: #fff;
  font-weight: 800;
  letter-spacing: 0;
}

.account-trigger__avatar {
  width: 1.75rem;
  height: 1.75rem;
  font-size: 0.72rem;
}

.account-trigger__chevron {
  display: inline-block;
  color: currentColor;
  font-size: 1rem;
  line-height: 1;
  transform: rotate(90deg);
  transition: transform 0.2s ease;
}

.account-trigger--open .account-trigger__chevron {
  transform: rotate(-90deg);
}

.account-menu-panel {
  position: absolute;
  top: calc(100% + 0.65rem);
  right: 0;
  width: min(92vw, 23rem);
  overflow: hidden;
  border: 1px solid var(--color-border-strong);
  border-radius: 0.45rem;
  background: var(--color-surface-muted);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
  color: var(--color-text);
  padding: 0.4rem 0;
  text-transform: none;
}

.account-menu-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.95rem 0.7rem;
}

.account-menu-profile__avatar {
  width: 2.35rem;
  height: 2.35rem;
  flex: 0 0 2.35rem;
  font-size: 0.9rem;
}

.account-trigger__avatar--guest,
.account-menu-profile__avatar--guest {
  border: 1px solid rgba(255, 255, 255, 0.7);
  background:
    radial-gradient(circle at 72% 18%, rgba(255, 255, 255, 0.94) 0 8%, transparent 9%),
    linear-gradient(145deg, #0f172a 0%, #176b43 44%, #8bdc72 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.2),
    0 7px 18px rgba(23, 107, 67, 0.24);
}

.account-trigger__avatar--guest::before,
.account-menu-profile__avatar--guest::before {
  content: '';
  position: absolute;
  inset: 16% 15% auto auto;
  width: 38%;
  height: 38%;
  border-radius: 70% 30% 68% 32%;
  background: rgba(255, 255, 255, 0.32);
  transform: rotate(-28deg);
}

.account-trigger__avatar--guest::after,
.account-menu-profile__avatar--guest::after {
  content: '';
  position: absolute;
  inset: auto -18% -24% 18%;
  height: 58%;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  filter: blur(3px);
  transform: rotate(-16deg);
}

.guest-avatar__mark {
  position: absolute;
  left: 19%;
  top: 22%;
  width: 32%;
  height: 34%;
  border-radius: 76% 24% 68% 32%;
  background: #c8f7b8;
  box-shadow: 0.38rem 0.18rem 0 -0.12rem rgba(224, 255, 207, 0.9);
  transform: rotate(-34deg);
}

.guest-avatar__initials {
  position: relative;
  z-index: 1;
  transform: translateY(0.04rem);
  text-shadow: 0 1px 5px rgba(6, 35, 21, 0.35);
}

.account-menu-profile p {
  max-width: 15rem;
  overflow: hidden;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-menu-profile span {
  display: block;
  margin-top: 0.15rem;
  color: var(--color-text-subtle);
  font-size: 0.72rem;
}

.account-menu-section {
  padding: 0.25rem 0;
}

.account-menu-divider {
  height: 1px;
  margin: 0.3rem 0;
  background: var(--color-border-soft);
}

.account-menu-row {
  display: grid;
  width: 100%;
  min-height: 2.05rem;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 0.5rem;
  align-items: center;
  padding: 0.42rem 0.95rem 0.42rem 1.15rem;
  color: var(--color-text-muted);
  font-size: 0.84rem;
  line-height: 1.25;
  text-align: left;
  transition: background 0.16s ease, color 0.16s ease;
}

.account-menu-row:hover,
.account-menu-row.is-active {
  background: color-mix(in srgb, var(--color-primary) 14%, transparent);
  color: var(--color-text);
}

.account-menu-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-menu-row em {
  color: var(--color-text-subtle);
  font-size: 0.76rem;
  font-style: normal;
  white-space: nowrap;
}

.account-menu-row b {
  color: var(--color-text-subtle);
  font-size: 1rem;
  line-height: 1;
  transition: transform 0.18s ease;
}

.account-menu-row b.is-expanded {
  transform: rotate(90deg);
}

.account-menu-row--sub {
  min-height: 1.85rem;
  padding-left: 2rem;
  background: color-mix(in srgb, var(--color-surface) 62%, transparent);
  font-size: 0.78rem;
}

.account-menu-row--muted {
  cursor: default;
  color: var(--color-text-muted);
}

.account-menu-row--muted:hover {
  background: transparent;
  color: var(--color-text-muted);
}

.account-menu-row--danger:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.account-submenu {
  border-left: 2px solid color-mix(in srgb, var(--color-primary) 42%, transparent);
  margin: 0.12rem 0 0.22rem 0.95rem;
}

.account-menu-enter-active,
.account-menu-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.account-menu-enter-from,
.account-menu-leave-to {
  opacity: 0;
  transform: translateY(-0.35rem) scale(0.98);
}

/* 背景遮罩：默认不可见、不可交互 */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  z-index: 998;
  pointer-events: none;
  transition: background 0.4s ease;
}
/* 遮罩可见状态：半透明并允许点击 */
.drawer-overlay--visible {
  background: rgba(0, 0, 0, 0.15);
  pointer-events: auto;
}

/* 抽屉主面板：初始位于屏幕上方，使用 cubic-bezier 实现流畅滑入 */
.drawer-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: var(--color-surface);
  color: var(--color-text);
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: translateY(-100%);
  transition: transform 0.65s cubic-bezier(0.76, 0, 0.24, 1);
  will-change: transform;
}

.drawer-nav-link {
  color: var(--color-text);
}

.drawer-nav-link:hover,
.drawer-nav-link--active {
  color: var(--color-primary);
}
/* 抽屉打开状态：滑入到屏幕内 */
.drawer-panel--open {
  transform: translateY(0);
}

/* 菜单项：初始透明+下移，逐项延迟淡入上移 */
.menu-item {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.menu-item--visible {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 640px) {
  .app-navbar {
    height: 3.65rem;
    padding-inline: 0.85rem;
  }

  .account-trigger {
    height: 2.45rem;
    gap: 0.36rem;
    padding: 0.22rem 0.48rem 0.22rem 0.22rem;
    background: color-mix(in srgb, var(--color-surface) 88%, transparent);
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.1);
  }

  .account-trigger__avatar {
    width: 2rem;
    height: 2rem;
    font-size: 0.72rem;
  }

  .account-trigger__chevron {
    font-size: 0.92rem;
  }

  .global-menu-button__inner {
    min-height: 2.25rem;
    padding-inline: 0.75rem;
    font-size: 0.68rem;
    letter-spacing: 0.04em;
  }

  .account-menu-panel {
    position: fixed;
    top: calc(4.15rem + env(safe-area-inset-top));
    right: max(0.85rem, env(safe-area-inset-right));
    left: max(0.85rem, env(safe-area-inset-left));
    width: auto;
    max-height: calc(100svh - 5.35rem - env(safe-area-inset-bottom));
    overflow-y: auto;
    border-radius: 0.85rem;
    background: color-mix(in srgb, var(--color-surface-muted) 94%, transparent);
    box-shadow: 0 22px 60px rgba(15, 23, 42, 0.22);
    -webkit-overflow-scrolling: touch;
  }

  .account-menu-profile {
    gap: 0.8rem;
    padding: 0.95rem 1rem 0.85rem;
    background:
      linear-gradient(135deg, rgba(46, 125, 50, 0.1), transparent 62%),
      color-mix(in srgb, var(--color-surface) 64%, transparent);
  }

  .account-menu-profile__avatar {
    width: 2.8rem;
    height: 2.8rem;
    flex-basis: 2.8rem;
    font-size: 0.94rem;
  }

  .account-menu-profile p {
    max-width: calc(100vw - 7.5rem);
    font-size: 1rem;
  }

  .account-menu-row {
    min-height: 2.75rem;
    grid-template-columns: minmax(0, 1fr) auto;
    padding: 0.62rem 1rem;
    font-size: 0.92rem;
  }

  .account-menu-row em {
    max-width: 8.5rem;
    overflow: hidden;
    font-size: 0.74rem;
    text-overflow: ellipsis;
  }

  .account-menu-row b {
    display: none;
  }

  .account-submenu {
    margin-left: 1rem;
  }

  .account-menu-row--sub {
    min-height: 2.35rem;
    padding-left: 1.15rem;
    font-size: 0.84rem;
  }

  .drawer-panel {
    height: 100svh;
  }

  .drawer-nav-link {
    gap: 0.7rem;
    font-size: clamp(1.55rem, 8.5vw, 2.35rem);
    line-height: 1.05;
  }

  .drawer-nav-link :deep(svg) {
    width: 2.1rem;
    height: 2.1rem;
  }
}

@media (max-width: 380px) {
  .app-navbar {
    padding-inline: 0.65rem;
  }

  .account-trigger {
    height: 2.25rem;
  }

  .account-trigger__avatar {
    width: 1.82rem;
    height: 1.82rem;
  }

  .global-menu-button__inner {
    min-height: 2.1rem;
    padding-inline: 0.58rem;
  }

  .account-menu-row em {
    display: none;
  }
}
</style>

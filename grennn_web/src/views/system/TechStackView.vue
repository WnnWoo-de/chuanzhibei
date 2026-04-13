<template>
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans">
    <!-- Sidebar -->
    <TheSidebar :isOpen="sidebarOpen" @toggle="toggleSidebar" @close="closeSidebar" />

    <!-- Top Navbar -->
    <TheNavbar />

    <!-- Grid Background -->
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
      <div v-for="n in 4" :key="`m-${n}`" class="border-r border-black h-full block md:hidden col-span-3"></div>
    </div>

    <!-- Sidebar + Content Layout -->
    <div class="relative z-10 pt-24 pb-12 px-6">
      <div class="grid grid-cols-12 gap-8">
        <!-- Sidebar -->
        <div class="col-span-12 md:col-span-3">
          <div class="sticky top-28">
            <h1 class="text-4xl md:text-5xl font-bold mt-2 mb-6">技术栈</h1>
            <p class="text-sm opacity-60 max-w-[200px] mb-8">
              前端技术栈<br>
              后端架构<br>
              了解项目使用的核心技术
            </p>

            <!-- Quick Navigation -->
            <nav class="hidden md:flex flex-col gap-2">
              <a href="#frontend" @click.prevent="scrollTo('#frontend')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                🎨 前端技术
              </a>
              <a href="#backend" @click.prevent="scrollTo('#backend')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                🔧 后端架构
              </a>
              <a href="#database" @click.prevent="scrollTo('#database')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                💾 数据库
              </a>
              <a href="#ai" @click.prevent="scrollTo('#ai')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                🤖 AI 技术
              </a>
              <a href="#tools" @click.prevent="scrollTo('#tools')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                🛠️ 开发工具
              </a>
            </nav>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-span-12 md:col-span-9">
          <!-- Introduction -->
          <section class="mb-16 animate-on-scroll">
            <div class="bg-gradient-to-br from-green-50 to-transparent p-8 rounded-2xl border border-green-100">
              <p class="text-gray-700 mb-4 font-mono text-xs uppercase tracking-widest opacity-70">项目架构</p>
              <p class="text-gray-700 mb-4">
                GreenSight AI 采用现代全栈开发技术，构建了一个功能丰富的环保社区平台。
              </p>
              <p class="text-gray-700">
                项目融合了前端现代化框架、后端 Node.js 架构和 AI 技术，FastAPI 作为全链路的数据调度中枢,为用户提供可持续生活方式的解决方案。
              </p>
            </div>
          </section>

          <!-- Frontend Technology -->
          <section id="frontend" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>🎨 前端技术栈</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 class="font-bold mb-4 text-blue-900">核心框架</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> Vue.js 3 (Composition API)</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> Vite 构建工具</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> Tailwind CSS 样式框架</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> Pinia 状态管理</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> Vue Router 路由管理</li>
                                    <li class="flex items-center gap-2"><span class="text-blue-500">•</span> Axios HTTP 客户端</li>
                </ul>
              </div>

              <div class="bg-purple-50 p-6 rounded-lg border border-purple-100">
                <h3 class="font-bold mb-4 text-purple-900">UI 与交互</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-purple-500">•</span> Element Plus UI 组件库</li>
                  <li class="flex items-center gap-2"><span class="text-purple-500">•</span> GSAP 动画库</li>
                  <li class="flex items-center gap-2"><span class="text-purple-500">•</span> NProgress 进度条</li>
                  <li class="flex items-center gap-2"><span class="text-purple-500">•</span> Open Graph (OG) 图像处理</li>
                  <li class="flex items-center gap-2"><span class="text-purple-500">•</span> Responsive Design 响应式设计</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Backend Architecture -->
          <section id="backend" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>🔧 后端架构</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-green-50 p-6 rounded-lg border border-green-100">
                <h3 class="font-bold mb-4 text-green-900">服务器端</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> Node.js + Express</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> RESTful API 设计</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> Socket.io 实时通信</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> Helmet 安全中间件</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> CORS 跨域支持</li>
                                    <li class="flex items-center gap-2"><span class="text-green-500">•</span> FastAPI 全链路的数据调度中枢</li>
                </ul>
              </div>

              <div class="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
                <h3 class="font-bold mb-4 text-yellow-900">认证与授权</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-yellow-500">•</span> Passport.js 认证框架</li>
                  <li class="flex items-center gap-2"><span class="text-yellow-500">•</span> JWT (JSON Web Tokens)</li>
                  <li class="flex items-center gap-2"><span class="text-yellow-500">•</span> Google OAuth 2.0</li>
                  <li class="flex items-center gap-2"><span class="text-yellow-500">•</span> Microsoft OAuth</li>
                  <li class="flex items-center gap-2"><span class="text-yellow-500">•</span> bcryptjs 密码加密</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Database -->
          <section id="database" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>💾 数据库与存储</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-orange-50 p-6 rounded-lg border border-orange-100">
                <h3 class="font-bold mb-4 text-orange-900">关系型数据库</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-orange-500">•</span> MySQL 8.0</li>
                  <li class="flex items-center gap-2"><span class="text-orange-500">•</span> Sequelize ORM</li>
                  <li class="flex items-center gap-2"><span class="text-orange-500">•</span> 数据迁移管理</li>
                  <li class="flex items-center gap-2"><span class="text-orange-500">•</span> 查询优化</li>
                </ul>
              </div>

              <div class="bg-red-50 p-6 rounded-lg border border-red-100">
                <h3 class="font-bold mb-4 text-red-900">文件存储</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-red-500">•</span> Multer 文件上传</li>
                  <li class="flex items-center gap-2"><span class="text-red-500">•</span> Cloudflare R2 存储</li>
                  <li class="flex items-center gap-2"><span class="text-red-500">•</span> 文件验证与处理</li>
                  <li class="flex items-center gap-2"><span class="text-red-500">•</span> 响应式图片</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- AI Technology -->
          <section id="ai" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>🤖 AI 技术集成</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-pink-50 p-6 rounded-lg border border-pink-100">
                <h3 class="font-bold mb-4 text-pink-900">大语言模型</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-pink-500">•</span> Qwen2.5 AI 模型</li>
                  <li class="flex items-center gap-2"><span class="text-pink-500">•</span> 智能对话系统</li>
                 <li class="flex items-center gap-2"><span class="text-pink-500">•</span> Fastapi 集成 AI 模型</li>
                  <li class="flex items-center gap-2"><span class="text-pink-500">•</span> 自然语言处理</li>
                  <li class="flex items-center gap-2"><span class="text-pink-500">•</span> 文本生成与理解</li>
                </ul>
              </div>

              <div class="bg-teal-50 p-6 rounded-lg border border-teal-100">
                <h3 class="font-bold mb-4 text-teal-900">AI 功能</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-teal-500">•</span> 碳足迹计算</li>
                  <li class="flex items-center gap-2"><span class="text-teal-500">•</span> 废弃物识别</li>
                  <li class="flex items-center gap-2"><span class="text-teal-500">•</span> 个性化建议</li>
                  <li class="flex items-center gap-2"><span class="text-teal-500">•</span> 对话历史管理</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Development Tools -->
          <section id="tools" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>🛠️ 开发工具与部署</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                <h3 class="font-bold mb-4 text-indigo-900">开发工具</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-indigo-500">•</span> VS Code 编辑器</li>
                  <li class="flex items-center gap-2"><span class="text-indigo-500">•</span> Git 版本控制</li>
                  <li class="flex items-center gap-2"><span class="text-indigo-500">•</span> ESLint 代码检查</li>
                  <li class="flex items-center gap-2"><span class="text-indigo-500">•</span> Prettier 代码格式化</li>
                </ul>
              </div>

              <div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 class="font-bold mb-4 text-gray-900">部署与自动化</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-gray-500">•</span> Cloudflare Pages 部署</li>
                  <li class="flex items-center gap-2"><span class="text-gray-500">•</span> Wrangler 工具</li>
                  <li class="flex items-center gap-2"><span class="text-gray-500">•</span> GitHub Actions</li>
                  <li class="flex items-center gap-2"><span class="text-gray-500">•</span> 环境变量管理</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Footer -->
          <section class="pt-12 border-t border-black/10">
            <p class="text-center text-gray-500 text-sm font-mono">
              © 2026 GreenSight AI. All rights reserved. | MIT License
            </p>
            <p class="text-center text-gray-400 text-xs mt-4 font-mono">
              最后更新：{{ currentDate }}
            </p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TheNavbar from '@/components/layout/TheNavbar.vue'
import TheSidebar from '@/components/layout/TheSidebar.vue'

gsap.registerPlugin(ScrollTrigger)

const currentDate = ref(new Date().toLocaleDateString('zh-CN'))
const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const scrollTo = (selector) => {
  const element = document.querySelector(selector)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// GSAP Scroll Animations
onMounted(() => {
  nextTick(() => {
    const elements = document.querySelectorAll('.animate-on-scroll')
    if (elements && elements.length > 0) {
      elements.forEach((section) => {
        gsap.fromTo(
          section,
          { y: 30, opacity: 0 },
          {
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            clearProps: 'all',
          },
        )
      })
    }
  })
})
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Hide scrollbar */
::-webkit-scrollbar {
  display: none;
}

html {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>

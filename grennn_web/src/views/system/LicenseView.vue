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
            <h1 class="text-4xl md:text-5xl font-bold mt-2 mb-6">许可协议</h1>
            <p class="text-sm opacity-60 max-w-[200px] mb-8">
              项目声明与<br>
              开源许可<br>
              了解项目许可证及声明信息
            </p>

            <!-- Quick Navigation -->
            <nav class="hidden md:flex flex-col gap-2">
              <a href="#license" @click.prevent="scrollTo('#license')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                📜 开源许可证
              </a>
              <a href="#statement" @click.prevent="scrollTo('#statement')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                🎯 项目声明
              </a>
              <a href="#vision" @click.prevent="scrollTo('#vision')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                💚 项目愿景
              </a>
              <a href="#tech" @click.prevent="scrollTo('#tech')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                🛠️ 技术栈
              </a>
              <a href="#contribution" @click.prevent="scrollTo('#contribution')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                📖 使用贡献
              </a>
              <a href="#contact" @click.prevent="scrollTo('#contact')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                📧 联系反馈
              </a>
            </nav>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-span-12 md:col-span-9">
          <!-- Introduction -->
          <section class="mb-16 animate-on-scroll">
            <div class="bg-gradient-to-br from-green-50 to-transparent p-8 rounded-2xl border border-green-100">
              <p class="text-gray-700 mb-4 font-mono text-xs uppercase tracking-widest opacity-70">项目信息</p>
              <p class="text-gray-700 mb-4">
                <strong>项目名称：</strong>GreenSight AI Web（绿我同行）
              </p>
              <p class="text-gray-700 mb-4">
                <strong>版本：</strong>2.0
              </p>
              <p class="text-gray-700 mb-4">
                <strong>开发者：</strong>wnnw
              </p>
              <p class="text-gray-700">
                <strong>更新时间：</strong>{{ currentDate }}
              </p>
            </div>
          </section>

          <!-- MIT License -->
          <section id="license" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>📜 开源许可证</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <p class="text-gray-700 mb-6">
              本项目采用 <strong>MIT License</strong> 开源许可证。以下是许可证的完整条款：
            </p>

            <div class="bg-gray-50 p-6 rounded-lg border border-black/10 font-mono text-xs md:text-sm leading-relaxed overflow-auto max-h-80">
              <pre>MIT License

Copyright (c) 2025 wnnw

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</pre>
            </div>
          </section>

          <!-- Project Statement -->
          <section id="statement" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>🎯 项目声明</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="space-y-4">
              <p class="text-gray-700">
                GreenSight AI 是一个为"<strong>传智杯</strong>AI-Web 网页开发挑战赛"设计开发的项目。
              </p>
              <p class="text-gray-700">
                本项目是开发者 <strong>wnnw</strong> 个人完成的学习成果和竞赛作品，集合了现代化的前端技术和 AI 应用探索。
              </p>
              <p class="text-gray-700">
                项目已开源，欢迎社区开发者查看、学习、改进和扩展。
              </p>
            </div>
          </section>

          <!-- Project Vision -->
          <section id="vision" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>💚 项目愿景</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="space-y-4">
              <p class="text-gray-700">
                <strong>致力于为用户打造更低碳、更可持续的绿色生活方式</strong>，通过 AI 技术和社区协作：
              </p>
              <ul class="space-y-3 text-gray-700">
                <li class="flex items-start gap-3">
                  <span class="mt-1 text-green-600">🌿</span>
                  <span>倡导节能减排理念，帮助用户建立日常环保习惯</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="mt-1 text-green-600">♻️</span>
                  <span>提供垃圾分类、碳足迹与绿色出行等实用支持</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="mt-1 text-green-600">🤝</span>
                  <span>连接更多关注生态与可持续发展的环保社区</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="mt-1 text-green-600">💚</span>
                  <span>用技术激发公众参与，让每个人都能成为绿色行动者</span>
                </li>
              </ul>
            </div>
          </section>

          <!-- Technology Stack -->
          <section id="tech" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>🛠️ 技术栈</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 class="font-bold mb-4 text-blue-900">前端技术</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> Vue.js 3 (Composition API)</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> Vite 构建工具</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> Tailwind CSS 样式框架</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> Pinia 状态管理</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> Vue Router 路由管理</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> GSAP 动画库</li>
                </ul>
              </div>

              <div class="bg-green-50 p-6 rounded-lg border border-green-100">
                <h3 class="font-bold mb-4 text-green-900">后端技术</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> Node.js + Express</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> MySQL 数据库</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> Passport.js 认证</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> Qwen2.5 AI 模型</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> RESTful API</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> Socket.io 实时通信</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Use & Contribution -->
          <section id="contribution" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>📖 使用与贡献</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="space-y-6">
              <div class="bg-white border border-black/10 p-6 rounded-lg">
                <h3 class="font-bold text-lg mb-3">✅ 你可以做的事</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>自由使用、修改和分发本项目</li>
                  <li>将本项目用于商业或个人项目</li>
                  <li>学习和研究源代码</li>
                  <li>提交问题和改进建议</li>
                  <li>贡献代码和新功能</li>
                </ul>
              </div>

              <div class="bg-orange-50 border border-orange-100 p-6 rounded-lg">
                <h3 class="font-bold text-lg mb-3">⚠️ 注意事项</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>必须保留原作者的版权声明</li>
                  <li>项目按"现状"提供，不提供任何担保</li>
                  <li>在商业使用时请注明原作者</li>
                  <li>遵守当地法律法规</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Contact & Feedback -->
          <section id="contact" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>📧 联系与反馈</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="bg-gradient-to-br from-orange-50 to-transparent p-6 rounded-lg border border-orange-100">
              <p class="text-gray-700 mb-4">
                如果您有任何问题、建议或反馈，欢迎通过以下方式与我们联系：
              </p>
              <ul class="space-y-3 text-gray-700">
                <li class="flex items-start gap-3">
                  <span class="text-lg ml-0">📌</span>
                  <div><strong>提交 Issue：</strong> 在 GitHub 项目页提交问题或功能请求</div>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-lg ml-0">✉️</span>
                  <div><strong>发送邮件：</strong> 与项目维护者沟通</div>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-lg ml-0">🤝</span>
                  <div><strong>参与贡献：</strong> Fork 项目，改进代码后提交 Pull Request</div>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-lg ml-0">💬</span>
                  <div><strong>社区讨论：</strong> 在项目社区参与讨论和知识分享</div>
                </li>
              </ul>
            </div>
          </section>

          <!-- Disclaimer -->
          <section class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>⚖️ 免责声明</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="bg-red-50 p-6 rounded-lg border border-red-100">
              <p class="text-gray-700 mb-4">
                本项目提供的所有功能和信息"按现状"提供。开发者对以下内容不承担任何责任：
              </p>
              <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>项目中的任何错误、遗漏或不准确之处</li>
                <li>由使用本项目导致的任何损失或损害</li>
                <li>第三方服务或资源的可用性和准确性</li>
                <li>用户因使用本项目而进行的任何操作后果</li>
              </ul>
            </div>
          </section>

          <!-- Footer -->
          <section class="pt-12 border-t border-black/10">
            <p class="text-center text-gray-500 text-sm font-mono">
              © 2025 GreenSight AI. All rights reserved. | MIT License
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

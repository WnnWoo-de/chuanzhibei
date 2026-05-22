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
            <h1 class="text-4xl md:text-5xl font-bold mt-2 mb-6">{{ langText.techStack.title }}</h1>
            <p class="text-sm opacity-60 max-w-[200px] mb-8">
              {{ langText.techStack.subtitle1 }}<br>
              {{ langText.techStack.subtitle2 }}<br>
              {{ langText.techStack.subtitleDesc }}
            </p>

            <!-- Quick Navigation -->
            <nav class="hidden md:flex flex-col gap-2">
              <a href="#frontend" @click.prevent="scrollTo('#frontend')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                🎨 {{ langText.techStack.frontendTech }}
              </a>
              <a href="#backend" @click.prevent="scrollTo('#backend')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                🔧 {{ langText.techStack.backendArch }}
              </a>
              <a href="#database" @click.prevent="scrollTo('#database')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                💾 {{ langText.techStack.database }}
              </a>
              <a href="#ai" @click.prevent="scrollTo('#ai')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                🤖 {{ langText.techStack.aiTech }}
              </a>
              <a href="#tools" @click.prevent="scrollTo('#tools')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                🛠️ {{ langText.techStack.devTools }}
              </a>
            </nav>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-span-12 md:col-span-9">
          <!-- Introduction -->
          <section class="mb-16 animate-on-scroll">
            <div class="bg-gradient-to-br from-green-50 to-transparent p-8 rounded-2xl border border-green-100">
              <p class="text-gray-700 mb-4 font-mono text-xs uppercase tracking-widest opacity-70">{{ langText.techStack.projectArch }}</p>
              <p class="text-gray-700 mb-4">
                {{ langText.techStack.archDesc }}
              </p>
              <p class="text-gray-700">
                {{ langText.techStack.archDesc2 }}
              </p>
            </div>
          </section>

          <!-- Frontend Technology -->
          <section id="frontend" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>🎨 {{ langText.techStack.frontendStack }}</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div class="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 class="font-bold mb-4 text-blue-900">{{ langText.techStack.coreFramework }}</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> Vue.js 3 (Composition API)</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> {{ langText.techStack.viteBuild }}</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> {{ langText.techStack.tailwindCss }}</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> {{ langText.techStack.piniaState }}</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> {{ langText.techStack.vueRouter }}</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> {{ langText.techStack.axiosHttp }}</li>
                </ul>
              </div>

              <div class="bg-purple-50 p-6 rounded-lg border border-purple-100">
                <h3 class="font-bold mb-4 text-purple-900">{{ langText.techStack.uiInteraction }}</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-purple-500">•</span> {{ langText.techStack.elementPlus }}</li>
                  <li class="flex items-center gap-2"><span class="text-purple-500">•</span> {{ langText.techStack.gsapAnim }}</li>
                  <li class="flex items-center gap-2"><span class="text-purple-500">•</span> {{ langText.techStack.nprogress }}</li>
                  <li class="flex items-center gap-2"><span class="text-purple-500">•</span> {{ langText.techStack.ogImage }}</li>
                  <li class="flex items-center gap-2"><span class="text-purple-500">•</span> {{ langText.techStack.responsiveDesign }}</li>
                </ul>
              </div>

              <div class="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
                <h3 class="font-bold mb-4 text-emerald-900">{{ langText.techStack.pwaTech }}</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-emerald-500">•</span> {{ langText.techStack.webManifest }}</li>
                  <li class="flex items-center gap-2"><span class="text-emerald-500">•</span> {{ langText.techStack.serviceWorker }}</li>
                  <li class="flex items-center gap-2"><span class="text-emerald-500">•</span> {{ langText.techStack.workboxCache }}</li>
                  <li class="flex items-center gap-2"><span class="text-emerald-500">•</span> {{ langText.techStack.installPrompt }}</li>
                  <li class="flex items-center gap-2"><span class="text-emerald-500">•</span> {{ langText.techStack.offlineFallback }}</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Backend Architecture -->
          <section id="backend" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>🔧 {{ langText.techStack.backend }}</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-green-50 p-6 rounded-lg border border-green-100">
                <h3 class="font-bold mb-4 text-green-900">{{ langText.techStack.serverSide }}</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> Node.js + Express</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> {{ langText.techStack.restfulApi }}</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> {{ langText.techStack.socketIo }}</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> {{ langText.techStack.helmet }}</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> {{ langText.techStack.cors }}</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> {{ langText.techStack.fastapiHub }}</li>
                </ul>
              </div>

              <div class="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
                <h3 class="font-bold mb-4 text-yellow-900">{{ langText.techStack.authAuthz }}</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-yellow-500">•</span> {{ langText.techStack.passportAuth }}</li>
                  <li class="flex items-center gap-2"><span class="text-yellow-500">•</span> JWT (JSON Web Tokens)</li>
                  <li class="flex items-center gap-2"><span class="text-yellow-500">•</span> Google OAuth 2.0</li>
                  <li class="flex items-center gap-2"><span class="text-yellow-500">•</span> Microsoft OAuth</li>
                  <li class="flex items-center gap-2"><span class="text-yellow-500">•</span> {{ langText.techStack.bcryptEncrypt }}</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Database -->
          <section id="database" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>💾 {{ langText.techStack.dbStorage }}</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-orange-50 p-6 rounded-lg border border-orange-100">
                <h3 class="font-bold mb-4 text-orange-900">{{ langText.techStack.relationalDb }}</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-orange-500">•</span> MySQL 8.0</li>
                  <li class="flex items-center gap-2"><span class="text-orange-500">•</span> Sequelize ORM</li>
                  <li class="flex items-center gap-2"><span class="text-orange-500">•</span> {{ langText.techStack.dataMigration }}</li>
                  <li class="flex items-center gap-2"><span class="text-orange-500">•</span> {{ langText.techStack.queryOptimize }}</li>
                </ul>
              </div>

              <div class="bg-red-50 p-6 rounded-lg border border-red-100">
                <h3 class="font-bold mb-4 text-red-900">{{ langText.techStack.fileStorage }}</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-red-500">•</span> {{ langText.techStack.multerUpload }}</li>
                  <li class="flex items-center gap-2"><span class="text-red-500">•</span> {{ langText.techStack.cloudflareR2 }}</li>
                  <li class="flex items-center gap-2"><span class="text-red-500">•</span> {{ langText.techStack.fileValidation }}</li>
                  <li class="flex items-center gap-2"><span class="text-red-500">•</span> {{ langText.techStack.responsiveImg }}</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- AI Technology -->
          <section id="ai" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>🤖 {{ langText.techStack.aiIntegration }}</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-pink-50 p-6 rounded-lg border border-pink-100">
                <h3 class="font-bold mb-4 text-pink-900">{{ langText.techStack.llm }}</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-pink-500">•</span> {{ langText.techStack.qwenModel }}</li>
                  <li class="flex items-center gap-2"><span class="text-pink-500">•</span> {{ langText.techStack.smartChat }}</li>
                  <li class="flex items-center gap-2"><span class="text-pink-500">•</span> {{ langText.techStack.fastapiAi }}</li>
                  <li class="flex items-center gap-2"><span class="text-pink-500">•</span> {{ langText.techStack.nlp }}</li>
                  <li class="flex items-center gap-2"><span class="text-pink-500">•</span> {{ langText.techStack.textGen }}</li>
                </ul>
              </div>

              <div class="bg-teal-50 p-6 rounded-lg border border-teal-100">
                <h3 class="font-bold mb-4 text-teal-900">{{ langText.techStack.aiFeatures }}</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-teal-500">•</span> {{ langText.techStack.carbonCalc }}</li>
                  <li class="flex items-center gap-2"><span class="text-teal-500">•</span> {{ langText.techStack.wasteRecognition }}</li>
                  <li class="flex items-center gap-2"><span class="text-teal-500">•</span> {{ langText.techStack.personalAdvice }}</li>
                  <li class="flex items-center gap-2"><span class="text-teal-500">•</span> {{ langText.techStack.chatHistory }}</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Development Tools -->
          <section id="tools" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>🛠️ {{ langText.techStack.devToolsDeploy }}</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                <h3 class="font-bold mb-4 text-indigo-900">{{ langText.techStack.devToolsTitle }}</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-indigo-500">•</span> {{ langText.techStack.vscode }}</li>
                  <li class="flex items-center gap-2"><span class="text-indigo-500">•</span> {{ langText.techStack.gitVcs }}</li>
                  <li class="flex items-center gap-2"><span class="text-indigo-500">•</span> {{ langText.techStack.eslint }}</li>
                  <li class="flex items-center gap-2"><span class="text-indigo-500">•</span> {{ langText.techStack.prettier }}</li>
                </ul>
              </div>

              <div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 class="font-bold mb-4 text-gray-900">{{ langText.techStack.deployAuto }}</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-gray-500">•</span> {{ langText.techStack.cfPages }}</li>
                  <li class="flex items-center gap-2"><span class="text-gray-500">•</span> {{ langText.techStack.wrangler }}</li>
                  <li class="flex items-center gap-2"><span class="text-gray-500">•</span> GitHub Actions</li>
                  <li class="flex items-center gap-2"><span class="text-gray-500">•</span> {{ langText.techStack.envManage }}</li>
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
              {{ langText.license.lastUpdate }}：{{ currentDate }}
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
import { langText } from '@/language'

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

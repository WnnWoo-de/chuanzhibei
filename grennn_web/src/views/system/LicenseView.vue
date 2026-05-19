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
            <h1 class="text-4xl md:text-5xl font-bold mt-2 mb-6">{{ langText.license.title }}</h1>
            <p class="text-sm opacity-60 max-w-[200px] mb-8">
              {{ langText.license.subtitle1 }}<br>
              {{ langText.license.subtitle2 }}<br>
              {{ langText.license.subtitleDesc }}
            </p>

            <!-- Quick Navigation -->
            <nav class="hidden md:flex flex-col gap-2">
              <a href="#license" @click.prevent="scrollTo('#license')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                📜 {{ langText.license.openSourceLicense }}
              </a>
              <a href="#statement" @click.prevent="scrollTo('#statement')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                🎯 {{ langText.license.projectStatement }}
              </a>
              <a href="#vision" @click.prevent="scrollTo('#vision')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                💚 {{ langText.license.projectVision }}
              </a>
              <a href="#tech" @click.prevent="scrollTo('#tech')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                🛠️ {{ langText.license.techStack }}
              </a>
              <a href="#contribution" @click.prevent="scrollTo('#contribution')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                📖 {{ langText.license.useContribution }}
              </a>
              <a href="#contact" @click.prevent="scrollTo('#contact')" class="text-sm font-mono px-4 py-2 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary">
                📧 {{ langText.license.contactFeedback }}
              </a>
            </nav>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-span-12 md:col-span-9">
          <!-- Introduction -->
          <section class="mb-16 animate-on-scroll">
            <div class="bg-gradient-to-br from-green-50 to-transparent p-8 rounded-2xl border border-green-100">
              <p class="text-gray-700 mb-4 font-mono text-xs uppercase tracking-widest opacity-70">{{ langText.license.projectInfo }}</p>
              <p class="text-gray-700 mb-4">
                <strong>{{ langText.license.projectName }}：</strong>GreenSight AI Web（绿我同行）
              </p>
              <p class="text-gray-700 mb-4">
                <strong>{{ langText.license.version }}：</strong>2.0
              </p>
              <p class="text-gray-700 mb-4">
                <strong>{{ langText.license.developer }}：</strong>wnnw
              </p>
              <p class="text-gray-700">
                <strong>{{ langText.license.updateTime }}：</strong>{{ currentDate }}
              </p>
            </div>
          </section>

          <!-- MIT License -->
          <section id="license" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>📜 {{ langText.license.openSourceLicense }}</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <p class="text-gray-700 mb-6">
              {{ langText.license.mitLicense }} <strong>MIT License</strong> {{ langText.license.mitLicenseSuffix }}
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
              <span>🎯 {{ langText.license.projectStatement }}</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="space-y-4">
              <p class="text-gray-700">
                {{ langText.license.statementContent1 }}<strong>传智杯</strong>{{ langText.license.statementContent1b }}
              </p>
              <p class="text-gray-700">
                {{ langText.license.statementContent2 }} <strong>wnnw</strong> {{ langText.license.statementContent2b }}
              </p>
              <p class="text-gray-700">
                {{ langText.license.statementContent3 }}
              </p>
            </div>
          </section>

          <!-- Project Vision -->
          <section id="vision" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>💚 {{ langText.license.projectVision }}</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="space-y-4">
              <p class="text-gray-700">
                <strong>{{ langText.license.visionContent }}</strong>{{ langText.license.visionCollab }}
              </p>
              <ul class="space-y-3 text-gray-700">
                <li class="flex items-start gap-3">
                  <span class="mt-1 text-green-600">🌿</span>
                  <span>{{ langText.license.visionItem1 }}</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="mt-1 text-green-600">♻️</span>
                  <span>{{ langText.license.visionItem2 }}</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="mt-1 text-green-600">🤝</span>
                  <span>{{ langText.license.visionItem3 }}</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="mt-1 text-green-600">💚</span>
                  <span>{{ langText.license.visionItem4 }}</span>
                </li>
              </ul>
            </div>
          </section>

          <!-- Technology Stack -->
          <section id="tech" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>🛠️ {{ langText.license.techStack }}</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 class="font-bold mb-4 text-blue-900">{{ langText.license.frontendTech }}</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> Vue.js 3 (Composition API)</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> {{ langText.techStack.viteBuild }}</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> {{ langText.techStack.tailwindCss }}</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> {{ langText.techStack.piniaState }}</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> {{ langText.techStack.vueRouter }}</li>
                  <li class="flex items-center gap-2"><span class="text-blue-500">•</span> {{ langText.techStack.gsapAnim }}</li>
                </ul>
              </div>

              <div class="bg-green-50 p-6 rounded-lg border border-green-100">
                <h3 class="font-bold mb-4 text-green-900">{{ langText.license.backendTech }}</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> Node.js + Express</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> MySQL 8.0</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> {{ langText.techStack.passportAuth }}</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> {{ langText.techStack.qwenModel }}</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> {{ langText.techStack.restfulApi }}</li>
                  <li class="flex items-center gap-2"><span class="text-green-500">•</span> {{ langText.techStack.socketIo }}</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Use & Contribution -->
          <section id="contribution" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>📖 {{ langText.license.useContribution }}</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="space-y-6">
              <div class="bg-white border border-black/10 p-6 rounded-lg">
                <h3 class="font-bold text-lg mb-3">✅ {{ langText.license.canDo }}</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{{ langText.license.canDo1 }}</li>
                  <li>{{ langText.license.canDo2 }}</li>
                  <li>{{ langText.license.canDo3 }}</li>
                  <li>{{ langText.license.canDo4 }}</li>
                  <li>{{ langText.license.canDo5 }}</li>
                </ul>
              </div>

              <div class="bg-orange-50 border border-orange-100 p-6 rounded-lg">
                <h3 class="font-bold text-lg mb-3">⚠️ {{ langText.license.notes }}</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{{ langText.license.note1 }}</li>
                  <li>{{ langText.license.note2 }}</li>
                  <li>{{ langText.license.note3 }}</li>
                  <li>{{ langText.license.note4 }}</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Contact & Feedback -->
          <section id="contact" class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>📧 {{ langText.license.contactTitle }}</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="bg-gradient-to-br from-orange-50 to-transparent p-6 rounded-lg border border-orange-100">
              <p class="text-gray-700 mb-4">
                {{ langText.license.contactDesc }}
              </p>
              <ul class="space-y-3 text-gray-700">
                <li class="flex items-start gap-3">
                  <span class="text-lg ml-0">📌</span>
                  <div><strong>{{ langText.license.submitIssue }}：</strong> {{ langText.license.submitIssueDesc }}</div>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-lg ml-0">✉️</span>
                  <div><strong>{{ langText.license.sendEmail }}：</strong> {{ langText.license.sendEmailDesc }}</div>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-lg ml-0">🤝</span>
                  <div><strong>{{ langText.license.contribute }}：</strong> {{ langText.license.contributeDesc }}</div>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-lg ml-0">💬</span>
                  <div><strong>{{ langText.license.communityDiscuss }}：</strong> {{ langText.license.communityDiscussDesc }}</div>
                </li>
              </ul>
            </div>
          </section>

          <!-- Disclaimer -->
          <section class="mb-16 animate-on-scroll">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
              <span>⚖️ {{ langText.license.disclaimer }}</span>
              <div class="flex-1 h-px bg-gradient-to-r from-black/20 to-transparent"></div>
            </h2>
            <div class="bg-red-50 p-6 rounded-lg border border-red-100">
              <p class="text-gray-700 mb-4">
                {{ langText.license.disclaimerContent }}
              </p>
              <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>{{ langText.license.disclaimer1 }}</li>
                <li>{{ langText.license.disclaimer2 }}</li>
                <li>{{ langText.license.disclaimer3 }}</li>
                <li>{{ langText.license.disclaimer4 }}</li>
              </ul>
            </div>
          </section>

          <!-- Footer -->
          <section class="pt-12 border-t border-black/10">
            <p class="text-center text-gray-500 text-sm font-mono">
              © 2025 GreenSight AI. All rights reserved. | MIT License
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

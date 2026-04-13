<template>
  <footer class="bg-white/90 backdrop-blur-md text-[#1a1a1a] border-t border-black/10 pt-12 md:pt-16 pb-8 px-4 md:px-6 relative overflow-hidden transition-colors">
    <!-- 背景网格装饰（12列，纯视觉，不可交互） -->
    <div class="absolute top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6">
      <!-- 桌面端：12列竖线 -->
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
      <!-- 移动端：4列竖线（每列占3格） -->
      <div v-for="n in 4" :key="`m-${n}`" class="border-r border-black h-full block md:hidden col-span-3"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto">
      <!-- 页脚主内容区（12列网格布局） -->
      <div class="grid grid-cols-12 gap-8 mb-12">

        <!-- 品牌区块（桌面占5列） -->
        <div class="col-span-12 md:col-span-5 flex flex-col justify-between">
          <div>
            <!-- 品牌 Logo + 大标题 -->
            <div class="flex items-start gap-3 md:gap-4 mb-6">
              <img src="@/assets/logo.png" alt="Logo" class="w-12 h-12 object-contain rounded-xl shadow-sm" />
              <h2
                class="text-3xl md:text-7xl font-bold tracking-tighter leading-none"
                style="font-family: var(--font-display)"
              >
                GreenSight<br />AI WEB
              </h2>
            </div>
            <!-- 品牌描述文字 -->
            <p class="opacity-70 max-w-xs mb-8 text-sm leading-relaxed">
              致力于通过人工智能技术推动可持续生活方式，
              连接每一位有环保意识的行动者。
            </p>
            <!-- 核心统计数据展示 -->
            <div class="grid grid-cols-3 gap-4 md:flex md:gap-8">
              <div>
                <p class="text-2xl font-bold text-green-600">2,450+</p>
                <p class="text-xs opacity-50 mt-1 font-bold" style="font-family: var(--font-mono)">重构案例</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-green-600">18k+</p>
                <p class="text-xs opacity-50 mt-1 font-bold" style="font-family: var(--font-mono)">社区用户</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-green-600">56t</p>
                <p class="text-xs opacity-50 mt-1 font-bold" style="font-family: var(--font-mono)">CO₂ 减排</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 间距列（仅桌面端显示） -->
        <div class="hidden md:block md:col-span-1"></div>

        <!-- 网站地图导航 -->
        <div class="col-span-6 md:col-span-2">
          <h3
            class="text-xs uppercase tracking-widest mb-6 opacity-50 font-bold"
            style="font-family: var(--font-mono)"
          >网站地图</h3>
          <ul class="space-y-3 text-sm font-medium">
            <li>
              <router-link to="/" class="group inline-flex items-center gap-2 opacity-70 hover:opacity-100 hover:text-green-600 transition-all">
                <span>首页</span>
                <span class="-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">↗</span>
              </router-link>
            </li>
            <li>
              <router-link to="/reconstruction" class="group inline-flex items-center gap-2 opacity-70 hover:opacity-100 hover:text-green-600 transition-all">
                <span>旧物重构</span>
                <span class="-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">↗</span>
              </router-link>
            </li>
            <li>
              <router-link to="/chat" class="group inline-flex items-center gap-2 opacity-70 hover:opacity-100 hover:text-green-600 transition-all">
                <span>智能助手</span>
                <span class="-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">↗</span>
              </router-link>
            </li>
            <li>
              <router-link to="/community" class="group inline-flex items-center gap-2 opacity-70 hover:opacity-100 hover:text-green-600 transition-all">
                <span>社区活动</span>
                <span class="-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">↗</span>
              </router-link>
            </li>
            <li>
              <router-link to="/weather" class="group inline-flex items-center gap-2 opacity-70 hover:opacity-100 hover:text-green-600 transition-all">
                <span>天气查询</span>
                <span class="-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">↗</span>
              </router-link>
            </li>
            <li>
              <router-link to="/achievements" class="group inline-flex items-center gap-2 opacity-70 hover:opacity-100 hover:text-green-600 transition-all">
                <span>成就系统</span>
                <span class="-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">↗</span>
              </router-link>
            </li>
          </ul>
        </div>

        <!-- 关于项目 -->
        <div class="col-span-6 md:col-span-2">
          <h3
            class="text-xs uppercase tracking-widest mb-6 opacity-50 font-bold"
            style="font-family: var(--font-mono)"
          >关于项目</h3>
          <ul class="space-y-3 text-sm font-medium">
            <li>
              <a href="#" class="group inline-flex items-center gap-2 opacity-70 hover:opacity-100 hover:text-green-600 transition-all">
                <span>项目介绍</span>
                <span class="-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">↗</span>
              </a>
            </li>
            <li>
              <a href="#" class="group inline-flex items-center gap-2 opacity-70 hover:opacity-100 hover:text-green-600 transition-all">
                <span>技术栈</span>
                <span class="-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">↗</span>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/WnnWoo-de/chuanzhibei"
                target="_blank"
                rel="noopener noreferrer"
                class="group inline-flex items-center gap-2 opacity-70 hover:opacity-100 hover:text-green-600 transition-all"
              >
                <span>开源地址</span>
                <span class="-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">↗</span>
              </a>
            </li>
            <li>
              <a href="#" class="group inline-flex items-center gap-2 opacity-70 hover:opacity-100 hover:text-green-600 transition-all">
                <span>联系我们</span>
                <span class="-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">↗</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- 社交媒体链接 -->
        <div class="col-span-12 md:col-span-2">
          <h3
            class="text-xs uppercase tracking-widest mb-6 opacity-50 font-bold"
            style="font-family: var(--font-mono)"
          >社交媒体</h3>
          <ul class="space-y-3 text-sm font-medium">
            <li>
              <!-- 每个链接前带小圆点装饰 -->
              <a
                href="https://github.com/WnnWoo-de/chuanzhibei"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-center gap-2 opacity-70 hover:opacity-100 hover:text-green-600 transition-all"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>GitHub</span>
                <span class="ml-1 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">↗</span>
              </a>
            </li>
            <li>
              <a
                href="https://weibo.com"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-center gap-2 opacity-70 hover:opacity-100 hover:text-green-600 transition-all"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>微博</span>
                <span class="ml-1 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">↗</span>
              </a>
            </li>
            <li>
              <a
                href="https://mp.weixin.qq.com/"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-center gap-2 opacity-70 hover:opacity-100 hover:text-green-600 transition-all"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>微信公众号</span>
                <span class="ml-1 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">↗</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- 底部版权栏（分割线 + 版权信息） -->
      <div class="border-t border-black/10 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <!-- 版权文字 -->
          <div class="text-xs opacity-50 font-bold" style="font-family: var(--font-mono)">
            &copy; 2026 GreenSight AI Web. 保留所有权利。
          </div>
          <!-- 技术栈 + 项目标签 -->
          <div class="flex flex-wrap items-center gap-3 md:gap-6 text-xs opacity-50 font-bold" style="font-family: var(--font-mono)">
            <span>Vue 3 + Node.js + AI</span>
            <span class="hidden md:inline">·</span>
            <span>可持续未来倡议</span>
            <span class="hidden md:inline">·</span>
            <span>Web 设计大赛参赛作品</span>
            <button
              type="button"
              @click="scrollToTop"
              class="ml-0 md:ml-2 rounded-full border border-black/20 px-3 py-1 opacity-80 hover:opacity-100 hover:text-green-600 hover:border-green-600 transition-all"
            >
              回到顶部 ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// TheFooter.vue - 页脚组件
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

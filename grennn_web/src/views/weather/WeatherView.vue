<template>
  <!-- 天气页面主容器，根据天气状况动态切换主题样式 -->
  <div class="weather-page" :class="themeClass" :data-theme="themeClass">
    <!-- 背景氛围光晕装饰层 -->
    <div class="weather-atmosphere weather-atmosphere--one"></div>
    <div class="weather-atmosphere weather-atmosphere--two"></div>
    <div class="weather-atmosphere weather-atmosphere--three"></div>
    <!-- 呼吸动画光效层 -->
    <div class="weather-breath-layer weather-breath-layer--core"></div>
    <div class="weather-breath-layer weather-breath-layer--edge"></div>

    <!-- 仪表盘主卡片容器 -->
    <div class="weather-dashboard-card">
      <div class="weather-container">
        <!-- 天气查询与绿色出行提示卡片 -->
        <div class="green-travel-card glass-card mb-4">
          <div class="card-content">
            <!-- 卡片标题区域 -->
            <div class="card-header">
              <div class="icon-wrapper">
                <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                <svg class="icon-leaf" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                </svg>
              </div>
              <div class="title-section">
                <h2 class="card-title">{{ langText.weather.pageTitle }}</h2>
                <p class="card-subtitle">{{ langText.weather.pageSubtitle }}</p>
              </div>
            </div>

            <!-- 绿色出行建议网格 -->
            <div class="tips-grid">
              <!-- 晴天出行建议 -->
              <div class="tip-item">
                <div class="tip-icon tip-icon--sunny">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2"></path>
                    <path d="M12 20v2"></path>
                    <path d="M4.93 4.93l1.41 1.41"></path>
                    <path d="M17.66 17.66l1.41 1.41"></path>
                    <path d="M2 12h2"></path>
                    <path d="M20 12h2"></path>
                    <path d="M6.34 17.66l-1.41 1.41"></path>
                    <path d="M19.07 4.93l-1.41 1.41"></path>
                  </svg>
                </div>
                <div class="tip-content">
                  <h3 class="tip-title">{{ langText.weather.sunnyTitle }}</h3>
                  <p class="tip-text">{{ langText.weather.sunnyText }}</p>
                </div>
              </div>

              <!-- 阴天出行建议 -->
              <div class="tip-item">
                <div class="tip-icon tip-icon--cloudy">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
                  </svg>
                </div>
                <div class="tip-content">
                  <h3 class="tip-title">{{ langText.weather.cloudyTitle }}</h3>
                  <p class="tip-text">{{ langText.weather.cloudyText }}</p>
                </div>
              </div>

              <!-- 雨天出行建议 -->
              <div class="tip-item">
                <div class="tip-icon tip-icon--rainy">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="8" y1="19" x2="8" y2="21"></line>
                    <line x1="8" y1="13" x2="8" y2="15"></line>
                    <line x1="16" y1="19" x2="16" y2="21"></line>
                    <line x1="16" y1="13" x2="16" y2="15"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="12" y1="15" x2="12" y2="17"></line>
                    <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path>
                  </svg>
                </div>
                <div class="tip-content">
                  <h3 class="tip-title">{{ langText.weather.rainyTitle }}</h3>
                  <p class="tip-text">{{ langText.weather.rainyText }}</p>
                </div>
              </div>

              <!-- 绿色环保出行建议 -->
              <div class="tip-item">
                <div class="tip-icon tip-icon--eco">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <path d="M9 12l2 2 4-4"></path>
                  </svg>
                </div>
                <div class="tip-content">
                  <h3 class="tip-title">{{ langText.weather.ecoTitle }}</h3>
                  <p class="tip-text">{{ langText.weather.ecoText }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 天气搜索区域组件 -->
        <WeatherSearchSection
          v-model:search-city="searchCity"
          :default-city="defaultCity"
          :loading="loading"
          :error-message="errorMessage"
          :info-message="infoMessage"
          :is-mock-data="isMockData"
          @search="handleSearch(searchCity)"
        />

        <!-- 加载状态骨架屏 -->
        <div v-if="loading && !weather" class="loading-state glass-card">
          <el-skeleton :rows="10" animated />
        </div>

        <!-- 天气数据内容区 -->
        <div v-else-if="weather" class="weather-content-fade">
          <!-- 天气概览摘要组件 -->
          <WeatherHeroSummary :weather="weather" :format-temp="fmt.temp" />

          <div class="dashboard-grid">
            <!-- 逐小时预报组件 -->
            <WeatherHourlyForecast :hourly="weather.hourly" :format-hour="formatHour" />

            <div class="bottom-layout">
              <!-- 多日预报组件 -->
              <div class="left-column">
                <WeatherDailyForecast
                  :forecast="weather.forecast"
                  :format-day="formatDay"
                  :get-bar-style="getBarStyle"
                />
              </div>
              <!-- 天气指标网格组件 -->
              <div class="right-column">
                <WeatherMetricsGrid
                  :weather="weather"
                  :get-aqi-color="getAqiColor"
                  :get-uv-level="getUvLevel"
                  :format-time="formatTime"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态（初始加载或无数据时显示骨架屏） -->
        <div v-else class="loading-state glass-card">
          <el-skeleton :rows="10" animated />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { langText } from '@/language' // 多语言文本
import {
  getAqiColor,
  useWeatherFormatters,
  weatherFmt,
} from './weatherFormatters' // 天气数据格式化工具
import { useWeatherQuery } from './useWeatherQuery' // 天气查询逻辑组合式函数
import WeatherDailyForecast from './components/WeatherDailyForecast.vue'
import WeatherHeroSummary from './components/WeatherHeroSummary.vue'
import WeatherHourlyForecast from './components/WeatherHourlyForecast.vue'
import WeatherMetricsGrid from './components/WeatherMetricsGrid.vue'
import WeatherSearchSection from './components/WeatherSearchSection.vue'

// 使用天气查询组合式函数，获取状态与方法
const {
  defaultCity,   // 默认城市
  errorMessage,  // 错误提示信息
  getBarStyle,   // 获取温度条样式
  handleSearch,  // 搜索处理函数
  infoMessage,   // 提示信息
  isMockData,    // 是否为模拟数据
  loading,       // 加载状态
  searchCity,    // 搜索城市
  weather,       // 天气数据
} = useWeatherQuery()
// 获取格式化工具函数
const { formatDay, formatHour, formatTime, getUvLevel } = useWeatherFormatters()
const fmt = weatherFmt // 天气格式化工具

// 根据当前天气文本动态计算主题类名（晴天/阴天/雨天）
const themeClass = computed(() => {
  const text = weather.value?.now?.text || ''
  if (/雨|雷|雪/.test(text)) return 'theme-rainy'
  if (/晴/.test(text)) return 'theme-sunny'
  return 'theme-cloudy'
})

// 页面挂载后自动查询默认城市的天气
onMounted(() => {
  handleSearch(searchCity.value || defaultCity)
})
</script>

<style scoped>
/* 页面主容器 */
.weather-page {
  --page-bg-top: #eef4fb;
  --page-bg-bottom: #dfe9f6;
  --page-glow-1: rgba(255, 255, 255, 0.78);
  --page-glow-2: rgba(201, 223, 255, 0.42);
  --page-glow-3: rgba(255, 223, 176, 0.34);
  --breath-core: rgba(255, 225, 168, 0.28);
  --breath-edge: rgba(170, 208, 255, 0.2);
  --card-bg: linear-gradient(180deg, rgba(255,255,255,0.62), rgba(236,243,251,0.7));
  --card-border: rgba(255,255,255,0.82);
  --card-shadow: 0 20px 45px rgba(118, 145, 181, 0.16);
  --text-primary: #f7fbff;
  --text-secondary: rgba(248, 251, 255, 0.72);
  padding: 24px 0 20px;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 2%, rgba(255,255,255,0.88), transparent 34%),
    linear-gradient(180deg, var(--page-bg-top), var(--page-bg-bottom));
  transition:
    background 0.8s ease,
    color 0.8s ease;
}

/* 晴天主题配色 */
.theme-sunny {
  --page-bg-top: #f5f8fd;
  --page-bg-bottom: #e6edf9;
  --page-glow-1: rgba(255, 255, 255, 0.88);
  --page-glow-2: rgba(255, 222, 173, 0.38);
  --page-glow-3: rgba(255, 201, 126, 0.3);
  --breath-core: rgba(255, 208, 126, 0.34);
  --breath-edge: rgba(255, 233, 175, 0.24);
}

/* 阴天主题配色 */
.theme-cloudy {
  --page-bg-top: #edf3fb;
  --page-bg-bottom: #d9e5f3;
  --page-glow-1: rgba(255, 255, 255, 0.84);
  --page-glow-2: rgba(198, 219, 246, 0.38);
  --page-glow-3: rgba(220, 231, 245, 0.36);
  --breath-core: rgba(207, 225, 248, 0.32);
  --breath-edge: rgba(230, 239, 250, 0.26);
}

/* 雨天主题配色 */
.theme-rainy {
  --page-bg-top: #e9f1fb;
  --page-bg-bottom: #d4e0f1;
  --page-glow-1: rgba(255, 255, 255, 0.72);
  --page-glow-2: rgba(175, 214, 255, 0.42);
  --page-glow-3: rgba(191, 211, 241, 0.34);
  --breath-core: rgba(159, 206, 252, 0.32);
  --breath-edge: rgba(186, 219, 250, 0.24);
}

/* 背景氛围光晕装饰 */
.weather-atmosphere {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(44px);
  transition: background 0.8s ease, opacity 0.8s ease, transform 0.8s ease;
  animation: drift 18s ease-in-out infinite;
}

.weather-atmosphere--one {
  width: 440px;
  height: 200px;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--page-glow-1);
}

.weather-atmosphere--two {
  width: 320px;
  height: 180px;
  top: 80px;
  left: 12%;
  background: var(--page-glow-2);
  animation-delay: 2s;
}

.weather-atmosphere--three {
  width: 360px;
  height: 180px;
  top: 60px;
  right: 10%;
  background: var(--page-glow-3);
  animation-delay: 5s;
}

/* 呼吸动画光效层 */
.weather-breath-layer {
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
  filter: blur(48px);
  opacity: 0.7;
  transition: background 0.8s ease, opacity 0.8s ease;
  animation: pageBreath 6.8s ease-in-out infinite;
}

.weather-breath-layer--core {
  width: 520px;
  height: 220px;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, var(--breath-core) 0%, rgba(255,255,255,0.04) 68%, transparent 78%);
}

.weather-breath-layer--edge {
  width: 420px;
  height: 180px;
  top: 180px;
  right: 18%;
  background: radial-gradient(circle, var(--breath-edge) 0%, rgba(255,255,255,0.04) 66%, transparent 78%);
  animation-delay: 2.2s;
}

/* 仪表盘主卡片 */
.weather-dashboard-card {
  position: relative;
  z-index: 1;
}

/* 内容容器 */
.weather-container {
  position: relative;
  z-index: 1;
  padding: 0 28px;
  max-width: 1540px;
  margin: 0 auto;
}

/* 天气查询与绿色出行卡片样式 */
.green-travel-card {
  padding: 24px 28px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.green-travel-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #22c55e, #10b981, #34d399, #22c55e);
  background-size: 200% 100%;
  animation: gradientFlow 4s linear infinite;
}

@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

.card-content {
  position: relative;
  z-index: 1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.icon-wrapper {
  display: flex;
  gap: 8px;
}

.icon-wrapper .icon-sun,
.icon-wrapper .icon-leaf {
  width: 24px;
  height: 24px;
  color: #22c55e;
  animation: gentlePulse 3s ease-in-out infinite;
}

.icon-wrapper .icon-leaf {
  animation-delay: 1.5s;
}

@keyframes gentlePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

.title-section {
  flex: 1;
}

.card-title {
  font-size: 22px;
  font-weight: 700;
  color: #15803d;
  margin: 0;
  line-height: 1.3;
}

.card-subtitle {
  font-size: 12px;
  font-weight: 400;
  color: #16a34a;
  margin: 4px 0 0;
  opacity: 0.7;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.tip-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.tip-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
  background: rgba(255, 255, 255, 0.6);
}

.tip-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.tip-icon--sunny {
  background: linear-gradient(135deg, #fcd34d, #fbbf24);
  color: white;
}

.tip-icon--cloudy {
  background: linear-gradient(135deg, #93c5fd, #60a5fa);
  color: white;
}

.tip-icon--rainy {
  background: linear-gradient(135deg, #67e8f9, #22d3ee);
  color: white;
}

.tip-icon--eco {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: white;
}

.tip-icon svg {
  width: 20px;
  height: 20px;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-size: 14px;
  font-weight: 600;
  color: #166534;
  margin: 0 0 4px;
  line-height: 1.4;
}

.tip-text {
  font-size: 12px;
  color: #15803d;
  margin: 0;
  line-height: 1.5;
  opacity: 0.85;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .card-title {
    font-size: 18px;
  }

  .tips-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .green-travel-card {
    padding: 18px 20px;
  }
}

/* 仪表盘网格布局 */
.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

/* 底部两栏布局（预报 + 指标） */
.bottom-layout {
  display: grid;
  grid-template-columns: minmax(380px, 0.9fr) minmax(0, 1.18fr);
  gap: 12px;
  align-items: start;
}

/* 左右栏容器 */
.left-column,
.right-column {
  min-width: 0;
}

/* 毛玻璃卡片通用样式 */
.glass-card {
  border-radius: 30px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    var(--card-shadow);
  backdrop-filter: blur(26px) saturate(135%);
  -webkit-backdrop-filter: blur(26px) saturate(135%);
  transition:
    background 0.6s ease,
    border-color 0.6s ease,
    box-shadow 0.35s ease,
    transform 0.35s ease;
}

/* 加载状态样式 */
.loading-state {
  margin-top: 16px;
  padding: 26px;
}

/* 天气内容淡入动画 */
.weather-content-fade {
  animation: weatherFade 0.55s ease;
}

:deep(.el-skeleton__item) {
  background: linear-gradient(90deg, rgba(255,255,255,0.5), rgba(226,236,246,0.95), rgba(255,255,255,0.5));
}

@keyframes drift {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(10px, -8px, 0) scale(1.05);
  }
}

@keyframes pageBreath {
  0%, 100% {
    opacity: 0.38;
    transform: scale(0.96);
  }
  50% {
    opacity: 0.84;
    transform: scale(1.08);
  }
}

@keyframes weatherFade {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .bottom-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .weather-page {
    padding-top: 24px;
  }

  .weather-container {
    padding: 0 14px;
  }

  .weather-atmosphere--one {
    width: 300px;
    height: 140px;
  }

  .weather-atmosphere--two,
  .weather-atmosphere--three {
    width: 220px;
    height: 110px;
  }
}

:global(html.theme-dark) .weather-page {
  --page-bg-top: #08110d;
  --page-bg-bottom: #050b08;
  --page-glow-1: rgba(110, 231, 164, 0.16);
  --page-glow-2: rgba(103, 232, 249, 0.12);
  --page-glow-3: rgba(251, 191, 36, 0.08);
  --breath-core: rgba(110, 231, 164, 0.18);
  --breath-edge: rgba(103, 232, 249, 0.12);
  --card-bg: linear-gradient(180deg, rgba(16, 26, 20, 0.82), rgba(20, 34, 26, 0.72));
  --card-border: rgba(202, 232, 214, 0.14);
  --card-shadow: 0 24px 64px rgba(0, 0, 0, 0.36);
  --text-primary: var(--color-text);
  --text-secondary: var(--color-text-muted);
  background:
    radial-gradient(circle at 50% 2%, rgba(110, 231, 164, 0.14), transparent 34%),
    linear-gradient(180deg, var(--page-bg-top), var(--page-bg-bottom));
}

:global(html.theme-dark) .card-header {
  border-bottom-color: var(--color-border-soft);
}

:global(html.theme-dark) .card-title,
:global(html.theme-dark) .tip-title {
  color: var(--color-text);
}

:global(html.theme-dark) .card-subtitle,
:global(html.theme-dark) .tip-text {
  color: var(--color-text-muted);
}

:global(html.theme-dark) .tip-item {
  background: rgba(15, 27, 21, 0.62);
  border-color: rgba(202, 232, 214, 0.12);
}

:global(html.theme-dark) .tip-item:hover {
  background: rgba(20, 34, 26, 0.78);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
}

:global(html.theme-dark) :deep(.el-skeleton__item) {
  background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(110,231,164,0.12), rgba(255,255,255,0.05));
}
</style>

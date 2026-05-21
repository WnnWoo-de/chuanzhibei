<template>
  <!-- 天气概览头部卡片 -->
  <header class="hero-card">
    <!-- 左侧主信息区域 -->
    <div class="hero-copy">
      <div class="hero-kicker">{{ langText.weather.heroKicker }}</div>
      <!-- 城市名称 -->
      <h1 class="city-name">
        {{ weather.city.name }}
        <span v-if="weather.city.adm2 && weather.city.adm2 !== weather.city.name" class="city-adm">
          {{ weather.city.adm2 }}
        </span>
      </h1>

      <!-- 天气图标和主温度显示 -->
      <div class="hero-temp-row">
        <div class="hero-icon-breath" :class="glowClass">
          <WeatherIcon :code="weather.now.icon" :size="72" :alt="weather.now.text" />
        </div>
        <!-- 当前温度（带滚动数字动画） -->
        <div class="temp-display">
          <transition name="roll-number" mode="out-in">
            <span :key="`now-temp-${formatTemp(weather.now.temp)}`" class="rolling-number">
              {{ formatTemp(weather.now.temp) }}
            </span>
          </transition>
          <span class="unit">°</span>
        </div>
      </div>

      <!-- 天气状态行：天气描述和体感温度 -->
      <div class="hero-status-row">
        <div class="weather-desc">{{ weather.now.text }}</div>
        <div class="hero-divider"></div>
        <div class="hero-feels-like">
          {{ langText.weather.feelsLike }}
          <transition name="roll-number" mode="out-in">
            <span :key="`feels-${formatTemp(weather.now.feelsLike)}`" class="inline-roll">
              {{ formatTemp(weather.now.feelsLike) }}
            </span>
          </transition>
          °
        </div>
      </div>

      <!-- 最高/最低温度行 -->
      <div class="hero-range-line">
        <span>
          {{ langText.weather.highLabel }}
          <transition name="roll-number" mode="out-in">
            <span :key="`max-${formatTemp(weather.forecast[0]?.tempMax)}`" class="inline-roll">
              {{ formatTemp(weather.forecast[0]?.tempMax) }}
            </span>
          </transition>
          °
        </span>
        <span>
          {{ langText.weather.lowLabel }}
          <transition name="roll-number" mode="out-in">
            <span :key="`min-${formatTemp(weather.forecast[0]?.tempMin)}`" class="inline-roll">
              {{ formatTemp(weather.forecast[0]?.tempMin) }}
            </span>
          </transition>
          °
        </span>
      </div>
    </div>

    <!-- 右侧天气概况面板 -->
    <div class="hero-side glass-panel">
      <div class="hero-side-label">{{ langText.weather.currentOverview }}</div>
      <!-- 天气概况摘要文字 -->
      <div class="hero-side-main">{{ summaryText }}</div>
      <div class="hero-side-sub">{{ langText.weather.humidityLabel }} {{ Math.round(weather.now.humidity || 0) }}% · {{ langText.weather.windSpeedLabel }} {{ weather.now.windSpeed || '--' }} km/h</div>
      <!-- 气压和能见度标签 -->
      <div class="hero-side-pills">
        <span class="hero-pill">{{ langText.weather.pressureLabel }} {{ Math.round(weather.now.pressure || 0) }} hPa</span>
        <span class="hero-pill">{{ langText.weather.visibilityLabel }} {{ weather.now.vis || '--' }} km</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { langText } from '@/language' // 多语言文本
import WeatherIcon from '@/components/weather/WeatherIcon.vue'

// 组件属性
const props = defineProps({
  weather: {
    type: Object,
    required: true, // 天气数据对象
  },
  formatTemp: {
    type: Function,
    required: true, // 温度格式化函数
  },
})

// 根据天气文本计算图标发光效果类名（晴天/阴天/雨天）
const glowClass = computed(() => {
  const text = props.weather?.now?.text || ''
  if (/雨|雷|雪/.test(text)) return 'is-rainy'
  if (/晴/.test(text)) return 'is-sunny'
  return 'is-cloudy'
})

// 根据天气状况生成概况摘要文字
const summaryText = computed(() => {
  const w = langText.value.weather
  const text = props.weather?.now?.text || ''
  if (/雨|雷|雪|rain|snow|thunder/i.test(text)) return w.summaryRainy
  if (/晴|sun|clear/i.test(text)) return w.summarySunny
  return w.summaryCloudy
})
</script>

<style scoped>
/* 概览卡片布局 */
.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.72fr);
  gap: 16px;
  padding: 22px 24px;
  border-radius: 32px;
  background: linear-gradient(180deg, rgba(255,255,255,0.64), rgba(235,243,251,0.72));
  border: 1px solid rgba(255,255,255,0.86);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.96),
    0 22px 48px rgba(118,145,181,0.16);
  backdrop-filter: blur(24px) saturate(135%);
  -webkit-backdrop-filter: blur(24px) saturate(135%);
  transition:
    background 0.6s ease,
    border-color 0.6s ease,
    box-shadow 0.35s ease,
    transform 0.35s ease;
}

/* 左侧主信息区域 */
.hero-copy {
  min-width: 0;
}

/* 标签文字样式 */
.hero-kicker,
.hero-side-label {
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(103, 122, 146, 0.7);
}

/* 城市名称 */
.city-name {
  margin: 8px 0 6px;
  font-size: clamp(38px, 4.8vw, 70px);
  line-height: 1.05;
  font-weight: 500;
  color: #52667f;
}

.city-adm {
  display: block;
  margin-top: 8px;
  font-size: 18px;
  color: rgba(104, 125, 150, 0.78);
  font-weight: 400;
}

/* 温度显示行（图标 + 温度） */
.hero-temp-row {
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 18px 0 10px;
}

/* 天气图标呼吸发光容器 */
.hero-icon-breath {
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6f87a4;
  background: rgba(255,255,255,0.6);
}

.hero-icon-breath::before,
.hero-icon-breath::after {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: inherit;
  opacity: 0.72;
  filter: blur(10px);
  animation: breathe 4.8s ease-in-out infinite;
}

.hero-icon-breath::after {
  inset: -4px;
  opacity: 0.34;
  animation-delay: 1.4s;
}

.hero-icon-breath.is-sunny::before,
.hero-icon-breath.is-sunny::after {
  background: radial-gradient(circle, rgba(255, 209, 117, 0.56) 0%, rgba(255, 196, 110, 0.18) 58%, transparent 74%);
}

.hero-icon-breath.is-cloudy::before,
.hero-icon-breath.is-cloudy::after {
  background: radial-gradient(circle, rgba(202, 222, 252, 0.65) 0%, rgba(181, 204, 238, 0.22) 58%, transparent 74%);
}

.hero-icon-breath.is-rainy::before,
.hero-icon-breath.is-rainy::after {
  background: radial-gradient(circle, rgba(155, 211, 255, 0.58) 0%, rgba(128, 178, 239, 0.2) 58%, transparent 74%);
}

/* 主温度显示 */
.temp-display {
  position: relative;
  font-size: clamp(84px, 11vw, 144px);
  line-height: 0.92;
  letter-spacing: -0.06em;
  color: #4f627b;
  font-weight: 250;
  display: inline-flex;
  align-items: flex-end;
}

/* 滚动数字动画 */
.rolling-number {
  display: inline-block;
  min-width: 1.6em;
  text-align: right;
}

.inline-roll {
  display: inline-block;
  min-width: 1.4em;
  text-align: right;
}

.unit {
  font-size: 0.34em;
  vertical-align: top;
  margin-left: 6px;
}

/* 天气状态行 */
.hero-status-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  color: #5c7089;
}

/* 天气描述文字 */
.weather-desc {
  font-size: 24px;
  font-weight: 600;
}

.hero-divider {
  width: 1px;
  height: 18px;
  background: rgba(117, 141, 168, 0.22);
}

.hero-feels-like,
.hero-range-line {
  color: rgba(102, 122, 146, 0.78);
  font-size: 15px;
}

.hero-range-line {
  margin-top: 14px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-side {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
  padding: 20px 22px;
  border-radius: 26px;
}

.glass-panel {
  background: linear-gradient(180deg, rgba(255,255,255,0.7), rgba(240,246,252,0.76));
  border: 1px solid rgba(255,255,255,0.88);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.96);
}

.hero-side-main {
  margin: 16px 0 12px;
  font-size: 24px;
  line-height: 1.45;
  color: #59708b;
}

.hero-side-sub {
  color: rgba(104, 123, 147, 0.88);
  line-height: 1.65;
  font-size: 14px;
}

.hero-side-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.hero-pill {
  padding: 9px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.74);
  color: #5e748f;
  font-size: 12px;
  border: 1px solid rgba(229, 237, 246, 0.9);
}

@keyframes breathe {
  0%, 100% {
    transform: scale(0.95);
    opacity: 0.34;
  }
  50% {
    transform: scale(1.12);
    opacity: 0.72;
  }
}

.roll-number-enter-active,
.roll-number-leave-active {
  transition: transform 0.32s ease, opacity 0.32s ease;
}

.roll-number-enter-from {
  transform: translateY(55%);
  opacity: 0;
}

.roll-number-leave-to {
  transform: translateY(-55%);
  opacity: 0;
}

@media (max-width: 900px) {
  .hero-card {
    grid-template-columns: 1fr;
    padding: 24px 22px;
  }

  .hero-side {
    min-height: auto;
  }
}
</style>

<template>
  <section class="forecast-card glass-card hover-float">
    <div class="section-header">
      <div class="section-title">
        <WeatherUiIcon name="forecast" class="widget-icon" />
        10日天气预报
      </div>
      <div class="section-subtitle">未来温度走势</div>
    </div>

    <div class="daily-list">
      <div v-for="(day, index) in forecast" :key="day.date" class="daily-item">
        <span class="d-day">{{ index === 0 ? '今天' : formatDay(day.date) }}</span>
        <span class="d-icon"><WeatherIcon :code="day.iconDay" :size="24" /></span>
        <span class="d-temp-min">{{ Math.round(day.tempMin) }}°</span>
        <div class="d-bar-container">
          <div class="d-bar-bg">
            <div class="d-bar-fill" :style="getBarStyle(day.tempMin, day.tempMax)"></div>
          </div>
        </div>
        <span class="d-temp-max">{{ Math.round(day.tempMax) }}°</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import WeatherIcon from '@/components/weather/WeatherIcon.vue'
import WeatherUiIcon from './WeatherUiIcon.vue'

defineProps({
  forecast: {
    type: Array,
    default: () => [],
  },
  formatDay: {
    type: Function,
    required: true,
  },
  getBarStyle: {
    type: Function,
    required: true,
  },
})
</script>

<style scoped>
.glass-card {
  border-radius: 30px;
  background: linear-gradient(180deg, rgba(255,255,255,0.62), rgba(236,243,251,0.72));
  border: 1px solid rgba(255,255,255,0.86);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.96),
    0 18px 40px rgba(118,145,181,0.14);
  backdrop-filter: blur(26px) saturate(135%);
  -webkit-backdrop-filter: blur(26px) saturate(135%);
  transition:
    background 0.6s ease,
    border-color 0.6s ease,
    box-shadow 0.35s ease,
    transform 0.35s ease;
}

.hover-float:hover {
  transform: translateY(-3px);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.96),
    0 24px 42px rgba(118,145,181,0.18);
}

.forecast-card {
  padding: 20px 20px;
  height: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #647994;
  font-size: 14px;
  letter-spacing: 0.06em;
}

.section-subtitle {
  color: rgba(113, 132, 156, 0.72);
  font-size: 12px;
}

.daily-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.daily-item {
  display: grid;
  grid-template-columns: 74px 38px 46px minmax(88px, 1fr) 46px;
  align-items: center;
  gap: 12px;
  color: #5a6f89;
}

.d-day,
.d-temp-min,
.d-temp-max {
  font-size: 15px;
}

.d-day {
  font-weight: 600;
}

.d-temp-min {
  color: rgba(116, 135, 157, 0.86);
}

.d-temp-max {
  text-align: right;
  font-weight: 700;
}

.d-bar-bg {
  position: relative;
  height: 7px;
  border-radius: 999px;
  background: rgba(205, 217, 232, 0.86);
  overflow: hidden;
}

.d-bar-fill {
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: inherit;
}

@media (max-width: 640px) {
  .daily-item {
    grid-template-columns: 64px 34px 42px minmax(68px, 1fr) 42px;
    gap: 8px;
  }
}
</style>

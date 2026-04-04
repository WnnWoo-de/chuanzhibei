<template>
  <section class="forecast-card glass-card hover-float">
    <div class="section-header">
      <div class="section-title">
        <WeatherUiIcon name="hourly" class="widget-icon" />
        每小时天气预报
      </div>
      <div class="section-subtitle">未来 24 小时趋势</div>
    </div>

    <div class="hourly-list">
      <div v-for="hour in hourly" :key="hour.time" class="hourly-item">
        <span class="h-time">{{ formatHour(hour.time) }}</span>
        <div class="h-icon-shell">
          <WeatherIcon :code="hour.icon" :size="28" class="h-icon" />
        </div>
        <span class="h-temp">{{ Math.round(hour.temp) }}°</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import WeatherIcon from '@/components/weather/WeatherIcon.vue'
import WeatherUiIcon from './WeatherUiIcon.vue'

defineProps({
  hourly: {
    type: Array,
    default: () => [],
  },
  formatHour: {
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
  padding: 18px 18px 14px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
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

.hourly-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 6px;
  scrollbar-width: none;
}

.hourly-list::-webkit-scrollbar {
  display: none;
}

.hourly-item {
  min-width: 82px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 14px 10px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.84), rgba(237,243,249,0.86));
  border: 1px solid rgba(226, 235, 245, 0.96);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.96);
}

.h-time {
  color: #7a8da6;
  font-size: 13px;
}

.h-temp {
  color: #556b85;
  font-size: 20px;
  font-weight: 700;
}

.h-icon-shell {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, rgba(255,255,255,0.94), rgba(226,236,246,0.72));
  color: #6b81a0;
}
</style>

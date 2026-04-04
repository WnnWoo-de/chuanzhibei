<template>
  <div class="weather-page" :class="themeClass" :data-theme="themeClass">
    <div class="weather-atmosphere weather-atmosphere--one"></div>
    <div class="weather-atmosphere weather-atmosphere--two"></div>
    <div class="weather-atmosphere weather-atmosphere--three"></div>
    <div class="weather-breath-layer weather-breath-layer--core"></div>
    <div class="weather-breath-layer weather-breath-layer--edge"></div>

    <div class="weather-dashboard-card">
      <div class="weather-container">
        <WeatherSearchSection
          v-model:search-city="searchCity"
          :default-city="defaultCity"
          :loading="loading"
          :error-message="errorMessage"
          @search="handleSearch(searchCity)"
        />

        <div v-if="loading && !weather" class="loading-state glass-card">
          <el-skeleton :rows="10" animated />
        </div>

        <div v-else-if="weather" class="weather-content-fade">
          <WeatherHeroSummary :weather="weather" :format-temp="fmt.temp" />

          <div class="dashboard-grid">
            <WeatherHourlyForecast :hourly="weather.hourly" :format-hour="formatHour" />

            <div class="bottom-layout">
              <div class="left-column">
                <WeatherDailyForecast
                  :forecast="weather.forecast"
                  :format-day="formatDay"
                  :get-bar-style="getBarStyle"
                />
              </div>
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

        <div v-else class="loading-state glass-card">
          <el-skeleton :rows="10" animated />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import {
  formatDay,
  formatHour,
  formatTime,
  getAqiColor,
  getUvLevel,
  weatherFmt,
} from './weatherFormatters'
import { useWeatherQuery } from './useWeatherQuery'
import WeatherDailyForecast from './components/WeatherDailyForecast.vue'
import WeatherHeroSummary from './components/WeatherHeroSummary.vue'
import WeatherHourlyForecast from './components/WeatherHourlyForecast.vue'
import WeatherMetricsGrid from './components/WeatherMetricsGrid.vue'
import WeatherSearchSection from './components/WeatherSearchSection.vue'

const { defaultCity, errorMessage, getBarStyle, handleSearch, loading, searchCity, weather } = useWeatherQuery()
const fmt = weatherFmt

const themeClass = computed(() => {
  const text = weather.value?.now?.text || ''
  if (/雨|雷|雪/.test(text)) return 'theme-rainy'
  if (/晴/.test(text)) return 'theme-sunny'
  return 'theme-cloudy'
})

onMounted(() => {
  handleSearch(searchCity.value || defaultCity)
})
</script>

<style scoped>
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
  padding: 72px 0 20px;
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

.theme-sunny {
  --page-bg-top: #f5f8fd;
  --page-bg-bottom: #e6edf9;
  --page-glow-1: rgba(255, 255, 255, 0.88);
  --page-glow-2: rgba(255, 222, 173, 0.38);
  --page-glow-3: rgba(255, 201, 126, 0.3);
  --breath-core: rgba(255, 208, 126, 0.34);
  --breath-edge: rgba(255, 233, 175, 0.24);
}

.theme-cloudy {
  --page-bg-top: #edf3fb;
  --page-bg-bottom: #d9e5f3;
  --page-glow-1: rgba(255, 255, 255, 0.84);
  --page-glow-2: rgba(198, 219, 246, 0.38);
  --page-glow-3: rgba(220, 231, 245, 0.36);
  --breath-core: rgba(207, 225, 248, 0.32);
  --breath-edge: rgba(230, 239, 250, 0.26);
}

.theme-rainy {
  --page-bg-top: #e9f1fb;
  --page-bg-bottom: #d4e0f1;
  --page-glow-1: rgba(255, 255, 255, 0.72);
  --page-glow-2: rgba(175, 214, 255, 0.42);
  --page-glow-3: rgba(191, 211, 241, 0.34);
  --breath-core: rgba(159, 206, 252, 0.32);
  --breath-edge: rgba(186, 219, 250, 0.24);
}

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
  top: 56px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--page-glow-1);
}

.weather-atmosphere--two {
  width: 320px;
  height: 180px;
  top: 148px;
  left: 12%;
  background: var(--page-glow-2);
  animation-delay: 2s;
}

.weather-atmosphere--three {
  width: 360px;
  height: 180px;
  top: 126px;
  right: 10%;
  background: var(--page-glow-3);
  animation-delay: 5s;
}

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
  top: 110px;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, var(--breath-core) 0%, rgba(255,255,255,0.04) 68%, transparent 78%);
}

.weather-breath-layer--edge {
  width: 420px;
  height: 180px;
  top: 250px;
  right: 18%;
  background: radial-gradient(circle, var(--breath-edge) 0%, rgba(255,255,255,0.04) 66%, transparent 78%);
  animation-delay: 2.2s;
}

.weather-dashboard-card {
  position: relative;
  z-index: 1;
}

.weather-container {
  position: relative;
  z-index: 1;
  padding: 0 28px;
  max-width: 1540px;
  margin: 0 auto;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.bottom-layout {
  display: grid;
  grid-template-columns: minmax(380px, 0.9fr) minmax(0, 1.18fr);
  gap: 12px;
  align-items: start;
}

.left-column,
.right-column {
  min-width: 0;
}

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

.loading-state {
  margin-top: 16px;
  padding: 26px;
}

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
    padding-top: 76px;
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
</style>

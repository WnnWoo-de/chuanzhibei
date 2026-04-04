<template>
  <div class="weather-page">

    <!-- 统一的天气应用卡片 (蓝白色系，全页铺满) -->
    <div class="weather-dashboard-card">
      <div class="weather-container">

        <!-- 内部顶端搜索区域 -->
        <div class="search-section">
          <el-input
            v-model="searchCity"
            placeholder="搜索城市或城区 (例如：北京市, 天河区)..."
            clearable
            @keyup.enter="handleSearch"
            class="search-input-el"
            size="large"
          >
            <template #prepend>
              <el-icon><Location /></el-icon>
            </template>
            <template #append>
              <el-button @click="handleSearch" :loading="loading" class="search-btn">
                查询
              </el-button>
            </template>
          </el-input>
          <div v-if="errorMessage" class="error-text">{{ errorMessage }}</div>
        </div>

        <!-- 加载态 -->
        <div v-if="loading" class="loading-state">
           <el-skeleton :rows="8" animated />
        </div>

        <!-- 核心天气数据面板 -->
        <div v-else-if="weather" class="weather-content-fade">

          <!-- 头部：城市 & 主温度 -->
          <header class="weather-header">
            <h1 class="city-name">{{ weather.city.name }} <span v-if="weather.city.adm2 && weather.city.adm2 !== weather.city.name" class="city-adm">{{ weather.city.adm2 }}</span></h1>
            <div class="temp-display">{{ fmt.temp(weather.now.temp) }}<span class="unit">°</span></div>
            <div class="weather-desc">{{ weather.now.text }}</div>
            <div class="high-low">最高 {{ fmt.temp(weather.forecast[0]?.tempMax) }}° 最低 {{ fmt.temp(weather.forecast[0]?.tempMin) }}°</div>
          </header>

          <!-- 布局网格 -->
          <div class="dashboard-grid">

            <!-- 顶端行：逐小时预报 -->
            <div class="widget widget-hourly">
              <div class="widget-header"><span class="widget-icon">⏰</span> 24小时天气预报</div>
              <div class="hourly-list">
                <div class="hourly-item" v-for="h in weather.hourly" :key="h.time">
                  <span class="h-time">{{ formatHour(h.time) }}</span>
                  <WeatherIcon :code="h.icon" :size="28" class="h-icon" />
                  <span class="h-temp">{{ Math.round(h.temp) }}°</span>
                </div>
              </div>
            </div>

            <!-- 底部分栏方案 -->
            <div class="bottom-layout">

              <!-- 左栏：10天预报 -->
              <div class="widget widget-10day">
                <div class="widget-header"><span class="widget-icon">📅</span> 10日天气预报</div>
                <div class="daily-list">
                  <div class="daily-item" v-for="(d, i) in weather.forecast" :key="d.date">
                    <span class="d-day">{{ i === 0 ? '今天' : formatDay(d.date) }}</span>
                    <span class="d-icon"><WeatherIcon :code="d.iconDay" :size="26" /></span>
                    <span class="d-temp-min">{{ Math.round(d.tempMin) }}°</span>
                    <div class="d-bar-container">
                      <div class="d-bar-bg">
                        <div class="d-bar-fill" :style="getBarStyle(d.tempMin, d.tempMax)"></div>
                      </div>
                    </div>
                    <span class="d-temp-max">{{ Math.round(d.tempMax) }}°</span>
                  </div>
                </div>
              </div>

              <!-- 右栏：环境微件网格 -->
              <div class="widget-group">

                <!-- AQI -->
                <div class="widget widget-square widget-aqi">
                  <div class="widget-header"><span class="widget-icon">🍃</span> 空气质量</div>
                  <div class="widget-content">
                    <div class="big-value">{{ Math.round(weather.airQuality.aqi || 0) }}</div>
                    <div class="aqi-level-text" :style="{ color: getAqiColor(weather.airQuality.aqi) }">{{ weather.airQuality.level }}</div>
                    <div class="aqi-bar-bg">
                      <div class="aqi-bar-fill" :style="{ width: Math.min(100, (weather.airQuality.aqi/300)*100) + '%', background: getAqiColor(weather.airQuality.aqi) }"></div>
                    </div>
                    <div class="sub-value">{{ weather.airQuality.advice }}</div>
                  </div>
                </div>

                <!-- 紫外线指数 -->
                <div class="widget widget-square">
                  <div class="widget-header"><span class="widget-icon">☀️</span> 紫外线指数</div>
                  <div class="widget-content">
                    <div class="big-value">{{ Math.round(weather.now.uvIndex || 0) }}</div>
                    <div class="highlight-text">{{ getUvLevel(weather.now.uvIndex) }}</div>
                  </div>
                </div>

                <!-- 日落 -->
                <div class="widget widget-square">
                  <div class="widget-header"><span class="widget-icon">🌅</span> 日落</div>
                  <div class="widget-content">
                    <div class="big-value">{{ formatTime(weather.now.sunset) }}</div>
                    <div class="sub-value mt-auto">日出: {{ formatTime(weather.now.sunrise) }}</div>
                  </div>
                </div>

                <!-- 风力指示 -->
                <div class="widget widget-square">
                  <div class="widget-header"><span class="widget-icon">🎐</span> 风力</div>
                  <div class="widget-content flex-center">
                    <div class="wind-circle">
                      <div class="wind-val">{{ weather.now.windScale }} 级</div>
                      <div class="wind-dir">{{ weather.now.windDir }}</div>
                    </div>
                  </div>
                </div>

                <!-- 降水 -->
                <div class="widget widget-square">
                  <div class="widget-header"><span class="widget-icon">💧</span> 降水</div>
                  <div class="widget-content">
                    <div class="big-value">{{ weather.now.precipitation || 0 }} 毫米</div>
                    <div class="sub-value mt-auto">过去 24 小时</div>
                  </div>
                </div>

                <!-- 体感温度 -->
                <div class="widget widget-square">
                  <div class="widget-header"><span class="widget-icon">🌡️</span> 体感温度</div>
                  <div class="widget-content">
                    <div class="big-value">{{ Math.round(weather.now.feelsLike) }}°</div>
                    <div class="sub-value mt-auto">风使体感温度比实际气温低。</div>
                  </div>
                </div>

                <!-- 湿度 -->
                <div class="widget widget-square">
                  <div class="widget-header"><span class="widget-icon">🌧️</span> 湿度</div>
                  <div class="widget-content">
                    <div class="big-value">{{ Math.round(weather.now.humidity) }}%</div>
                    <div class="sub-value mt-auto">当前露点温度为 20°。</div>
                  </div>
                </div>

                <!-- 能见度 -->
                <div class="widget widget-square">
                  <div class="widget-header"><span class="widget-icon">👁️</span> 能见度</div>
                  <div class="widget-content">
                    <div class="big-value">{{ weather.now.vis }} 公里</div>
                    <div class="sub-value mt-auto">视野非常清晰。</div>
                  </div>
                </div>

                <!-- 气压 -->
                <div class="widget widget-square">
                  <div class="widget-header"><span class="widget-icon">⏲️</span> 气压</div>
                  <div class="widget-content">
                    <div class="big-value">{{ Math.round(weather.now.pressure) }}</div>
                    <div class="sub-value">百帕</div>
                    <div class="sub-value mt-auto">气压处于正常范围</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- 空状态提示 -->
        <div v-else class="empty-state">
          <el-empty description="输入城市或城区名称，探索实况天气数据" />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Location } from '@element-plus/icons-vue'
import WeatherIcon from '@/components/weather/WeatherIcon.vue'
import { queryWeatherByCity } from '@/services/weatherService'

const searchCity = ref('北京')
const weather = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const globalMinTemp = ref(0)
const globalMaxTemp = ref(40)

// ── 格式化工具 ────────────────────────────────────────────────────────────────
const fmt = {
  temp: (v) => (v !== null && v !== undefined ? Math.round(v) : '--'),
}

const formatHour = (iso) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const now = new Date()
  if (d.getHours() === now.getHours() && d.getDate() === now.getDate()) return '现在'
  return `${d.getHours()}时`
}

const formatDay = (dateStr) => {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[d.getDay()]
}

const formatTime = (iso) => {
  if (!iso) return '--'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const getUvLevel = (uv) => {
  if (!uv) return '低'
  if (uv < 3) return '低'
  if (uv < 6) return '中等'
  if (uv < 8) return '高'
  if (uv < 11) return '极高'
  return '危险'
}

const getAqiColor = (aqi) => {
  if (aqi <= 50) return '#10b981' // Green
  if (aqi <= 100) return '#eab308' // Yellow
  if (aqi <= 150) return '#f97316' // Orange
  if (aqi <= 200) return '#ef4444' // Red
  if (aqi <= 300) return '#a855f7' // Purple
  return '#be123c' // Maroon
}

const getBarStyle = (min, max) => {
  const range = globalMaxTemp.value - globalMinTemp.value || 1;
  const left = ((min - globalMinTemp.value) / range) * 100;
  const width = ((max - min) / range) * 100;
  return {
    left: `${Math.max(0, left)}%`,
    width: `${Math.max(0, width)}%`,
    // 渐变蓝黄红过渡
    background: 'linear-gradient(90deg, #60a5fa, #fbbf24, #fb7185)'
  }
}

// ── 查询逻辑 ─────────────────────────────────────────────────────────────────
const handleSearch = async () => {
  const city = searchCity.value.trim()
  if (!city) return

  loading.value = true
  errorMessage.value = ''
  weather.value = null // 重新查询时清空界面

  const result = await queryWeatherByCity(city)
  loading.value = false

  if (result.ok && result.data) {
    weather.value = result.data
    errorMessage.value = ''

    // Calculate global min/max for the 10-day bars
    if (result.data.forecast && result.data.forecast.length > 0) {
      let temps = []
      result.data.forecast.forEach(d => {
        temps.push(d.tempMin, d.tempMax)
      })
      globalMinTemp.value = Math.min(...temps)
      globalMaxTemp.value = Math.max(...temps)
    }
  } else {
    weather.value = null
    errorMessage.value = result.message || '查询失败，请重试'
  }
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
/* ── Reset & Container ── */
.weather-page {
  padding: 64px 0 0;
  background-color: transparent;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* ── 顶部搜索区域 ── */
.search-section {
  max-width: 600px;
  margin: 0 auto 28px;
}
.search-input-el {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-radius: 8px;
}
.error-text {
  color: #ef4444;
  margin-top: 8px;
  font-size: 14px;
  text-align: center;
}

/* ── 加载和空状态 ── */
.loading-state, .empty-state {
  max-width: 1000px;
  margin: 40px auto;
  background: var(--el-bg-color, #fff);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 100, 200, 0.05);
}

/* ── 独立的天气卡片 (蓝白渐变底色) ── */
.weather-dashboard-card {
  position: relative;
  width: 100%;
  flex: 1;
  border-radius: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #d1d7db 0%, #ffffff 50%, #f0f9ff 100%);
  color: #a2a9bd;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-shadow: none;
}

.weather-container {
  position: relative;
  z-index: 1;
  padding: 32px 40px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* ── General Widget UI (微调为半透明白底以凸显下方蓝底) ── */
.widget {
  background: rgba(255, 255, 255, 0.65); /* 半透明白 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(186, 230, 253, 0.3); /* 极细微的蓝浅阴影 */
}
.widget-header {
  font-size: 13px;
  color: #8f98a9; /* 蓝色系表头 */
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  font-weight: 500;
}
.widget-icon {
  margin-right: 6px;
}

/* ── Header ── */
.weather-header {
  text-align: center;
  margin-bottom: 40px;
}
.city-name {
  font-size: 36px;
  font-weight: 500;
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #1e3a8a;
}
.city-adm {
  font-size: 18px;
  opacity: 0.8;
  font-weight: 400;
  color: #3b82f6;
}
.temp-display {
  font-size: 96px;
  font-weight: 300;
  line-height: 1;
  margin: 0;
  position: relative;
  display: inline-block;
  color: #1e3a8a;
}
.temp-display .unit {
  position: absolute;
  font-size: 40px;
  top: 10px;
}
.weather-desc {
  font-size: 24px;
  font-weight: 400;
  margin: 6px 0;
  color: #1e40af;
}
.high-low {
  font-size: 18px;
  font-weight: 500;
  color: #3b82f6;
}

/* ── Dashboard Layout ── */
.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.bottom-layout {
  display: flex;
  gap: 20px;
}

@media (max-width: 900px) {
  .bottom-layout { flex-direction: column; }
  .weather-container { padding: 20px 16px; }
}

@media (min-width: 1600px) {
  .widget-group {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

/* ── Widget: Hourly ── */
.widget-hourly { padding: 16px 20px; }
.hourly-list {
  display: flex;
  overflow-x: auto;
  gap: 24px;
  padding-bottom: 10px;
  scrollbar-width: none;
}
.hourly-list::-webkit-scrollbar { display: none; }
.hourly-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
}
.h-time { font-size: 15px; font-weight: 500; margin-bottom: 12px; color: #3b82f6; }
.h-icon { font-size: 28px; margin-bottom: 12px; filter: drop-shadow(0 2px 4px rgba(186, 230, 253, 0.4)); }
.h-temp { font-size: 18px; font-weight: 600; color: #1e3a8a; }

/* ── Widget: 10-Day ── */
.widget-10day { flex: 0 0 350px; max-width: 350px; }
.daily-list { display: flex; flex-direction: column; }
.daily-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(147, 197, 253, 0.3); /* 边框变成极浅蓝 */
  font-size: 17px;
}
.daily-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.d-day { flex: 0 0 50px; font-weight: 500; color: #1e40af; }
.d-icon { flex: 0 0 50px; text-align: center; filter: drop-shadow(0 2px 4px rgba(186, 230, 253, 0.4)); }
.d-temp-min { flex: 0 0 40px; text-align: right; color: #60a5fa; font-weight: 500; }
.d-temp-max { flex: 0 0 40px; text-align: left; font-weight: 600; color: #1e3a8a; }
.d-bar-container {
  flex: 1; margin: 0 16px; display: flex; align-items: center;
}
.d-bar-bg {
  width: 100%; height: 6px; background: rgba(147, 197, 253, 0.3); border-radius: 3px; position: relative; overflow: hidden;
}
.d-bar-fill { position: absolute; height: 100%; border-radius: 3px; }

/* ── Widget: Group (Right Grid) ── */
.widget-group {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  align-items: start;
}
.widget-square {
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
}
.widget-content { flex: 1; display: flex; flex-direction: column; }
.flex-center { align-items: center; justify-content: center; }
.big-value { font-size: 32px; font-weight: 500; margin-bottom: 4px; line-height: 1.1; color: #1e3a8a; }
.sub-value { font-size: 14px; color: #3b82f6; line-height: 1.4; }
.mt-auto { margin-top: auto; }
.highlight-text { font-size: 18px; font-weight: 600; color: #1e40af; }

/* AQI Custom */
.aqi-level-text { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
.aqi-bar-bg { width: 100%; height: 6px; border-radius: 3px; background: rgba(147, 197, 253, 0.3); margin-bottom: 8px; overflow: hidden;}
.aqi-bar-fill { height: 100%; border-radius: 3px; }

/* Wind Circle */
.wind-circle {
  width: 100px; height: 100px; border-radius: 50%;
  border: 4px solid rgba(147, 197, 253, 0.3);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.wind-val { font-size: 20px; font-weight: 600; color: #1e3a8a; }
.wind-dir { font-size: 14px; color: #3b82f6; }

@media (max-width: 600px) {
  .widget-10day { max-width: 100%; }
  .widget-group { grid-template-columns: repeat(2, 1fr); }
  .temp-display { font-size: 72px; }
}
</style>

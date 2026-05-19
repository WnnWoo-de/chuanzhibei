<template>
  <section class="metrics-grid">
    <article class="metric-card hover-float">
      <div class="metric-header">
        <WeatherUiIcon name="air-quality" class="widget-icon" />
        {{ langText.weather.metricAqiTitle }}
      </div>
      <div class="aqi-stage">
        <div class="aqi-orb orb-green"></div>
        <div class="aqi-orb orb-yellow"></div>
        <div class="aqi-orb orb-lime"></div>
        <div class="aqi-center">
          <div class="aqi-center-value">
            <transition name="roll-number" mode="out-in">
              <span :key="`aqi-${Math.round(weather.airQuality.aqi || 0)}`" class="rolling-number-sm">
                {{ Math.round(weather.airQuality.aqi || 0) }}
              </span>
            </transition>
          </div>
          <div class="aqi-center-label" :style="{ color: getAqiColor(weather.airQuality.aqi) }">
            {{ weather.airQuality.level }}
          </div>
        </div>
      </div>
      <div class="metric-footnote">{{ weather.airQuality.advice }}</div>
    </article>

    <article class="metric-card hover-float">
      <div class="metric-header">
        <WeatherUiIcon name="uv" class="widget-icon" />
        {{ langText.weather.metricUvTitle }}
      </div>
      <div class="metric-value metric-value--large">
        <transition name="roll-number" mode="out-in">
          <span :key="`uv-${Math.round(weather.now.uvIndex || 0)}`" class="rolling-number-lg">
            {{ Math.round(weather.now.uvIndex || 0) }}
          </span>
        </transition>
      </div>
      <div class="metric-highlight">{{ getUvLevel(weather.now.uvIndex) }}</div>
      <div class="metric-footnote">{{ langText.weather.metricUvNote }}</div>
    </article>

    <article class="metric-card hover-float">
      <div class="metric-header">
        <WeatherUiIcon name="sunset" class="widget-icon" />
        {{ langText.weather.metricSunsetTitle }}
      </div>
      <div class="metric-value metric-value--time">{{ formatTime(weather.now.sunset) }}</div>
      <div class="sun-track">
        <span class="sun-track-dot"></span>
      </div>
      <div class="metric-footnote">{{ langText.weather.metricSunrisePrefix }}{{ formatTime(weather.now.sunrise) }}</div>
    </article>

    <article class="metric-card hover-float">
      <div class="metric-header">
        <WeatherUiIcon name="wind" class="widget-icon" />
        {{ langText.weather.metricWindTitle }}
      </div>
      <div class="wind-dial">
        <div class="wind-dial-inner">
          <div class="wind-arrow"></div>
          <div class="wind-speed">
            <transition name="roll-number" mode="out-in">
              <span :key="`wind-${weather.now.windScale}`" class="rolling-number-md">{{ weather.now.windScale }}</span>
            </transition>
          </div>
          <div class="wind-dir">{{ weather.now.windDir }}</div>
        </div>
      </div>
    </article>

    <article class="metric-card hover-float">
      <div class="metric-header">
        <WeatherUiIcon name="precipitation" class="widget-icon" />
        {{ langText.weather.metricPrecipTitle }}
      </div>
      <div class="metric-value">
        <transition name="roll-number" mode="out-in">
          <span :key="`prec-${weather.now.precipitation || 0}`" class="rolling-number-md">{{ weather.now.precipitation || 0 }}</span>
        </transition>
        <span> {{ langText.weather.mmUnit }}</span>
      </div>
      <div class="metric-footnote">{{ langText.weather.pastHours }}</div>
    </article>

    <article class="metric-card hover-float">
      <div class="metric-header">
        <WeatherUiIcon name="feels-like" class="widget-icon" />
        {{ langText.weather.metricFeelsTitle }}
      </div>
      <div class="metric-value">
        <transition name="roll-number" mode="out-in">
          <span :key="`feel-${Math.round(weather.now.feelsLike)}`" class="rolling-number-md">
            {{ Math.round(weather.now.feelsLike) }}
          </span>
        </transition>
        °
      </div>
      <div class="metric-footnote">{{ langText.weather.metricFeelsNote }}</div>
    </article>

    <article class="metric-card hover-float">
      <div class="metric-header">
        <WeatherUiIcon name="humidity" class="widget-icon" />
        {{ langText.weather.metricHumidityTitle }}
      </div>
      <div class="metric-value">
        <transition name="roll-number" mode="out-in">
          <span :key="`humidity-${Math.round(weather.now.humidity)}`" class="rolling-number-md">
            {{ Math.round(weather.now.humidity) }}
          </span>
        </transition>
        %
      </div>
      <div class="metric-footnote">{{ langText.weather.metricHumidityNote }}</div>
    </article>

    <article class="metric-card hover-float">
      <div class="metric-header">
        <WeatherUiIcon name="visibility" class="widget-icon" />
        {{ langText.weather.metricVisTitle }}
      </div>
      <div class="metric-value">
        <transition name="roll-number" mode="out-in">
          <span :key="`vis-${weather.now.vis}`" class="rolling-number-md">{{ weather.now.vis }}</span>
        </transition>
        {{ langText.weather.kmUnit }}
      </div>
      <div class="metric-footnote">{{ langText.weather.metricVisNote }}</div>
    </article>

    <article class="metric-card hover-float">
      <div class="metric-header">
        <WeatherUiIcon name="pressure" class="widget-icon" />
        {{ langText.weather.metricPressureTitle }}
      </div>
      <div class="metric-value">
        <transition name="roll-number" mode="out-in">
          <span :key="`pressure-${Math.round(weather.now.pressure)}`" class="rolling-number-md">
            {{ Math.round(weather.now.pressure) }}
          </span>
        </transition>
      </div>
      <div class="metric-footnote">{{ langText.weather.metricPressureNote }}</div>
    </article>
  </section>
</template>

<script setup>
import { langText } from '@/language'
import WeatherUiIcon from './WeatherUiIcon.vue'

defineProps({
  weather: {
    type: Object,
    required: true,
  },
  getAqiColor: {
    type: Function,
    required: true,
  },
  getUvLevel: {
    type: Function,
    required: true,
  },
  formatTime: {
    type: Function,
    required: true,
  },
})
</script>

<style scoped>
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  position: relative;
  min-height: 206px;
  padding: 18px 18px;
  border-radius: 30px;
  overflow: hidden;
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

.metric-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.4), transparent 48%);
  pointer-events: none;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.96),
    0 24px 42px rgba(118,145,181,0.18);
}

.metric-card--wide {
  grid-column: span 2;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b8099;
  font-size: 13px;
  letter-spacing: 0.06em;
  margin-bottom: 16px;
}

.metric-value,
.metric-value--large,
.metric-value--time {
  color: #566b84;
  line-height: 1;
}

.rolling-number-sm,
.rolling-number-md,
.rolling-number-lg {
  display: inline-block;
  min-width: 1.1em;
}

.rolling-number-sm {
  text-align: center;
}

.rolling-number-md,
.rolling-number-lg {
  text-align: right;
}

.metric-value {
  font-size: 40px;
  font-weight: 500;
}

.metric-value span {
  font-size: 0.42em;
}

.metric-value--large {
  font-size: 64px;
  font-weight: 300;
}

.metric-value--time {
  font-size: 54px;
  font-weight: 300;
}

.metric-highlight {
  margin-top: 6px;
  color: #677d96;
  font-size: 24px;
  font-weight: 600;
}

.metric-footnote {
  margin-top: 14px;
  color: rgba(109, 129, 152, 0.9);
  line-height: 1.65;
  font-size: 14px;
}

.aqi-stage {
  position: relative;
  height: 120px;
  border-radius: 22px;
  overflow: hidden;
  background:
    linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)),
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.22), transparent 22%),
    radial-gradient(circle at 70% 40%, rgba(255,255,255,0.18), transparent 22%),
    #8f98a8;
}

.aqi-orb {
  position: absolute;
  border-radius: 999px;
  opacity: 0.78;
}

.orb-green {
  width: 120px;
  height: 120px;
  right: -8px;
  top: -24px;
  background: rgba(104, 196, 91, 0.82);
}

.orb-yellow {
  width: 140px;
  height: 140px;
  left: 20px;
  top: 28px;
  background: rgba(232, 188, 90, 0.78);
}

.orb-lime {
  width: 90px;
  height: 90px;
  left: -15px;
  bottom: -12px;
  background: rgba(205, 210, 70, 0.78);
}

.aqi-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  border-radius: 999px;
  background: rgba(70, 61, 41, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(0,0,0,0.14);
}

.aqi-center-value {
  color: #fff;
  font-size: 22px;
  font-weight: 700;
}

.aqi-center-label {
  font-size: 11px;
  margin-top: 2px;
}

.sun-track {
  position: relative;
  height: 76px;
  margin-top: 12px;
}

.sun-track::before,
.sun-track::after {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
}

.sun-track::before {
  top: 42px;
  border-top: 1px solid rgba(135, 154, 176, 0.24);
}

.sun-track::after {
  top: 6px;
  height: 72px;
  border-top: 4px solid rgba(185, 199, 217, 0.8);
  border-radius: 60% 60% 0 0;
  transform: scaleY(0.72);
}

.sun-track-dot {
  position: absolute;
  top: 16px;
  right: 22%;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: #fff6de;
  box-shadow: 0 0 16px rgba(255, 234, 176, 0.72);
}

.wind-dial {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 136px;
}

.wind-dial-inner {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 999px;
  border: 1px dashed rgba(168, 186, 207, 0.62);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.wind-arrow {
  position: absolute;
  top: 18px;
  width: 2px;
  height: 34px;
  background: #7a8ea7;
}

.wind-arrow::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 10px solid #7a8ea7;
}

.wind-speed {
  color: #5a6f89;
  font-size: 42px;
  line-height: 1;
}

.wind-dir {
  margin-top: 6px;
  color: rgba(109, 129, 152, 0.9);
}

@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .metric-card--wide {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .metric-card,
  .metric-card--wide {
    grid-column: auto;
  }
}

.roll-number-enter-active,
.roll-number-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.roll-number-enter-from {
  transform: translateY(50%);
  opacity: 0;
}

.roll-number-leave-to {
  transform: translateY(-50%);
  opacity: 0;
}
</style>

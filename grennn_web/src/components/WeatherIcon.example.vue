<!-- WeatherIcon 组件使用示例 -->

<!-- 示例 1: 基础使用 -->
<WeatherIcon code="100" />

<!-- 示例 2: 自定义大小 -->
<WeatherIcon code="101" :size="64" />

<!-- 示例 3: 使用填充版本 -->
<WeatherIcon code="102" :fill="true" :size="48" />

<!-- 示例 4: 完整示例（在天气卡片中） -->
<div class="weather-card">
  <WeatherIcon :code="weatherData.now.icon" :size="80" :alt="weatherData.now.text" />
  <p>{{ weatherData.now.text }}</p>
  <p>{{ weatherData.now.temp }}°C</p>
</div>

<!-- 示例 5: 在列表中使用 -->
<div class="weather-list">
  <div v-for="day in forecast" :key="day.date" class="forecast-item">
    <WeatherIcon :code="day.iconDay" :size="40" :alt="day.textDay" />
    <span>{{ day.textDay }}</span>
  </div>
</div>

<!-- 示例 6: 响应式大小 -->
<WeatherIcon 
  :code="weatherCode" 
  :size="isMobile ? 40 : 64" 
  :alt="description" 
/>

<!-- 常用天气代码参考 -->
<!--
100 - 晴
101 - 多云
102 - 少云
103 - 晴间多云
104 - 阴
300 - 阵雨
305 - 小雨
306 - 中雨
307 - 大雨
400 - 雨夹雪
500 - 小雪
501 - 中雪
502 - 大雪
600 - 雾
700 - 雷阵雨
-->

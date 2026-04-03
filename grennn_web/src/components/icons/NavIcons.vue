<template>
  <svg
    :viewBox="viewBox"
    :width="size"
    :height="size"
    :class="['nav-icon', `nav-icon--${name}`]"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 关于 - 叶子 -->
    <g v-if="name === 'about'">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
    </g>

    <!-- 旧物重构 - 循环箭头 -->
    <g v-if="name === 'reconstruction'">
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
    </g>

    <!-- AI 助手 - 机器人 -->
    <g v-if="name === 'chat'">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
    </g>

    <!-- 社区活动 - 地球 -->
    <g v-if="name === 'community'">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
    </g>

    <!-- 志愿活动 - 握手 -->
    <g v-if="name === 'volunteer'">
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
    </g>

    <!-- 天气查询 - 太阳 -->
    <g v-if="name === 'weather'">
      <path d="M12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm0-10c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zM13 2h-2v3h2V2zm0 15h-2v3h2v-3zM5 11H2v2h3v-2zm15 0h-3v2h3v-2zM6.3 5.3L4.2 3.2 2.8 4.6l2.1 2.1 1.4-1.4zm11.4 11.4l-1.4 1.4 2.1 2.1 1.4-1.4-2.1-2.1zM19.8 4.6l-2.1 2.1 1.4 1.4 2.1-2.1-1.4-1.4zM6.3 17.7l-2.1 2.1 1.4 1.4 2.1-2.1-1.4-1.4z"/>
    </g>

    <!-- 成就系统 - 奖杯 -->
    <g v-if="name === 'achievements'">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/>
    </g>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true,
    validator: (value) => ['about', 'reconstruction', 'chat', 'community', 'volunteer', 'weather', 'achievements'].includes(value)
  },
  size: {
    type: [String, Number],
    default: 24
  }
})

const viewBox = '0 0 24 24'
</script>

<style scoped>
.nav-icon {
  display: inline-block;
  vertical-align: middle;
  transition: opacity 0.3s ease;
}
</style>

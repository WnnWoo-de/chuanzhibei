<template>
  <span class="weather-ui-icon" :style="iconStyle" aria-hidden="true">
    <svg
      v-if="name === 'air-quality'"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 15.5c1.2-2.2 2.7-3.3 4.5-3.3 1.5 0 2.9.8 4.2 2.4" />
      <path d="M5 18.5c1.7-3.2 4-4.8 6.8-4.8 2.4 0 4.6 1.1 6.7 3.4" />
      <path d="M12 10c2.4-.7 4-2.8 4-5.5-3 .1-5.2 1.1-6.6 2.9-1.1 1.3-1.6 3-1.5 5.1 1.3-1.4 2.7-2.2 4.1-2.5Z" fill="currentColor" stroke="none" />
    </svg>

    <svg
      v-else-if="name === 'uv'"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" />
    </svg>

    <svg
      v-else-if="name === 'sunset'"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 18.5h16" />
      <path d="M7 18a5 5 0 0 1 10 0" />
      <path d="M12 5.5v5" />
      <path d="m9.5 8 2.5 2.5L14.5 8" />
    </svg>

    <svg
      v-else-if="name === 'wind'"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3 9.5h10.5a2.5 2.5 0 1 0-2.4-3.2" />
      <path d="M3 14h14a2.5 2.5 0 1 1-2.4 3.2" />
      <path d="M3 18.5h8" />
    </svg>

    <svg
      v-else-if="name === 'precipitation'"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7.5 10.5a4.5 4.5 0 1 1 8.6-1.7A3.8 3.8 0 1 1 17.8 16H7.8a3.3 3.3 0 0 1-.3-6.5Z" />
      <path d="M9 17.5 7.8 20M13 17.5 11.8 20M17 17.5 15.8 20" />
    </svg>

    <svg
      v-else-if="name === 'feels-like'"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 5a2 2 0 1 1 4 0v7.2a4 4 0 1 1-4 0V5Z" />
      <path d="M12 8v7" />
      <path d="M12 17.5v.1" />
    </svg>

    <svg
      v-else-if="name === 'humidity'"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 4.5c3 4 5 6.7 5 9.2a5 5 0 1 1-10 0c0-2.5 2-5.2 5-9.2Z" />
      <path d="M9.5 14.5c.2 1.4 1.2 2.4 2.5 2.8" />
    </svg>

    <svg
      v-else-if="name === 'visibility'"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>

    <svg
      v-else-if="name === 'pressure'"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="7" />
      <path d="M12 12 16 9" />
      <path d="M12 7v1.5M7 12h1.5M15.5 12H17M12 15.5V17" />
    </svg>

    <svg
      v-else-if="name === 'hourly'"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </svg>

    <svg
      v-else-if="name === 'forecast'"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3.5V7M16 3.5V7M4 10h16" />
      <path d="M8 13h3M8 16h5M15.5 14.5l1 1 2-2.5" />
    </svg>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 18,
  },
  strokeWidth: {
    type: [Number, String],
    default: 1.8,
  },
})

const iconStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  '--icon-stroke-width': props.strokeWidth,
}))
</script>

<style scoped>
.weather-ui-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.weather-ui-icon svg {
  width: 100%;
  height: 100%;
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-width: var(--icon-stroke-width);
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>

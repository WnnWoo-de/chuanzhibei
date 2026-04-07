<template>
  <div class="search-shell">
    <div class="search-card glass-card">
      <div class="search-copy">
        <div class="search-eyebrow">天气查询</div>
        <div class="search-hint">输入城市或城区；留空时将自动展示默认地区天气状态。</div>
      </div>

      <div class="search-controls">
        <el-input
          :model-value="searchCity"
          placeholder="搜索城市或城区，例如：北京、朝阳区、广州..."
          clearable
          class="search-input-el"
          size="large"
          @update:model-value="$emit('update:searchCity', $event)"
          @keyup.enter="$emit('search')"
        >
          <template #prefix>
            <el-icon><Location /></el-icon>
          </template>
        </el-input>

        <el-button :loading="false" :disabled="loading" class="search-btn" size="large" @click="$emit('search')">
          <span class="search-btn-inner">
            <span v-if="loading" class="loading-cluster" aria-hidden="true">
              <i></i><i></i><i></i>
            </span>
            <span class="search-btn-label">{{ loading ? '查询中' : '查询天气' }}</span>
          </span>
        </el-button>
      </div>

      <div class="search-meta">
        <span class="meta-badge">默认城市：{{ defaultCity }}</span>
        <span v-if="errorMessage" :class="errorMessage.includes('演示数据') ? 'meta-info' : 'meta-error'">{{ errorMessage }}</span>
        <span v-else class="meta-tip">支持直接输入地区名，页面会始终保留天气状态展示。</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Location } from '@element-plus/icons-vue'

defineProps({
  searchCity: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  defaultCity: {
    type: String,
    default: '北京',
  },
})

defineEmits(['update:searchCity', 'search'])
</script>

<style scoped>
.search-shell {
  margin-bottom: 16px;
}

.search-card {
  display: grid;
  grid-template-columns: minmax(240px, 0.88fr) minmax(360px, 1.24fr);
  gap: 14px 18px;
  align-items: center;
  padding: 16px 18px;
}

.glass-card {
  border-radius: 30px;
  background: linear-gradient(180deg, rgba(255,255,255,0.65), rgba(235,242,250,0.72));
  border: 1px solid rgba(255,255,255,0.86);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.95),
    0 18px 40px rgba(118,145,181,0.14);
  backdrop-filter: blur(26px) saturate(135%);
  -webkit-backdrop-filter: blur(26px) saturate(135%);
  transition:
    background 0.6s ease,
    border-color 0.6s ease,
    box-shadow 0.35s ease,
    transform 0.35s ease;
}

.search-copy {
  min-width: 0;
}

.search-eyebrow {
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(96, 118, 145, 0.72);
  margin-bottom: 6px;
}

.search-hint {
  color: rgba(80, 101, 128, 0.94);
  font-size: 14px;
  line-height: 1.55;
}

.search-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
}

.search-input-el :deep(.el-input__wrapper) {
  min-height: 50px;
  border-radius: 18px;
  background: rgba(255,255,255,0.76);
  box-shadow:
    inset 0 0 0 1px rgba(216, 228, 240, 0.9),
    0 8px 18px rgba(159, 181, 209, 0.12);
}

.search-input-el :deep(.el-input__inner) {
  color: #4c6078;
}

.search-input-el :deep(.el-input__inner::placeholder) {
  color: rgba(120, 139, 162, 0.68);
}

.search-input-el :deep(.el-input__prefix-inner),
.search-input-el :deep(.el-input__suffix-inner) {
  color: rgba(103, 124, 151, 0.78);
}

.search-btn {
  min-width: 126px;
  min-height: 50px;
  border-radius: 18px;
  border: 1px solid rgba(225, 234, 245, 0.96);
  background: linear-gradient(135deg, rgba(255,255,255,0.92), rgba(223,235,249,0.92));
  color: #4f6480;
  box-shadow: 0 12px 22px rgba(133, 158, 189, 0.14);
  position: relative;
  overflow: hidden;
}

.search-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.22) 35%, rgba(255,255,255,0.62) 50%, rgba(255,255,255,0.2) 65%, transparent 100%);
  transform: translateX(-130%);
  opacity: 0;
}

.search-btn:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(216,231,248,0.96));
}

.search-btn:disabled {
  cursor: wait;
}

.search-btn:disabled::before {
  opacity: 1;
  animation: shimmer 1.6s linear infinite;
}

.search-btn-inner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.search-btn-label {
  position: relative;
  z-index: 1;
}

.loading-cluster {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  position: relative;
  z-index: 1;
}

.loading-cluster i {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #7c93af;
  opacity: 0.35;
  animation: dotPulse 1.1s ease-in-out infinite;
}

.loading-cluster i:nth-child(2) {
  animation-delay: 0.14s;
}

.loading-cluster i:nth-child(3) {
  animation-delay: 0.28s;
}

.search-meta {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.meta-badge,
.meta-tip,
.meta-error {
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1;
}

.meta-badge {
  background: rgba(255,255,255,0.76);
  color: #5e7590;
  border: 1px solid rgba(224, 233, 243, 0.9);
}

.meta-tip {
  color: rgba(111, 130, 155, 0.92);
}

.meta-info {
  background: rgba(233, 244, 255, 0.96);
  color: #5a7597;
  border: 1px solid rgba(199, 223, 248, 0.9);
}

.meta-error {
  background: rgba(255, 239, 239, 0.96);
  color: #c36e6e;
  border: 1px solid rgba(255, 214, 214, 0.9);
}

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: translateY(0) scale(0.9);
    opacity: 0.28;
  }
  40% {
    transform: translateY(-1px) scale(1.15);
    opacity: 0.95;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-130%);
  }
  100% {
    transform: translateX(130%);
  }
}

@media (max-width: 900px) {
  .search-card,
  .search-controls {
    grid-template-columns: 1fr;
  }

  .search-btn {
    width: 100%;
  }
}
</style>

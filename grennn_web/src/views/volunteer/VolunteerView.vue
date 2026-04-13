<template>
  <div class="activity-page min-h-screen pt-24 pb-16 px-6 md:px-8">
    <div class="mx-auto max-w-7xl">
      <!-- 顶部展示区 -->
      <section class="hero-panel rounded-3xl p-6 md:p-10 mb-8">
        <p class="hero-kicker">VOLUNTEER SHOWCASE</p>
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 class="hero-title">城市绿色志愿活动展</h1>
            <p class="hero-desc">
              本页面为静态前端展示，用于预览近期公益活动信息、活动主题与参与方式。
            </p>
          </div>

          <div class="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <div class="stat-card">
              <p class="stat-label">活动数量</p>
              <p class="stat-value">{{ activities.length }}</p>
            </div>
            <div class="stat-card">
              <p class="stat-label">总名额</p>
              <p class="stat-value">{{ totalCapacity }}</p>
            </div>
            <div class="stat-card">
              <p class="stat-label">主题类型</p>
              <p class="stat-value">{{ categories.length }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 分类标签 -->
      <section class="mb-6 flex flex-wrap gap-2">
        <span
          v-for="category in categories"
          :key="category"
          class="category-chip"
        >
          {{ category }}
        </span>
      </section>

      <!-- 活动卡片列表 -->
      <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <article
          v-for="activity in activities"
          :key="activity.id"
          class="activity-card"
        >
          <div class="card-top">
            <span class="card-tag">{{ activity.category }}</span>
            <span class="card-code">ACT-{{ String(activity.id).padStart(3, '0') }}</span>
          </div>

          <h3 class="card-title">{{ activity.title }}</h3>
          <p class="card-desc">{{ activity.description }}</p>

          <ul class="card-meta">
            <li>📅 {{ activity.date }}</li>
            <li>📍 {{ activity.location }}</li>
            <li>👥 {{ activity.capacity }} 人名额</li>
            <li>⏱ 预计 {{ activity.duration }}</li>
          </ul>

          <div class="card-footer">
            <span class="point-pill">+{{ activity.points }} 积分</span>
            <button class="preview-btn" type="button">仅展示</button>
          </div>
        </article>
      </section>

      <!-- 说明 -->
      <section class="mt-8 notice-panel rounded-2xl p-4 md:p-5">
        <p>
          当前为静态演示页面，不包含实际报名、登录、后端接口交互。可作为比赛演示或视觉确认版本。
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const activities = [
  {
    id: 1,
    title: '滨江塑料清理行动',
    category: '社区清洁',
    date: '2026-04-12 08:30',
    location: '南城滨江公园 3 号入口',
    duration: '3 小时',
    capacity: 60,
    points: 90,
    description: '沿江步道分段清理塑料废弃物，完成分类回收并进行数据登记。',
  },
  {
    id: 2,
    title: '城市树木认养与养护日',
    category: '环境保护',
    date: '2026-04-16 09:00',
    location: '青禾生态公园中庭',
    duration: '4 小时',
    capacity: 45,
    points: 120,
    description: '开展树木认养、松土浇灌和病虫害排查，建立社区绿植成长档案。',
  },
  {
    id: 3,
    title: '银龄数字助学课堂',
    category: '关爱老人',
    date: '2026-04-18 14:00',
    location: '东湖街道长者服务中心',
    duration: '2.5 小时',
    capacity: 30,
    points: 80,
    description: '帮助老人学习手机支付、防诈骗设置和线上挂号等日常数字技能。',
  },
  {
    id: 4,
    title: '旧物改造公开工坊',
    category: '教育支持',
    date: '2026-04-21 13:30',
    location: '创益社区青年空间',
    duration: '3.5 小时',
    capacity: 50,
    points: 110,
    description: '面向青少年开展旧物重构实践，制作可重复使用的生活用品。',
  },
  {
    id: 5,
    title: '社区垃圾分类巡讲',
    category: '环境保护',
    date: '2026-04-24 19:00',
    location: '和风花园 A 区广场',
    duration: '2 小时',
    capacity: 40,
    points: 70,
    description: '志愿者入户发放分类手册，进行分类问答与投放点位示范教学。',
  },
  {
    id: 6,
    title: '周末河道守护计划',
    category: '社区清洁',
    date: '2026-04-27 08:00',
    location: '北岸生态湿地码头',
    duration: '4 小时',
    capacity: 35,
    points: 130,
    description: '分组开展河道漂浮物打捞、岸线巡检与环保宣传拍摄任务。',
  },
]

const categories = [...new Set(activities.map((item) => item.category))]
const totalCapacity = computed(() => activities.reduce((sum, item) => sum + item.capacity, 0))
</script>

<style scoped>
.activity-page {
  background:
    radial-gradient(circle at 15% 10%, rgba(34, 197, 94, 0.13), transparent 35%),
    radial-gradient(circle at 85% 25%, rgba(59, 130, 246, 0.12), transparent 32%),
    linear-gradient(180deg, #f7faf7 0%, #f4f8ff 55%, #f8fafc 100%);
}

.hero-panel {
  border: 1px solid rgba(46, 125, 50, 0.2);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.06);
}

.hero-kicker {
  font-size: 12px;
  letter-spacing: 0.22em;
  color: #2e7d32;
  font-weight: 700;
  margin-bottom: 10px;
}

.hero-title {
  font-size: clamp(28px, 4vw, 48px);
  line-height: 1.1;
  font-weight: 800;
  margin-bottom: 10px;
  color: #14221a;
}

.hero-desc {
  color: #4b5563;
  max-width: 640px;
}

.stat-card {
  border-radius: 14px;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.88);
  min-width: 90px;
}

.stat-label {
  color: #6b7280;
  font-size: 12px;
  margin-bottom: 3px;
}

.stat-value {
  font-size: 20px;
  font-weight: 800;
  color: #1f2937;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(46, 125, 50, 0.18);
  background: rgba(46, 125, 50, 0.08);
  color: #1b5e20;
  font-size: 12px;
  font-weight: 700;
}

.activity-card {
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  padding: 18px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 32px rgba(34, 197, 94, 0.16);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.card-tag {
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  color: #1d4ed8;
  background: #dbeafe;
}

.card-code {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
}

.card-title {
  font-size: 20px;
  line-height: 1.25;
  font-weight: 800;
  margin-bottom: 8px;
  color: #111827;
}

.card-desc {
  color: #4b5563;
  line-height: 1.6;
  min-height: 48px;
  margin-bottom: 12px;
}

.card-meta {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: #334155;
}

.card-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.point-pill {
  border-radius: 999px;
  padding: 4px 12px;
  color: #14532d;
  background: #dcfce7;
  font-size: 12px;
  font-weight: 800;
}

.preview-btn {
  border: 1px solid rgba(59, 130, 246, 0.35);
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #1d4ed8;
  background: #eff6ff;
}

.notice-panel {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: #475569;
  font-size: 14px;
}
</style>

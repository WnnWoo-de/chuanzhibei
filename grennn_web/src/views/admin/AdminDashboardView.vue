<template>
  <main class="admin-page min-h-screen bg-transparent px-4 pb-16 pt-24 text-[#17211b] md:px-6">
    <div class="pointer-events-none fixed inset-0 z-0 grid grid-cols-12 gap-4 px-6 opacity-[0.07]">
      <div v-for="n in 12" :key="n" class="hidden h-full border-r border-black md:block"></div>
      <div v-for="n in 4" :key="`m-${n}`" class="col-span-3 block h-full border-r border-black md:hidden"></div>
    </div>

    <section class="relative z-10 mx-auto max-w-7xl">
      <header class="admin-header">
        <div>
          <p class="admin-kicker">ADMIN CONSOLE</p>
          <h1>GreenSight 管理端</h1>
          <p class="admin-subtitle">
            {{ adminName }}，这里是演示型后台工作台，用于集中查看平台运营、内容审核、活动和系统状态。
          </p>
        </div>
        <div class="admin-header__actions">
          <router-link to="/profile" class="admin-link-button">返回个人中心</router-link>
          <router-link to="/" class="admin-primary-button">回到前台</router-link>
        </div>
      </header>

      <section class="admin-metrics" aria-label="管理端核心指标">
        <article v-for="metric in metrics" :key="metric.label" class="admin-metric-card">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <p>{{ metric.hint }}</p>
        </article>
      </section>

      <section class="admin-shell">
        <aside class="admin-tabs" aria-label="管理端分区">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :data-testid="`tab-${tab.id}`"
            type="button"
            class="admin-tab"
            :class="{ 'admin-tab--active': activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span>{{ tab.name }}</span>
            <small>{{ tab.desc }}</small>
          </button>
        </aside>

        <div class="admin-panel">
          <section v-if="activeTab === 'overview'" class="admin-section">
            <div class="admin-section__head">
              <div>
                <h2>运营总览</h2>
                <p>聚合绿色行动、AI 服务、社区审核和激励体系的关键状态。</p>
              </div>
              <span class="admin-status admin-status--ok">今日数据正常</span>
            </div>

            <div class="admin-overview-grid">
              <article class="admin-card admin-card--wide">
                <h3>今日工作队列</h3>
                <div class="admin-work-list">
                  <div v-for="item in workQueue" :key="item.name">
                    <span>{{ item.name }}</span>
                    <strong>{{ item.count }}</strong>
                    <em>{{ item.state }}</em>
                  </div>
                </div>
              </article>

              <article class="admin-card">
                <h3>AI 服务摘要</h3>
                <div class="admin-ai-stack">
                  <div v-for="item in aiSummary" :key="item.name">
                    <span>{{ item.name }}</span>
                    <strong>{{ item.value }}</strong>
                  </div>
                </div>
              </article>

              <article class="admin-card">
                <h3>绿色激励</h3>
                <p class="admin-card__large">{{ userPoints }}</p>
                <p class="admin-muted">当前登录用户积分，可作为演示账号的激励参考。</p>
              </article>
            </div>
          </section>

          <section v-if="activeTab === 'users'" class="admin-section">
            <div class="admin-section__head">
              <div>
                <h2>用户管理</h2>
                <p>查看用户状态、积分等级和最近一次绿色行动。</p>
              </div>
              <span class="admin-status admin-status--soft">{{ users.length }} 名演示用户</span>
            </div>

            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>用户</th>
                    <th>角色</th>
                    <th>积分</th>
                    <th>最近活跃</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td>
                      <strong>{{ user.name }}</strong>
                      <small>{{ user.email }}</small>
                    </td>
                    <td>{{ user.role }}</td>
                    <td>{{ user.points }}</td>
                    <td>{{ user.lastActive }}</td>
                    <td><span class="admin-status" :class="statusClass(user.status)">{{ user.status }}</span></td>
                    <td>
                      <button type="button" class="admin-text-button" @click="toggleUser(user)">
                        {{ user.status === '正常' ? '设为观察' : '恢复正常' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-if="activeTab === 'content'" class="admin-section">
            <div class="admin-section__head">
              <div>
                <h2>内容审核</h2>
                <p>处理社区动态、旧物重构作品和 AI 识别反馈。</p>
              </div>
              <span class="admin-status admin-status--warn">{{ pendingContents }} 条待审核</span>
            </div>

            <div class="admin-review-list">
              <article v-for="item in contentItems" :key="item.id" class="admin-review-card">
                <div>
                  <span class="admin-type">{{ item.type }}</span>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.summary }}</p>
                </div>
                <div class="admin-review-card__side">
                  <span class="admin-status" :class="statusClass(item.status)">{{ item.status }}</span>
                  <div class="admin-actions">
                    <button
                      type="button"
                      class="admin-text-button"
                      :data-testid="`approve-content-${item.id}`"
                      @click="reviewContent(item, '已通过')"
                    >
                      通过
                    </button>
                    <button type="button" class="admin-text-button admin-text-button--danger" @click="reviewContent(item, '已驳回')">
                      驳回
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section v-if="activeTab === 'activities'" class="admin-section">
            <div class="admin-section__head">
              <div>
                <h2>活动管理</h2>
                <p>管理志愿活动报名、容量、签到和活动状态。</p>
              </div>
              <span class="admin-status admin-status--soft">本周 {{ totalEnrollments }} 人报名</span>
            </div>

            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>活动</th>
                    <th>地点</th>
                    <th>报名</th>
                    <th>日期</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="activity in activities" :key="activity.id">
                    <td>{{ activity.title }}</td>
                    <td>{{ activity.location }}</td>
                    <td>{{ activity.enrolled }}/{{ activity.capacity }}</td>
                    <td>{{ activity.date }}</td>
                    <td><span class="admin-status" :class="statusClass(activity.status)">{{ activity.status }}</span></td>
                    <td>
                      <button type="button" class="admin-text-button" @click="closeActivity(activity)">
                        {{ activity.status === '招募中' ? '结束报名' : '重新开放' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-if="activeTab === 'store'" class="admin-section">
            <div class="admin-section__head">
              <div>
                <h2>商城管理</h2>
                <p>查看环保商品库存、兑换热度和补货建议。</p>
              </div>
              <span class="admin-status admin-status--warn">{{ lowStockCount }} 个低库存商品</span>
            </div>

            <div class="admin-store-grid">
              <article v-for="product in products" :key="product.id" class="admin-product-card">
                <span>{{ product.category }}</span>
                <h3>{{ product.name }}</h3>
                <p>{{ product.points }} 积分 · 已兑换 {{ product.redeemed }} 次</p>
                <div class="admin-stock">
                  <i :style="{ width: `${Math.min(100, product.stock * 5)}%` }"></i>
                </div>
                <div class="admin-product-card__footer">
                  <strong>库存 {{ product.stock }}</strong>
                  <button type="button" class="admin-text-button" @click="restockProduct(product)">补货 +5</button>
                </div>
              </article>
            </div>
          </section>

          <section v-if="activeTab === 'system'" class="admin-section">
            <div class="admin-section__head">
              <div>
                <h2>系统监控</h2>
                <p>展示前端、后端、AI 服务和数据库的演示级运行状态。</p>
              </div>
              <span class="admin-status admin-status--ok">服务链路可演示</span>
            </div>

            <div class="admin-system-grid">
              <article v-for="service in services" :key="service.name" class="admin-service-card">
                <div>
                  <h3>{{ service.name }}</h3>
                  <p>{{ service.desc }}</p>
                </div>
                <span class="admin-status" :class="statusClass(service.status)">{{ service.status }}</span>
                <button type="button" class="admin-text-button" @click="resolveService(service)">刷新状态</button>
              </article>
            </div>
          </section>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const activeTab = ref('overview')

const tabs = [
  { id: 'overview', name: '运营总览', desc: '核心指标' },
  { id: 'users', name: '用户管理', desc: '账号状态' },
  { id: 'content', name: '内容审核', desc: '社区与作品' },
  { id: 'activities', name: '活动管理', desc: '志愿报名' },
  { id: 'store', name: '商城管理', desc: '库存兑换' },
  { id: 'system', name: '系统监控', desc: '服务链路' },
]

const users = ref([
  { id: 'u1', name: '汪宁', email: 'demo@greensight.cn', role: '演示管理员', points: 2680, lastActive: '刚刚', status: '正常' },
  { id: 'u2', name: '低碳小队', email: 'team@greensight.cn', role: '社群用户', points: 1540, lastActive: '12 分钟前', status: '正常' },
  { id: 'u3', name: '旧物达人', email: 'reuse@greensight.cn', role: '内容创作者', points: 3210, lastActive: '今天 09:20', status: '观察中' },
  { id: 'u4', name: '志愿者 Lee', email: 'volunteer@greensight.cn', role: '志愿者', points: 980, lastActive: '昨天', status: '正常' },
])

const contentItems = ref([
  { id: 'c101', type: '社区动态', title: '旧纸箱改造成桌面收纳盒', summary: '用户上传了 4 张制作过程图，等待确认是否适合推荐到首页。', status: '待审核' },
  { id: 'c102', type: '旧物重构', title: '木椅改造成阳台花架', summary: 'AI 已识别为木质家具，减碳估算 3.6 kg CO₂e。', status: '已通过' },
  { id: 'c103', type: 'AI 反馈', title: '干电池识别结果复核', summary: '用户反馈有害垃圾提示需要增加回收点说明。', status: '待审核' },
])

const activities = ref([
  { id: 'a1', title: '校园垃圾分类引导', location: '教学楼 A 区', enrolled: 18, capacity: 25, date: '07-09', status: '招募中' },
  { id: 'a2', title: '社区低碳宣传摊位', location: '绿洲社区', enrolled: 12, capacity: 12, date: '07-10', status: '已满员' },
  { id: 'a3', title: '河道清洁志愿服务', location: '东湖步道', enrolled: 21, capacity: 30, date: '07-13', status: '招募中' },
])

const products = ref([
  { id: 'p1', name: '环保帆布袋', category: '实物商品', points: 500, stock: 20, redeemed: 36 },
  { id: 'p2', name: '可重复使用水杯', category: '实物商品', points: 800, stock: 4, redeemed: 28 },
  { id: 'p3', name: '公益树苗认养证书', category: '公益证书', points: 1500, stock: 6, redeemed: 12 },
  { id: 'p4', name: '绿色知识达人徽章', category: '虚拟徽章', points: 300, stock: 99, redeemed: 64 },
])

const services = ref([
  { name: 'Vue 前端', desc: 'Vite 构建与 PWA 静态资源', status: '正常' },
  { name: 'Node 后端', desc: 'Express API 与 JWT 鉴权', status: '正常' },
  { name: 'FastAPI AI', desc: '垃圾识别与旧物重构视觉服务', status: '观察中' },
  { name: 'MySQL 数据库', desc: 'Sequelize 模型与业务记录', status: '正常' },
])

const adminName = computed(() => userStore.user?.username || userStore.user?.email || '管理员')
const userPoints = computed(() => Number(userStore.user?.points || 0))
const pendingContents = computed(() => contentItems.value.filter((item) => item.status === '待审核').length)
const totalEnrollments = computed(() => activities.value.reduce((sum, item) => sum + item.enrolled, 0))
const lowStockCount = computed(() => products.value.filter((item) => item.stock <= 6).length)

const metrics = computed(() => [
  { label: '用户规模', value: users.value.length + 128, hint: '含演示用户与历史注册' },
  { label: 'AI 调用', value: '2,436', hint: '对话、识别、重构累计' },
  { label: '待审核', value: pendingContents.value, hint: '社区与 AI 反馈队列' },
  { label: '活动报名', value: totalEnrollments.value, hint: '本周志愿活动报名人数' },
  { label: '低库存', value: lowStockCount.value, hint: '需要补货或下架处理' },
  { label: '系统健康', value: '96%', hint: '演示链路整体状态' },
])

const workQueue = computed(() => [
  { name: '内容审核', count: pendingContents.value, state: '需处理' },
  { name: '活动报名确认', count: 7, state: '今日截止' },
  { name: '商品补货', count: lowStockCount.value, state: '建议补货' },
  { name: 'AI 反馈复核', count: 3, state: '排队中' },
])

const aiSummary = [
  { name: '垃圾识别', value: '842 次' },
  { name: '旧物重构', value: '316 次' },
  { name: 'AI 对话', value: '1,278 次' },
]

const statusClass = (status) => {
  if (['正常', '已通过', '招募中'].includes(status)) return 'admin-status--ok'
  if (['待审核', '观察中', '已满员'].includes(status)) return 'admin-status--warn'
  if (['已驳回', '已关闭'].includes(status)) return 'admin-status--danger'
  return 'admin-status--soft'
}

const toggleUser = (user) => {
  user.status = user.status === '正常' ? '观察中' : '正常'
  ElMessage.success(`已更新 ${user.name} 的账号状态`)
}

const reviewContent = (item, status) => {
  item.status = status
  ElMessage.success(`${item.title}：${status}`)
}

const closeActivity = (activity) => {
  activity.status = activity.status === '招募中' ? '已关闭' : '招募中'
  ElMessage.info(`${activity.title} 状态已更新`)
}

const restockProduct = (product) => {
  product.stock += 5
  ElMessage.success(`${product.name} 已补货 5 件`)
}

const resolveService = (service) => {
  service.status = '正常'
  ElMessage.success(`${service.name} 状态已刷新`)
}
</script>

<style scoped>
.admin-page {
  position: relative;
  isolation: isolate;
}

.admin-header,
.admin-shell,
.admin-metric-card,
.admin-card,
.admin-review-card,
.admin-product-card,
.admin-service-card {
  border: 1px solid rgba(46, 125, 50, 0.14);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 52px rgba(31, 41, 55, 0.08);
}

.admin-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  border-radius: 1.25rem;
  padding: clamp(1.25rem, 3vw, 2rem);
}

.admin-kicker,
.admin-tab small,
.admin-metric-card span,
.admin-type,
.admin-muted {
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-header h1 {
  margin-top: 0.4rem;
  color: #102316;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 850;
  line-height: 1;
}

.admin-subtitle {
  max-width: 46rem;
  margin-top: 0.8rem;
  color: #475569;
  line-height: 1.75;
}

.admin-header__actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.admin-link-button,
.admin-primary-button,
.admin-text-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.65rem;
  font-size: 0.78rem;
  font-weight: 800;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.admin-link-button,
.admin-primary-button {
  min-height: 2.5rem;
  padding: 0.65rem 0.9rem;
}

.admin-link-button {
  border: 1px solid rgba(46, 125, 50, 0.18);
  color: #1f3f2a;
}

.admin-primary-button {
  background: #2e7d32;
  color: #fff;
}

.admin-metrics {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.9rem;
  margin-top: 1rem;
}

.admin-metric-card {
  border-radius: 0.9rem;
  padding: 1rem;
}

.admin-metric-card strong {
  display: block;
  margin-top: 0.45rem;
  color: #1f3f2a;
  font-size: 1.8rem;
  line-height: 1;
}

.admin-metric-card p,
.admin-section__head p,
.admin-card p,
.admin-review-card p,
.admin-product-card p,
.admin-service-card p,
.admin-table small {
  margin-top: 0.35rem;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.6;
}

.admin-shell {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr);
  gap: 1rem;
  margin-top: 1rem;
  border-radius: 1.25rem;
  padding: 1rem;
}

.admin-tabs {
  display: grid;
  align-content: start;
  gap: 0.5rem;
}

.admin-tab {
  border: 1px solid transparent;
  border-radius: 0.8rem;
  padding: 0.85rem;
  text-align: left;
  transition: all 0.2s ease;
}

.admin-tab span {
  display: block;
  color: #1f2937;
  font-weight: 850;
}

.admin-tab small {
  display: block;
  margin-top: 0.25rem;
  letter-spacing: 0;
  text-transform: none;
}

.admin-tab--active,
.admin-tab:hover {
  border-color: rgba(46, 125, 50, 0.24);
  background: rgba(232, 245, 233, 0.86);
}

.admin-panel {
  min-width: 0;
}

.admin-section {
  min-height: 35rem;
}

.admin-section__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.admin-section__head h2 {
  color: #102316;
  font-size: 1.45rem;
  font-weight: 850;
}

.admin-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.75rem;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.74rem;
  font-weight: 850;
  white-space: nowrap;
}

.admin-status--ok {
  background: #dcfce7;
  color: #166534;
}

.admin-status--warn {
  background: #fef3c7;
  color: #92400e;
}

.admin-status--danger {
  background: #fee2e2;
  color: #991b1b;
}

.admin-status--soft {
  background: #e8eef5;
  color: #1f3a5f;
}

.admin-overview-grid,
.admin-system-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.admin-card,
.admin-review-card,
.admin-product-card,
.admin-service-card {
  border-radius: 0.95rem;
  padding: 1rem;
}

.admin-card--wide {
  grid-column: span 2;
}

.admin-card h3,
.admin-review-card h3,
.admin-product-card h3,
.admin-service-card h3 {
  color: #1f2937;
  font-size: 1rem;
  font-weight: 850;
}

.admin-card__large {
  color: #2e7d32 !important;
  font-size: 3rem !important;
  font-weight: 850;
  line-height: 1;
}

.admin-work-list,
.admin-ai-stack,
.admin-review-list,
.admin-store-grid {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.admin-work-list {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.admin-work-list div,
.admin-ai-stack div {
  border: 1px solid rgba(46, 125, 50, 0.12);
  border-radius: 0.75rem;
  background: rgba(245, 250, 246, 0.86);
  padding: 0.85rem;
}

.admin-work-list span,
.admin-ai-stack span {
  color: #64748b;
  font-size: 0.76rem;
}

.admin-work-list strong,
.admin-ai-stack strong {
  display: block;
  margin-top: 0.25rem;
  color: #102316;
  font-size: 1.35rem;
}

.admin-work-list em {
  display: block;
  margin-top: 0.15rem;
  color: #2e7d32;
  font-size: 0.75rem;
  font-style: normal;
  font-weight: 800;
}

.admin-table-wrap {
  overflow-x: auto;
  border: 1px solid rgba(46, 125, 50, 0.12);
  border-radius: 0.95rem;
}

.admin-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  background: #fff;
}

.admin-table th,
.admin-table td {
  border-bottom: 1px solid rgba(46, 125, 50, 0.1);
  padding: 0.9rem;
  text-align: left;
  vertical-align: middle;
}

.admin-table th {
  background: #f8fafc;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 850;
}

.admin-table td {
  color: #1f2937;
  font-size: 0.9rem;
}

.admin-table td strong,
.admin-table td small {
  display: block;
}

.admin-review-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.admin-review-card__side,
.admin-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.55rem;
}

.admin-review-card__side {
  flex-direction: column;
  align-items: flex-end;
}

.admin-text-button {
  border: 1px solid rgba(46, 125, 50, 0.18);
  color: #2e7d32;
  padding: 0.45rem 0.65rem;
}

.admin-text-button:hover,
.admin-link-button:hover,
.admin-primary-button:hover {
  transform: translateY(-1px);
}

.admin-text-button--danger {
  border-color: rgba(220, 38, 38, 0.18);
  color: #dc2626;
}

.admin-store-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.admin-stock {
  overflow: hidden;
  height: 0.5rem;
  margin-top: 0.9rem;
  border-radius: 999px;
  background: #e8f5e9;
}

.admin-stock i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #2e7d32, #6bbf59);
}

.admin-product-card__footer,
.admin-service-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.admin-product-card__footer {
  margin-top: 0.9rem;
}

.admin-product-card__footer strong {
  color: #1f3f2a;
}

.admin-service-card {
  align-items: flex-start;
}

@media (max-width: 1120px) {
  .admin-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .admin-shell {
    grid-template-columns: 1fr;
  }

  .admin-tabs {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .admin-header,
  .admin-section__head,
  .admin-review-card,
  .admin-service-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-metrics,
  .admin-overview-grid,
  .admin-work-list,
  .admin-store-grid,
  .admin-system-grid,
  .admin-tabs {
    grid-template-columns: 1fr;
  }

  .admin-card--wide {
    grid-column: auto;
  }

  .admin-review-card__side {
    align-items: flex-start;
  }
}

:global(html.theme-dark) .admin-page {
  color: #f4fff6;
}

:global(html.theme-dark) .admin-header,
:global(html.theme-dark) .admin-shell,
:global(html.theme-dark) .admin-metric-card,
:global(html.theme-dark) .admin-card,
:global(html.theme-dark) .admin-review-card,
:global(html.theme-dark) .admin-product-card,
:global(html.theme-dark) .admin-service-card,
:global(html.theme-dark) .admin-table {
  border-color: rgba(213, 245, 224, 0.14);
  background: linear-gradient(145deg, rgba(15, 37, 27, 0.9), rgba(7, 22, 16, 0.86));
}

:global(html.theme-dark) .admin-header h1,
:global(html.theme-dark) .admin-section__head h2,
:global(html.theme-dark) .admin-tab span,
:global(html.theme-dark) .admin-card h3,
:global(html.theme-dark) .admin-review-card h3,
:global(html.theme-dark) .admin-product-card h3,
:global(html.theme-dark) .admin-service-card h3,
:global(html.theme-dark) .admin-table td,
:global(html.theme-dark) .admin-work-list strong,
:global(html.theme-dark) .admin-ai-stack strong {
  color: #f4fff6;
}

:global(html.theme-dark) .admin-subtitle,
:global(html.theme-dark) .admin-section__head p,
:global(html.theme-dark) .admin-card p,
:global(html.theme-dark) .admin-review-card p,
:global(html.theme-dark) .admin-product-card p,
:global(html.theme-dark) .admin-service-card p,
:global(html.theme-dark) .admin-table small,
:global(html.theme-dark) .admin-kicker,
:global(html.theme-dark) .admin-tab small,
:global(html.theme-dark) .admin-metric-card span,
:global(html.theme-dark) .admin-type,
:global(html.theme-dark) .admin-muted {
  color: rgba(192, 212, 201, 0.76);
}

:global(html.theme-dark) .admin-tab--active,
:global(html.theme-dark) .admin-tab:hover,
:global(html.theme-dark) .admin-work-list div,
:global(html.theme-dark) .admin-ai-stack div,
:global(html.theme-dark) .admin-table th {
  border-color: rgba(213, 245, 224, 0.14);
  background: rgba(23, 77, 51, 0.44);
  color: #f4fff6;
}

:global(html.theme-dark) .admin-link-button,
:global(html.theme-dark) .admin-text-button {
  border-color: rgba(82, 237, 154, 0.18);
  color: #33e58d;
}

:global(html.theme-dark) .admin-primary-button {
  background: linear-gradient(135deg, #24dc83, #47d79a);
  color: #06140e;
}
</style>

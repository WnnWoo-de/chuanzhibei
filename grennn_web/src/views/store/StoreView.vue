<template>
  <div class="store-root min-h-screen bg-transparent px-5 pt-24 pb-16 text-[#17211b]">
    <div class="fixed inset-0 z-0 grid grid-cols-12 gap-4 px-6 opacity-[0.055] pointer-events-none">
      <div v-for="n in 12" :key="n" class="h-full border-r border-primary"></div>
    </div>

    <div class="relative z-10 mx-auto max-w-7xl">
      <header class="store-header">
        <div>
          <p class="store-kicker">GREEN REWARD CENTER</p>
          <h1>{{ langText.store.title }}</h1>
          <p>{{ langText.store.subtitle }}</p>
        </div>
        <div class="store-points">
          <span>{{ langText.store.myPoints }}</span>
          <strong>{{ greenPoints }}</strong>
        </div>
      </header>

      <section class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            class="store-filter"
            :class="{ 'store-filter--active': activeCategory === category }"
            @click="activeCategory = category"
          >
            {{ category }}
          </button>
        </div>
        <router-link to="/quiz" class="store-earn-link">{{ langText.store.goToQuiz }}</router-link>
      </section>

      <main class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article v-for="product in filteredProducts" :key="product.id" class="store-product">
            <div class="store-product__visual" :class="product.accent">
              <el-icon :size="30"><component :is="product.icon" /></el-icon>
              <span>{{ product.category }}</span>
            </div>
            <div class="flex flex-1 flex-col p-4">
              <div class="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2>{{ product.name }}</h2>
                  <p>{{ product.description }}</p>
                </div>
              </div>
              <div class="mb-4 flex flex-wrap gap-2">
                <span v-for="tag in product.tags" :key="tag" class="store-tag">{{ tag }}</span>
              </div>
              <div class="mt-auto flex items-end justify-between gap-3 border-t border-black/5 pt-4">
                <div>
                  <strong class="store-cost">{{ product.points }}</strong>
                  <span class="store-cost-unit">{{ langText.store.costUnit }}</span>
                  <p class="mt-1 text-xs text-gray-400">{{ langText.store.stock }} {{ product.stock }}</p>
                </div>
                <button
                  type="button"
                  class="store-redeem-btn"
                  :disabled="!canRedeem(product)"
                  @click="openProduct(product)"
                >
                  {{ product.stock <= 0 ? langText.store.soldOut : greenPoints < product.points ? langText.store.notEnough : langText.store.redeemNow }}
                </button>
              </div>
            </div>
          </article>
        </section>

        <aside class="space-y-4">
          <section class="store-side-card">
            <div class="mb-4 flex items-center justify-between">
              <h3>{{ langText.store.redeemHistory }}</h3>
              <span class="text-xs font-mono text-gray-400">RECENT</span>
            </div>
            <div v-if="redeemRecords.length === 0" class="store-empty">{{ langText.store.noRecords }}</div>
            <div v-else class="divide-y divide-black/5">
              <div v-for="record in redeemRecords" :key="record.id" class="store-record">
                <div>
                  <strong>{{ record.productName }}</strong>
                  <span>{{ formatDate(record.createdAt) }} · {{ record.statusText || record.status }}</span>
                </div>
                <b>-{{ record.costPoints }}</b>
              </div>
            </div>
          </section>

          <section class="store-side-card">
            <h3 class="mb-4">{{ langText.store.earnTitle }}</h3>
            <div class="divide-y divide-black/5">
              <router-link v-for="entry in earnEntries" :key="entry.path" :to="entry.path" class="store-entry">
                <span>{{ entry.title }}</span>
                <b>{{ entry.desc }}</b>
              </router-link>
            </div>
          </section>
        </aside>
      </main>
    </div>

    <el-dialog v-model="showDetail" :width="520" align-center>
      <template v-if="selectedProduct">
        <div class="store-dialog">
          <div class="store-dialog__icon" :class="selectedProduct.accent">
            <el-icon :size="42"><component :is="selectedProduct.icon" /></el-icon>
          </div>
          <p class="store-kicker">{{ selectedProduct.category }}</p>
          <h2>{{ selectedProduct.name }}</h2>
          <p>{{ selectedProduct.description }}</p>
          <div class="my-5 grid grid-cols-2 gap-3 text-left">
            <div class="store-dialog-cell">
              <span>{{ langText.store.requiredPoints }}</span>
              <strong>{{ selectedProduct.points }}</strong>
            </div>
            <div class="store-dialog-cell">
              <span>{{ langText.store.stockStatus }}</span>
              <strong>{{ selectedProduct.stock > 0 ? selectedProduct.stock + ' ' + langText.store.stockCount : langText.store.soldOut }}</strong>
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" class="store-cancel-btn" @click="showDetail = false">{{ langText.store.cancel }}</button>
            <button type="button" class="store-confirm-btn" :disabled="!canRedeem(selectedProduct)" @click="confirmRedeem">{{ langText.store.confirmRedeem }}</button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { CoffeeCup, CollectionTag, Goods, Medal, Present, Reading, ShoppingBag } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { langText } from '@/language'
import { fetchRedeemRecords, fetchRewardProducts, redeemRewardProduct } from '@/services/storeService'

const POINTS_KEY = 'green_reward_points'
const RECORDS_KEY = 'green_redeem_records'
const BADGES_KEY = 'green_redeemed_badges'
const userStore = useUserStore()

const readNumber = (key, fallback) => {
  const raw = Number(localStorage.getItem(key))
  return Number.isFinite(raw) && raw >= 0 ? raw : fallback
}

const greenPoints = ref(readNumber(POINTS_KEY, 1280))
const activeCategory = ref(langText.value.store.categories[0])
const showDetail = ref(false)
const selectedProduct = shallowRef(null)
const redeemRecords = ref(JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]'))

const iconMap = {
  ShoppingBag,
  CoffeeCup,
  Goods,
  CollectionTag,
  Medal,
  Present,
  Reading,
}

const categories = computed(() => langText.value.store.categories)
const earnEntries = computed(() => langText.value.store.earnEntries)

const staticProducts = [
  { id: 1, points: 500, stock: 20, productType: 'physical', icon: ShoppingBag, accent: 'accent-green' },
  { id: 2, points: 800, stock: 12, productType: 'physical', icon: CoffeeCup, accent: 'accent-blue' },
  { id: 3, points: 1200, stock: 8, productType: 'physical', icon: Goods, accent: 'accent-amber' },
  { id: 4, points: 200, stock: 40, productType: 'physical', icon: CollectionTag, accent: 'accent-cyan' },
  { id: 5, points: 300, stock: 99, productType: 'virtual', icon: Medal, accent: 'accent-lime' },
  { id: 6, points: 400, stock: 99, productType: 'virtual', icon: Present, accent: 'accent-rose' },
  { id: 7, points: 1500, stock: 6, productType: 'certificate', icon: Reading, accent: 'accent-emerald' },
]

const products = ref(
  langText.value.store.products.map((item, i) => ({
    ...item,
    ...staticProducts[i],
  })),
)

const filteredProducts = computed(() => {
  const t = langText.value.store
  if (activeCategory.value === t.categories[0]) return products.value
  if (activeCategory.value === t.categories[5]) return products.value.filter((item) => item.stock <= 10)
  return products.value.filter((item) => item.category === activeCategory.value)
})

watch(greenPoints, (value) => {
  localStorage.setItem(POINTS_KEY, String(value))
  window.dispatchEvent(new CustomEvent('green-points:change', { detail: { points: value } }))
})

watch(redeemRecords, (records) => {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
}, { deep: true })

const canRedeem = (product) => Boolean(product && product.stock > 0 && greenPoints.value >= product.points)
const formatDate = (value) => value ? String(value).slice(0, 10) : ''

const normalizeProduct = (item) => ({
  ...item,
  tags: Array.isArray(item.tags) ? item.tags : [],
  icon: typeof item.icon === 'string' ? (iconMap[item.icon] || ShoppingBag) : (item.icon || ShoppingBag),
  accent: item.accent || 'accent-green',
  productType: item.productType || (item.category === langText.value.store.categories[1] ? 'physical' : 'virtual'),
})

const rememberVirtualReward = (product, record) => {
  if (!product || product.productType === 'physical') return
  const current = JSON.parse(localStorage.getItem(BADGES_KEY) || '[]')
  const next = [{
    id: record?.id || Date.now(),
    name: product.name,
    category: product.category,
    description: product.description,
    redeemedAt: record?.createdAt || new Date().toISOString(),
  }, ...current.filter((item) => item.name !== product.name)].slice(0, 20)
  localStorage.setItem(BADGES_KEY, JSON.stringify(next))
}

const openProduct = (product) => {
  selectedProduct.value = product
  showDetail.value = true
}

const confirmRedeem = async () => {
  const product = selectedProduct.value
  if (!canRedeem(product)) return

  if (userStore.isLoggedIn) {
    const result = await redeemRewardProduct(product.id)
    if (result.ok) {
      const updated = result.data?.product ? normalizeProduct(result.data.product) : null
      const idx = products.value.findIndex((item) => item.id === product.id)
      if (updated && idx >= 0) products.value[idx] = updated
      greenPoints.value = Number(result.data?.points ?? greenPoints.value)
      if (userStore.user) userStore.user.points = greenPoints.value
      const record = result.data?.record
      if (record) {
        redeemRecords.value = [record, ...redeemRecords.value.filter((item) => item.id !== record.id)].slice(0, 10)
        rememberVirtualReward(product, record)
      }
      showDetail.value = false
      ElMessage.success(langText.value.store.messages.redeemSuccess.replace('{points}', product.points))
      return
    }
    if (result.status !== 401) {
      ElMessage.error(result.message)
      return
    }
  }

  product.stock -= 1
  greenPoints.value -= product.points
  const record = {
    id: Date.now(),
    productId: product.id,
    productName: product.name,
    category: product.category,
    productType: product.productType,
    costPoints: product.points,
    status: product.productType === 'physical' ? langText.value.store.submitted : langText.value.store.received,
    statusText: product.productType === 'physical' ? langText.value.store.submitted : langText.value.store.received,
    createdAt: new Date().toISOString(),
  }
  redeemRecords.value = [record, ...redeemRecords.value].slice(0, 10)
  rememberVirtualReward(product, record)
  showDetail.value = false
  ElMessage.success(langText.value.store.messages.redeemSuccess.replace('{points}', product.points))
}

const handlePointChange = (event) => {
  const points = Number(event.detail?.points)
  if (Number.isFinite(points)) greenPoints.value = points
}

onMounted(async () => {
  window.addEventListener('green-points:change', handlePointChange)
  await userStore.init()
  if (userStore.user) greenPoints.value = Number(userStore.user.points) || greenPoints.value

  const productResult = await fetchRewardProducts()
  if (productResult.ok && productResult.items.length > 0) {
    products.value = productResult.items.map(normalizeProduct)
  }

  if (userStore.isLoggedIn) {
    const recordResult = await fetchRedeemRecords()
    if (recordResult.ok) {
      redeemRecords.value = recordResult.items
    }
  }
})
onUnmounted(() => window.removeEventListener('green-points:change', handlePointChange))
</script>

<style scoped>
.store-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(25, 45, 32, 0.1);
  border-radius: 0.75rem;
  background: rgba(255,255,255,0.92);
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(31, 65, 44, 0.05);
}
@media (min-width: 768px) {
  .store-header { grid-template-columns: minmax(0, 1fr) 260px; align-items: end; }
}
.store-kicker { font-family: var(--font-mono); font-size: 0.64rem; font-weight: 700; letter-spacing: 0.14em; color: rgba(46, 125, 50, 0.72); }
.store-header h1 { margin-top: 0.3rem; font-size: clamp(2rem, 3.4vw, 3.25rem); line-height: 1.05; font-weight: 750; letter-spacing: 0; }
.store-header p { margin-top: 0.65rem; color: #647269; font-size: 0.95rem; }
.store-points { border: 1px solid rgba(25, 45, 32, 0.06); border-radius: 0.5rem; background: #f8faf8; padding: 1rem; }
.store-points span { display: block; font-size: 0.8rem; color: #66756b; }
.store-points strong { display: block; margin-top: 0.15rem; font-size: 2.25rem; line-height: 1; color: #245d2d; }
.store-filter,
.store-earn-link,
.store-redeem-btn,
.store-cancel-btn,
.store-confirm-btn {
  border-radius: 0.45rem;
  padding: 0.62rem 0.9rem;
  font-size: 0.84rem;
  font-weight: 700;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.store-filter { border: 1px solid rgba(25,45,32,0.1); background: rgba(255,255,255,0.9); color: #58645c; }
.store-filter--active,
.store-earn-link,
.store-confirm-btn { background: #2e7d32; color: white; }
.store-product,
.store-side-card {
  overflow: hidden;
  border: 1px solid rgba(25, 45, 32, 0.1);
  border-radius: 0.75rem;
  background: rgba(255,255,255,0.94);
  box-shadow: 0 8px 24px rgba(31, 65, 44, 0.045);
}
.store-product { display: grid; grid-template-columns: 86px minmax(0, 1fr); min-height: 13rem; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
.store-product:hover { border-color: rgba(46,125,50,0.28); box-shadow: 0 12px 28px rgba(31, 65, 44, 0.07); }
.store-product__visual { display: flex; min-height: 100%; align-items: center; justify-content: center; position: relative; color: #1f3f2a; border-right: 1px solid rgba(25,45,32,0.08); }
.store-product__visual span {
  position: absolute;
  left: 50%;
  bottom: 0.8rem;
  width: max-content;
  max-width: 76px;
  transform: translateX(-50%);
  border-radius: 0.35rem;
  background: rgba(255,255,255,0.72);
  padding: 0.2rem 0.35rem;
  font-size: 0.65rem;
  font-weight: 700;
  text-align: center;
}
.store-product h2 { font-size: 1.1rem; font-weight: 800; }
.store-product p { margin-top: 0.4rem; min-height: 2.6rem; color: #66756b; font-size: 0.86rem; line-height: 1.55; }
.store-tag { border-radius: 0.35rem; background: #f2f7f2; padding: 0.2rem 0.5rem; font-size: 0.7rem; font-weight: 700; color: #2e7d32; }
.store-cost { font-size: 1.45rem; color: #2e7d32; }
.store-cost-unit { margin-left: 0.25rem; font-size: 0.75rem; color: #708075; }
.store-redeem-btn { background: #2e7d32; color: white; }
button:disabled { opacity: 0.45; cursor: not-allowed; }
.store-side-card { padding: 1.25rem; }
.store-side-card h3 { font-weight: 750; }
.store-empty { border-radius: 0.5rem; background: #f8faf9; padding: 1.25rem; text-align: center; color: #8b968e; }
.store-record,
.store-entry { display: flex; justify-content: space-between; gap: 1rem; border-radius: 0; background: transparent; padding: 0.85rem 0; }
.store-record span,
.store-entry b { display: block; margin-top: 0.15rem; font-size: 0.74rem; color: #718177; }
.store-record b { color: #dc2626; }
.store-entry span { font-weight: 800; color: #25342b; }
.store-dialog { text-align: center; }
.store-dialog__icon { display: grid; width: 4.5rem; height: 4.5rem; place-items: center; margin: 0 auto 1rem; border-radius: 0.65rem; color: #1f3f2a; }
.store-dialog h2 { margin-top: 0.35rem; font-size: 1.7rem; font-weight: 800; }
.store-dialog p { color: #647269; }
.store-dialog-cell { border-radius: 0.5rem; background: #f8faf9; padding: 1rem; }
.store-dialog-cell span { display: block; font-size: 0.72rem; color: #718177; }
.store-dialog-cell strong { display: block; margin-top: 0.2rem; font-size: 1.35rem; color: #2e7d32; }
.store-cancel-btn { border: 1px solid rgba(0,0,0,0.1); background: white; color: #5d6b62; }
.accent-green { background: #edf7ee; }
.accent-blue { background: #eef6ff; }
.accent-amber { background: #fff7e6; }
.accent-cyan { background: #ecfeff; }
.accent-lime { background: #f3fae8; }
.accent-rose { background: #fff1f4; }
.accent-emerald { background: #ecfdf5; }
</style>

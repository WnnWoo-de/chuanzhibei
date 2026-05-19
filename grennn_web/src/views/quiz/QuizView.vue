<template>
  <div class="quiz-root min-h-screen bg-transparent px-5 pt-24 pb-16 text-[#17211b]">
    <div class="fixed inset-0 z-0 grid grid-cols-12 gap-4 px-6 opacity-[0.055] pointer-events-none">
      <div v-for="n in 12" :key="n" class="h-full border-r border-primary"></div>
    </div>

    <div class="relative z-10 mx-auto max-w-7xl">
      <header class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section class="quiz-hero">
          <p class="quiz-kicker">GREEN DAILY QUIZ</p>
          <h1>绿色生活问答</h1>
          <p class="quiz-hero__copy">每天 5 道题，学习环保知识，获得绿色积分。</p>
          <div class="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
            <div v-for="item in statCards" :key="item.label" class="quiz-stat">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </section>

        <aside class="quiz-reward-panel">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="quiz-kicker">TODAY REWARD</p>
              <h2>今日奖励</h2>
            </div>
            <router-link to="/store" class="quiz-link-btn">去兑换</router-link>
          </div>
          <div class="mt-4 divide-y divide-black/5">
            <div v-for="rule in rewardRules" :key="rule.title" class="quiz-rule">
              <div>
                <strong>{{ rule.title }}</strong>
                <span>{{ rule.desc }}</span>
              </div>
              <b>{{ rule.points }}</b>
            </div>
          </div>
        </aside>
      </header>

      <main class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section class="quiz-card">
          <template v-if="!isTodayCompleted">
            <div class="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="quiz-kicker">QUESTION {{ currentIndex + 1 }} / {{ quizQuestions.length }}</p>
                <h2>{{ currentQuestion.question }}</h2>
              </div>
              <span class="quiz-category">{{ currentQuestion.category }} · {{ typeLabel(currentQuestion.type) }}</span>
            </div>

            <div class="mb-5 h-1.5 overflow-hidden rounded-full bg-black/5">
              <div class="h-full rounded-full bg-primary transition-all duration-500" :style="{ width: progressPercent + '%' }"></div>
            </div>

            <div class="grid gap-2.5">
              <button
                v-for="option in currentQuestion.options"
                :key="option.label"
                type="button"
                class="quiz-option"
                :class="optionClass(option.label)"
                :disabled="submitted"
                @click="toggleOption(option.label)"
              >
                <span>{{ option.label }}</span>
                <strong>{{ option.text }}</strong>
              </button>
            </div>

            <transition name="fade-up">
              <div v-if="submitted" class="quiz-explain" :class="isCurrentCorrect ? 'quiz-explain--right' : 'quiz-explain--wrong'">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="font-bold">{{ isCurrentCorrect ? '回答正确' : '继续学习' }}</p>
                    <p class="mt-1 text-sm leading-relaxed text-gray-600">
                      正确答案：{{ currentQuestion.answer.join('、') }}。{{ currentQuestion.explanation }}
                    </p>
                  </div>
                  <span>{{ isCurrentCorrect ? '+10' : '+3' }}</span>
                </div>
              </div>
            </transition>

            <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button type="button" class="quiz-ghost-btn" @click="resetToday">重置今日演示</button>
              <div class="flex gap-3">
                <button type="button" class="quiz-secondary-btn" :disabled="submitted || selectedAnswers.length === 0" @click="submitAnswer">提交答案</button>
                <button type="button" class="quiz-primary-btn" :disabled="!submitted" @click="nextQuestion">
                  {{ isLastQuestion ? '完成今日问答' : '下一题' }}
                </button>
              </div>
            </div>
          </template>

          <transition name="fade-up">
            <div v-if="isTodayCompleted" class="quiz-complete">
              <p class="quiz-kicker">DAILY QUIZ COMPLETED</p>
              <h2>今日问答已完成</h2>
              <p class="quiz-complete__desc">
                本次答对 {{ correctCount }} / {{ quizQuestions.length }} 题，今日共获得
                <strong>+{{ todayTotalEarned }}</strong> 绿色积分。
              </p>
              <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div class="quiz-result-cell">
                  <span>答题得分</span>
                  <strong>+{{ todayEarned }}</strong>
                </div>
                <div class="quiz-result-cell">
                  <span>完成奖励</span>
                  <strong>+{{ completionBonus }}</strong>
                </div>
                <div class="quiz-result-cell">
                  <span>正确率</span>
                  <strong>{{ Math.round((correctCount / quizQuestions.length) * 100) }}%</strong>
                </div>
              </div>
              <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" class="quiz-ghost-btn" @click="resetToday">重新演示</button>
                <router-link to="/store" class="quiz-primary-btn text-center">去兑换商城</router-link>
              </div>
            </div>
          </transition>
        </section>

        <aside class="space-y-4">
          <section class="quiz-side-card">
            <div class="mb-4 flex items-center justify-between">
              <h3>分类挑战</h3>
              <span class="text-xs font-mono text-primary">{{ completedCategories }}/6</span>
            </div>
            <div class="divide-y divide-black/5">
              <button
                v-for="category in categories"
                :key="category.name"
                class="quiz-category-row"
                type="button"
                @click="jumpToCategory(category.name)"
              >
                <span>{{ category.name }}</span>
                <b>{{ category.done ? '已完成' : category.count + ' 题' }}</b>
              </button>
            </div>
          </section>

          <section class="quiz-side-card">
            <div class="mb-4 flex items-center justify-between">
              <h3>历史成绩</h3>
              <span class="text-xs font-mono text-gray-400">RECENT</span>
            </div>
            <div class="divide-y divide-black/5">
              <div v-for="record in visibleRecords" :key="record.date" class="quiz-record">
                <div>
                  <strong>{{ record.date }}</strong>
                  <span>{{ record.correctCount }}/{{ record.totalCount }} 正确</span>
                </div>
                <b>+{{ record.earnedPoints }}</b>
              </div>
            </div>
          </section>
        </aside>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { fetchQuizQuestions, fetchQuizRecords, saveQuizRecord } from '@/services/quizService'

const POINTS_KEY = 'green_reward_points'
const RECORDS_KEY = 'green_quiz_records'
const userStore = useUserStore()

const readNumber = (key, fallback) => {
  const raw = Number(localStorage.getItem(key))
  return Number.isFinite(raw) && raw >= 0 ? raw : fallback
}

const greenPoints = ref(readNumber(POINTS_KEY, 1280))
const currentIndex = ref(0)
const selectedAnswers = ref([])
const submitted = ref(false)
const isTodayCompleted = ref(false)
const completionBonus = ref(0)
const answers = ref([])
const quizRecords = ref(JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]'))

const quizQuestions = ref([
  { id: 1, category: '垃圾分类', type: 'single', question: '以下哪种垃圾属于可回收物？', options: [{ label: 'A', text: '废旧报纸' }, { label: 'B', text: '剩菜剩饭' }, { label: 'C', text: '用过的纸巾' }, { label: 'D', text: '烟蒂' }], answer: ['A'], explanation: '废旧报纸属于可回收物，回收后可以重新制浆造纸。' },
  { id: 2, category: '低碳出行', type: 'single', question: '短距离出行时，以下哪种方式更低碳？', options: [{ label: 'A', text: '开私家车' }, { label: 'B', text: '步行或骑自行车' }, { label: 'C', text: '怠速停车等待' }, { label: 'D', text: '单人长距离开车' }], answer: ['B'], explanation: '步行和骑行几乎不产生直接碳排放，适合短距离通勤。' },
  { id: 3, category: '节水节电', type: 'judge', question: '离开房间随手关灯可以减少不必要的电力消耗。', options: [{ label: 'A', text: '正确' }, { label: 'B', text: '错误' }], answer: ['A'], explanation: '随手关灯是最容易坚持的节能行为之一，也能降低家庭用电成本。' },
  { id: 4, category: '绿色饮食', type: 'single', question: '以下哪种行为更符合绿色饮食理念？', options: [{ label: 'A', text: '按需点餐，减少浪费' }, { label: 'B', text: '每餐大量剩饭' }, { label: 'C', text: '频繁使用一次性餐具' }, { label: 'D', text: '只购买过度包装食品' }], answer: ['A'], explanation: '按需点餐可以减少食物浪费，也能降低生产和处理过程中的资源消耗。' },
  { id: 5, category: '旧物利用', type: 'multiple', question: '以下哪些做法属于旧物利用？', options: [{ label: 'A', text: '把旧玻璃瓶改造成花瓶' }, { label: 'B', text: '修补旧衣服继续穿' }, { label: 'C', text: '还能用的物品直接丢弃' }, { label: 'D', text: '旧纸箱改成收纳盒' }], answer: ['A', 'B', 'D'], explanation: '旧物利用可以延长物品生命周期，减少新资源消耗和废弃物产生。' },
])

const rewardRules = [
  { title: '答对 1 题', desc: '即时反馈并写入积分', points: '+10' },
  { title: '答错学习解析', desc: '完成知识复盘也有奖励', points: '+3' },
  { title: '完成每日 5 题', desc: '提交全部题目后自动发放', points: '+20' },
  { title: '全部答对', desc: '触发满分额外奖励', points: '+50' },
]

const categories = computed(() => ['垃圾分类', '低碳出行', '节水节电', '绿色饮食', '旧物利用', '生态保护'].map((name) => ({
  name,
  count: quizQuestions.value.filter((q) => q.category === name).length || 8,
  done: answers.value.some((a) => quizQuestions.value.find((q) => q.id === a.id)?.category === name),
})))

const currentQuestion = computed(() => quizQuestions.value[currentIndex.value] || quizQuestions.value[0])
const isLastQuestion = computed(() => currentIndex.value === quizQuestions.value.length - 1)
const progressPercent = computed(() => {
  if (isTodayCompleted.value) return 100
  return ((answers.value.length + (submitted.value ? 0 : 1)) / quizQuestions.value.length) * 100
})
const completedCategories = computed(() => categories.value.filter((c) => c.done).length)
const correctCount = computed(() => answers.value.filter((item) => item.correct).length)
const todayEarned = computed(() => answers.value.reduce((sum, item) => sum + item.points, 0))
const todayTotalEarned = computed(() => todayEarned.value + completionBonus.value)
const isCurrentCorrect = computed(() => sameAnswer(selectedAnswers.value, currentQuestion.value.answer))
const visibleRecords = computed(() => [
  ...quizRecords.value,
  { date: '2026-05-17', correctCount: 5, totalCount: 5, earnedPoints: 120 },
  { date: '2026-05-16', correctCount: 4, totalCount: 5, earnedPoints: 70 },
].slice(0, 4))

const statCards = computed(() => [
  { label: '当前积分', value: greenPoints.value },
  { label: '今日完成', value: `${answers.value.length} / ${quizQuestions.value.length}` },
  { label: '连续答题', value: '7 天' },
  { label: '今日正确率', value: answers.value.length ? `${Math.round((correctCount.value / answers.value.length) * 100)}%` : '0%' },
])

watch(greenPoints, (value) => {
  localStorage.setItem(POINTS_KEY, String(value))
  window.dispatchEvent(new CustomEvent('green-points:change', { detail: { points: value } }))
})

const awardPoints = (amount) => {
  greenPoints.value += amount
  if (userStore.isLoggedIn) userStore.addPoints(amount)
}

const sameAnswer = (left, right) => left.slice().sort().join('|') === right.slice().sort().join('|')
const typeLabel = (type) => ({ single: '单选', multiple: '多选', judge: '判断' }[type] || '选择')

const toggleOption = (label) => {
  if (currentQuestion.value.type === 'multiple') {
    selectedAnswers.value = selectedAnswers.value.includes(label)
      ? selectedAnswers.value.filter((item) => item !== label)
      : [...selectedAnswers.value, label]
    return
  }
  selectedAnswers.value = [label]
}

const optionClass = (label) => {
  if (!submitted.value) return selectedAnswers.value.includes(label) ? 'quiz-option--selected' : ''
  if (currentQuestion.value.answer.includes(label)) return 'quiz-option--right'
  if (selectedAnswers.value.includes(label)) return 'quiz-option--wrong'
  return 'quiz-option--disabled'
}

const submitAnswer = () => {
  if (submitted.value || isTodayCompleted.value || selectedAnswers.value.length === 0) return
  const correct = isCurrentCorrect.value
  const points = correct ? 10 : 3
  answers.value.push({ id: currentQuestion.value.id, correct, points })
  awardPoints(points)
  submitted.value = true
  ElMessage.success(correct ? `回答正确，获得 +${points} 积分` : `已学习解析，获得 +${points} 积分`)
}

const finishToday = () => {
  if (isTodayCompleted.value) return
  let bonus = 20
  if (correctCount.value === quizQuestions.value.length) bonus += 50
  completionBonus.value = bonus
  awardPoints(bonus)
  const record = {
    date: new Date().toISOString().slice(0, 10),
    correctCount: correctCount.value,
    totalCount: quizQuestions.value.length,
    earnedPoints: todayTotalEarned.value,
    questionIds: answers.value.map((item) => item.id),
  }
  quizRecords.value = [record, ...quizRecords.value.filter((item) => item.date !== record.date)].slice(0, 5)
  localStorage.setItem(RECORDS_KEY, JSON.stringify(quizRecords.value))
  if (userStore.isLoggedIn) saveQuizRecord(record)
  isTodayCompleted.value = true
  ElMessage.success(`今日问答完成，额外获得 +${bonus} 积分`)
}

const nextQuestion = () => {
  if (!submitted.value || isTodayCompleted.value) return
  if (isLastQuestion.value) {
    finishToday()
    return
  }
  currentIndex.value += 1
  selectedAnswers.value = []
  submitted.value = false
}

const jumpToCategory = (name) => {
  const idx = quizQuestions.value.findIndex((q) => q.category === name)
  if (idx >= 0 && !submitted.value) currentIndex.value = idx
}

const resetToday = () => {
  currentIndex.value = 0
  selectedAnswers.value = []
  submitted.value = false
  isTodayCompleted.value = false
  completionBonus.value = 0
  answers.value = []
  ElMessage.info('已重置今日问答演示')
}

onMounted(async () => {
  await userStore.init()
  if (userStore.user) greenPoints.value = Number(userStore.user.points) || greenPoints.value
  const questionResult = await fetchQuizQuestions()
  if (questionResult.ok && questionResult.items.length > 0) {
    quizQuestions.value = questionResult.items
    currentIndex.value = 0
  }
  if (userStore.isLoggedIn) {
    const recordResult = await fetchQuizRecords()
    if (recordResult.ok) quizRecords.value = recordResult.items
  }
})
</script>

<style scoped>
.quiz-hero,
.quiz-reward-panel,
.quiz-card,
.quiz-side-card {
  border: 1px solid rgba(25, 45, 32, 0.1);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 24px rgba(31, 65, 44, 0.05);
}
.quiz-hero { padding: 1.5rem; }
.quiz-hero h1 {
  margin-top: 0.3rem;
  font-size: clamp(2rem, 3.4vw, 3.25rem);
  line-height: 1.05;
  font-weight: 750;
  letter-spacing: 0;
}
.quiz-hero__copy { margin-top: 0.7rem; max-width: 34rem; color: #5f6f64; font-size: 0.95rem; }
.quiz-kicker { font-family: var(--font-mono); font-size: 0.64rem; font-weight: 700; letter-spacing: 0.14em; color: rgba(46, 125, 50, 0.72); }
.quiz-stat {
  border: 1px solid rgba(25, 45, 32, 0.06);
  border-radius: 0.5rem;
  background: #f8faf8;
  padding: 0.8rem 0.9rem;
}
.quiz-stat span { display: block; font-size: 0.72rem; color: #6b756e; }
.quiz-stat strong { display: block; margin-top: 0.15rem; font-size: 1.35rem; color: #225b32; }
.quiz-reward-panel,
.quiz-card,
.quiz-side-card { padding: 1.25rem; }
.quiz-reward-panel h2,
.quiz-card h2,
.quiz-side-card h3 { font-weight: 750; }
.quiz-card h2 { font-size: clamp(1.25rem, 2.5vw, 1.9rem); line-height: 1.35; }
.quiz-link-btn,
.quiz-primary-btn,
.quiz-secondary-btn,
.quiz-ghost-btn { border-radius: 0.45rem; padding: 0.65rem 0.95rem; font-size: 0.84rem; font-weight: 700; transition: all 0.2s ease; }
.quiz-link-btn,
.quiz-primary-btn { background: #2e7d32; color: white; }
.quiz-secondary-btn { border: 1px solid rgba(46, 125, 50, 0.24); color: #2e7d32; background: rgba(46, 125, 50, 0.06); }
.quiz-ghost-btn { border: 1px solid rgba(0, 0, 0, 0.08); color: #607068; background: white; }
button:disabled { opacity: 0.45; cursor: not-allowed; }
.quiz-rule,
.quiz-record,
.quiz-category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 0;
  background: transparent;
  padding: 0.8rem 0;
}
.quiz-rule span,
.quiz-record span { display: block; margin-top: 0.15rem; font-size: 0.75rem; color: #718177; }
.quiz-rule b,
.quiz-record b { color: #2e7d32; }
.quiz-category { align-self: flex-start; border-radius: 0.4rem; background: #f2f7f2; padding: 0.42rem 0.65rem; font-size: 0.75rem; font-weight: 700; color: #2e7d32; }
.quiz-option {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  border: 1px solid rgba(25,45,32,0.1);
  border-radius: 0.55rem;
  background: #fff;
  padding: 0.9rem 1rem;
  text-align: left;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.quiz-option:hover { border-color: rgba(46,125,50,0.34); }
.quiz-option span { display: grid; width: 1.8rem; height: 1.8rem; place-items: center; border-radius: 0.4rem; background: #f1f5f2; font-weight: 800; color: #2e7d32; }
.quiz-option--selected { border-color: #2e7d32; background: #f6fbf6; }
.quiz-option--right { border-color: #2e7d32; background: #2e7d32; color: white; }
.quiz-option--right span { background: rgba(255,255,255,0.18); color: white; }
.quiz-option--wrong { border-color: #ef4444; background: #ef4444; color: white; }
.quiz-option--wrong span { background: rgba(255,255,255,0.18); color: white; }
.quiz-option--disabled { opacity: 0.55; }
.quiz-explain { margin-top: 1rem; border-radius: 0.55rem; padding: 1rem; }
.quiz-explain span { white-space: nowrap; font-size: 1.4rem; font-weight: 800; }
.quiz-explain--right { border-left: 3px solid #2e7d32; background: #f3faf4; color: #245d2d; }
.quiz-explain--wrong { border-left: 3px solid #f97316; background: #fff7ed; color: #9a3412; }
.quiz-category-row { width: 100%; text-align: left; transition: all 0.2s ease; }
.quiz-category-row:hover { color: #2e7d32; }
.quiz-category-row b { font-size: 0.75rem; color: #2e7d32; }
.quiz-complete {
  min-height: 24rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.quiz-complete h2 {
  margin-top: 0.35rem;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
}
.quiz-complete__desc {
  margin-top: 0.8rem;
  max-width: 34rem;
  color: #607068;
  line-height: 1.7;
}
.quiz-complete__desc strong {
  color: #2e7d32;
}
.quiz-result-cell {
  border: 1px solid rgba(25,45,32,0.08);
  border-radius: 0.5rem;
  background: #f8faf8;
  padding: 1rem;
}
.quiz-result-cell span {
  display: block;
  font-size: 0.75rem;
  color: #718177;
}
.quiz-result-cell strong {
  display: block;
  margin-top: 0.25rem;
  font-size: 1.55rem;
  color: #245d2d;
}
.fade-up-enter-active,
.fade-up-leave-active { transition: all 0.25s ease; }
.fade-up-enter-from,
.fade-up-leave-to { opacity: 0; transform: translateY(8px); }
</style>

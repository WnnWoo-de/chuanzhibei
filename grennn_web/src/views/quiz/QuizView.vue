<template>
  <div class="quiz-root min-h-screen bg-transparent px-5 pt-24 pb-16">
    <div class="fixed inset-0 z-0 grid grid-cols-12 gap-4 px-6 opacity-[0.055] pointer-events-none">
      <div v-for="n in 12" :key="n" class="h-full border-r border-primary"></div>
    </div>

    <transition name="celebration-fade">
      <div
        v-if="showCelebration"
        class="quiz-celebration"
        :style="{
          '--burst-x': `${celebrationOrigin.x}px`,
          '--burst-y': `${celebrationOrigin.y}px`,
        }"
        aria-hidden="true"
      >
        <span
          v-for="petal in celebrationPetals"
          :key="petal.id"
          class="quiz-petal"
          :style="{
            '--petal-x-mid': `${petal.xMid}px`,
            '--petal-y-mid': `${petal.yMid}px`,
            '--petal-x-end': `${petal.xEnd}px`,
            '--petal-y-end': `${petal.yEnd}px`,
            '--petal-fall': `${petal.fall}px`,
            '--petal-delay': `${petal.delay}s`,
            '--petal-duration': `${petal.duration}s`,
            '--petal-size': `${petal.size}px`,
            '--petal-rotate': `${petal.rotate}deg`,
            '--petal-color': petal.color,
          }"
        ></span>
      </div>
    </transition>

    <transition name="finish-celebration-fade">
      <div v-if="showFinishCelebration" class="quiz-finish-celebration" aria-hidden="true">
        <span
          v-for="petal in finishPetals"
          :key="petal.id"
          class="quiz-finish-petal"
          :style="{
            '--finish-origin-x': `${finishCelebrationOrigin.x}px`,
            '--finish-origin-y': `${finishCelebrationOrigin.y}px`,
            '--finish-x-mid': `${petal.xMid}px`,
            '--finish-y-mid': `${petal.yMid}px`,
            '--finish-x-end': `${petal.xEnd}px`,
            '--finish-y-end': `${petal.yEnd}px`,
            '--finish-delay': `${petal.delay}s`,
            '--finish-duration': `${petal.duration}s`,
            '--finish-size': `${petal.size}px`,
            '--finish-rotate': `${petal.rotate}deg`,
            '--finish-color': petal.color,
          }"
        ></span>
      </div>
    </transition>

    <div class="relative z-10 mx-auto max-w-7xl">
      <header class="quiz-header mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section class="quiz-hero">
          <div class="quiz-panel-pattern" aria-hidden="true"></div>
          <div class="quiz-hero__content">
            <p class="quiz-kicker">GREEN DAILY QUIZ</p>
            <h1>{{ langText.quiz.title }}</h1>
            <p class="quiz-hero__copy">{{ langText.quiz.subtitle }}</p>
            <div class="quiz-hero-tags" aria-hidden="true">
              <span>低碳知识</span>
              <span>积分激励</span>
              <span>每日挑战</span>
            </div>
          </div>
          <div class="quiz-hero__signal" aria-hidden="true">
            <div class="quiz-signal-ring" :style="{ '--signal-progress': `${progressPercent}%` }">
              <strong>{{ Math.round(progressPercent) }}%</strong>
              <span>PROGRESS</span>
            </div>
            <div class="quiz-signal-line"></div>
          </div>
          <div class="quiz-stat-grid mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
            <div v-for="(item, index) in statCards" :key="item.label" class="quiz-stat" :style="{ '--stat-index': index }">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </section>

        <aside class="quiz-reward-panel">
          <div class="quiz-panel-pattern quiz-panel-pattern--right" aria-hidden="true"></div>
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="quiz-kicker">TODAY REWARD</p>
              <h2>{{ langText.quiz.todayReward }}</h2>
            </div>
            <router-link to="/store" class="quiz-link-btn">
              <span>{{ langText.quiz.goToRedeem }}</span>
            </router-link>
          </div>
          <div class="mt-4 divide-y divide-black/5">
            <div v-for="rule in rewardRules" :key="rule.title" class="quiz-rule">
              <i aria-hidden="true"></i>
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
          <div class="quiz-card__glow" aria-hidden="true"></div>
          <template v-if="!isTodayCompleted">
            <div class="quiz-card-ribbon" aria-hidden="true">
              <span>QUESTION BANK</span>
              <b>{{ currentIndex + 1 }}</b>
            </div>
            <div class="quiz-question-head mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="quiz-kicker">QUESTION {{ currentIndex + 1 }} / {{ quizQuestions.length }}</p>
                <h2>{{ currentQuestion.question }}</h2>
              </div>
              <span class="quiz-category">{{ currentQuestion.category }} · {{ typeLabel(currentQuestion.type) }}</span>
            </div>

            <div class="quiz-progress mb-5">
              <div class="h-full rounded-full bg-primary transition-all duration-500" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <div class="quiz-step-row" aria-hidden="true">
              <span
                v-for="step in questionSteps"
                :key="step.index"
                :class="['quiz-step-dot', step.state]"
              ></span>
            </div>

            <div class="quiz-options grid gap-2.5">
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
                <i aria-hidden="true"></i>
              </button>
            </div>

            <div class="quiz-learning-strip" aria-hidden="true">
              <span>KNOWLEDGE</span>
              <i></i>
              <span>CARBON</span>
              <i></i>
              <span>ACTION</span>
            </div>

            <transition name="fade-up">
              <div v-if="submitted" class="quiz-explain" :class="isCurrentCorrect ? 'quiz-explain--right' : 'quiz-explain--wrong'">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="font-bold">{{ isCurrentCorrect ? langText.quiz.correctAnswer : langText.quiz.keepLearning }}</p>
                    <p class="mt-1 text-sm leading-relaxed text-gray-600">
                      {{ langText.quiz.correctAnswerLabel }}：{{ currentQuestion.answer.join('、') }}。{{ currentQuestion.explanation }}
                    </p>
                  </div>
                  <span>{{ isCurrentCorrect ? '+10' : '+3' }}</span>
                </div>
              </div>
            </transition>

            <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button type="button" class="quiz-ghost-btn" @click="resetToday">{{ langText.quiz.resetDemo }}</button>
              <div class="flex gap-3">
                <button type="button" class="quiz-secondary-btn" :disabled="submitted || selectedAnswers.length === 0" @click="submitAnswer($event)">{{ langText.quiz.submitAnswer }}</button>
                <button type="button" class="quiz-primary-btn" :disabled="!submitted" @click="nextQuestion($event)">
                  {{ isLastQuestion ? langText.quiz.finishToday : langText.quiz.nextQuestion }}
                </button>
              </div>
            </div>
          </template>

          <transition name="fade-up">
            <div v-if="isTodayCompleted" class="quiz-complete">
              <div class="quiz-complete-spark" aria-hidden="true"></div>
              <div class="quiz-complete-mark" aria-hidden="true"></div>
              <p class="quiz-kicker">DAILY QUIZ COMPLETED</p>
              <h2>{{ langText.quiz.completedTitle }}</h2>
              <p class="quiz-complete__desc">
                {{ langText.quiz.completedDesc1 }} {{ correctCount }} / {{ quizQuestions.length }} {{ langText.quiz.completedDesc2 }}
                <strong>+{{ todayTotalEarned }}</strong> {{ langText.quiz.completedDesc3 }}
              </p>
              <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div class="quiz-result-cell">
                  <span>{{ langText.quiz.scoreResult }}</span>
                  <strong>+{{ todayEarned }}</strong>
                </div>
                <div class="quiz-result-cell">
                  <span>{{ langText.quiz.completionReward }}</span>
                  <strong>+{{ completionBonus }}</strong>
                </div>
                <div class="quiz-result-cell">
                  <span>{{ langText.quiz.accuracy }}</span>
                  <strong>{{ Math.round((correctCount / quizQuestions.length) * 100) }}%</strong>
                </div>
              </div>
              <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" class="quiz-ghost-btn" @click="resetToday">{{ langText.quiz.replay }}</button>
                <router-link to="/store" class="quiz-primary-btn text-center">{{ langText.quiz.goToStore }}</router-link>
              </div>
            </div>
          </transition>
        </section>

        <aside class="quiz-aside space-y-4">
          <section class="quiz-side-card quiz-insight-card">
            <div class="quiz-accuracy-ring" :style="{ '--accuracy': `${accuracyPercent}%` }">
              <strong>{{ accuracyPercent }}%</strong>
              <span>{{ langText.quiz.accuracy }}</span>
            </div>
            <div>
              <h3>{{ langText.quiz.scoreResult }}</h3>
              <p>{{ correctCount }} / {{ Math.max(answers.length, 1) }} {{ langText.quiz.correctLabel }}</p>
            </div>
          </section>

          <section class="quiz-side-card">
            <div class="mb-4 flex items-center justify-between">
              <h3>{{ langText.quiz.categoryChallenge }}</h3>
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
                <span>
                  {{ category.name }}
                  <em :style="{ width: category.done ? '100%' : '34%' }"></em>
                </span>
                <b>{{ category.done ? langText.quiz.completedLabel : category.count + ' ' + langText.quiz.questionsLabel }}</b>
              </button>
            </div>
          </section>

          <section class="quiz-side-card">
            <div class="mb-4 flex items-center justify-between">
              <h3>{{ langText.quiz.historyTitle }}</h3>
              <span class="text-xs font-mono text-gray-400">RECENT</span>
            </div>
            <div class="divide-y divide-black/5">
              <div v-for="record in visibleRecords" :key="record.date" class="quiz-record">
                <div>
                  <strong>{{ record.date }}</strong>
                  <span>{{ record.correctCount }}/{{ record.totalCount }} {{ langText.quiz.correctLabel }}</span>
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { langText } from '@/language'
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
const showCelebration = ref(false)
const showFinishCelebration = ref(false)
const celebrationOrigin = ref({ x: 50, y: 50 })
const finishCelebrationOrigin = ref({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
const completionBonus = ref(0)
const answers = ref([])
const quizRecords = ref(JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]'))
let celebrationTimer = null
let finishCelebrationTimer = null

const quizQuestions = ref(
  langText.value.quiz.questions.map((q, i) => ({ id: i + 1, ...q })),
)

const rewardRules = computed(() => langText.value.quiz.rewardRules)

const categories = computed(() => langText.value.quiz.categoryNames.map((name) => ({
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
const accuracyPercent = computed(() => {
  const base = answers.value.length || 1
  return Math.round((correctCount.value / base) * 100)
})
const todayEarned = computed(() => answers.value.reduce((sum, item) => sum + item.points, 0))
const todayTotalEarned = computed(() => todayEarned.value + completionBonus.value)
const isCurrentCorrect = computed(() => sameAnswer(selectedAnswers.value, currentQuestion.value.answer))
const visibleRecords = computed(() => [
  ...quizRecords.value,
  { date: '2026-05-17', correctCount: 5, totalCount: 5, earnedPoints: 120 },
  { date: '2026-05-16', correctCount: 4, totalCount: 5, earnedPoints: 70 },
].slice(0, 4))

const celebrationPetals = computed(() => {
  const palette = ['#f9a8d4', '#fda4af', '#fef08a', '#bbf7d0', '#86efac', '#fde68a']
  return Array.from({ length: 34 }, (_, index) => {
    const angle = (((index * 137.5) % 360) * Math.PI) / 180
    const distance = 46 + (index % 7) * 13
    const fall = 40 + (index % 6) * 10
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance
    return {
      id: index,
      xMid: x * 0.38,
      yMid: y * 0.38,
      xEnd: x * 1.08,
      yEnd: y + fall,
      fall,
      delay: (index % 8) * 0.025,
      duration: 1.35 + (index % 5) * 0.12,
      size: 8 + (index % 5) * 3,
      rotate: (index * 41) % 360,
      color: palette[index % palette.length],
    }
  })
})

const finishPetals = computed(() => {
  const palette = ['#f9a8d4', '#fda4af', '#fecdd3', '#fef08a', '#bbf7d0', '#86efac', '#a7f3d0']
  return Array.from({ length: 118 }, (_, index) => {
    const angle = (((index * 137.5) % 360) * Math.PI) / 180
    const ring = index % 4
    const distance = 140 + ring * 135 + (index % 9) * 14
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance
    return {
      id: index,
      xMid: x * 0.32,
      yMid: y * 0.32,
      xEnd: x,
      yEnd: y,
      delay: (index % 28) * 0.024,
      duration: 2.35 + (index % 7) * 0.13,
      size: 8 + (index % 7) * 2.7,
      rotate: (index * 47) % 360,
      color: palette[index % palette.length],
    }
  })
})

const questionSteps = computed(() => quizQuestions.value.map((question, index) => {
  if (answers.value.some((answer) => answer.id === question.id)) return { index, state: 'is-done' }
  if (index === currentIndex.value) return { index, state: 'is-current' }
  return { index, state: '' }
}))

const statCards = computed(() => {
  const t = langText.value.quiz.statLabels
  return [
    { label: t.currentPoints, value: greenPoints.value },
    { label: t.todayCompleted, value: `${answers.value.length} / ${quizQuestions.value.length}` },
    { label: t.streak, value: t.streakValue },
    { label: t.todayAccuracy, value: answers.value.length ? `${Math.round((correctCount.value / answers.value.length) * 100)}%` : '0%' },
  ]
})

watch(greenPoints, (value) => {
  localStorage.setItem(POINTS_KEY, String(value))
  window.dispatchEvent(new CustomEvent('green-points:change', { detail: { points: value } }))
})

const awardPoints = (amount) => {
  greenPoints.value += amount
  if (userStore.isLoggedIn) userStore.addPoints(amount)
}

const sameAnswer = (left, right) => left.slice().sort().join('|') === right.slice().sort().join('|')
const typeLabel = (type) => langText.value.quiz.typeLabels[type] || type

const triggerCelebration = (event) => {
  if (event?.currentTarget) {
    const rect = event.currentTarget.getBoundingClientRect()
    celebrationOrigin.value = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }
  showCelebration.value = false
  if (celebrationTimer) window.clearTimeout(celebrationTimer)
  requestAnimationFrame(() => {
    showCelebration.value = true
    celebrationTimer = window.setTimeout(() => {
      showCelebration.value = false
      celebrationTimer = null
    }, 1900)
  })
}

const triggerFinishCelebration = (event) => {
  if (event?.currentTarget) {
    const rect = event.currentTarget.getBoundingClientRect()
    finishCelebrationOrigin.value = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  } else {
    finishCelebrationOrigin.value = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }
  }
  showFinishCelebration.value = false
  if (finishCelebrationTimer) window.clearTimeout(finishCelebrationTimer)
  requestAnimationFrame(() => {
    showFinishCelebration.value = true
    finishCelebrationTimer = window.setTimeout(() => {
      showFinishCelebration.value = false
      finishCelebrationTimer = null
    }, 3600)
  })
}

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

const submitAnswer = (event) => {
  if (submitted.value || isTodayCompleted.value || selectedAnswers.value.length === 0) return
  const correct = isCurrentCorrect.value
  const points = correct ? 10 : 3
  answers.value.push({ id: currentQuestion.value.id, correct, points })
  awardPoints(points)
  submitted.value = true
  triggerCelebration(event)
  const t = langText.value.quiz.messages
  ElMessage.success(correct ? t.correctPoints.replace('{points}', points) : t.learnedPoints.replace('{points}', points))
}

const finishToday = (event) => {
  if (isTodayCompleted.value) return
  triggerCelebration(event)
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
  triggerFinishCelebration(event)
  ElMessage.success(langText.value.quiz.messages.todayComplete.replace('{bonus}', bonus))
}

const nextQuestion = (event) => {
  if (!submitted.value || isTodayCompleted.value) return
  if (isLastQuestion.value) {
    finishToday(event)
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
  showCelebration.value = false
  showFinishCelebration.value = false
  if (celebrationTimer) {
    window.clearTimeout(celebrationTimer)
    celebrationTimer = null
  }
  if (finishCelebrationTimer) {
    window.clearTimeout(finishCelebrationTimer)
    finishCelebrationTimer = null
  }
  completionBonus.value = 0
  answers.value = []
  ElMessage.info(langText.value.quiz.messages.resetDone)
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

onBeforeUnmount(() => {
  if (celebrationTimer) window.clearTimeout(celebrationTimer)
  if (finishCelebrationTimer) window.clearTimeout(finishCelebrationTimer)
})
</script>

<style scoped>
.quiz-root {
  position: relative;
  overflow: hidden;
  color: var(--color-text);
  background: transparent;
}
.quiz-hero,
.quiz-reward-panel,
.quiz-card,
.quiz-side-card {
  border: 1px solid color-mix(in srgb, var(--color-primary) 14%, transparent);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--glass-surface-strong, #fff) 94%, transparent);
  box-shadow: 0 18px 48px rgba(31, 65, 44, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(18px) saturate(118%);
  -webkit-backdrop-filter: blur(18px) saturate(118%);
}
.quiz-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1.5rem;
  overflow: hidden;
  padding: clamp(1.35rem, 2.4vw, 2rem);
}
.quiz-panel-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.28;
  pointer-events: none;
  background-image:
    linear-gradient(135deg, rgba(46, 125, 50, 0.07) 0 1px, transparent 1px),
    radial-gradient(circle at 12% 22%, rgba(246, 200, 95, 0.22), transparent 9rem);
  background-size: 1.15rem 1.15rem, auto;
}
.quiz-panel-pattern--right {
  opacity: 0.22;
  background-image:
    radial-gradient(circle at 85% 20%, rgba(129, 199, 132, 0.28), transparent 8rem),
    linear-gradient(135deg, rgba(46, 125, 50, 0.06) 0 1px, transparent 1px);
}
.quiz-hero::after {
  content: '';
  position: absolute;
  right: -5rem;
  bottom: -8rem;
  width: 22rem;
  height: 22rem;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(46, 125, 50, 0.12), transparent 66%);
}
.quiz-hero__content,
.quiz-hero__signal {
  position: relative;
  z-index: 1;
}
.quiz-hero h1 {
  margin-top: 0.35rem;
  max-width: 46rem;
  font-size: clamp(2.15rem, 4vw, 4.35rem);
  line-height: 1.02;
  font-weight: 850;
  letter-spacing: 0;
  color: #16261a;
}
.quiz-hero__copy {
  margin-top: 0.8rem;
  max-width: 38rem;
  color: #5c6c61;
  font-size: 1rem;
}
.quiz-hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.1rem;
}
.quiz-hero-tags span {
  border: 1px solid rgba(46, 125, 50, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  padding: 0.34rem 0.68rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: #315b39;
}
.quiz-hero__signal {
  display: grid;
  place-items: center;
  min-width: 9.5rem;
}
.quiz-signal-ring {
  display: grid;
  width: 7.8rem;
  height: 7.8rem;
  place-items: center;
  align-content: center;
  border: 1px solid rgba(46, 125, 50, 0.18);
  border-radius: 999px;
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, 0.92) 0 54%, transparent 55%),
    conic-gradient(var(--color-primary) var(--signal-progress), rgba(46, 125, 50, 0.12) 0);
  box-shadow: 0 18px 32px rgba(46, 125, 50, 0.1);
}
.quiz-signal-ring strong {
  font-size: 1.55rem;
  line-height: 1;
  color: #1f6a30;
}
.quiz-signal-ring span {
  margin-top: 0.3rem;
  font-family: var(--font-mono);
  font-size: 0.56rem;
  font-weight: 800;
  color: #6a7b6f;
}
.quiz-signal-line {
  width: 0.08rem;
  height: 2.5rem;
  margin-top: 0.75rem;
  background: linear-gradient(transparent, rgba(46, 125, 50, 0.28), transparent);
}
.quiz-kicker {
  font-family: var(--font-mono);
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: color-mix(in srgb, var(--color-primary) 76%, #3f4c41);
}
.quiz-stat {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(25, 45, 32, 0.07);
  border-radius: 0.58rem;
  background: linear-gradient(135deg, rgba(248, 252, 248, 0.96), rgba(238, 248, 239, 0.76));
  padding: 0.95rem 1rem;
}
.quiz-stat::before {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 0.2rem;
  background: linear-gradient(90deg, #2e7d32, #7cc486, #f6c85f);
  opacity: calc(0.42 + var(--stat-index) * 0.08);
}
.quiz-stat span {
  display: block;
  font-size: 0.72rem;
  color: #6b756e;
}
.quiz-stat strong {
  display: block;
  margin-top: 0.2rem;
  font-size: 1.4rem;
  color: #225b32;
}
.quiz-reward-panel,
.quiz-card,
.quiz-side-card {
  position: relative;
  overflow: hidden;
  padding: 1.25rem;
}
.quiz-reward-panel h2,
.quiz-card h2,
.quiz-side-card h3 {
  font-weight: 800;
  color: #17241b;
}
.quiz-link-btn,
.quiz-primary-btn,
.quiz-secondary-btn,
.quiz-ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.65rem;
  border-radius: 0.5rem;
  padding: 0.68rem 1rem;
  font-size: 0.84rem;
  font-weight: 800;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}
.quiz-link-btn,
.quiz-primary-btn {
  background: linear-gradient(135deg, #2e7d32, #1f6a30);
  color: white;
  box-shadow: 0 12px 22px rgba(46, 125, 50, 0.18);
}
.quiz-secondary-btn {
  border: 1px solid rgba(46, 125, 50, 0.28);
  color: #235d2f;
  background: rgba(46, 125, 50, 0.08);
}
.quiz-ghost-btn {
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: #607068;
  background: rgba(255, 255, 255, 0.82);
}
.quiz-link-btn:hover,
.quiz-primary-btn:hover,
.quiz-secondary-btn:hover,
.quiz-ghost-btn:hover {
  transform: translateY(-1px);
}
button:disabled {
  opacity: 0.48;
  cursor: not-allowed;
  transform: none !important;
}
.quiz-rule,
.quiz-record,
.quiz-category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 0;
  background: transparent;
  padding: 0.85rem 0;
}
.quiz-rule {
  justify-content: flex-start;
}
.quiz-rule i {
  width: 0.62rem;
  height: 0.62rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: linear-gradient(135deg, #7cc486, #f6c85f);
  box-shadow: 0 0 0 0.28rem rgba(46, 125, 50, 0.07);
}
.quiz-rule div {
  flex: 1;
}
.quiz-rule span,
.quiz-record span,
.quiz-insight-card p {
  display: block;
  margin-top: 0.18rem;
  font-size: 0.75rem;
  color: #718177;
}
.quiz-rule b,
.quiz-record b {
  color: #2e7d32;
}
.quiz-card {
  position: relative;
  overflow: hidden;
  min-height: 31rem;
}
.quiz-card::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.32;
  pointer-events: none;
  background:
    linear-gradient(120deg, transparent 0 58%, rgba(46, 125, 50, 0.08) 58% 58.4%, transparent 58.5%),
    radial-gradient(circle at 92% 12%, rgba(246, 200, 95, 0.18), transparent 8rem),
    radial-gradient(circle at 8% 96%, rgba(129, 199, 132, 0.2), transparent 9rem);
}
.quiz-card__glow {
  position: absolute;
  inset: -8rem -8rem auto auto;
  width: 18rem;
  height: 18rem;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(124, 196, 134, 0.16), transparent 68%);
  pointer-events: none;
}
.quiz-card-ribbon {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(46, 125, 50, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.68);
  padding: 0.3rem 0.38rem 0.3rem 0.75rem;
  color: #58705e;
  font-family: var(--font-mono);
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}
.quiz-card-ribbon b {
  display: grid;
  width: 1.65rem;
  height: 1.65rem;
  place-items: center;
  border-radius: 999px;
  background: #2e7d32;
  color: #fff;
  font-family: var(--font-body);
  letter-spacing: 0;
}
.quiz-card > *:not(.quiz-card__glow) {
  position: relative;
  z-index: 1;
}
.quiz-question-head h2,
.quiz-card h2 {
  font-size: clamp(1.35rem, 2.5vw, 2.15rem);
  line-height: 1.32;
}
.quiz-category {
  align-self: flex-start;
  border: 1px solid rgba(46, 125, 50, 0.12);
  border-radius: 0.48rem;
  background: rgba(46, 125, 50, 0.08);
  padding: 0.45rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 800;
  color: #2e7d32;
}
.quiz-progress {
  height: 0.52rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(25, 45, 32, 0.06);
}
.quiz-progress > div {
  background: linear-gradient(90deg, #2e7d32, #81c784, #f6c85f);
}
.quiz-step-row {
  display: flex;
  gap: 0.4rem;
  margin: -0.35rem 0 1.25rem;
}
.quiz-step-dot {
  height: 0.34rem;
  flex: 1;
  border-radius: 999px;
  background: rgba(25, 45, 32, 0.08);
}
.quiz-step-dot.is-current {
  background: rgba(46, 125, 50, 0.42);
}
.quiz-step-dot.is-done {
  background: #2e7d32;
}
.quiz-options {
  perspective: 900px;
}
.quiz-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-height: 4.2rem;
  border: 1px solid rgba(25, 45, 32, 0.1);
  border-radius: 0.65rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.95rem 1rem;
  text-align: left;
  box-shadow: 0 8px 20px rgba(31, 65, 44, 0.04);
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.quiz-option:hover {
  border-color: rgba(46, 125, 50, 0.34);
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(31, 65, 44, 0.07);
}
.quiz-option span {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.5rem;
  background: #eef6ef;
  font-weight: 900;
  color: #2e7d32;
}
.quiz-option strong {
  flex: 1;
  line-height: 1.45;
}
.quiz-option i {
  width: 0.68rem;
  height: 0.68rem;
  flex: 0 0 auto;
  border: 1px solid rgba(46, 125, 50, 0.28);
  border-radius: 999px;
}
.quiz-option--selected {
  border-color: #2e7d32;
  background: linear-gradient(135deg, rgba(246, 251, 246, 0.98), rgba(232, 245, 233, 0.86));
}
.quiz-option--selected i,
.quiz-option--right i {
  border-color: white;
  background: white;
  box-shadow: inset 0 0 0 0.18rem #2e7d32;
}
.quiz-option--right {
  border-color: #2e7d32;
  background: linear-gradient(135deg, #2e7d32, #25712d);
  color: white;
}
.quiz-option--right span,
.quiz-option--wrong span {
  background: rgba(255, 255, 255, 0.18);
  color: white;
}
.quiz-option--wrong {
  border-color: #ef4444;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}
.quiz-option--disabled {
  opacity: 0.55;
}
.quiz-learning-strip {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-top: 1rem;
  color: rgba(46, 125, 50, 0.58);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}
.quiz-learning-strip i {
  width: 0.32rem;
  height: 0.32rem;
  border-radius: 999px;
  background: rgba(46, 125, 50, 0.32);
}
.quiz-explain {
  margin-top: 1rem;
  border-radius: 0.68rem;
  padding: 1rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}
.quiz-explain span {
  white-space: nowrap;
  font-size: 1.4rem;
  font-weight: 900;
}
.quiz-explain--right {
  border: 1px solid rgba(46, 125, 50, 0.16);
  border-left: 4px solid #2e7d32;
  background: #f3faf4;
  color: #245d2d;
}
.quiz-explain--wrong {
  border: 1px solid rgba(249, 115, 22, 0.18);
  border-left: 4px solid #f97316;
  background: #fff7ed;
  color: #9a3412;
}
.quiz-aside {
  align-self: start;
}
.quiz-insight-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 1rem;
}
.quiz-accuracy-ring {
  display: grid;
  width: 5.4rem;
  height: 5.4rem;
  place-items: center;
  align-content: center;
  border-radius: 999px;
  background:
    radial-gradient(circle at center, var(--glass-surface-strong, #fff) 0 58%, transparent 59%),
    conic-gradient(var(--color-primary) var(--accuracy), rgba(46, 125, 50, 0.12) 0);
}
.quiz-accuracy-ring strong {
  line-height: 1;
  color: #225b32;
}
.quiz-accuracy-ring span {
  font-size: 0.62rem;
  color: #718177;
}
.quiz-category-row {
  width: 100%;
  text-align: left;
  transition: color 0.2s ease, transform 0.2s ease;
}
.quiz-category-row:hover {
  color: #2e7d32;
  transform: translateX(2px);
}
.quiz-category-row span {
  min-width: 0;
  flex: 1;
}
.quiz-category-row em {
  display: block;
  height: 0.24rem;
  max-width: 8rem;
  margin-top: 0.38rem;
  border-radius: 999px;
  background: linear-gradient(90deg, #2e7d32, #81c784);
  transition: width 0.3s ease;
}
.quiz-category-row b {
  flex: 0 0 auto;
  font-size: 0.75rem;
  color: #2e7d32;
}
.quiz-complete {
  position: relative;
  min-height: 24rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.quiz-complete-spark {
  position: absolute;
  inset: 2rem 2rem auto auto;
  width: 8rem;
  height: 8rem;
  border-radius: 999px;
  background:
    radial-gradient(circle at center, rgba(246, 200, 95, 0.45), transparent 24%),
    conic-gradient(from 20deg, transparent 0 10%, rgba(46, 125, 50, 0.18) 10% 14%, transparent 14% 27%, rgba(246, 200, 95, 0.2) 27% 32%, transparent 32%);
  filter: blur(0.2px);
  opacity: 0.8;
  pointer-events: none;
}
.quiz-complete-mark {
  width: 4.4rem;
  height: 4.4rem;
  margin-bottom: 1rem;
  border-radius: 999px;
  background:
    linear-gradient(135deg, transparent 42%, white 43% 55%, transparent 56%) 1.35rem 1.78rem / 1.55rem 0.8rem no-repeat,
    linear-gradient(135deg, #2e7d32, #81c784);
  box-shadow: 0 18px 32px rgba(46, 125, 50, 0.22);
}
.quiz-complete h2 {
  margin-top: 0.35rem;
  font-size: clamp(1.85rem, 3vw, 2.85rem);
}
.quiz-complete__desc {
  margin-top: 0.8rem;
  max-width: 36rem;
  color: #607068;
  line-height: 1.7;
}
.quiz-complete__desc strong {
  color: #2e7d32;
}
.quiz-result-cell {
  border: 1px solid rgba(25, 45, 32, 0.08);
  border-radius: 0.58rem;
  background: linear-gradient(135deg, #f8faf8, #eef7ef);
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
.quiz-celebration {
  position: fixed;
  inset: 0;
  z-index: 50;
  overflow: hidden;
  pointer-events: none;
}
.quiz-finish-celebration {
  position: fixed;
  inset: 0;
  z-index: 60;
  overflow: hidden;
  pointer-events: none;
}
.quiz-petal {
  position: absolute;
  top: var(--burst-y);
  left: var(--burst-x);
  width: var(--petal-size);
  height: calc(var(--petal-size) * 1.35);
  border-radius: 70% 20% 70% 20%;
  background:
    radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.85), transparent 34%),
    var(--petal-color);
  box-shadow: 0 8px 18px rgba(46, 125, 50, 0.12);
  opacity: 0;
  transform: translate3d(-50%, -50%, 0) rotate(var(--petal-rotate)) scale(0.5);
  animation: petal-burst var(--petal-duration) cubic-bezier(0.18, 0.72, 0.26, 1) var(--petal-delay) forwards;
}
.quiz-finish-petal {
  position: absolute;
  top: var(--finish-origin-y);
  left: var(--finish-origin-x);
  width: var(--finish-size);
  height: calc(var(--finish-size) * 1.35);
  border-radius: 72% 20% 70% 22%;
  background:
    radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.82), transparent 34%),
    var(--finish-color);
  box-shadow: 0 10px 24px rgba(46, 125, 50, 0.14);
  opacity: 0;
  transform: translate3d(-50%, -50%, 0) rotate(var(--finish-rotate)) scale(0.45);
  animation: finish-petal-bloom var(--finish-duration) cubic-bezier(0.17, 0.76, 0.28, 1) var(--finish-delay) forwards;
}
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.25s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
.celebration-fade-enter-active,
.celebration-fade-leave-active {
  transition: opacity 0.35s ease;
}
.celebration-fade-enter-from,
.celebration-fade-leave-to {
  opacity: 0;
}
.finish-celebration-fade-enter-active,
.finish-celebration-fade-leave-active {
  transition: opacity 0.45s ease;
}
.finish-celebration-fade-enter-from,
.finish-celebration-fade-leave-to {
  opacity: 0;
}
@keyframes petal-burst {
  0% {
    opacity: 0;
    transform: translate3d(-50%, -50%, 0) rotate(var(--petal-rotate)) scale(0.4);
  }
  12% {
    opacity: 0.96;
    transform: translate3d(calc(-50% + var(--petal-x-mid)), calc(-50% + var(--petal-y-mid)), 0) rotate(calc(var(--petal-rotate) + 90deg)) scale(1);
  }
  68% {
    opacity: 0.88;
    transform: translate3d(calc(-50% + var(--petal-x-end) * 0.92), calc(-50% + var(--petal-y-end) * 0.72), 0) rotate(calc(var(--petal-rotate) + 250deg)) scale(0.96);
  }
  100% {
    opacity: 0;
    transform: translate3d(calc(-50% + var(--petal-x-end)), calc(-50% + var(--petal-y-end)), 0) rotate(calc(var(--petal-rotate) + 430deg)) scale(0.7);
  }
}
@keyframes finish-petal-bloom {
  0% {
    opacity: 0;
    transform: translate3d(-50%, -50%, 0) rotate(var(--finish-rotate)) scale(0.35);
  }
  9% {
    opacity: 0.98;
    transform: translate3d(calc(-50% + var(--finish-x-mid)), calc(-50% + var(--finish-y-mid)), 0) rotate(calc(var(--finish-rotate) + 120deg)) scale(1.08);
  }
  58% {
    opacity: 0.9;
    transform: translate3d(calc(-50% + var(--finish-x-end) * 0.78), calc(-50% + var(--finish-y-end) * 0.78), 0) rotate(calc(var(--finish-rotate) + 360deg)) scale(0.98);
  }
  100% {
    opacity: 0;
    transform: translate3d(calc(-50% + var(--finish-x-end)), calc(-50% + var(--finish-y-end)), 0) rotate(calc(var(--finish-rotate) + 620deg)) scale(0.64);
  }
}
:root[data-theme='dark'] .quiz-hero h1,
:root[data-theme='dark'] .quiz-reward-panel h2,
:root[data-theme='dark'] .quiz-card h2,
:root[data-theme='dark'] .quiz-side-card h3 {
  color: #fff;
}
:root[data-theme='dark'] .quiz-hero__copy,
:root[data-theme='dark'] .quiz-stat span,
:root[data-theme='dark'] .quiz-rule span,
:root[data-theme='dark'] .quiz-record span,
:root[data-theme='dark'] .quiz-complete__desc,
:root[data-theme='dark'] .quiz-insight-card p {
  color: rgba(255, 255, 255, 0.72);
}
:root[data-theme='dark'] .quiz-stat,
:root[data-theme='dark'] .quiz-option,
:root[data-theme='dark'] .quiz-result-cell,
:root[data-theme='dark'] .quiz-ghost-btn,
:root[data-theme='dark'] .quiz-card-ribbon,
:root[data-theme='dark'] .quiz-hero-tags span {
  background: #333 !important;
}
:root[data-theme='dark'] .quiz-secondary-btn {
  color: #d8ceff;
  background: rgba(159, 134, 255, 0.16);
  border-color: rgba(159, 134, 255, 0.28);
}
:root[data-theme='dark'] .quiz-option--right,
:root[data-theme='dark'] .quiz-primary-btn,
:root[data-theme='dark'] .quiz-link-btn {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
}
:root[data-theme='dark'] .quiz-explain--right,
:root[data-theme='dark'] .quiz-explain--wrong {
  background: #333;
}
@media (max-width: 768px) {
  .quiz-root {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .quiz-hero {
    grid-template-columns: 1fr;
  }
  .quiz-hero__signal {
    display: none;
  }
  .quiz-link-btn,
  .quiz-primary-btn,
  .quiz-secondary-btn,
  .quiz-ghost-btn {
    width: 100%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .quiz-celebration {
    display: none;
  }
  .quiz-finish-celebration {
    display: none;
  }
}
</style>

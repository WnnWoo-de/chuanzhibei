<template>
  <div class="bg-transparent min-h-screen text-[#1a1a1a] font-sans pt-24 px-6 relative overflow-x-hidden">
    <!-- Grid Background -->
    <div class="fixed top-0 left-0 w-full h-full grid grid-cols-12 gap-4 pointer-events-none opacity-10 z-0 px-6">
      <div v-for="n in 12" :key="n" class="border-r border-black h-full hidden md:block"></div>
      <div v-for="n in 4" :key="`m-${n}`" class="border-r border-black h-full block md:hidden col-span-3"></div>
    </div>

    <!-- Main Container -->
    <div class="max-w-6xl mx-auto relative z-10 w-full pb-24">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
        <!-- Left Column: Title -->
        <div class="lg:col-span-1 mb-12 lg:mb-0">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-tighter text-primary">{{ langText.profile.title }}</h1>
          <p class="font-mono text-xs uppercase tracking-widest text-gray-600">{{ langText.profile.subtitle }}</p>

          <div class="profile-side-card mt-8">
            <span>{{ langText.profile.competitionProfile }}</span>
            <strong>{{ profileCompleteness }}%</strong>
            <div class="profile-side-card__bar">
              <i :style="{ width: `${profileCompleteness}%` }"></i>
            </div>
            <p>{{ langText.profile.profileDesc }}</p>
          </div>

          <!-- Sidebar Navigation (below title on mobile, same row on desktop) -->
          <nav class="space-y-2 mt-6 lg:mt-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="w-full text-left px-4 py-3 flex items-center justify-between group transition-all duration-200 border-l-2"
              :class="activeTab === tab.id ? 'border-primary bg-white shadow-sm font-bold' : 'border-transparent hover:border-black/20 text-gray-600 hover:text-black'"
            >
              <span class="text-sm font-mono tracking-widest">{{ tab.name }}</span>
              <span class="opacity-0 group-hover:opacity-100 transition-opacity text-xs" :class="activeTab === tab.id ? 'opacity-100 text-primary' : ''">→</span>
            </button>
          </nav>
        </div>

        <!-- Profile Content -->
        <div class="lg:col-span-4 lg:mt-12">
          <div class="bg-white/95 backdrop-blur-md border border-primary/20 shadow-xl rounded-2xl min-h-[600px]">
            <!-- Profile Overview -->
            <div v-if="activeTab === 'overview'" class="p-6 md:p-8 lg:p-8 animate-[fade-in_0.3s_ease]">
              <div class="mb-6 pb-3 border-b border-primary/10">
                <h2 class="text-xl font-bold mb-1">{{ langText.profile.overview }}</h2>
                <p class="text-xs text-gray-600 font-mono uppercase">{{ langText.profile.overviewEn }}</p>
              </div>

              <section class="profile-hero mb-6">
                <div class="profile-hero__content">
                  <p class="profile-kicker">GREEN CITIZEN PROFILE</p>
                  <h3>{{ userStore.user?.username || langText.profile.greenActor }}</h3>
                  <p class="profile-hero__bio">{{ profileBio }}</p>
                  <div class="profile-tags">
                    <span>Lv. {{ userLevel }} {{ levelTitle }}</span>
                    <span>{{ displayPoints }} {{ langText.profile.points }}</span>
                    <span>{{ actionCount }} {{ langText.profile.greenRecords }}</span>
                  </div>
                </div>
                <div class="profile-level-panel">
                  <div class="profile-level-panel__top">
                    <span>{{ langText.profile.nextLevel }}</span>
                    <strong>{{ nextLevelRemain }}</strong>
                  </div>
                  <div class="profile-progress" aria-label="等级进度">
                    <i :style="{ width: `${levelProgress}%` }"></i>
                  </div>
                  <p>{{ levelProgress }}% · {{ nextLevelLabel }}</p>
                </div>
              </section>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Profile Info Card -->
                <div class="lg:col-span-1">
                  <div class="bg-white/95 backdrop-blur-md border border-primary/20 p-5 lg:p-5 relative group overflow-hidden rounded-2xl shadow-lg h-full">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>

                    <div class="flex flex-col items-center text-center">
                      <div class="profile-avatar mb-4" aria-label="用户头像">
                        <img
                          v-if="displayAvatarSrc"
                          :src="displayAvatarSrc"
                          alt="User Avatar"
                          class="profile-avatar__image"
                          decoding="async"
                          @error="avatarLoadError = true"
                        />
                        <div v-else class="profile-avatar__fallback">
                          {{ avatarInitials }}
                        </div>
                        <div class="profile-avatar__ring"></div>
                      </div>

                      <h2 class="profile-user-name">{{ userStore.user?.username || langText.profile.unnamedUser }}</h2>
                      <p class="profile-user-email">{{ userStore.user?.email || 'N/A' }}</p>

                      <div class="w-full flex justify-between items-center px-3 py-2 bg-green-50 border border-primary/10 rounded-lg mb-4">
                        <span class="text-[10px] font-bold uppercase tracking-widest text-gray-600">{{ langText.profile.ecoPoints }}</span>
                        <span class="text-lg font-mono font-bold text-primary">{{ displayPoints }}</span>
                      </div>

                      <div class="profile-mini-stats mb-4">
                        <div>
                          <strong>{{ carbonReduction }}</strong>
                          <span>kg {{ langText.profile.carbonReduction }}</span>
                        </div>
                        <div>
                          <strong>{{ unlockedBadgeCount }}</strong>
                          <span>{{ langText.profile.badgesLabel }}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        class="w-full py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 hover:shadow-glow transition-colors flex items-center justify-center gap-2"
                        @click="openEditDialog"
                      >
                        {{ langText.profile.editProfile }} <span class="text-[8px]">→</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Right Column: Stats -->
                <div class="lg:col-span-2 space-y-5">
                  <!-- Overview Cards - First Row -->
                  <div class="grid grid-cols-2 gap-5">
                    <div class="bg-white/95 backdrop-blur-md border border-primary/20 p-5 relative overflow-hidden group rounded-2xl shadow-lg hover:shadow-glow transition-all duration-500">
                      <div class="font-mono text-[10px] text-gray-500 mb-3 tracking-widest uppercase">{{ langText.profile.carbonReduction }} / CO₂e</div>
                      <div class="text-3xl font-bold mb-1 group-hover:text-primary transition-colors">{{ carbonReduction }}<span class="text-base text-gray-400 ml-1">kg</span></div>
                      <p class="text-xs text-gray-600 mt-2 line-clamp-1">{{ langText.profile.treeEquivalent }} {{ Math.floor(displayPoints / 100) }} {{ langText.profile.treesSuffix }}</p>
                    </div>

                    <div class="bg-white/95 backdrop-blur-md border border-primary/20 p-5 relative overflow-hidden group rounded-2xl shadow-lg hover:shadow-glow transition-all duration-500">
                      <div class="font-mono text-[10px] text-gray-500 mb-3 tracking-widest uppercase">{{ langText.profile.unlockedBadges }} / Badges</div>
                      <div class="text-3xl font-bold mb-1 group-hover:text-primary transition-colors">{{ userStore.badges?.filter(b => b.unlocked).length || 0 }}<span class="text-base text-gray-400 ml-1 opacity-50">/ {{ userStore.badges?.length || 15 }}</span></div>
                      <router-link to="/achievements" class="inline-flex text-xs text-primary border-b border-primary mt-2 font-bold hover:text-primary/80 hover:border-primary/80 transition-colors">
                        {{ langText.profile.viewAllBadges }}
                      </router-link>
                    </div>
                  </div>

                  <!-- Overview Cards - Second Row -->
                  <div class="grid grid-cols-2 gap-5">
                    <div class="bg-white/95 backdrop-blur-md border border-primary/20 p-5 rounded-2xl shadow-lg">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                        </div>
                        <h3 class="font-bold text-sm text-gray-800">{{ langText.profile.userLevel }}</h3>
                      </div>
                      <p class="text-lg font-mono text-primary">Lv. {{ getUserLevel(displayPoints) }}</p>
                      <p class="text-xs text-gray-600 mt-1">{{ langText.profile.continueAccumulate }}</p>
                    </div>

                    <div class="bg-white/95 backdrop-blur-md border border-primary/20 p-5 rounded-2xl shadow-lg">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 class="font-bold text-sm text-gray-800">{{ langText.profile.redeemedRewards }}</h3>
                      </div>
                      <p class="text-lg font-mono text-primary">{{ redeemedRecords.length }}</p>
                      <p class="text-xs text-gray-600 mt-1">{{ langText.profile.rewardTypes }}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <router-link to="/quiz" class="profile-shortcut">
                      <span>{{ langText.profile.dailyQuiz }}</span>
                      <strong>{{ quizSummary.total }} {{ langText.profile.recordsSuffix }}</strong>
                    </router-link>
                    <router-link to="/store" class="profile-shortcut">
                      <span>{{ langText.profile.pointsAvailable }}</span>
                      <strong>{{ displayPoints }} {{ langText.profile.pointsAvailable }}</strong>
                    </router-link>
                    <router-link to="/achievements" class="profile-shortcut">
                      <span>{{ langText.profile.achievementBadges }}</span>
                      <strong>{{ unlockedBadgeCount }} {{ langText.profile.unlockedSuffix }}</strong>
                    </router-link>
                  </div>
                </div>
              </div>

              <div class="profile-impact-grid mt-6">
                <div v-for="card in impactCards" :key="card.label" class="profile-impact-card">
                  <span>{{ card.label }}</span>
                  <strong>{{ card.value }}</strong>
                  <p>{{ card.desc }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
                <section class="profile-panel">
                  <div class="profile-panel__head">
                    <div>
                      <h3>{{ langText.profile.milestones }}</h3>
                      <p>{{ langText.profile.milestonesDesc }}</p>
                    </div>
                    <router-link to="/achievements">{{ langText.profile.badgeWall }} →</router-link>
                  </div>
                  <div class="profile-timeline">
                    <div v-for="item in recentMilestones" :key="item.title" class="profile-timeline__item">
                      <span>{{ item.date }}</span>
                      <div>
                        <strong>{{ item.title }}</strong>
                        <p>{{ item.desc }}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section class="profile-panel">
                  <div class="profile-panel__head">
                    <div>
                      <h3>{{ langText.profile.nextAction }}</h3>
                      <p>{{ langText.profile.nextActionDesc }}</p>
                    </div>
                    <router-link to="/quiz">{{ langText.profile.goAction }} →</router-link>
                  </div>
                  <div class="profile-action-list">
                    <router-link v-for="action in nextActionTips" :key="action.title" :to="action.to">
                      <span>{{ action.title }}</span>
                      <strong>{{ action.desc }}</strong>
                    </router-link>
                  </div>
                </section>
              </div>
            </div>

            <!-- Recent Activity -->
            <div v-if="activeTab === 'activity'" class="p-6 md:p-10 animate-[fade-in_0.3s_ease]">
              <div class="mb-8 pb-4 border-b border-primary/10">
                <h2 class="text-2xl font-bold mb-1">{{ langText.profile.recentActivity }}</h2>
                <p class="text-xs text-gray-600 font-mono uppercase">{{ langText.profile.recentActivityEn }}</p>
              </div>

              <div v-if="hasActivity" class="space-y-4">
                <div v-for="(chat, i) in userStore.chatHistory.slice(-3)" :key="i" class="flex gap-4 p-4 border border-primary/10 hover:border-primary/30 transition-colors bg-green-50/50 rounded-lg">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-sm mb-1 text-gray-800">{{ langText.profile.aiEcoConsult }}</h4>
                    <p class="text-xs text-gray-600 line-clamp-1">{{ chat.content }}</p>
                    <p class="text-[10px] font-mono text-gray-500 mt-2">{{ new Date(chat.timestamp || Date.now()).toLocaleDateString() }}</p>
                  </div>
                </div>
                <div v-for="record in redeemedRecords.slice(0, 3)" :key="`redeem-${record.id}`" class="flex gap-4 p-4 border border-primary/10 hover:border-primary/30 transition-colors bg-green-50/50 rounded-lg">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 8.25h10.5l-.85 10.15a1.5 1.5 0 0 1-1.5 1.35H9.1a1.5 1.5 0 0 1-1.5-1.35L6.75 8.25ZM9 8.25a3 3 0 0 1 6 0" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-sm mb-1 text-gray-800">{{ langText.profile.exchanged }} {{ record.productName }}</h4>
                    <p class="text-xs text-gray-600">{{ langText.profile.consumed }} {{ record.costPoints }} {{ langText.profile.pointsSuffix }} · {{ record.statusText || record.status }}</p>
                    <p class="text-[10px] font-mono text-gray-500 mt-2">{{ formatDate(record.createdAt) }}</p>
                  </div>
                </div>
                <div v-for="record in quizRecords.slice(0, 3)" :key="`quiz-${record.id || record.date}`" class="flex gap-4 p-4 border border-primary/10 hover:border-primary/30 transition-colors bg-green-50/50 rounded-lg">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.75a3.75 3.75 0 1 1 5.68 3.22c-1.1.64-1.93 1.39-1.93 2.78M12 17.75h.01" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-sm mb-1 text-gray-800">{{ langText.profile.completedQuiz }}</h4>
                    <p class="text-xs text-gray-600">{{ langText.profile.correctOf }} {{ record.correctCount }}/{{ record.totalCount }} {{ langText.profile.totalSuffix }} · {{ langText.profile.pointsEarned }} {{ record.earnedPoints }} {{ langText.profile.pointsSuffix }}</p>
                    <p class="text-[10px] font-mono text-gray-500 mt-2">{{ formatDate(record.date || record.createdAt) }}</p>
                  </div>
                </div>
                <div class="text-center pt-2">
                  <router-link to="/chat" class="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
                    {{ langText.profile.viewMoreInAI }} →
                  </router-link>
                </div>
              </div>

              <div v-else class="text-center py-12 px-4 border border-dashed border-primary/20 bg-green-50/30 rounded-lg">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <svg viewBox="0 0 24 24" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-sm text-gray-600 mb-4">{{ langText.profile.noActivity }}</p>
                <router-link to="/chat" class="inline-flex px-4 py-2 bg-primary text-white text-xs font-bold uppercase hover:bg-primary/90 transition-colors rounded-lg">
                  {{ langText.profile.exploreFeatures }}
                </router-link>
              </div>
            </div>

            <!-- Reward Center -->
            <div v-if="activeTab === 'rewards'" class="p-6 md:p-10 animate-[fade-in_0.3s_ease]">
              <div class="mb-8 pb-4 border-b border-primary/10">
                <h2 class="text-2xl font-bold mb-1">{{ langText.profile.myRedemptions }}</h2>
                <p class="text-xs text-gray-600 font-mono uppercase">{{ langText.profile.myRedemptionsEn }}</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div class="profile-metric">
                  <span>{{ langText.profile.totalRedeemed }}</span>
                  <strong>{{ redeemedRecords.length }}</strong>
                </div>
                <div class="profile-metric">
                  <span>{{ langText.profile.totalSpentPoints }}</span>
                  <strong>{{ spentPoints }}</strong>
                </div>
                <div class="profile-metric">
                  <span>{{ langText.profile.virtualBadges }}</span>
                  <strong>{{ virtualRewards.length }}</strong>
                </div>
              </div>

              <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-bold text-lg">{{ langText.profile.quizLearning }}</h3>
                  <router-link to="/quiz" class="text-xs font-bold text-primary">{{ langText.profile.continueQuiz }} →</router-link>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div class="profile-metric">
                    <span>{{ langText.profile.completionCount }}</span>
                    <strong>{{ quizSummary.total }}</strong>
                  </div>
                  <div class="profile-metric">
                    <span>{{ langText.profile.avgAccuracy }}</span>
                    <strong>{{ quizSummary.accuracy }}%</strong>
                  </div>
                  <div class="profile-metric">
                    <span>{{ langText.profile.quizPoints }}</span>
                    <strong>{{ quizSummary.points }}</strong>
                  </div>
                </div>
                <div v-if="quizRecords.length === 0" class="profile-empty">
                  {{ langText.profile.noQuizRecords }}
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div v-for="record in quizRecords.slice(0, 6)" :key="`quiz-panel-${record.id || record.date}`" class="profile-reward-card">
                    <div>
                      <h4>{{ formatDate(record.date || record.createdAt) }}</h4>
                      <p>{{ langText.profile.correctOf }} {{ record.correctCount }}/{{ record.totalCount }} {{ langText.profile.totalSuffix }}</p>
                      <span>{{ langText.profile.quizAccuracy }} {{ Math.round((record.correctCount / Math.max(record.totalCount, 1)) * 100) }}%</span>
                    </div>
                    <strong class="!text-primary">+{{ record.earnedPoints }}</strong>
                  </div>
                </div>
              </div>

              <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-bold text-lg">{{ langText.profile.redeemedProducts }}</h3>
                  <router-link to="/store" class="text-xs font-bold text-primary">{{ langText.profile.continueRedeem }} →</router-link>
                </div>
                <div v-if="redeemedRecords.length === 0" class="profile-empty">
                  {{ langText.profile.noRedeemRecords }}
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div v-for="record in redeemedRecords" :key="record.id" class="profile-reward-card">
                    <div>
                      <h4>{{ record.productName }}</h4>
                      <p>{{ record.category || langText.profile.statusText }} · {{ record.statusText || record.status }}</p>
                      <span>{{ formatDate(record.createdAt) }}</span>
                    </div>
                    <strong>-{{ record.costPoints }}</strong>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="font-bold text-lg mb-4">{{ langText.profile.profileBadges }}</h3>
                <div v-if="virtualRewards.length === 0" class="profile-empty">
                  {{ langText.profile.noVirtualRewards }}
                </div>
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div v-for="reward in virtualRewards" :key="reward.id" class="profile-badge-card">
                    <div class="profile-badge-card__icon">✓</div>
                    <h4>{{ reward.name }}</h4>
                    <p>{{ reward.category }}</p>
                    <span>{{ formatDate(reward.redeemedAt || reward.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Account Settings -->
            <div v-if="activeTab === 'settings'" class="p-6 md:p-10 animate-[fade-in_0.3s_ease]">
              <div class="mb-8 pb-4 border-b border-primary/10">
                <h2 class="text-2xl font-bold mb-1">{{ langText.profile.accountSettings }}</h2>
                <p class="text-xs text-gray-600 font-mono uppercase">{{ langText.profile.accountSettingsEn }}</p>
              </div>

              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="block text-xs font-bold uppercase tracking-widest text-gray-600">{{ langText.profile.username }}</label>
                    <input
                      type="text"
                      :value="userStore.user?.username || ''"
                      disabled
                      class="w-full bg-green-50 border border-primary/10 px-4 py-3 text-sm text-gray-500 cursor-not-allowed rounded-lg"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-xs font-bold uppercase tracking-widest text-gray-600">{{ langText.profile.email }}</label>
                    <input
                      type="email"
                      :value="userStore.user?.email || ''"
                      disabled
                      class="w-full bg-green-50 border border-primary/10 px-4 py-3 text-sm text-gray-500 cursor-not-allowed rounded-lg"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-xs font-bold uppercase tracking-widest text-gray-600">{{ langText.profile.ecoPoints }}</label>
                  <div class="w-full bg-green-50 border border-primary/10 px-4 py-3 text-sm rounded-lg">
                    <span class="font-mono font-bold text-primary">{{ displayPoints }}</span>
                  </div>
                </div>

                <div class="pt-6">
                  <button
                    type="button"
                    class="px-6 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors rounded-lg"
                    @click="openEditDialog"
                  >
                    {{ langText.profile.editProfile }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showEditDialog"
      :title="langText.profile.editProfile"
      :width="560"
      align-center
      class="profile-edit-dialog"
      :close-on-click-modal="!isSaving"
      :close-on-press-escape="!isSaving"
      :show-close="!isSaving"
      @closed="handleDialogClosed"
    >
      <div class="space-y-5">
        <BaseInput
          id="username"
          v-model="form.username"
          type="text"
          :label="langText.profile.username"
          :placeholder="langText.profile.enterUsername"
          :error="errors.username"
          :success="touched.username && Boolean(form.username) && !errors.username"
          required
          @blur="validateUsername"
        />

        <div>
          <label for="email" class="block text-xs font-mono uppercase mb-2 text-gray-600">{{ langText.profile.email }}</label>
          <input
            id="email"
            :value="userStore.user?.email || ''"
            type="email"
            disabled
            class="w-full bg-green-50 border border-primary/10 px-4 py-3 text-sm text-gray-500 cursor-not-allowed rounded-lg"
          >
        </div>

        <div>
          <label for="avatar" class="block text-xs font-mono uppercase mb-2 text-gray-600">{{ langText.profile.avatarLink }}</label>
          <input
            id="avatar"
            v-model="form.avatar"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            class="w-full bg-green-50 border border-primary/10 px-4 py-3 text-sm transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-lg"
            :class="errors.avatar ? 'border-red-500 text-red-900 placeholder-red-300' : ''"
            @blur="validateAvatar"
          >
          <p v-if="errors.avatar" class="mt-1 text-xs text-red-500 font-mono">{{ errors.avatar }}</p>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label for="bio" class="block text-xs font-mono uppercase text-gray-600">{{ langText.profile.bio }}</label>
            <span class="text-xs text-gray-500">{{ form.bio.length }}/500</span>
          </div>
          <textarea
            id="bio"
            v-model="form.bio"
            rows="4"
            :placeholder="langText.profile.enterBio"
            class="w-full bg-green-50 border border-primary/10 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all resize-none rounded-lg"
            :class="errors.bio ? 'border-red-500 text-red-900 placeholder-red-300' : ''"
            @blur="validateBio"
          ></textarea>
          <p v-if="errors.bio" class="mt-1 text-xs text-red-500 font-mono">{{ errors.bio }}</p>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            class="px-5 py-2.5 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/10 transition-colors rounded-lg"
            :disabled="isSaving"
            @click="resetForm"
          >
            {{ langText.profile.reset }}
          </button>
          <button
            type="button"
            class="px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed rounded-lg"
            :disabled="isSaving"
            @click="handleSubmit"
          >
            {{ isSaving ? langText.profile.saving : langText.profile.saveProfile }}
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useUserStore } from '@/stores/user'
import { fetchRedeemRecords } from '@/services/storeService'
import { fetchQuizRecords } from '@/services/quizService'
import { langText } from '@/language'

const userStore = useUserStore()
const isSaving = ref(false)
const showEditDialog = ref(false)
const activeTab = ref('overview')
const avatarLoadError = ref(false)

/**
 * 左侧导航标签配置
 */
const tabs = computed(() => [
  { id: 'overview', name: langText.value.profile.overview },
  { id: 'activity', name: langText.value.profile.recentActivity },
  { id: 'rewards', name: langText.value.profile.myRedemptions },
  { id: 'settings', name: langText.value.profile.accountSettings }
])

/**
 * 根据积分计算用户等级
 */
const getUserLevel = (points) => {
  const p = Number(points) || 0
  if (p >= 4000) return 5
  if (p >= 2000) return 4
  if (p >= 1000) return 3
  if (p >= 500) return 2
  return 1
}

const form = reactive({
  username: '',
  avatar: '',
  bio: '',
})

const errors = reactive({
  username: '',
  avatar: '',
  bio: '',
})

const touched = reactive({
  username: false,
  avatar: false,
  bio: false,
})

const localPoints = ref(Number(localStorage.getItem('green_reward_points')) || 1280)
const redeemedRecords = ref(JSON.parse(localStorage.getItem('green_redeem_records') || '[]'))
const redeemedBadges = ref(JSON.parse(localStorage.getItem('green_redeemed_badges') || '[]'))
const quizRecords = ref(JSON.parse(localStorage.getItem('green_quiz_records') || '[]'))

const displayPoints = computed(() => Number(userStore.user?.points ?? localPoints.value) || 0)
const carbonReduction = computed(() => (displayPoints.value * 0.15).toFixed(1))
const unlockedBadgeCount = computed(() => userStore.badges?.filter((badge) => badge.unlocked).length || 0)
const spentPoints = computed(() => redeemedRecords.value.reduce((sum, item) => sum + (Number(item.costPoints) || 0), 0))
const actionCount = computed(() => (
  (userStore.chatHistory?.length || 0) +
  redeemedRecords.value.length +
  quizRecords.value.length +
  unlockedBadgeCount.value
))
const userLevel = computed(() => getUserLevel(displayPoints.value))
const levelTitle = computed(() => {
  const titles = [
    langText.value.profile.level1,
    langText.value.profile.level2,
    langText.value.profile.level3,
    langText.value.profile.level4,
    langText.value.profile.level5,
  ]
  return titles[userLevel.value - 1] || titles[0]
})
const levelTargets = [0, 500, 1000, 2000, 4000, 5000]
const nextLevelTarget = computed(() => levelTargets[userLevel.value] || levelTargets[levelTargets.length - 1])
const currentLevelBase = computed(() => levelTargets[Math.max(userLevel.value - 1, 0)] || 0)
const nextLevelRemain = computed(() => Math.max(nextLevelTarget.value - displayPoints.value, 0))
const nextLevelLabel = computed(() => (
  nextLevelRemain.value === 0 ? langText.value.profile.reachedMaxLevel : `${langText.value.profile.needPointsToLevel} ${nextLevelRemain.value} ${langText.value.profile.pointsToLevelSuffix}`
))
const levelProgress = computed(() => {
  const range = Math.max(nextLevelTarget.value - currentLevelBase.value, 1)
  const progressed = Math.max(displayPoints.value - currentLevelBase.value, 0)
  return Math.min(Math.round((progressed / range) * 100), 100)
})
const profileBio = computed(() => (
  userStore.user?.bio ||
  langText.value.profile.profileBioDefault
))
const profileCompleteness = computed(() => {
  const checks = [
    Boolean(userStore.user?.username),
    Boolean(userStore.user?.email),
    Boolean(userStore.user?.bio),
    Boolean(userStore.user?.avatar),
    displayPoints.value > 0,
    actionCount.value > 0,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
})
const quizAccuracyText = computed(() => `${quizSummary.value.accuracy}%`)
const impactCards = computed(() => [
  {
    label: langText.value.profile.carbonEstimate,
    value: `${carbonReduction.value} kg`,
    desc: `${langText.value.profile.treeEquivalent} ${Math.floor(displayPoints.value / 100)} ${langText.value.profile.treesSuffix}`,
  },
  {
    label: langText.value.profile.learningCompletion,
    value: quizAccuracyText.value,
    desc: `${quizSummary.value.total} ${langText.value.profile.quizRecordsSuffix}`,
  },
  {
    label: langText.value.profile.rewardCycle,
    value: `${redeemedRecords.value.length} ${langText.value.profile.recordsSuffix}`,
    desc: `${langText.value.profile.consumedPoints} ${spentPoints.value} ${langText.value.profile.consumedPointsSuffix}`,
  },
  {
    label: langText.value.profile.growthBadges,
    value: `${unlockedBadgeCount.value}/${userStore.badges?.length || 15}`,
    desc: langText.value.profile.growthBadgesDesc,
  },
])
const virtualRewards = computed(() => {
  const fromRecords = redeemedRecords.value
    .filter((item) => item.productType && item.productType !== 'physical')
    .map((item) => ({
      id: `record-${item.id}`,
      name: item.productName,
      category: item.category,
      redeemedAt: item.createdAt,
    }))
  return [...fromRecords, ...redeemedBadges.value].filter((item, index, arr) => (
    arr.findIndex((next) => next.name === item.name) === index
  ))
})
const hasActivity = computed(() => Boolean(userStore.chatHistory?.length || redeemedRecords.value.length || quizRecords.value.length))
const quizSummary = computed(() => {
  const total = quizRecords.value.length
  const correct = quizRecords.value.reduce((sum, item) => sum + (Number(item.correctCount) || 0), 0)
  const count = quizRecords.value.reduce((sum, item) => sum + (Number(item.totalCount) || 0), 0)
  const points = quizRecords.value.reduce((sum, item) => sum + (Number(item.earnedPoints) || 0), 0)
  return {
    total,
    accuracy: count ? Math.round((correct / count) * 100) : 0,
    points,
  }
})
const recentMilestones = computed(() => {
  const items = [
    {
      date: langText.value.profile.reachedLevel,
      title: `${langText.value.profile.reachedLevel} Lv.${userLevel.value} ${levelTitle.value}`,
      desc: `${langText.value.profile.cumulativePoints} ${displayPoints.value} ${langText.value.profile.pointsFormLevel}`,
    },
    {
      date: quizRecords.value[0]?.date ? formatDate(quizRecords.value[0].date) : langText.value.profile.startQuiz,
      title: quizRecords.value.length ? langText.value.profile.completedQuiz : langText.value.profile.startQuiz,
      desc: quizRecords.value.length
        ? `${langText.value.profile.quizCompletedDesc} ${quizRecords.value.length} ${langText.value.profile.quizTimes} ${quizSummary.value.accuracy}%。`
        : langText.value.profile.quizStartDesc,
    },
    {
      date: redeemedRecords.value[0]?.createdAt ? formatDate(redeemedRecords.value[0].createdAt) : langText.value.profile.waitingRedemption,
      title: redeemedRecords.value.length ? langText.value.profile.completedRedemption : langText.value.profile.waitingRedemption,
      desc: redeemedRecords.value.length
        ? `${langText.value.profile.redeemedDesc} ${redeemedRecords.value.length} ${langText.value.profile.redeemedItems}`
        : langText.value.profile.waitingRedeemDesc,
    },
  ]
  return items
})
const nextActionTips = computed(() => [
  {
    title: quizRecords.value.length ? langText.value.profile.continueDailyQuiz : langText.value.profile.completeFirstQuiz,
    desc: quizRecords.value.length ? langText.value.profile.maintainLearning : langText.value.profile.buildFirstRecord,
    to: '/quiz',
  },
  {
    title: displayPoints.value >= 200 ? langText.value.profile.redeemGreenReward : langText.value.profile.accumulatePoints,
    desc: displayPoints.value >= 200 ? langText.value.profile.formRewardLoop : langText.value.profile.getPointsViaActions,
    to: displayPoints.value >= 200 ? '/store' : '/volunteer',
  },
  {
    title: langText.value.profile.perfectBadges,
    desc: `${unlockedBadgeCount.value} ${langText.value.profile.badgessUnlocked}`,
    to: '/achievements',
  },
])

const syncForm = () => {
  form.username = userStore.user?.username || ''
  form.avatar = userStore.user?.avatar || ''
  form.bio = userStore.user?.bio || ''
  errors.username = ''
  errors.avatar = ''
  errors.bio = ''
  touched.username = false
  touched.avatar = false
  touched.bio = false
}

const validateUsername = (options) => {
  const shouldTrim = Boolean(options?.shouldTrim) || Boolean(options?.target)
  touched.username = true
  if (shouldTrim) form.username = form.username.trim()
  if (!form.username) {
    errors.username = langText.value.profile.enterUsername
    return false
  }
  if (form.username.length < 2) {
    errors.username = langText.value.profile.usernameMin2
    return false
  }
  if (form.username.length > 20) {
    errors.username = langText.value.profile.usernameMax20
    return false
  }
  errors.username = ''
  return true
}

const validateAvatar = (options) => {
  const shouldTrim = Boolean(options?.shouldTrim) || Boolean(options?.target)
  touched.avatar = true
  if (shouldTrim) form.avatar = form.avatar.trim()
  if (!form.avatar) {
    errors.avatar = ''
    return true
  }
  if (!/^https?:\/\//i.test(form.avatar)) {
    errors.avatar = langText.value.profile.validHttpLink
    return false
  }
  errors.avatar = ''
  return true
}

const validateBio = () => {
  touched.bio = true
  if (form.bio.length > 500) {
    errors.bio = langText.value.profile.bioMax500
    return false
  }
  errors.bio = ''
  return true
}

const focusFirstInvalid = () => {
  if (errors.username) return document.getElementById('username')?.focus?.()
  if (errors.avatar) return document.getElementById('avatar')?.focus?.()
  if (errors.bio) return document.getElementById('bio')?.focus?.()
}

const resetForm = () => {
  syncForm()
  ElMessage.info(langText.value.profile.savedToCurrent)
}

const openEditDialog = () => {
  syncForm()
  showEditDialog.value = true
}

const handleDialogClosed = () => {
  if (!isSaving.value) syncForm()
}

const handleSubmit = async () => {
  if (isSaving.value) return

  const okUsername = validateUsername({ shouldTrim: true })
  const okAvatar = validateAvatar({ shouldTrim: true })
  const okBio = validateBio()
  if (!okUsername || !okAvatar || !okBio) {
    ElMessage.warning(langText.value.profile.fixFormError)
    focusFirstInvalid()
    return
  }

  isSaving.value = true
  const result = await userStore.updateProfile({
    username: form.username.trim(),
    avatar: form.avatar.trim(),
    bio: form.bio.trim(),
  })
  isSaving.value = false

  if (!result.ok) {
    const fieldErrors = result.fieldErrors || {}
    if (fieldErrors.username) errors.username = fieldErrors.username
    if (fieldErrors.avatar) errors.avatar = fieldErrors.avatar
    if (fieldErrors.bio) errors.bio = fieldErrors.bio
    focusFirstInvalid()
    return
  }

  syncForm()
}

const displayAvatarSrc = computed(() => {
  const avatar = String(userStore.user?.avatar || '').trim()
  if (avatarLoadError.value || !/^https?:\/\//i.test(avatar)) return ''
  return avatar
})

const avatarInitials = computed(() => {
  const source = String(userStore.user?.username || userStore.user?.email || 'U').trim()
  const compact = source.replace(/\s+/g, '')
  return (compact.match(/[a-zA-Z0-9]/g)?.join('') || compact || 'U').slice(0, 2).toUpperCase()
})

const formatDate = (value) => value ? String(value).slice(0, 10) : ''

const loadRewardData = async () => {
  localPoints.value = Number(localStorage.getItem('green_reward_points')) || localPoints.value
  redeemedRecords.value = JSON.parse(localStorage.getItem('green_redeem_records') || '[]')
  redeemedBadges.value = JSON.parse(localStorage.getItem('green_redeemed_badges') || '[]')
  quizRecords.value = JSON.parse(localStorage.getItem('green_quiz_records') || '[]')
  if (!userStore.isReady) await userStore.init()
  if (userStore.isLoggedIn) {
    const [redeemResult, quizResult] = await Promise.all([fetchRedeemRecords(), fetchQuizRecords()])
    if (redeemResult.ok) redeemedRecords.value = redeemResult.items
    if (quizResult.ok) quizRecords.value = quizResult.items
  }
}

onMounted(loadRewardData)

watch(() => userStore.user, syncForm, { immediate: true, deep: true })
watch(() => userStore.user?.avatar, () => { avatarLoadError.value = false })
watch(() => form.username, () => { if (touched.username) validateUsername() })
watch(() => form.avatar, () => { if (touched.avatar) validateAvatar() })
watch(() => form.bio, () => { if (touched.bio) validateBio() })
</script>

<style scoped>
:deep(.profile-edit-dialog .el-dialog) {
  border-radius: 20px;
  overflow: hidden;
}

:deep(.profile-edit-dialog .el-dialog__header) {
  background: linear-gradient(to right, #2e7d32, #4caf50);
  padding: 20px 24px;
}

:deep(.profile-edit-dialog .el-dialog__title) {
  color: white;
  font-weight: bold;
}

:deep(.profile-edit-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

:deep(.profile-edit-dialog .el-dialog__body) {
  padding: 30px 24px;
}

:deep(.profile-edit-dialog .el-dialog__footer) {
  padding: 20px 24px 30px;
}

.profile-side-card {
  border: 1px solid rgba(46, 125, 50, 0.18);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.86);
  padding: 1rem;
  box-shadow: 0 14px 40px rgba(31, 41, 55, 0.08);
}

.profile-side-card span,
.profile-kicker {
  color: #6b7280;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.profile-side-card strong {
  display: block;
  margin-top: 0.35rem;
  color: #1f3f2a;
  font-size: 1.9rem;
  line-height: 1;
}

.profile-side-card p {
  margin-top: 0.75rem;
  color: #6b7280;
  font-size: 0.78rem;
  line-height: 1.6;
}

.profile-side-card__bar,
.profile-progress {
  overflow: hidden;
  height: 0.45rem;
  border-radius: 999px;
  background: rgba(46, 125, 50, 0.12);
}

.profile-side-card__bar {
  margin-top: 0.75rem;
}

.profile-side-card__bar i,
.profile-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #2e7d32, #6bbf59);
  transition: width 0.35s ease;
}

.profile-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 18rem;
  gap: 1.25rem;
  align-items: stretch;
  border: 1px solid rgba(46, 125, 50, 0.14);
  border-radius: 1rem;
  background:
    linear-gradient(135deg, rgba(232, 245, 233, 0.92), rgba(255, 255, 255, 0.92)),
    radial-gradient(circle at top right, rgba(46, 125, 50, 0.16), transparent 38%);
  padding: 1.25rem;
}

.profile-hero__content h3 {
  margin-top: 0.35rem;
  color: #102316;
  font-size: clamp(1.75rem, 4vw, 2.65rem);
  font-weight: 850;
  line-height: 1.08;
}

.profile-hero__bio {
  max-width: 42rem;
  margin-top: 0.75rem;
  color: #4b5563;
  font-size: 0.95rem;
  line-height: 1.75;
}

.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.profile-tags span {
  border: 1px solid rgba(46, 125, 50, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #1f3f2a;
  padding: 0.4rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.profile-level-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid rgba(46, 125, 50, 0.14);
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.76);
  padding: 1rem;
}

.profile-level-panel__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.profile-level-panel__top span,
.profile-level-panel p {
  color: #6b7280;
  font-size: 0.76rem;
}

.profile-level-panel__top strong {
  color: #2e7d32;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 1.5rem;
  line-height: 1;
}

.profile-level-panel p {
  margin-top: 0.7rem;
}

.profile-avatar {
  position: relative;
  display: grid;
  width: 6rem;
  height: 6rem;
  place-items: center;
  flex: 0 0 6rem;
  contain: layout paint;
}

.profile-avatar__image,
.profile-avatar__fallback {
  position: relative;
  z-index: 1;
  width: 5rem;
  height: 5rem;
  border: 4px solid #fff;
  border-radius: 9999px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

.profile-avatar__image {
  display: block;
  object-fit: cover;
  background: #111827;
}

.profile-avatar__fallback {
  display: grid;
  place-items: center;
  background: #111;
  color: #fff;
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  user-select: none;
}

.profile-avatar__ring {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(46, 125, 50, 0.2);
  border-radius: 9999px;
  pointer-events: none;
}

.profile-user-name,
.profile-user-email {
  max-width: 100%;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-user-name {
  margin-bottom: 0.25rem;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.35;
}

.profile-user-email {
  margin-bottom: 1rem;
  color: #6b7280;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.75rem;
  line-height: 1.4;
}

.profile-mini-stats {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.profile-mini-stats div {
  border: 1px solid rgba(46, 125, 50, 0.12);
  border-radius: 0.6rem;
  background: rgba(245, 250, 246, 0.8);
  padding: 0.55rem;
}

.profile-mini-stats strong,
.profile-mini-stats span {
  display: block;
}

.profile-mini-stats strong {
  color: #1f3f2a;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 1rem;
}

.profile-mini-stats span {
  margin-top: 0.15rem;
  color: #6b7280;
  font-size: 0.68rem;
}

.profile-shortcut {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border: 1px solid rgba(46, 125, 50, 0.14);
  border-radius: 0.75rem;
  background: rgba(245, 250, 246, 0.9);
  padding: 1rem;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.profile-shortcut:hover {
  border-color: rgba(46, 125, 50, 0.35);
  transform: translateY(-1px);
}

.profile-shortcut span,
.profile-metric span,
.profile-reward-card span,
.profile-badge-card span {
  font-size: 0.72rem;
  color: #6b7280;
}

.profile-shortcut strong {
  color: #2e7d32;
  font-size: 0.9rem;
}

.profile-metric {
  border: 1px solid rgba(46, 125, 50, 0.14);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
}

.profile-metric strong {
  display: block;
  margin-top: 0.25rem;
  color: #2e7d32;
  font-size: 1.7rem;
  line-height: 1;
}

.profile-empty {
  border: 1px dashed rgba(46, 125, 50, 0.24);
  border-radius: 0.75rem;
  background: rgba(245, 250, 246, 0.72);
  padding: 1.5rem;
  color: #6b7280;
  font-size: 0.9rem;
  text-align: center;
}

.profile-reward-card {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(46, 125, 50, 0.14);
  border-radius: 0.75rem;
  background: white;
  padding: 1rem;
}

.profile-reward-card h4,
.profile-badge-card h4 {
  font-weight: 700;
  color: #1f2937;
}

.profile-reward-card p,
.profile-badge-card p {
  margin-top: 0.2rem;
  color: #6b7280;
  font-size: 0.8rem;
}

.profile-reward-card strong {
  color: #dc2626;
  white-space: nowrap;
}

.profile-badge-card {
  border: 1px solid rgba(46, 125, 50, 0.14);
  border-radius: 0.75rem;
  background: white;
  padding: 1rem;
}

.profile-badge-card__icon {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  margin-bottom: 0.75rem;
  border-radius: 0.5rem;
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: 800;
}

.profile-impact-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.profile-impact-card,
.profile-panel {
  border: 1px solid rgba(46, 125, 50, 0.14);
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 14px 35px rgba(31, 41, 55, 0.06);
}

.profile-impact-card {
  padding: 1rem;
}

.profile-impact-card span {
  color: #6b7280;
  font-size: 0.72rem;
}

.profile-impact-card strong {
  display: block;
  margin-top: 0.45rem;
  color: #1f3f2a;
  font-size: 1.45rem;
  line-height: 1;
}

.profile-impact-card p {
  margin-top: 0.65rem;
  color: #6b7280;
  font-size: 0.75rem;
  line-height: 1.55;
}

.profile-panel {
  padding: 1.1rem;
}

.profile-panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.profile-panel__head h3 {
  color: #1f2937;
  font-size: 1rem;
  font-weight: 800;
}

.profile-panel__head p {
  margin-top: 0.2rem;
  color: #6b7280;
  font-size: 0.75rem;
}

.profile-panel__head a {
  flex: 0 0 auto;
  color: #2e7d32;
  font-size: 0.75rem;
  font-weight: 800;
}

.profile-timeline {
  display: grid;
  gap: 0.85rem;
}

.profile-timeline__item {
  display: grid;
  grid-template-columns: 4rem minmax(0, 1fr);
  gap: 0.75rem;
  align-items: start;
}

.profile-timeline__item > span {
  border-radius: 999px;
  background: #e8f5e9;
  color: #2e7d32;
  padding: 0.3rem 0.45rem;
  text-align: center;
  font-size: 0.68rem;
  font-weight: 800;
}

.profile-timeline__item strong {
  display: block;
  color: #1f2937;
  font-size: 0.85rem;
}

.profile-timeline__item p {
  margin-top: 0.18rem;
  color: #6b7280;
  font-size: 0.75rem;
  line-height: 1.55;
}

.profile-action-list {
  display: grid;
  gap: 0.75rem;
}

.profile-action-list a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(46, 125, 50, 0.12);
  border-radius: 0.7rem;
  background: rgba(245, 250, 246, 0.72);
  padding: 0.85rem;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.profile-action-list a:hover {
  border-color: rgba(46, 125, 50, 0.34);
  transform: translateY(-1px);
}

.profile-action-list span {
  color: #1f2937;
  font-size: 0.85rem;
  font-weight: 800;
}

.profile-action-list strong {
  color: #6b7280;
  font-size: 0.72rem;
  font-weight: 500;
  text-align: right;
}

:global(:root[data-theme='dark']) .profile-side-card,
:global(:root[data-theme='dark']) .profile-level-panel,
:global(:root[data-theme='dark']) .profile-metric,
:global(:root[data-theme='dark']) .profile-empty,
:global(:root[data-theme='dark']) .profile-reward-card,
:global(:root[data-theme='dark']) .profile-badge-card,
:global(:root[data-theme='dark']) .profile-impact-card,
:global(:root[data-theme='dark']) .profile-panel {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(17, 24, 20, 0.92);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.26);
}

:global(:root[data-theme='dark']) .profile-hero {
  border-color: rgba(110, 231, 123, 0.18);
  background:
    linear-gradient(135deg, rgba(22, 49, 31, 0.94), rgba(13, 22, 17, 0.96)),
    radial-gradient(circle at top right, rgba(110, 231, 123, 0.16), transparent 40%);
}

:global(:root[data-theme='dark']) .profile-mini-stats div,
:global(:root[data-theme='dark']) .profile-shortcut,
:global(:root[data-theme='dark']) .profile-action-list a,
:global(:root[data-theme='dark']) .profile-tags span,
:global(:root[data-theme='dark']) .profile-timeline__item > span {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-text);
}

:global(:root[data-theme='dark']) .profile-kicker,
:global(:root[data-theme='dark']) .profile-side-card span,
:global(:root[data-theme='dark']) .profile-side-card p,
:global(:root[data-theme='dark']) .profile-hero__bio,
:global(:root[data-theme='dark']) .profile-level-panel__top span,
:global(:root[data-theme='dark']) .profile-level-panel p,
:global(:root[data-theme='dark']) .profile-user-email,
:global(:root[data-theme='dark']) .profile-mini-stats span,
:global(:root[data-theme='dark']) .profile-shortcut span,
:global(:root[data-theme='dark']) .profile-metric span,
:global(:root[data-theme='dark']) .profile-reward-card span,
:global(:root[data-theme='dark']) .profile-badge-card span,
:global(:root[data-theme='dark']) .profile-impact-card span,
:global(:root[data-theme='dark']) .profile-impact-card p,
:global(:root[data-theme='dark']) .profile-panel__head p,
:global(:root[data-theme='dark']) .profile-timeline__item p,
:global(:root[data-theme='dark']) .profile-action-list strong {
  color: var(--color-text-muted);
}

:global(:root[data-theme='dark']) .profile-hero__content h3,
:global(:root[data-theme='dark']) .profile-user-name,
:global(:root[data-theme='dark']) .profile-side-card strong,
:global(:root[data-theme='dark']) .profile-mini-stats strong,
:global(:root[data-theme='dark']) .profile-shortcut strong,
:global(:root[data-theme='dark']) .profile-metric strong,
:global(:root[data-theme='dark']) .profile-reward-card h4,
:global(:root[data-theme='dark']) .profile-badge-card h4,
:global(:root[data-theme='dark']) .profile-impact-card strong,
:global(:root[data-theme='dark']) .profile-panel__head h3,
:global(:root[data-theme='dark']) .profile-timeline__item strong,
:global(:root[data-theme='dark']) .profile-action-list span {
  color: var(--color-text);
}

:global(:root[data-theme='dark']) .profile-level-panel__top strong,
:global(:root[data-theme='dark']) .profile-panel__head a,
:global(:root[data-theme='dark']) .profile-tags span,
:global(:root[data-theme='dark']) .profile-timeline__item > span {
  color: var(--color-primary);
}

@media (max-width: 1024px) {
  .profile-hero {
    grid-template-columns: 1fr;
  }

  .profile-impact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .profile-impact-grid {
    grid-template-columns: 1fr;
  }

  .profile-panel__head,
  .profile-action-list a {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-action-list strong {
    text-align: left;
  }
}
</style>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import '@/assets/lang-dropdown.css'
import '@/assets/app.css'
import '@/assets/rule-box.css'
import '@/assets/responsive.css'

import MovieSuggestions from './components/MovieSuggestions.vue'
import TrendingList from './components/TrendingList.vue'
import PopularList from './components/PopularList.vue'
import MovieDetailsModal from './components/MovieDetailsModal.vue'
import ProvidersModal from './components/ProvidersModal.vue'

import { useMovies } from './composables/useMovies'
import { useLanguage } from './composables/useLanguage'
import { useTabs } from './composables/useTabs'

const { t, locale } = useI18n()
const {
  movieSuggestions,
  trendingMovies,
  popularMovies,
  selectedMovie,
  isLoading,
  showProvidersModal,
  providers,
  providersLoading,
  providersError,
  suggestMovie,
  fetchTrending,
  fetchPopular,
  selectMovie,
  closeMovie,
  showProviders,
  closeProvidersModal,
  getConsolidatedProviders,
  openProviderUrl
} = useMovies()

const {
  showDropdown,
  languages,
  toggleLanguageDropdown,
  selectLanguage
} = useLanguage()

const {
  activeTab,
  trendingPeriod,
  setActiveTab,
  setTrendingPeriod
} = useTabs()

const userQuery = ref('')
const autoTextarea = ref<HTMLTextAreaElement | null>(null)

function autoResize() {
  const el = autoTextarea.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }
}

watch([activeTab, locale], async ([tab]) => {
  if (tab === 'trending') await fetchTrending(trendingPeriod.value, locale.value)
  if (tab === 'popular') await fetchPopular(locale.value)
})

watch(trendingPeriod, async () => {
  if (activeTab.value === 'trending') await fetchTrending(trendingPeriod.value, locale.value)
})

watch(userQuery, () => {
  autoResize()
})

watch(locale, () => {
  if (userQuery.value.trim()) {
    suggestMovie(userQuery.value, locale.value)
  }
  fetchTrending(trendingPeriod.value, locale.value)
  fetchPopular(locale.value)
})

onMounted(() => {
  fetchTrending(trendingPeriod.value, locale.value)
  fetchPopular(locale.value)
  autoResize()
  window.addEventListener('keydown', handleEsc)
})

function handleEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && selectedMovie.value) {
    closeMovie()
  }
}

async function handleSuggestMovie() {
  await suggestMovie(userQuery.value, locale.value)
}
</script>

<template>
  <div class="container">
    <div class="lang-dropdown">
      <button
        class="lang-btn"
        @click="toggleLanguageDropdown"
        :title="$t('changeLang')"
        aria-label="Switch language"
      >
        <img
          :src="languages.find(l => l.code === locale)?.flag"
          :alt="languages.find(l => l.code === locale)?.label"
          class="flag-icon"
        />
      </button>
      <div v-if="showDropdown" class="dropdown">
        <div
          v-for="lang in languages"
          :key="lang.code"
          class="dropdown-item"
          @click="selectLanguage(lang.code)"
        >
          <img :src="lang.flag" :alt="lang.label" class="flag-icon" />
          <span>{{ lang.label }}</span>
        </div>
      </div>
    </div>
    <h1>
      <span class="cine" style="font-size: 2.5rem; font-weight: bold;">Cine</span><span class="matcha" style="font-size: 2.5rem; font-weight: bold;">matcha</span>
    </h1>
    <div class="tabs">
      <button :class="{active: activeTab === 'search'}" @click="setActiveTab('search')">{{$t('tab.search')}}</button>
      <button :class="{active: activeTab === 'trending'}" @click="setActiveTab('trending')">{{$t('tab.trending')}}</button>
      <button :class="{active: activeTab === 'popular'}" @click="setActiveTab('popular')">{{$t('tab.popular')}}</button>
    </div>
    <div v-if="activeTab === 'trending'" class="sub-tabs">
      <button :class="{active: trendingPeriod === 'day'}" @click="setTrendingPeriod('day')">{{$t('tab.today')}}</button>
      <button :class="{active: trendingPeriod === 'week'}" @click="setTrendingPeriod('week')">{{$t('tab.week')}}</button>
    </div>
    <div v-if="activeTab === 'search'">
      <div class="form-area">
        <textarea
          v-model="userQuery"
          :placeholder="$t('placeholder')"
          class="query-input"
          rows="1"
          ref="autoTextarea"
          @input="autoResize"
          style="resize: none; overflow: hidden; font-size: 1rem;"
        />
        <button @click="handleSuggestMovie" :disabled="isLoading || !userQuery.trim()" style="font-size: 1rem;">
          <span v-if="!isLoading">{{ $t('button') }}</span>
          <span v-else>...</span>
        </button>
      </div>
      <MovieSuggestions :movieSuggestions="movieSuggestions" :isLoading="isLoading" @selectMovie="selectMovie" />
    </div>
    <div v-else-if="activeTab === 'trending'">
      <TrendingList :trendingMovies="trendingMovies" @selectMovie="selectMovie" />
    </div>
    <div v-else-if="activeTab === 'popular'">
      <PopularList :popularMovies="popularMovies" @selectMovie="selectMovie" />
    </div>
    <Teleport to="body">
      <MovieDetailsModal
        v-if="selectedMovie"
        :movie="selectedMovie"
        :locale="locale"
        @close="closeMovie"
        @show-providers="showProviders"
      />
    </Teleport>
    <Teleport to="body">
      <ProvidersModal
        v-if="showProvidersModal"
        :showProvidersModal="showProvidersModal"
        :loading="providersLoading"
        :error="providersError"
        :providers="providers"
        @close="closeProvidersModal"
        @provider-click="openProviderUrl"
      />
    </Teleport>
  </div>
</template>

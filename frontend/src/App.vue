<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import brFlag from '@/assets/images/br.png'
import usFlag from '@/assets/images/us.png'
import '@/assets/lang-dropdown.css'
import '@/assets/app.css'
import '@/assets/rule-box.css'
import axios from 'axios'

const userQuery = ref('')
const movieSuggestions = ref<Array<any>>([])
const selectedMovie = ref<any>(null)
const isLoading = ref(false)

const { locale, t } = useI18n()
const showDropdown = ref(false)

const languages = [
  { code: 'pt-BR', label: 'Português', flag: brFlag },
  { code: 'en', label: 'English', flag: usFlag }
]

function toggleLanguageDropdown() {
  showDropdown.value = !showDropdown.value
}

function selectLanguage(code: string) {
  locale.value = code
  showDropdown.value = false
}

function selectMovie(movie: any) {
  selectedMovie.value = movie
}

async function suggestMovie() {
  isLoading.value = true
  movieSuggestions.value = []
  try {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await fetch(`${apiUrl}/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: userQuery.value, language: locale.value })
    })
    if (!response.ok) throw new Error('Failed to fetch suggestions')
    const movies = await response.json()
    movieSuggestions.value = movies
  } catch (error) {
    movieSuggestions.value = []
  } finally {
    isLoading.value = false
  }
}

const activeTab = ref('search') // 'search', 'trending', 'popular'
const trendingPeriod = ref('day') // 'day' or 'week'
const trendingMovies = ref([])
const popularMovies = ref([])

async function fetchTrending() {
  const apiUrl = import.meta.env.VITE_API_URL
  const response = await fetch(`${apiUrl}/tmdb/trending?period=${trendingPeriod.value}&language=${locale.value}`)
  trendingMovies.value = await response.json()
}

async function fetchPopular() {
  const apiUrl = import.meta.env.VITE_API_URL
  const response = await fetch(`${apiUrl}/tmdb/popular?language=${locale.value}`)
  popularMovies.value = await response.json()
}

watch([activeTab, trendingPeriod, locale], async ([tab]) => {
  if (tab === 'trending') await fetchTrending()
  if (tab === 'popular') await fetchPopular()
})

const autoTextarea = ref<HTMLTextAreaElement | null>(null)
function autoResize() {
  const el = autoTextarea.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }
}
onMounted(() => {
  autoResize()
})
watch(userQuery, () => {
  autoResize()
})

watch(locale, (newLocale, oldLocale) => {
  if (userQuery.value.trim()) {
    suggestMovie();
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleEsc)
})
function handleEsc(e) {
  if (e.key === 'Escape' && selectedMovie.value) {
    selectedMovie.value = null
  }
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
      <span class="cine">Cine</span><span class="matcha">matcha</span>
    </h1>
    <div class="tabs">
      <button :class="{active: activeTab === 'search'}" @click="activeTab = 'search'">{{$t('tab.search')}}</button>
      <button :class="{active: activeTab === 'trending'}" @click="activeTab = 'trending'">{{$t('tab.trending')}}</button>
      <button :class="{active: activeTab === 'popular'}" @click="activeTab = 'popular'">{{$t('tab.popular')}}</button>
    </div>
    <div v-if="activeTab === 'trending'" class="sub-tabs">
      <button :class="{active: trendingPeriod === 'day'}" @click="trendingPeriod = 'day'">{{$t('tab.today')}}</button>
      <button :class="{active: trendingPeriod === 'week'}" @click="trendingPeriod = 'week'">{{$t('tab.week')}}</button>
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
          style="resize: none; overflow: hidden;"
        />
        <button @click="suggestMovie" :disabled="isLoading || !userQuery.trim()">
          <span v-if="!isLoading">{{ $t('button') }}</span>
          <span v-else>...</span>
        </button>
      </div>
      <div class="suggestions">
        <h2>{{ $t('suggestions') }}</h2>
        <div v-if="movieSuggestions.length === 0 && !isLoading" class="no-results">{{ $t('noResults') }}</div>
        <div v-else class="suggestion-list">
          <div v-for="(movie, idx) in movieSuggestions" :key="idx" class="suggestion-item" @click="selectMovie(movie)" style="cursor:pointer">
            <img :src="movie.poster" :alt="movie.title + ' poster'" class="movie-img" @error="(e) => ((e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg')" />
            <div class="movie-title">{{ movie.title }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="activeTab === 'trending'">
      <div class="trending-list">
        <div v-for="movie in trendingMovies" :key="movie.id" class="trending-item">
          <img :src="movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : ''" :alt="movie.title" />
          <div class="movie-title">{{ movie.title }}</div>
          <div class="movie-date">{{ movie.release_date }}</div>
        </div>
      </div>
    </div>
    <div v-else-if="activeTab === 'popular'">
      <div class="popular-list">
        <div v-for="movie in popularMovies" :key="movie.id" class="popular-item">
          <img :src="movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : ''" :alt="movie.title" />
          <div class="movie-title">{{ movie.title }}</div>
          <div class="movie-date">{{ movie.release_date }}</div>
        </div>
      </div>
    </div>
    <Teleport to="body">
      <div v-if="selectedMovie">
        <div class="modal-backdrop"></div>
        <div
          class="movie-details rule-box"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-desc"
        >
          <div class="details-header">
            <h3 id="modal-title" class="movie-title">{{ selectedMovie.title }}</h3>
            <button class="close-btn" @click="selectedMovie = null" aria-label="Fechar detalhes">&times;</button>
          </div>
          <p id="modal-desc" class="movie-overview">{{ selectedMovie.overview }}</p>
          <iframe
            v-if="selectedMovie.trailer"
            :src="selectedMovie.trailer.replace('watch?v=', 'embed/')"
            width="100%"
            height="225"
            frameborder="0"
            allowfullscreen
            style="margin-bottom: 18px;"
          ></iframe>
        </div>
      </div>
    </Teleport>
  </div>
</template>

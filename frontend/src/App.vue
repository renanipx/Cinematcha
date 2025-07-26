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
  const response = await fetch(`${import.meta.env.VITE_API_URL}/suggest/tmdb/trending?period=${trendingPeriod.value}&language=${locale.value}`)
  trendingMovies.value = await response.json()
}

async function fetchPopular() {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/suggest/tmdb/popular?language=${locale.value}`)
  popularMovies.value = await response.json()
}

watch([activeTab, locale], async ([tab]) => {
  if (tab === 'trending') await fetchTrending();
  if (tab === 'popular') await fetchPopular();
})

watch(trendingPeriod, async () => {
  if (activeTab.value === 'trending') await fetchTrending();
});

const autoTextarea = ref<HTMLTextAreaElement | null>(null)
function autoResize() {
  const el = autoTextarea.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }
}
onMounted(() => {
  fetchTrending(); 
  fetchPopular();  
  autoResize();
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

const showProvidersModal = ref(false)
const providers = ref<any[]>([])
const providersLoading = ref(false)
const providersError = ref('')

function getCountryFromLocale(locale) {
  if (locale === 'pt-BR') return 'BR'
  if (locale === 'en') return 'US'
  return 'US'
}

async function showProviders(movie: any) {
  showProvidersModal.value = true
  providersLoading.value = true
  providersError.value = ''
  providers.value = []
  try {
    const country = getCountryFromLocale(locale.value)
    const apiUrl = import.meta.env.VITE_API_URL
    const res = await fetch(`${apiUrl}/suggest/tmdb/providers/${movie.id}?country=${country}`)
    if (!res.ok) throw new Error('Failed to fetch providers')
    providers.value = await res.json()
  } catch (e) {
    providersError.value = 'Error fetching providers.'
  } finally {
    providersLoading.value = false
  }
}

function closeProvidersModal() {
  showProvidersModal.value = false
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
          <div v-for="(movie, idx) in movieSuggestions" :key="idx" class="suggestion-item" @click="selectMovie(movie)" style="cursor:pointer; position:relative">
            <img :src="movie.poster" :alt="movie.title + ' poster'" class="movie-img" @error="(e) => ((e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg')" />
            <div class="movie-title">{{ movie.title }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="activeTab === 'trending'">
      <div class="trending-list">
        <div v-for="movie in trendingMovies" :key="movie.id" class="suggestion-item" @click="selectMovie(movie)" style="cursor:pointer">
          <img :src="movie.poster" :alt="movie.title" class="movie-img" />
          <div class="movie-title">{{ movie.title }}</div>
        </div>
      </div>
    </div>
    <div v-else-if="activeTab === 'popular'">
      <div class="popular-list">
        <div v-for="movie in popularMovies" :key="movie.id" class="suggestion-item" @click="selectMovie(movie)" style="cursor:pointer">
          <img :src="movie.poster" :alt="movie.title" class="movie-img" />
          <div class="movie-title">{{ movie.title }}</div>
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
            <button class="close-btn" @click="selectedMovie = null" aria-label="Close">&times;</button>
          </div>
          <p id="modal-desc" class="movie-overview">{{ selectedMovie.overview }}</p>
          <button
            class="watch-providers-btn"
            @click="showProviders(selectedMovie)"
            style="margin: 12px 0; background: #222; color: #fff; border-radius: 6px; padding: 8px 16px; font-size: 1em; cursor: pointer; border: none;"
          >
            🎬 {{ $t('whereToWatch') }}
          </button>
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
    <Teleport to="body">
      <div v-if="showProvidersModal">
        <div class="modal-backdrop" @click="closeProvidersModal"></div>
        <div class="movie-details rule-box" style="min-width:320px;max-width:400px" role="dialog" aria-modal="true">
          <div class="details-header">
            <h3 class="movie-title">{{ $t('whereToWatch') }}</h3>
            <button class="close-btn" @click="closeProvidersModal" aria-label="Close">&times;</button>
          </div>
          <div v-if="providersLoading" style="text-align:center;padding:24px 0">Loading...</div>
          <div v-else-if="providersError" style="color:red">{{ providersError }}</div>
          <div v-else-if="providers.length === 0" style="text-align:center;padding:24px 0">
            This movie is not currently available for streaming, rental, or purchase in your region.
          </div>
          <div v-else class="providers-list" style="display:flex;flex-direction:column;gap:12px">
            <div v-for="provider in providers" :key="provider.name" style="display:flex;align-items:center;gap:12px">
              <img :src="provider.icon" :alt="provider.name" style="width:32px;height:32px;border-radius:6px;background:#fff" />
              <a :href="provider.url" target="_blank" rel="noopener" style="font-weight:bold;text-decoration:none">{{ provider.name }}</a>
              <span style="font-size:0.95em;color:#888">({{ provider.type === 'stream' ? 'Streaming' : provider.type === 'rent' ? 'Rent' : 'Buy' }})</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

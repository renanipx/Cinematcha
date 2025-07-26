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
  // Always reload trending and popular when language changes
  fetchTrending();
  fetchPopular();
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

function getConsolidatedProviders() {
  const providerMap = new Map();
  
  // Group providers by name
  for (const provider of providers.value) {
    if (!providerMap.has(provider.name)) {
      providerMap.set(provider.name, {
        name: provider.name,
        icon: provider.icon,
        url: provider.url,
        hasStreaming: false,
        hasRent: false,
        hasBuy: false
      });
    }
    
    const consolidated = providerMap.get(provider.name);
    if (provider.type === 'stream' || provider.type === 'flatrate') {
      consolidated.hasStreaming = true;
    } else if (provider.type === 'rent') {
      consolidated.hasRent = true;
    } else if (provider.type === 'buy') {
      consolidated.hasBuy = true;
    }
  }
  
  return Array.from(providerMap.values());
}

function openProviderUrl(url: string) {
  window.open(url, '_blank');
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
          style="resize: none; overflow: hidden; font-size: 1rem;"
        />
        <button @click="suggestMovie" :disabled="isLoading || !userQuery.trim()" style="font-size: 1rem;">
          <span v-if="!isLoading">{{ $t('button') }}</span>
          <span v-else>...</span>
        </button>
      </div>
      <div class="suggestions">
        <h2 style="font-size: 1.5rem; font-weight: 600;">{{ $t('suggestions') }}</h2>
        <div v-if="movieSuggestions.length === 0 && !isLoading" class="no-results">{{ $t('noResults') }}</div>
        <div v-else class="suggestion-list">
          <div v-for="(movie, idx) in movieSuggestions" :key="idx" class="suggestion-item" @click="selectMovie(movie)" style="cursor:pointer; position:relative; background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid #e8e8e8; hover:box-shadow: 0 8px 25px rgba(0,0,0,0.15); hover:transform: translateY(-4px); hover:border-color: #27ae60;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <img :src="movie.poster" :alt="movie.title + ' poster'" class="movie-img" style="width: 60px; height: 90px; object-fit: cover; border-radius: 8px; box-shadow: 0 3px 8px rgba(0,0,0,0.15); transition: transform 0.3s ease;" @error="(e) => ((e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg')" />
              <div style="flex: 1;">
                <div class="movie-title" style="font-size: 1.1rem; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; transition: color 0.3s ease;">{{ movie.title }}</div>
                <div style="display: flex; align-items: center; gap: 12px; color: #7f8c8d; font-size: 0.85rem;">
                  <span>{{ movie.year || movie.releaseDate?.split('-')[0] || 'N/A' }}</span>
                  <span v-if="movie.rating && movie.rating > 0" style="color: #f39c12; font-weight: 500;">⭐ {{ movie.rating }}/10</span>
                  <span v-if="movie.voteCount && movie.voteCount > 0" style="color: #5a6c7d;">({{ movie.voteCount.toLocaleString() }} {{ $t('votes') }})</span>
                </div>
              </div>
            </div>
            <div style="position: absolute; top: 8px; right: 8px; background: #27ae60; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; box-shadow: 0 2px 4px rgba(39, 174, 96, 0.3); transition: all 0.3s ease;">{{ idx + 1 }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="activeTab === 'trending'">
      <div class="trending-list">
        <div v-for="movie in trendingMovies" :key="movie.id" class="suggestion-item" @click="selectMovie(movie)" style="cursor:pointer; background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid #e8e8e8; hover:box-shadow: 0 8px 25px rgba(0,0,0,0.15); hover:transform: translateY(-4px); hover:border-color: #27ae60;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img :src="movie.poster" :alt="movie.title" class="movie-img" style="width: 60px; height: 90px; object-fit: cover; border-radius: 8px; box-shadow: 0 3px 8px rgba(0,0,0,0.15); transition: transform 0.3s ease;" />
            <div style="flex: 1;">
              <div class="movie-title" style="font-size: 1.1rem; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; transition: color 0.3s ease;">{{ movie.title }}</div>
              <div style="display: flex; align-items: center; gap: 12px; color: #7f8c8d; font-size: 0.85rem;">
                <span>{{ movie.year || movie.releaseDate?.split('-')[0] || 'N/A' }}</span>
                <span v-if="movie.rating && movie.rating > 0" style="color: #f39c12; font-weight: 500;">⭐ {{ movie.rating }}/10</span>
                <span v-if="movie.voteCount && movie.voteCount > 0" style="color: #5a6c7d;">({{ movie.voteCount.toLocaleString() }} {{ $t('votes') }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="activeTab === 'popular'">
      <div class="popular-list">
        <div v-for="movie in popularMovies" :key="movie.id" class="suggestion-item" @click="selectMovie(movie)" style="cursor:pointer; background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid #e8e8e8; hover:box-shadow: 0 8px 25px rgba(0,0,0,0.15); hover:transform: translateY(-4px); hover:border-color: #27ae60;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img :src="movie.poster" :alt="movie.title" class="movie-img" style="width: 60px; height: 90px; object-fit: cover; border-radius: 8px; box-shadow: 0 3px 8px rgba(0,0,0,0.15); transition: transform 0.3s ease;" />
            <div style="flex: 1;">
              <div class="movie-title" style="font-size: 1.1rem; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; transition: color 0.3s ease;">{{ movie.title }}</div>
              <div style="display: flex; align-items: center; gap: 12px; color: #7f8c8d; font-size: 0.85rem;">
                <span>{{ movie.year || movie.releaseDate?.split('-')[0] || 'N/A' }}</span>
                <span v-if="movie.rating && movie.rating > 0" style="color: #f39c12; font-weight: 500;">⭐ {{ movie.rating }}/10</span>
                <span v-if="movie.voteCount && movie.voteCount > 0" style="color: #5a6c7d;">({{ movie.voteCount.toLocaleString() }} {{ $t('votes') }})</span>
              </div>
            </div>
          </div>
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
        <div class="movie-details rule-box" style="min-width:450px;max-width:550px" role="dialog" aria-modal="true">
          <div class="details-header" style="text-align:center;position:relative">
            <h3 class="movie-title" style="margin:0;padding-right:40px">{{ $t('whereToWatch') }}</h3>
            <button class="close-btn" @click="closeProvidersModal" aria-label="Close" style="position:absolute;right:0;top:50%;transform:translateY(-50%)">&times;</button>
          </div>
          <div v-if="providersLoading" style="text-align:center;padding:24px 0">Loading...</div>
          <div v-else-if="providersError" style="color:red">{{ providersError }}</div>
          <div v-else-if="providers.length === 0" style="text-align:center;padding:24px 0">
            This movie is not currently available for streaming, rental, or purchase in your region.
          </div>
          <div v-else class="providers-list" style="display:flex;flex-direction:column;gap:16px">
            <div v-for="provider in getConsolidatedProviders()" :key="provider.name" 
                 style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:8px;background:#f8f9fa;transition:all 0.2s;cursor:pointer;border:1px solid transparent"
                 @mouseenter="$event.target.style.borderColor='#4CAF50'"
                 @mouseleave="$event.target.style.borderColor='transparent'"
                 @click="openProviderUrl(provider.url)">
              <img :src="provider.icon" :alt="provider.name" style="width:32px;height:32px;border-radius:6px;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,0.1)" />
              <div style="flex:1">
                <div style="font-weight:600;color:#333;font-size:14px">{{ provider.name }}</div>
                <div style="font-size:12px;color:#666">
                  <span v-if="provider.hasStreaming" style="color:#4CAF50;margin-right:8px">Streaming</span>
                  <span v-if="provider.hasRent" style="color:#FF9800;margin-right:8px">Rent</span>
                  <span v-if="provider.hasBuy" style="color:#2196F3">Buy</span>
                </div>
              </div>
              <div style="font-size:12px;color:#999">→</div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

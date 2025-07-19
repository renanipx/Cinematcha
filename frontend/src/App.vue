<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import brFlag from '@/assets/images/br.png'
import usFlag from '@/assets/images/us.png'
import '@/assets/lang-dropdown.css'
import '@/assets/app.css'

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
      body: JSON.stringify({ query: userQuery.value })
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
    <div v-if="selectedMovie" class="movie-details" style="position:fixed; top:60px; right:40px; width:400px; background:#fff; box-shadow:0 2px 8px rgba(0,0,0,0.1); padding:24px; border-radius:12px; z-index:10;">
      <h3>{{ selectedMovie.title }}</h3>
      <p>{{ selectedMovie.overview }}</p>
      <iframe
        v-if="selectedMovie.trailer"
        :src="selectedMovie.trailer.replace('watch?v=', 'embed/')"
        width="100%"
        height="225"
        frameborder="0"
        allowfullscreen
      ></iframe>
      <button style="margin-top:12px" @click="selectedMovie = null">Fechar</button>
    </div>
  </div>
</template>

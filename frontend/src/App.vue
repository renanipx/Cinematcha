<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import brFlag from '@/assets/images/br.png'
import usFlag from '@/assets/images/us.png'
import '@/assets/lang-dropdown.css'
import '@/assets/app.css'

const userQuery = ref('')
const movieSuggestions = ref<Array<{ titleKey: string; image: string }>>([])
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

async function suggestMovie() {
  isLoading.value = true
  movieSuggestions.value = []
  setTimeout(() => {
    // Mock suggestions with i18n keys
    movieSuggestions.value = [
      { titleKey: 'movie.inception', image: 'https://image.tmdb.org/t/p/w200/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg' },
      { titleKey: 'movie.interstellar', image: 'https://image.tmdb.org/t/p/w200/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg' }
    ]
    isLoading.value = false
  }, 1200)
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
        <div v-for="(movie, idx) in movieSuggestions" :key="idx" class="suggestion-item">
          <img :src="movie.image" :alt="$t(movie.titleKey) + ' poster'" class="movie-img" @error="(e) => ((e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg')" />          <div class="movie-title">{{ $t(movie.titleKey) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

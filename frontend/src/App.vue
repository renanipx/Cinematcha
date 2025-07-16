<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const userQuery = ref('')
const movieSuggestions = ref<Array<{ titleKey: string; image: string }>>([])
const isLoading = ref(false)

const { locale, t } = useI18n()

function toggleLanguage() {
  locale.value = locale.value === 'en' ? 'pt-BR' : 'en'
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
</script>

<template>
  <div class="container">
    <div class="lang-switch">
      <button
        @click="toggleLanguage"
        class="lang-btn"
        :title="locale === 'en' ? 'Switch to Portuguese' : 'Mudar para Inglês'"
        aria-label="Switch language"
      >
        <span v-if="locale === 'en'">🇺🇸</span>
        <span v-else>🇧🇷</span>
      </button>
    </div>
    <h1>Cinematcha</h1>
    <div class="form-area">
      <input
        v-model="userQuery"
        :placeholder="$t('placeholder')"
        class="query-input"
        @keyup.enter="suggestMovie"
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
          <img :src="movie.image" :alt="$t(movie.titleKey)" class="movie-img" />
          <div class="movie-title">{{ $t(movie.titleKey) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 420px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  text-align: center;
}
.lang-switch {
  text-align: right;
  margin-bottom: 1rem;
}
.lang-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  margin-bottom: 1rem;
  outline: none;
  transition: transform 0.1s;
}
.lang-btn:active {
  transform: scale(0.95);
}
.form-area {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}
.query-input {
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
}
button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background: #42b983;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
button:disabled {
  background: #b2dfdb;
  cursor: not-allowed;
}
.suggestions {
  margin-top: 2rem;
}
.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.suggestion-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 0.5rem 1rem;
}
.movie-img {
  width: 60px;
  border-radius: 6px;
}
.movie-title {
  font-size: 1.1rem;
  font-weight: 500;
}
.no-results {
  color: #aaa;
  margin-top: 1rem;
}
</style>

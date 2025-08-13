<template>
  <div class="suggestions">
    <h2 style="font-size: 1.5rem; font-weight: 600;">{{ $t('suggestions') }}</h2>
    <div v-if="movieSuggestions.length === 0 && !isLoading" class="no-results">{{ $t('noResults') }}</div>
    <div v-else class="suggestion-list">
      <div v-for="(movie, idx) in movieSuggestions" :key="idx" class="suggestion-item" @click="$emit('selectMovie', movie)" style="cursor:pointer; position:relative; background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);">
        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
          <img :src="movie.poster" :alt="movie.title + ' poster'" class="movie-img" style="width: 60px; height: 90px; object-fit: cover; border-radius: 8px; box-shadow: 0 3px 8px rgba(0,0,0,0.15); transition: transform 0.3s ease; flex-shrink: 0;" @error="(e) => ((e.target as HTMLImageElement).src = '')" />
          <div style="flex: 1; min-width: 0;">
            <div class="movie-title" style="font-size: 1.1rem; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; transition: color 0.3s ease; word-wrap: break-word;">{{ movie.title }}</div>
            <div style="display: flex; align-items: center; gap: 12px; color: #7f8c8d; font-size: 0.85rem; flex-wrap: wrap;">
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
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
const props = defineProps<{ movieSuggestions: Array<any>, isLoading: boolean }>()
defineEmits(['selectMovie'])
</script>

<style scoped>
.suggestions {
  margin-top: 1.5rem;
}
.no-results {
  color: #888;
  font-size: 1rem;
  margin-top: 1rem;
}
.suggestion-list {
  margin-top: 1rem;
}
</style>
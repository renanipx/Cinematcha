<template>
  <div class="popular-list">
    <div v-for="movie in popularMovies" :key="movie.id" class="suggestion-item" @click="$emit('selectMovie', movie)" style="cursor:pointer; background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);">
      <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
        <img :src="movie.poster" :alt="movie.title" class="movie-img" style="width: 60px; height: 90px; object-fit: cover; border-radius: 8px; box-shadow: 0 3px 8px rgba(0,0,0,0.15); transition: transform 0.3s ease; flex-shrink: 0;" />
        <div style="flex: 1; min-width: 0;">
          <div class="movie-title" style="font-size: 1.1rem; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; transition: color 0.3s ease; word-wrap: break-word;">{{ movie.title }}</div>
          <div style="display: flex; align-items: center; gap: 12px; color: #7f8c8d; font-size: 0.85rem; flex-wrap: wrap;">
            <span>{{ movie.year || movie.releaseDate?.split('-')[0] || 'N/A' }}</span>
            <span v-if="movie.rating && movie.rating > 0" style="color: #f39c12; font-weight: 500;">⭐ {{ movie.rating }}/10</span>
            <span v-if="movie.voteCount && movie.voteCount > 0" style="color: #5a6c7d;">({{ movie.voteCount.toLocaleString() }} {{ $t('votes') }})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
const props = defineProps<{ popularMovies: Array<any> }>()
defineEmits(['selectMovie'])
</script>

<style scoped>
.popular-list {
  margin-top: 1.5rem;
}
</style>
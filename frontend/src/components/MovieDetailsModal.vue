<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  movie: any
  locale: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'show-providers', movie: any, locale: string): void
}>()
</script>

<template>
  <div>
    <div class="modal-backdrop" @click="emit('close')"></div>
    <div
      class="movie-details rule-box"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      @click.stop
    >
      <div class="details-header">
        <h3 id="modal-title" style="text-align: center" class="movie-title">{{ movie.title }}</h3>
        <button class="close-btn" @click="emit('close')" aria-label="Close">&times;</button>
      </div>
      <p id="modal-desc" class="movie-overview">{{ movie.overview }}</p>
      <button
        class="watch-providers-btn"
        @click="emit('show-providers', movie, locale)"
        style="margin: 12px 0; background: #222; color: #fff; border-radius: 6px; padding: 8px 16px; font-size: 1em; cursor: pointer; border: none;"
      >
        🎬 {{ $t('whereToWatch') }}
      </button>
      <iframe
        v-if="movie.trailer"
        :src="movie.trailer.replace('watch?v=', 'embed/')"
        width="100%"
        height="225"
        frameborder="0"
        allowfullscreen
        style="margin-bottom: 18px;"
      ></iframe>
    </div>
  </div>
</template>
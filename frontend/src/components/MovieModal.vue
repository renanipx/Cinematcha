<template>
  <Teleport to="body">
    <div v-if="selectedMovie">
      <div class="modal-backdrop" @click="$emit('close')"></div>
      <div class="movie-details rule-box" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc" @click.stop>
        <div class="details-header">
          <h3 id="modal-title" style="text-align: center" class="movie-title">{{ selectedMovie.title }}</h3>
          <button class="close-btn" @click="$emit('close')" aria-label="Close">&times;</button>
        </div>
        <p id="modal-desc" class="movie-overview">{{ selectedMovie.overview }}</p>
        <button class="watch-providers-btn" @click="$emit('showProviders', selectedMovie)" style="margin: 12px 0; background: #222; color: #fff; border-radius: 6px; padding: 8px 16px; font-size: 1em; cursor: pointer; border: none;">
          🎬 {{ $t('whereToWatch') }}
        </button>
        <iframe v-if="selectedMovie.trailer" :src="selectedMovie.trailer.replace('watch?v=', 'embed/')" width="100%" height="225" frameborder="0" allowfullscreen style="margin-bottom: 18px;"></iframe>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
const props = defineProps<{ selectedMovie: any }>()
defineEmits(['close', 'showProviders'])
</script>

<style scoped>
.movie-details {
  z-index: 1000;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.4);
  z-index: 999;
}
</style>
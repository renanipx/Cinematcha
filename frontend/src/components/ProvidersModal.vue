<template>
  <div v-if="showProvidersModal">
    <div class="modal-backdrop" @click="$emit('close')"></div>
    <div class="movie-details rule-box" style="min-width:450px;max-width:550px" role="dialog" aria-modal="true" @click.stop>
      <div class="details-header" style="text-align:center;position:relative">
        <h3 class="movie-title" style="margin:0;padding-right:40px;text-align:center">{{ $t('whereToWatch') }}</h3>
        <button class="close-btn" @click="$emit('close')" aria-label="Close" style="position:absolute;right:0;top:50%;transform:translateY(-50%)">&times;</button>
      </div>
      <div v-if="loading" style="text-align:center;padding:24px 0">Loading...</div>
      <div v-else-if="error" style="color:red">{{ error }}</div>
      <div v-else-if="providers.length === 0" style="text-align:center;padding:24px 0">
        This movie is not currently available for streaming, rental, or purchase in your region.
      </div>
      <div v-else class="providers-list">
        <div v-for="provider in consolidatedProviders" :key="provider.name" @click="$emit('provider-click', provider.url)">
          <img :src="provider.icon" :alt="provider.name" />
          <div class="provider-info">
            <div class="provider-name">{{ provider.name }}</div>
            <div class="provider-options">
              <span v-if="provider.hasStreaming" style="color:#4CAF50">Streaming</span>
              <span v-if="provider.hasRent" style="color:#FF9800">Rent</span>
              <span v-if="provider.hasBuy" style="color:#2196F3">Buy</span>
            </div>
          </div>
          <div class="provider-arrow">→</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
const props = defineProps<{ showProvidersModal: boolean, providers: Array<any>, loading: boolean, error: string }>();
defineEmits(['close', 'provider-click'])

function getConsolidatedProviders(providers: Array<any>) {
  const providerMap = new Map()
  for (const provider of providers) {
    if (!providerMap.has(provider.name)) {
      providerMap.set(provider.name, {
        name: provider.name,
        icon: provider.icon,
        url: provider.url,
        hasStreaming: false,
        hasRent: false,
        hasBuy: false
      })
    }
    const consolidated = providerMap.get(provider.name)
    if (provider.type === 'stream' || provider.type === 'flatrate') {
      consolidated.hasStreaming = true
    } else if (provider.type === 'rent') {
      consolidated.hasRent = true
    } else if (provider.type === 'buy') {
      consolidated.hasBuy = true
    }
  }
  return Array.from(providerMap.values())
}

const consolidatedProviders = computed(() => getConsolidatedProviders(props.providers))
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
<template>
  <div class="tabs">
    <button :class="{active: activeTab === 'search'}" @click="$emit('update:activeTab', 'search')">{{$t('tab.search')}}</button>
    <button :class="{active: activeTab === 'trending'}" @click="$emit('update:activeTab', 'trending')">{{$t('tab.trending')}}</button>
    <button :class="{active: activeTab === 'popular'}" @click="$emit('update:activeTab', 'popular')">{{$t('tab.popular')}}</button>
  </div>
  <div v-if="activeTab === 'trending'" class="sub-tabs">
    <button :class="{active: trendingPeriod === 'day'}" @click="$emit('update:trendingPeriod', 'day')">{{$t('tab.today')}}</button>
    <button :class="{active: trendingPeriod === 'week'}" @click="$emit('update:trendingPeriod', 'week')">{{$t('tab.week')}}</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
const props = defineProps<{ activeTab: string, trendingPeriod: string }>()
defineEmits(['update:activeTab', 'update:trendingPeriod'])
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.tabs button.active {
  font-weight: bold;
  border-bottom: 2px solid #27ae60;
}
.sub-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.sub-tabs button.active {
  font-weight: bold;
  border-bottom: 2px solid #27ae60;
}
</style>
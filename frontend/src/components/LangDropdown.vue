<template>
  <div class="lang-dropdown">
    <button class="lang-btn" @click="toggleDropdown" :title="$t('changeLang')" aria-label="Switch language">
      <img :src="currentFlag" :alt="currentLabel" class="flag-icon" />
    </button>
    <div v-if="showDropdown" class="dropdown">
      <div v-for="lang in languages" :key="lang.code" class="dropdown-item" @click="selectLanguage(lang.code)">
        <img :src="lang.flag" :alt="lang.label" class="flag-icon" />
        <span>{{ lang.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import brFlag from '@/assets/images/br.png'
import usFlag from '@/assets/images/us.png'

const { locale } = useI18n()
const showDropdown = ref(false)

const languages = [
  { code: 'pt-BR', label: 'Português', flag: brFlag },
  { code: 'en', label: 'English', flag: usFlag }
]

const currentFlag = computed(() => languages.find(l => l.code === locale.value)?.flag)
const currentLabel = computed(() => languages.find(l => l.code === locale.value)?.label)

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}
function selectLanguage(code: string) {
  locale.value = code
  showDropdown.value = false
}
</script>

<style scoped>
@import '@/assets/lang-dropdown.css';
</style>
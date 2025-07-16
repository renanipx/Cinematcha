import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ptBR from './locales/pt-BR.json'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    'pt-BR': ptBR
  }
})

createApp(App).use(i18n).mount('#app')

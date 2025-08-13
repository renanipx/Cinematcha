import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import brFlag from '@/assets/images/br.png'
import usFlag from '@/assets/images/us.png'

export function useLanguage() {
  const { locale } = useI18n()
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

  return {
    locale,
    showDropdown,
    languages,
    toggleLanguageDropdown,
    selectLanguage
  }
}
import { ref, watch } from 'vue'
import { api } from '@/services/api'

export function useMovies() {
  const movieSuggestions = ref<Array<any>>([])
  const trendingMovies = ref([])
  const popularMovies = ref([])
  const selectedMovie = ref<any>(null)
  const isLoading = ref(false)

  // Providers state
  const showProvidersModal = ref(false)
  const providers = ref<any[]>([])
  const providersLoading = ref(false)
  const providersError = ref('')

  async function suggestMovie(query: string, language: string) {
    isLoading.value = true
    movieSuggestions.value = []
    try {
      movieSuggestions.value = await api.suggestMovies(query, language)
    } catch (error) {
      movieSuggestions.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTrending(period: string, language: string) {
    trendingMovies.value = await api.getTrendingMovies(period, language)
  }

  async function fetchPopular(language: string) {
    popularMovies.value = await api.getPopularMovies(language)
  }

  function selectMovie(movie: any) {
    selectedMovie.value = movie
  }

  function closeMovie() {
    selectedMovie.value = null
  }

  function getCountryFromLocale(locale: string) {
    if (locale === 'pt-BR') return 'BR'
    return 'US'
  }

  async function showProviders(movie: any, locale: string) {
    showProvidersModal.value = true
    providersLoading.value = true
    providersError.value = ''
    providers.value = []
    try {
      const country = getCountryFromLocale(locale)
      providers.value = await api.getMovieProviders(movie.id, country)
    } catch (e) {
      providersError.value = 'Error fetching providers.'
    } finally {
      providersLoading.value = false
    }
  }

  function closeProvidersModal() {
    showProvidersModal.value = false
  }

  function getConsolidatedProviders() {
    const providerMap = new Map()
    
    for (const provider of providers.value) {
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

  function openProviderUrl(url: string) {
    window.open(url, '_blank')
  }

  return {
    movieSuggestions,
    trendingMovies,
    popularMovies,
    selectedMovie,
    isLoading,
    showProvidersModal,
    providers,
    providersLoading,
    providersError,
    suggestMovie,
    fetchTrending,
    fetchPopular,
    selectMovie,
    closeMovie,
    showProviders,
    closeProvidersModal,
    getConsolidatedProviders,
    openProviderUrl
  }
}
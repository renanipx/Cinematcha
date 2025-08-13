import { ref } from 'vue'

const API_URL = import.meta.env.VITE_API_URL

export const api = {
  async suggestMovies(prompt: string, locale: string) {
    const response = await fetch(`${API_URL}/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, locale })
    })
    if (!response.ok) throw new Error('Failed to fetch suggestions')
    return response.json()
  },

  async getTrendingMovies(period: string, language: string) {
    const response = await fetch(`${API_URL}/suggest/tmdb/trending?period=${period}&language=${language}`)
    return response.json()
  },

  async getPopularMovies(language: string) {
    const response = await fetch(`${API_URL}/suggest/tmdb/popular?language=${language}`)
    return response.json()
  },

  async getMovieProviders(movieId: number, country: string) {
    const response = await fetch(`${API_URL}/suggest/tmdb/providers/${movieId}?country=${country}`)
    if (!response.ok) throw new Error('Failed to fetch providers')
    return response.json()
  }
}
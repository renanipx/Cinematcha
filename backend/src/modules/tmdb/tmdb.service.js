const axios = require('axios');
const config = require('../../config/env.config');

class TMDBService {
  constructor() {
    this.apiKey = config.tmdb.apiKey;
    this.baseUrl = config.tmdb.apiUrl;
  }

  async searchMovie(title, language = 'en-US') {
    const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(title)}&language=${language}`;
    const response = await axios.get(url);
    return response.data.results?.[0] || null;
  }

  async getMovieTrailer(movieId, language = 'en-US') {
    const url = `${this.baseUrl}/movie/${movieId}/videos?api_key=${this.apiKey}&language=${language}`;
    const response = await axios.get(url);
    return (response.data.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube');
  }

  async getTrendingMovies(period = 'day', language = 'en-US') {
    const url = `${this.baseUrl}/trending/movie/${period}?api_key=${this.apiKey}&language=${language}`;
    const response = await axios.get(url);
    return response.data.results || [];
  }

  async getPopularMovies(language = 'en-US') {
    const url = `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=${language}`;
    const response = await axios.get(url);
    return response.data.results || [];
  }

  async getWatchProviders(movieId, country = 'BR') {
    const url = `${this.baseUrl}/movie/${movieId}/watch/providers?api_key=${this.apiKey}`;
    const response = await axios.get(url);
    return response.data.results?.[country] || null;
  }

  formatMovieDetails(movie, trailer = null) {
    return {
      title: movie.title,
      id: movie.id,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      overview: movie.overview,
      trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      releaseDate: movie.release_date,
      rating: Math.round(movie.vote_average * 10) / 10,
      voteCount: movie.vote_count,
      popularity: movie.popularity,
      originalTitle: movie.original_title,
      hasVideo: movie.video
    };
  }

  formatProviders(data) {
    if (!data) return [];
    const allProviders = [];

    if (data.flatrate) {
      for (const p of data.flatrate) {
        allProviders.push({
          name: p.provider_name,
          type: 'stream',
          url: data.link,
          icon: `https://image.tmdb.org/t/p/w92${p.logo_path}`
        });
      }
    }
    if (data.rent) {
      for (const p of data.rent) {
        allProviders.push({
          name: p.provider_name,
          type: 'rent',
          url: data.link,
          icon: `https://image.tmdb.org/t/p/w92${p.logo_path}`
        });
      }
    }
    if (data.buy) {
      for (const p of data.buy) {
        allProviders.push({
          name: p.provider_name,
          type: 'buy',
          url: data.link,
          icon: `https://image.tmdb.org/t/p/w92${p.logo_path}`
        });
      }
    }
    return allProviders;
  }
}

module.exports = new TMDBService();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../../config/env.config');
const tmdbService = require('../../tmdb/tmdb.service');

class SuggestService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  }

  async suggestMovies(preferences, language = 'en') {
    try {
      const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
      const isPt = language && language.toLowerCase().startsWith('pt');
      const prompt = (isPt ? config.prompts.pt : config.prompts.en).replace('{{preferences}}', JSON.stringify(preferences));
      const result = await model.generateContent(prompt);
      const responseText = (await result.response).text();
      const aiMovieNames = responseText.split(',').map(s => s.trim()).filter(Boolean);
      if (!aiMovieNames.length) throw new Error('No movie names returned by Gemini AI.');
      const locale = isPt ? 'pt-BR' : 'en-US';
      const movies = await Promise.all(aiMovieNames.map(async title => {
        const movie = await tmdbService.searchMovie(title, locale);
        if (!movie) return null;
        const trailer = await tmdbService.getMovieTrailer(movie.id, locale);
        return tmdbService.formatMovieDetails(movie, trailer);
      }));
      return movies.filter(Boolean);
    } catch (aiError) {
      throw new Error('Gemini AI service unavailable or returned no results: ' + aiError.message);
    }
  }

  async getTrendingMovies(locale = 'en') {
    const movies = await tmdbService.getTrendingMovies('day', locale === 'pt' ? 'pt-BR' : 'en-US');
    const moviesWithTrailers = await Promise.all(
      movies.map(async (movie) => {
        const trailer = await tmdbService.getMovieTrailer(movie.id, locale === 'pt' ? 'pt-BR' : 'en-US');
        return tmdbService.formatMovieDetails(movie, trailer);
      })
    );
    return moviesWithTrailers;
  }

  async getPopularMovies(locale = 'en') {
    const movies = await tmdbService.getPopularMovies(locale === 'pt' ? 'pt-BR' : 'en-US');
    const moviesWithTrailers = await Promise.all(
      movies.map(async (movie) => {
        const trailer = await tmdbService.getMovieTrailer(movie.id, locale === 'pt' ? 'pt-BR' : 'en-US');
        return tmdbService.formatMovieDetails(movie, trailer);
      })
    );
    return moviesWithTrailers;
  }

  async getWatchProviders(movieId) {
    const providers = await tmdbService.getWatchProviders(movieId);
    return tmdbService.formatProviders(providers);
  }
}

module.exports = new SuggestService();
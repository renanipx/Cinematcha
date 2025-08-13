const express = require('express');
const suggestService = require('../service/suggest.service');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { prompt, locale } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const movies = await suggestService.suggestMovies(prompt, locale);
    res.json(movies);
  } catch (error) {
    next(error);
  }
});

router.get('/tmdb/trending', async (req, res, next) => {
  try {
    const { locale } = req.query;
    const movies = await suggestService.getTrendingMovies(locale);
    res.json(movies);
  } catch (error) {
    next(error);
  }
});

router.get('/tmdb/popular', async (req, res, next) => {
  try {
    const { locale } = req.query;
    const movies = await suggestService.getPopularMovies(locale);
    res.json(movies);
  } catch (error) {
    next(error);
  }
});

router.get('/tmdb/providers/:movieId', async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const providers = await suggestService.getWatchProviders(movieId);
    res.json(providers);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
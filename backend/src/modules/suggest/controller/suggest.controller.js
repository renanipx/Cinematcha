const express = require('express');
const router = express.Router();
const suggestService = require('../service/suggest.service');

router.post('/', async (req, res) => {
  try {
    const { query, language } = req.body;
    const movies = await suggestService.suggestMovies({ query }, language); 
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tmdb/trending', async (req, res) => {
  try {
    const { period = 'day', language = 'en-US' } = req.query;
    const movies = await suggestService.getTrendingMovies(period, language);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tmdb/popular', async (req, res) => {
  try {
    const { language = 'en-US' } = req.query;
    const movies = await suggestService.getPopularMovies(language);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
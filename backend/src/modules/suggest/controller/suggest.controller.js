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

module.exports = router; 
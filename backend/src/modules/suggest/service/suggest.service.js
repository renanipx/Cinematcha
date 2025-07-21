const axios = require('axios');


async function fetchMovieDetailsFromTMDB(title, language = 'en-US') {
  const searchUrl = `${process.env.TMDB_API_URL}/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=${language}`;
  const searchRes = await axios.get(searchUrl);
  const movie = searchRes.data.results && searchRes.data.results[0];
  if (!movie) return null;

  // Search for trailer
  const videosUrl = `${process.env.TMDB_API_URL}/movie/${movie.id}/videos?api_key=${process.env.TMDB_API_KEY}&language=${language}`;
  const videosRes = await axios.get(videosUrl);
  const trailer = (videosRes.data.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube');

  return {
    title: movie.title,
    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    overview: movie.overview,
    trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
  };
}

async function suggestMovies(preferences, language = 'en-US') {
  try {
    // Check if API keys are configured
    if (!process.env.HUGGINGFACE_API_KEY || !process.env.TMDB_API_KEY) {
      throw new Error('API keys not configured. Please check your .env file.');
    }

    let movieNames = [];
    try {
      const prompt = `Suggest 5 popular movies available on TMDB based on preferences: ${JSON.stringify(preferences)}. Return only movie names separated by commas.`;
      const iaRes = await axios.post(process.env.HUGGINGFACE_API_URL, {
        inputs: prompt,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      const responseText = iaRes.data[0]?.generated_text || '';
      const aiMovieNames = responseText.split(',').map(s => s.trim()).filter(name => name.length > 0);
      if (aiMovieNames.length > 0) {
        movieNames = aiMovieNames;
      } else {
        throw new Error('No movie names returned by AI.');
      }
    } catch (aiError) {
      throw new Error('AI service unavailable or returned no results: ' + aiError.message);
    }

    // Validate and fetch details from TMDB
    const validatedMovies = [];
    for (const name of movieNames) {
      try {
        const details = await fetchMovieDetailsFromTMDB(name, language);
        if (details && details.poster && details.overview && details.trailer) {
          validatedMovies.push(details);
        }
      } catch (movieError) {
        console.log(`Error fetching details for ${name}:`, movieError.message);
      }
    }
    
    if (validatedMovies.length === 0) {
      throw new Error('No movies found. Please check your TMDB API key or the AI response.');
    }
    
    return validatedMovies;
  } catch (error) {
    throw new Error(`Suggestion service error: ${error.message}`);
  }
}

module.exports = { suggestMovies }; 
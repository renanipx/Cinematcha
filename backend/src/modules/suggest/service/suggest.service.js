const { GoogleGenerativeAI } = require('@google/generative-ai');
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
    id: movie.id,
    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    overview: movie.overview,
    trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
  };
}

async function suggestMovies(preferences, language = 'en-US') {
  try {
    if (!process.env.TMDB_API_KEY) {
      throw new Error('TMDB API key not configured. Please check your .env file.');
    }

    let movieNames = [];
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
      let prompt;
      if ((language && language.toLowerCase().startsWith('pt'))) {
        prompt = `O usuário solicitou filmes semelhantes a: "${JSON.stringify(preferences)}". 
                 Analise o gênero, o estilo, os temas centrais, a narrativa e o enredo desse filme. Com base nisso, recomende 10 filmes populares e recentes que tenham características semelhantes e que provavelmente existam na base do TMDB. Retorne apenas os títulos dos filmes, separados por vírgula.`;
      } else {
        prompt = `The user requested movies similar to: "${JSON.stringify(preferences)}". 
                 Analyze the genre, style, core themes, narrative, and plot of this movie. Based on that, recommend 10 recent and popular movies that share similar characteristics and most likely exist in the TMDB database. Return only the movie titles, separated by commas.`;
      }
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      const aiMovieNames = responseText.split(',').map(s => s.trim()).filter(name => name.length > 0);
      if (aiMovieNames.length > 0) {
        movieNames = aiMovieNames;
      } else {
        throw new Error('No movie names returned by Gemini AI.');
      }
    } catch (aiError) {
      throw new Error('Gemini AI service unavailable or returned no results: ' + aiError.message);
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
      throw new Error('No movies found. Please check your TMDB API key or the Gemini AI response.');
    }

    return validatedMovies;
  } catch (error) {
    throw new Error(`Suggestion service error: ${error.message}`);
  }
}

async function getTrendingMovies(period = 'day', language = 'en-US') {
  try {
    const url = `${process.env.TMDB_API_URL}/trending/movie/${period}?api_key=${process.env.TMDB_API_KEY}&language=en-US`;
    const res = await axios.get(url);
    const validatedMovies = [];
    for (const movie of res.data.results) {
      try {
        const details = await fetchMovieDetailsFromTMDB(movie.title, language);
        if (details && details.poster && details.overview && details.trailer) {
          validatedMovies.push(details);
        }
      } catch (movieError) {
        console.log(`Error fetching details for ${movie.title}:`, movieError.message);
      }
    }
    if (validatedMovies.length === 0) {
      throw new Error('No trending movies found with complete details.');
    }
    return validatedMovies;
  } catch (error) {
    throw new Error('Failed to fetch trending movies from TMDB: ' + error.message);
  }
}

async function getPopularMovies(language = 'en-US') {
  try {
    const url = `${process.env.TMDB_API_URL}/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=en-US`;
    const res = await axios.get(url);
    const validatedMovies = [];
    for (const movie of res.data.results) {
      try {
        const details = await fetchMovieDetailsFromTMDB(movie.title, language);
        if (details && details.poster && details.overview && details.trailer) {
          validatedMovies.push(details);
        }
      } catch (movieError) {
        console.log(`Error fetching details for ${movie.title}:`, movieError.message);
      }
    }
    if (validatedMovies.length === 0) {
      throw new Error('No popular movies found with complete details.');
    }
    return validatedMovies;
  } catch (error) {
    throw new Error('Failed to fetch popular movies from TMDB: ' + error.message);
  }
}

async function getWatchProviders(movieId, country = 'BR') {
  const url = `${process.env.TMDB_API_URL}/movie/${movieId}/watch/providers?api_key=${process.env.TMDB_API_KEY}`;
  const res = await axios.get(url);
  console.log(`TMDB Watch Providers - Movie ID: ${movieId}, Country: ${country}`);
  console.log('TMDB Response:', JSON.stringify(res.data, null, 2));
  const data = res.data.results && res.data.results[country];
  console.log(`Data for country ${country}:`, data);
  if (!data) {
    console.log('No providers found for this movie. Testing with a popular movie...');
    // Test with a popular movie (Fight Club - ID: 550) to verify functionality
    const testUrl = `${process.env.TMDB_API_URL}/movie/550/watch/providers?api_key=${process.env.TMDB_API_KEY}`;
    const testRes = await axios.get(testUrl);
    const testData = testRes.data.results && testRes.data.results[country];
    console.log('Test movie providers:', testData);
    if (testData) {
      console.log('Provider functionality is working - the original movie just has no providers');
    }
    return [];
  }
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

module.exports = { suggestMovies, getTrendingMovies, getPopularMovies, getWatchProviders }; 
// Mock para APIs externas (TMDB e Gemini)

// Mock para resposta do TMDB
const mockTMDBMovie = {
  id: 123,
  title: 'Filme de Teste',
  poster_path: '/poster.jpg',
  overview: 'Um filme para testes',
  release_date: '2023-01-01',
  vote_average: 8.5,
  vote_count: 1000
};

const mockTMDBTrailer = {
  id: 'abc123',
  key: 'trailer_key',
  site: 'YouTube',
  type: 'Trailer'
};

// Mock para resposta do Gemini AI
const mockGeminiResponse = {
  text: () => 'Filme 1, Filme 2, Filme 3'
};

module.exports = {
  mockTMDBMovie,
  mockTMDBTrailer,
  mockGeminiResponse
};
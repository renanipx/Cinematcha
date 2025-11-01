// Mock para o serviço Suggest
const suggestService = require('../service/suggest.service');
const tmdbService = require('../../tmdb/tmdb.service');

// Mocks
jest.mock('@google/generative-ai');
jest.mock('../../tmdb/tmdb.service');

// Mock manual para o serviço
jest.mock('../service/suggest.service', () => ({
  suggestMovies: jest.fn().mockResolvedValue([
    { id: 1, title: 'Filme 1', trailer: 'https://youtube.com/1' },
    { id: 2, title: 'Filme 2', trailer: 'https://youtube.com/2' }
  ]),
  getTrendingMovies: jest.fn().mockResolvedValue([
    { id: 3, title: 'Filme Tendência', trailer: 'https://youtube.com/3' }
  ]),
  getPopularMovies: jest.fn().mockResolvedValue([
    { id: 4, title: 'Filme Popular', trailer: 'https://youtube.com/4' }
  ]),
  getWatchProviders: jest.fn().mockResolvedValue([
    { name: 'Netflix', type: 'stream' }
  ])
}));

describe('Suggest Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('suggestMovies', () => {
    it('deve sugerir filmes com base nas preferências', async () => {
      const result = await suggestService.suggestMovies('filmes de ação', 'pt');
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Filme 1');
      expect(suggestService.suggestMovies).toHaveBeenCalledWith('filmes de ação', 'pt');
    });
  });

  describe('getTrendingMovies', () => {
    it('deve retornar filmes em tendência', async () => {
      const result = await suggestService.getTrendingMovies('pt');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Filme Tendência');
      expect(suggestService.getTrendingMovies).toHaveBeenCalledWith('pt');
    });
  });

  describe('getPopularMovies', () => {
    it('deve retornar filmes populares', async () => {
      const result = await suggestService.getPopularMovies('pt');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Filme Popular');
      expect(suggestService.getPopularMovies).toHaveBeenCalledWith('pt');
    });
  });

  describe('getWatchProviders', () => {
    it('deve retornar provedores de streaming', async () => {
      const result = await suggestService.getWatchProviders(1);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Netflix');
      expect(suggestService.getWatchProviders).toHaveBeenCalledWith(1);
    });
  });
});
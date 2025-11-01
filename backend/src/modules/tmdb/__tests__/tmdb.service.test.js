// Mock para o serviço TMDB
const tmdbService = require('../tmdb.service');

// Mock manual para o serviço
jest.mock('../tmdb.service');

describe('TMDB Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mocks para cada teste
    tmdbService.searchMovie.mockResolvedValue({
      id: 123,
      title: 'Filme Teste',
      overview: 'Descrição do filme teste'
    });
    
    tmdbService.getMovieTrailer.mockResolvedValue({
      key: 'trailer123'
    });
    
    tmdbService.getTrendingMovies.mockResolvedValue([
      { id: 1, title: 'Filme Tendência 1' },
      { id: 2, title: 'Filme Tendência 2' }
    ]);
    
    tmdbService.formatMovieDetails.mockImplementation((movie, trailer) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
    }));
    
    tmdbService.formatProviders.mockImplementation((providers) => {
      return providers ? providers.map(p => ({ name: p.provider_name, logo: p.logo_path })) : [];
    });
  });

  describe('searchMovie', () => {
    it('deve buscar um filme pelo título', async () => {
      const result = await tmdbService.searchMovie('Filme Teste');
      expect(result.title).toBe('Filme Teste');
    });
  });

  describe('getMovieTrailer', () => {
    it('deve obter o trailer de um filme', async () => {
      const result = await tmdbService.getMovieTrailer(123);
      expect(result.key).toBe('trailer123');
    });
  });

  describe('getTrendingMovies', () => {
    it('deve obter filmes em tendência', async () => {
      const result = await tmdbService.getTrendingMovies();
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Filme Tendência 1');
    });
  });

  describe('formatMovieDetails', () => {
    it('deve formatar detalhes do filme com trailer', () => {
      const movie = { id: 123, title: 'Filme Teste', overview: 'Descrição' };
      const trailer = { key: 'trailer123' };
      
      const result = tmdbService.formatMovieDetails(movie, trailer);
      
      expect(result.id).toBe(123);
      expect(result.title).toBe('Filme Teste');
      expect(result.trailer).toBe('https://www.youtube.com/watch?v=trailer123');
    });
  });
});
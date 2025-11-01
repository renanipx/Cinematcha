const request = require('supertest');
const suggestService = require('../service/suggest.service');

// Mock manual para o serviço
jest.mock('../service/suggest.service');

// Mock para express
const express = require('express');
const app = express();
app.use(express.json());

// Importar o controlador após os mocks
const suggestController = require('../controller/suggest.controller');
app.use('/', suggestController);

describe('Suggest Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mocks para cada teste
    suggestService.suggestMovies.mockResolvedValue([
      { id: 1, title: 'Filme 1', trailer: 'https://youtube.com/1' },
      { id: 2, title: 'Filme 2', trailer: 'https://youtube.com/2' }
    ]);
    
    suggestService.getTrendingMovies.mockResolvedValue([
      { id: 1, title: 'Filme Tendência 1' },
      { id: 2, title: 'Filme Tendência 2' }
    ]);
  });

  describe('POST /', () => {
    it('deve sugerir filmes com base no prompt', async () => {
      const response = await request(app)
        .post('/')
        .send({ prompt: 'filmes de ação', language: 'pt' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /tmdb/trending', () => {
    it('deve retornar filmes em tendência', async () => {
      const response = await request(app)
        .get('/tmdb/trending')
        .query({ language: 'pt' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });
});
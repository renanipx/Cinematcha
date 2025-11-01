// Mock para axios
const mockAxios = {
  get: jest.fn().mockImplementation(() => Promise.resolve({ 
    data: {
      results: [
        { id: 1, title: 'Filme Teste 1', overview: 'Descrição do filme 1' },
        { id: 2, title: 'Filme Teste 2', overview: 'Descrição do filme 2' }
      ],
      videos: {
        results: [
          { type: 'Trailer', key: 'trailer123', site: 'YouTube' }
        ]
      }
    }
  })),
  create: jest.fn().mockImplementation(() => mockAxios),
  defaults: {
    baseURL: 'https://api.themoviedb.org/3'
  }
};

module.exports = mockAxios;
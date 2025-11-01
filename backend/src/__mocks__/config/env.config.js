// Mock para configurações de ambiente
module.exports = {
  tmdb: {
    apiKey: 'test-api-key',
    apiUrl: 'https://api.themoviedb.org/3'
  },
  gemini: {
    apiKey: 'test-gemini-key'
  },
  prompts: {
    en: 'Suggest me movies like {{preferences}}',
    pt: 'Sugira filmes como {{preferences}}'
  }
};
// Mock para Google Generative AI
class MockGenerativeModel {
  constructor() {
    this.generateContent = jest.fn().mockResolvedValue({
      response: {
        text: () => "Filme 1, Filme 2, Filme 3"
      }
    });
  }
}

const GoogleGenerativeAI = jest.fn().mockImplementation(() => ({
  getGenerativeModel: jest.fn().mockReturnValue(new MockGenerativeModel())
}));

module.exports = { GoogleGenerativeAI };
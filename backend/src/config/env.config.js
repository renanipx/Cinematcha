const dotenv = require('dotenv');
const path = require('path');

class EnvConfig {
  constructor() {
    dotenv.config({ path: path.join(__dirname, '../../.env') });
    this.validateEnv();
  }

  validateEnv() {
    const requiredEnvVars = [
      'TMDB_API_KEY',
      'TMDB_API_URL',
      'GEMINI_API_KEY',
      'PROMPT_EN',
      'PROMPT_PT'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}. ` +
        'Please check your .env file.'
      );
    }
  }

  get config() {
    return {
      port: process.env.PORT || 3001,
      tmdb: {
        apiKey: process.env.TMDB_API_KEY,
        apiUrl: process.env.TMDB_API_URL
      },
      gemini: {
        apiKey: process.env.GEMINI_API_KEY
      },
      prompts: {
        en: process.env.PROMPT_EN,
        pt: process.env.PROMPT_PT
      }
    };
  }
}

module.exports = new EnvConfig().config;
# Cinematcha

Cinematcha is a fullstack web application for smart movie recommendations, combining generative AI (Google Gemini) and TMDB data. Users can get personalized suggestions, see trending and popular movies, watch trailers, and discover where to stream each movie.

## Features
- AI-powered movie suggestions (Google Gemini) with TMDB validation
- Search for trending and most popular movies
- Display of trailer, synopsis, rating, and year
- Discover streaming, rental, and purchase providers by country
- Multilingual interface (Portuguese and English)
- Modern, responsive, and accessible UI

## Project Structure
```
Cinematcha/
  backend/    # Node.js/Express API, integrates Gemini and TMDB
  frontend/   # SPA Vue 3 + Vite
```

## Prerequisites
- Node.js 18+
- TMDB account and API Key (https://www.themoviedb.org/)
- Google Gemini service account and key (https://ai.google.dev/)

## Installation

### Backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:
```env
PORT=3001
TMDB_API_KEY=YOUR_TMDB_API_KEY
TMDB_API_URL=https://api.themoviedb.org/3
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Place your Google Gemini service key JSON file in `backend/` and make sure it is in .gitignore.

### Frontend
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` with:
```env
VITE_API_URL=http://localhost:3001
```

## Usage

### Start the backend
```bash
cd backend
npm start
```

### Start the frontend
```bash
cd frontend
npm run dev
```

Access: http://localhost:5173

## Main Scripts
- Backend: `npm start` (Express on port 3001)
- Frontend: `npm run dev` (Vite on port 5173)

## Notes
- The backend depends on properly configured environment variables and API keys.
- The frontend communicates with the backend via REST.
- Do not share your API keys publicly.

## License
MIT

## Author

Developed by Renan Campos Cavalcanti  
GitHub: [https://github.com/renanipx/](https://github.com/renanipx/)  
LinkedIn: [https://www.linkedin.com/in/renanccavalcanti/](https://www.linkedin.com/in/renanccavalcanti/) 

---

> Academic/demo project. Do not use sensitive keys in production without proper protection. 
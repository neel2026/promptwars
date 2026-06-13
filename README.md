# CookList

AI-powered cooking to-do list generator. Describe your day — get a realistic, timed cooking plan.

## Structure

```
promptwars/
├── frontend/     ← React + Vite
├── backend/      ← Node.js + Express (API key lives here)
├── vercel.json   ← Deployment config
└── PITCH.md
```

## Quick Start

### 1. Add your API key
```bash
# backend/.env
GEMINI_API_KEY=your_gemini_key_here
```

### 2. Start backend
```bash
cd backend
npm install
npm run dev     # runs on http://localhost:3001
```

### 3. Start frontend
```bash
cd frontend
npm install
npm run dev     # runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173)

## Tech Stack
- **Frontend**: React 18 + Vite 5
- **Backend**: Node.js + Express — API key is server-side only
- **AI**: Gemini 2.5 Flash-Lite via `POST /api/generate`
- **Deploy**: Vercel (frontend + backend as one project)

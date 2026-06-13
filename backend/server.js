/**
 * CookList — Express Backend
 * POST /api/generate → Gemini API → { tasks: [...] }
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

const app  = express();
const PORT = process.env.PORT || 3001;

// ── System prompt ──────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a practical cooking assistant.
Given a description of someone's day, return a cooking to-do list as JSON.

Return ONLY valid JSON. No markdown fences. No explanation. No preamble.

Format exactly:
{
  "tasks": [
    {
      "id": 1,
      "time": "5:30 PM",
      "category": "Prep",
      "task": "Take chicken out of freezer to thaw",
      "done": false
    }
  ]
}

Rules:
- 5 to 10 tasks max
- Specific and realistic — real steps a home cook takes
- Time-aware — spread tasks across their actual day
- Categories: Prep, Cook, or Serve only
- No fluff, no encouragement, no recipe intros`;

// ── Middleware ─────────────────────────────────────────────────
app.use(express.json());

// CORS — allow only the Vite dev server and production frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (e.g. curl, Postman in dev)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
}));

// Rate limit: 10 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Wait a minute and try again.' },
});

app.use('/api', limiter);

// ── POST /api/generate ─────────────────────────────────────────
app.post('/api/generate', async (req, res) => {
  const { dayDescription } = req.body ?? {};

  // Input validation
  if (!dayDescription || typeof dayDescription !== 'string') {
    return res.status(400).json({ error: 'dayDescription is required.' });
  }
  const trimmed = dayDescription.trim();
  if (trimmed.length === 0) {
    return res.status(400).json({ error: 'dayDescription cannot be empty.' });
  }
  if (trimmed.length > 500) {
    return res.status(400).json({ error: 'dayDescription must be 500 characters or fewer.' });
  }

  // API key check
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
  }

  try {
    const tasks = await callGemini(apiKey, trimmed);
    return res.json({ tasks });
  } catch (err) {
    console.error('[/api/generate]', err.message);
    return res.status(502).json({ error: err.message || 'Failed to generate cooking list.' });
  }
});

// ── Gemini API call ────────────────────────────────────────────
// ▼▼▼ GEMINI CONFIGURATION — swap endpoint/model here if needed ▼▼▼
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGemini(apiKey, dayText) {
  const url = `${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: dayText }] }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const msg = errBody?.error?.message || `Gemini API error: HTTP ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();

  // Extract text from Gemini response
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const cleaned = raw
    .replace(/^```[a-z]*\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed?.tasks)) {
    throw new Error('Unexpected response format from Gemini.');
  }

  return parsed.tasks;
}
// ▲▲▲ END GEMINI CONFIGURATION ▲▲▲

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[CookList] Backend running on http://localhost:${PORT}`);
});

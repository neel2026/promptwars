/**
 * utils/api.js — Structured API layer.
 * All functions validate input, handle timeouts, network errors,
 * non-200 responses, and malformed JSON.
 * Returns { data, error } — never throws.
 */

const API_BASE    = import.meta.env.VITE_API_URL || '';
const TIMEOUT_MS  = 20000;

/**
 * Makes a POST request with a timeout and structured error handling.
 * @param {string} path - API path e.g. '/api/analyze'
 * @param {object} payload - Request body
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
async function postWithTimeout(path, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      signal:  controller.signal,
      body:    JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = `Server error (${response.status})`;
      try {
        const errBody = await response.json();
        if (errBody?.error) message = errBody.error;
      } catch {
        // response body not JSON — use default message
      }
      return { data: null, error: message };
    }

    const data = await response.json().catch(() => null);
    if (!data) {
      return { data: null, error: 'Received an unexpected response. Please try again.' };
    }

    return { data, error: null };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { data: null, error: 'The request timed out. Check your connection and try again.' };
    }
    return { data: null, error: 'Network error. Please check your connection.' };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Analyzes a student's mood entry and returns AI wellness response.
 * @param {{ name: string, examType: string, moodScore: number, journalEntry: string, recentMoods?: number[] }} payload
 * @returns {Promise<{ data: { acknowledgment: string, trigger: string, copingStrategy: object, encouragement: string }|null, error: string|null }>}
 */
export async function analyzeWellness(payload) {
  if (!payload || typeof payload !== 'object') {
    return { data: null, error: 'Invalid request payload.' };
  }
  return postWithTimeout('/api/analyze', payload);
}

/**
 * Fetches an AI-detected emotional pattern from the last 7 entries.
 * @param {{ name: string, examType: string, last7Entries: Array }} payload
 * @returns {Promise<{ data: { pattern: string, insight: string, recommendation: string }|null, error: string|null }>}
 */
export async function analyzePattern(payload) {
  if (!payload || typeof payload !== 'object') {
    return { data: null, error: 'Invalid request payload.' };
  }
  return postWithTimeout('/api/pattern', payload);
}

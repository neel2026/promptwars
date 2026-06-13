import { useState, useCallback, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * useCookingList
 * Manages: tasks, loading, error state, submit, regenerate
 * API key lives server-side — this hook only knows the Express endpoint.
 */
export function useCookingList() {
  const [tasks,     setTasks]     = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);
  const lastDayText = useRef('');
  const inFlight    = useRef(false); // prevent duplicate calls

  const generate = useCallback(async (dayText) => {
    if (!dayText || inFlight.current) return;

    inFlight.current = true;
    lastDayText.current = dayText;
    setIsLoading(true);
    setError(null);
    setTasks([]);

    try {
      const res = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayDescription: dayText }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      if (!Array.isArray(data.tasks)) {
        throw new Error('Unexpected response from server.');
      }

      // Initialize all tasks as not done
      setTasks(data.tasks.map(t => ({ ...t, done: false })));
    } catch (err) {
      const msg = classify(err.message);
      setError(msg);
    } finally {
      setIsLoading(false);
      inFlight.current = false;
    }
  }, []);

  const regenerate = useCallback(() => {
    if (lastDayText.current) generate(lastDayText.current);
  }, [generate]);

  const toggleTask = useCallback((id) => {
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
    );
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { tasks, isLoading, error, generate, regenerate, toggleTask, clearError };
}

/** Map raw error messages to user-friendly strings */
function classify(msg = '') {
  const m = msg.toLowerCase();
  // "not configured" = missing key; "invalid" = key exists but rejected by the API
  if (m.includes('not configured'))
    return 'No API key found on the server. Add GEMINI_API_KEY to backend/.env and restart.';
  if (m.includes('invalid api key') || m.includes('invalid_api_key') || m.includes('authentication') || m.includes('unauthorized') || m.includes('401'))
    return 'API key was rejected — it may be invalid or expired. Check your key in backend/.env.';
  if (m.includes('quota') || m.includes('rate') || m.includes('429') || m.includes('too many'))
    return 'Rate limit reached. Wait a moment and try again.';
  if (m.includes('json') || m.includes('unexpected') || m.includes('parse'))
    return 'The AI returned an unexpected format. Try submitting again.';
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('econnrefused'))
    return 'Cannot reach the server. Make sure the backend is running on port 3001.';
  return msg || 'Something went wrong. Try again.';
}

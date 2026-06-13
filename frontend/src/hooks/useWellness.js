/**
 * hooks/useWellness.js
 * Manages AI analysis state and submission logic.
 */

import { useState, useCallback, useRef } from 'react';
import { analyzeWellness, analyzePattern } from '../utils/api';
import { validateJournalEntry, validateMoodScore } from '../utils/validation';

/**
 * @param {{ addEntry: Function, last7: Array, recentMoodScores: number[] }} historyHook
 * @returns {{
 *   aiResponse: object|null,
 *   patternData: object|null,
 *   isLoading: boolean,
 *   isLoadingPattern: boolean,
 *   error: string|null,
 *   submitCheckIn: (payload: object) => Promise<void>,
 *   fetchPattern: (payload: object) => Promise<void>,
 *   clearError: () => void,
 *   clearResponse: () => void,
 * }}
 */
export function useWellness({ addEntry, last7, recentMoodScores }) {
  const [aiResponse,       setAiResponse]       = useState(null);
  const [patternData,      setPatternData]       = useState(null);
  const [isLoading,        setIsLoading]         = useState(false);
  const [isLoadingPattern, setIsLoadingPattern]  = useState(false);
  const [error,            setError]             = useState(null);

  // Prevent duplicate submissions
  const submittingRef = useRef(false);

  const clearError    = useCallback(() => setError(null), []);
  const clearResponse = useCallback(() => {
    setAiResponse(null);
    setPatternData(null);
    setError(null);
  }, []);

  const submitCheckIn = useCallback(async ({ name, examType, moodScore, journalEntry }) => {
    if (submittingRef.current) return;

    // Client-side validation before calling API
    const moodVal    = validateMoodScore(moodScore);
    const journalVal = validateJournalEntry(journalEntry);

    if (!moodVal.valid)    { setError(moodVal.error);    return; }
    if (!journalVal.valid) { setError(journalVal.error); return; }

    submittingRef.current = true;
    setIsLoading(true);
    setError(null);
    setAiResponse(null);

    const { data, error: apiError } = await analyzeWellness({
      name,
      examType,
      moodScore: Number(moodScore),
      journalEntry,
      recentMoods: recentMoodScores,
    });

    setIsLoading(false);
    submittingRef.current = false;

    if (apiError) {
      setError(apiError);
      return;
    }

    setAiResponse(data);
    addEntry({ moodScore: Number(moodScore), journalEntry, examType, aiResponse: data });
  }, [addEntry, recentMoodScores]);

  const fetchPattern = useCallback(async ({ name, examType }) => {
    if (last7.length < 2 || isLoadingPattern) return;

    setIsLoadingPattern(true);
    setPatternData(null);

    const { data, error: apiError } = await analyzePattern({
      name,
      examType,
      last7Entries: last7,
    });

    setIsLoadingPattern(false);

    if (!apiError && data) {
      setPatternData(data);
    }
    // Pattern failure is silent — not critical
  }, [last7, isLoadingPattern]);

  return {
    aiResponse,
    patternData,
    isLoading,
    isLoadingPattern,
    error,
    submitCheckIn,
    fetchPattern,
    clearError,
    clearResponse,
  };
}

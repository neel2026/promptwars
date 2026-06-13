/**
 * utils/mood.js — Pure utility functions for mood data.
 * All functions are pure: same input always returns same output, no side effects.
 */

/** @type {string[]} Ordered exam types */
export const EXAM_TYPES = ['NEET', 'JEE', 'UPSC', 'CAT', 'GATE', 'CUET'];

/**
 * Returns a human-readable label for a mood score.
 * @param {number} score - Integer 1-10
 * @returns {string}
 */
export function getMoodLabel(score) {
  const s = Number(score);
  if (s <= 2) return 'Overwhelmed';
  if (s <= 3) return 'Really low';
  if (s <= 4) return 'Struggling';
  if (s <= 5) return 'Okay';
  if (s <= 6) return 'Managing';
  if (s <= 7) return 'Feeling decent';
  if (s <= 8) return 'Pretty good';
  if (s <= 9) return 'Great';
  return 'Excellent';
}

/**
 * Returns a CSS color string for a mood score (red → amber → green).
 * @param {number} score - Integer 1-10
 * @returns {string} HSL color string
 */
export function getMoodColor(score) {
  const s = Math.max(1, Math.min(10, Number(score)));
  if (s <= 3) return '#EF4444'; // red
  if (s <= 5) return '#F59E0B'; // amber
  if (s <= 7) return '#A3E635'; // lime
  return '#10B981';              // emerald
}

/**
 * Returns a short formatted date string from a timestamp.
 * @param {number} timestamp - Unix timestamp in ms
 * @returns {string} e.g. "Mon 9 Jun"
 */
export function formatDate(timestamp) {
  if (!timestamp || !Number.isFinite(Number(timestamp))) return '';
  const d = new Date(Number(timestamp));
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day:     'numeric',
    month:   'short',
  });
}

/**
 * Returns a short day label for chart axes.
 * @param {number} timestamp - Unix timestamp in ms
 * @returns {string} e.g. "Mon"
 */
export function formatDayShort(timestamp) {
  if (!timestamp || !Number.isFinite(Number(timestamp))) return '';
  return new Date(Number(timestamp)).toLocaleDateString('en-IN', { weekday: 'short' });
}

/**
 * Calculates the current check-in streak (consecutive days ending today or yesterday).
 * @param {Array<{timestamp: number}>} entries - Array of mood entries sorted newest-first
 * @returns {number} streak count
 */
export function calculateStreak(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return 0;

  const dayMs = 86400000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDays = [...new Set(
    entries.map(e => {
      const d = new Date(Number(e.timestamp));
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  )].sort((a, b) => b - a);

  if (uniqueDays.length === 0) return 0;

  const latestDay = uniqueDays[0];
  const todayMs   = today.getTime();

  // Streak must include today or yesterday to be active
  if (latestDay < todayMs - dayMs) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i - 1] - uniqueDays[i] === dayMs) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Detects the day of week with the lowest average mood score.
 * @param {Array<{timestamp: number, moodScore: number}>} entries
 * @returns {string} Day name e.g. "Sunday", or empty string if not enough data
 */
export function detectWeakDay(entries) {
  if (!Array.isArray(entries) || entries.length < 3) return '';

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayTotals = Array.from({ length: 7 }, () => ({ sum: 0, count: 0 }));

  for (const entry of entries) {
    const day   = new Date(Number(entry.timestamp)).getDay();
    const score = Number(entry.moodScore);
    if (Number.isFinite(score)) {
      dayTotals[day].sum   += score;
      dayTotals[day].count += 1;
    }
  }

  let lowestAvg = Infinity;
  let weakDay   = -1;

  for (let i = 0; i < 7; i++) {
    if (dayTotals[i].count === 0) continue;
    const avg = dayTotals[i].sum / dayTotals[i].count;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      weakDay   = i;
    }
  }

  return weakDay >= 0 ? DAY_NAMES[weakDay] : '';
}

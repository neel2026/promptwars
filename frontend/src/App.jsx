import { useCookingList } from './hooks/useCookingList';
import DayInput from './components/DayInput';
import TaskList from './components/TaskList';

/**
 * App — root component
 * Assembles the full UI using the useCookingList hook.
 * UI states: empty → loading → results (or error)
 */
export default function App() {
  const {
    tasks,
    isLoading,
    error,
    generate,
    regenerate,
    toggleTask,
    clearError,
  } = useCookingList();

  const showEmpty   = !isLoading && !error && tasks.length === 0;
  const showResults = !isLoading && !error && tasks.length > 0;

  return (
    <>
      <main className="app" id="main-app">

        {/* ── Header ── */}
        <header className="header" id="header">
          <p className="header__wordmark">CookList</p>
          <h1 className="header__headline">
            What's your day <em>actually</em> like?
          </h1>
          <p className="header__sub">
            Describe your schedule, what's in the fridge, who you're feeding.
            Get a real, timed cooking to-do list built around your actual day.
          </p>
        </header>

        {/* ── Input ── */}
        <DayInput onSubmit={generate} isLoading={isLoading} />

        {/* ── Loading ── */}
        {isLoading && (
          <div
            className="loading-state"
            role="status"
            aria-live="polite"
            aria-label="Generating your cooking list"
          >
            <div className="loading-flame" aria-hidden="true">
              <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 40C22 40 8 31 8 19C8 11.268 14.268 5 22 5C29.732 5 36 11.268 36 19C36 31 22 40 22 40Z"
                  fill="oklch(0.63 0.18 32)" opacity="0.9"
                />
                <path
                  d="M22 33C22 33 13 27 13 20C13 16.134 17.134 13 22 13C26.866 13 31 16.134 31 20C31 27 22 33 22 33Z"
                  fill="oklch(0.78 0.16 55)" opacity="0.85"
                />
                <path
                  d="M22 26C22 26 17 23 17 19.5C17 17.567 19.239 16 22 16C24.761 16 27 17.567 27 19.5C27 23 22 26 22 26Z"
                  fill="oklch(0.93 0.10 90)" opacity="0.9"
                />
              </svg>
            </div>
            <p className="loading-text">Reading your day, building the list…</p>
            <div className="loading-bar-track" aria-hidden="true">
              <div className="loading-bar-fill" />
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="error-state" role="alert" aria-live="assertive">
            <p className="error-state__title">Something went wrong</p>
            <p className="error-state__msg">{error}</p>
            <button
              type="button"
              className="error-state__retry"
              onClick={clearError}
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Empty ── */}
        {showEmpty && (
          <div className="empty-state">
            <div className="empty-state__icon" aria-hidden="true">🍳</div>
            <p className="empty-state__text">
              Tell me about your day and I'll build your cooking list
            </p>
            <p className="empty-state__hint">
              Be specific — time, energy level, what's in the fridge, who you're feeding.
            </p>
          </div>
        )}

        {/* ── Results ── */}
        {showResults && (
          <TaskList
            tasks={tasks}
            onToggle={toggleTask}
            onRegenerate={regenerate}
            isLoading={isLoading}
          />
        )}

      </main>

      <footer className="footer">
        <p className="footer__text">© 2026 CookList</p>
        <p className="footer__powered">Powered by <span>Gemini</span></p>
      </footer>
    </>
  );
}

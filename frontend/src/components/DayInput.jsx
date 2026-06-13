import { useState, useCallback } from 'react';

const MAX_CHARS = 500;

const EXAMPLES = [
  { label: 'Quick family dinner',   text: 'Busy morning, home by 6:30pm, have chicken thighs and rice, feeding 2 kids, low energy tonight' },
  { label: 'WFH solo cook',         text: 'Working from home all day, have eggs, spinach, and pasta, eating solo, want to prep lunch and dinner' },
  { label: 'Weekend dinner party',  text: 'Weekend, have salmon, potatoes, and salad greens, hosting 4 guests for dinner at 7pm, want to impress' },
];

/**
 * DayInput
 * Textarea + example chips + submit button.
 * Calls onSubmit(text) when the user is ready.
 */
export default function DayInput({ onSubmit, isLoading }) {
  const [text, setText] = useState('');

  const handleChange = useCallback((e) => {
    if (e.target.value.length <= MAX_CHARS) setText(e.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed && !isLoading) onSubmit(trimmed);
  }, [text, isLoading, onSubmit]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
  }, [handleSubmit]);

  const fillExample = useCallback((exText) => {
    setText(exText);
  }, []);

  const canSubmit = text.trim().length > 0 && !isLoading;

  return (
    <section className="input-section" aria-label="Describe your day">
      <label className="input-label" htmlFor="day-textarea">
        Tell me about your day
      </label>

      <div className="textarea-wrap">
        <textarea
          className="day-textarea"
          id="day-textarea"
          rows={5}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Busy morning, home by 6pm, have chicken thighs and some veg, feeding 2 adults and a toddler, low energy tonight…"
          aria-describedby="char-count"
          disabled={isLoading}
        />
        <span className="char-count" id="char-count" aria-live="polite">
          {text.length} / {MAX_CHARS}
        </span>
      </div>

      <div className="examples" role="group" aria-label="Example prompts">
        {EXAMPLES.map(({ label, text: exText }) => (
          <button
            key={label}
            type="button"
            className="example-chip"
            onClick={() => fillExample(exText)}
            disabled={isLoading}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="submit-btn"
        id="submit-btn"
        onClick={handleSubmit}
        disabled={!canSubmit}
        aria-label="Build my cooking list"
      >
        <span className="submit-btn__icon" aria-hidden="true">🔥</span>
        Build my cooking list
      </button>
    </section>
  );
}

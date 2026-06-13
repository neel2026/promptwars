import { useCallback } from 'react';

/**
 * TaskItem
 * Single task row: checkbox, time badge, task text.
 * Toggles done state on click or keyboard activation.
 */
export default function TaskItem({ task, onToggle, entryIndex }) {
  const handleToggle = useCallback(() => onToggle(task.id), [task.id, onToggle]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle(task.id);
    }
  }, [task.id, onToggle]);

  // Stagger delay for chef's-pass animation
  const style = { '--entry-delay': `${60 + entryIndex * 85}ms` };

  return (
    <div
      className={`task-card is-entered${task.done ? ' is-done' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={task.done}
      aria-label={`${task.time} — ${task.task}. ${task.done ? 'Done. Activate to undo.' : 'Activate to mark done.'}`}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      style={style}
    >
      <div className="task-checkbox" aria-hidden="true">
        <svg
          className="task-checkbox__check"
          width="12"
          height="10"
          viewBox="0 0 12 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 5L4.5 8.5L11 1.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="task-body">
        <span className="task-time">{task.time}</span>
        <p className="task-text">{task.task}</p>
      </div>
    </div>
  );
}

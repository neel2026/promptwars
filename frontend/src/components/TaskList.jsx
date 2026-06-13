import TaskItem from './TaskItem';
import ProgressBar from './ProgressBar';

const CATEGORY_ORDER = ['Prep', 'Cook', 'Serve'];

/**
 * TaskList
 * Groups tasks by category (Prep / Cook / Serve).
 * Renders ProgressBar + Regenerate button in the header.
 * Passes per-task entry index for the stagger animation.
 */
export default function TaskList({ tasks, onToggle, onRegenerate, isLoading }) {
  // Group tasks by category
  const groups = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = tasks.filter(t =>
      CATEGORY_ORDER.includes(t.category) ? t.category === cat : cat === 'Cook'
    );
    return acc;
  }, {});

  let globalIndex = 0;

  return (
    <section className="results-section" aria-label="Your cooking to-do list">
      <header className="results-header">
        <h2 className="results-title">Your cooking list</h2>
        <button
          type="button"
          className="regen-btn"
          onClick={onRegenerate}
          disabled={isLoading}
          aria-label="Generate a fresh list"
        >
          <span aria-hidden="true">↺</span> Regenerate
        </button>
      </header>

      <ProgressBar tasks={tasks} />

      <div aria-label="Cooking tasks">
        {CATEGORY_ORDER.map(cat => {
          const catTasks = groups[cat];
          if (!catTasks.length) return null;

          return (
            <div key={cat} className="category-group">
              <div className="category-label">{cat}</div>
              {catTasks.map(task => {
                const idx = globalIndex++;
                return (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    entryIndex={idx}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}

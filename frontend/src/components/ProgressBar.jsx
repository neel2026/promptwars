/**
 * ProgressBar
 * Shows "X of Y tasks done" + animated fill track.
 */
export default function ProgressBar({ tasks }) {
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="progress-wrap" aria-label="Task completion progress">
      <div className="progress-label">
        <span className="progress-label__text">
          {done} of {total} task{total !== 1 ? 's' : ''} done
        </span>
        <span className="progress-label__pct" aria-hidden="true">{pct}%</span>
      </div>
      <div className="progress-track" aria-hidden="true">
        <div
          className="progress-fill"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% complete`}
        />
      </div>
    </div>
  );
}

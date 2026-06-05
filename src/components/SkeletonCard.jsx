// Generic loading skeleton — pulse animation, no actual data needed.
// Use <SkeletonCard /> for job cards, <SkeletonRow /> for list rows.

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line w-60" />
      <div className="skeleton-line w-40" />
      <div className="skeleton-line w-full" />
      <div className="skeleton-line w-full" />
      <div className="skeleton-chips">
        <div className="skeleton-chip" />
        <div className="skeleton-chip" />
        <div className="skeleton-chip" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <div>
        <div className="skeleton-line w-48" />
        <div className="skeleton-line w-32" style={{ marginTop: 6 }} />
      </div>
      <div className="skeleton-chip" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="skeleton-stat">
      <div className="skeleton-line w-24" />
      <div className="skeleton-line w-16" style={{ marginTop: 10, height: 28 }} />
    </div>
  );
}

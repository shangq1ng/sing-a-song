export function SongListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="visually-hidden">Loading results</span>
      <ul className="song-list" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <li key={index}>
            <div className="song-link song-link-skeleton">
              <span className="skeleton skeleton-icon" />
              <span className="song-link-body">
                <span className="skeleton skeleton-line skeleton-medium" />
                <span className="skeleton skeleton-line skeleton-short" />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SongCardSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="visually-hidden">Loading track</span>
      <article className="song-card" aria-hidden="true">
        <header className="song-card-head">
          <span className="skeleton skeleton-icon-lg" />
          <div className="skeleton-stack">
            <span className="skeleton skeleton-line skeleton-title" />
            <span className="skeleton skeleton-line skeleton-short" />
          </div>
        </header>

        <dl className="song-meta">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index}>
              <span className="skeleton skeleton-label" />
              <span className="skeleton skeleton-line skeleton-medium" />
            </div>
          ))}
        </dl>

        <section className="song-lyrics">
          <span className="skeleton skeleton-label" />
          {Array.from({ length: 6 }, (_, index) => (
            <span key={index} className="skeleton skeleton-line" />
          ))}
        </section>
      </article>
    </div>
  );
}

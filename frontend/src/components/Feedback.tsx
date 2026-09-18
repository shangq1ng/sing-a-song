export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="state state-loading" role="status" aria-live="polite">
      <i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="state state-error" role="alert">
      <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="state state-empty">
      <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
      <h2>{title}</h2>
      {message ? <p>{message}</p> : null}
    </div>
  );
}

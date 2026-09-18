import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="container page">
      <div className="state state-empty">
        <i className="fa-solid fa-compass" aria-hidden="true" />
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or has moved.</p>
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    </div>
  );
}

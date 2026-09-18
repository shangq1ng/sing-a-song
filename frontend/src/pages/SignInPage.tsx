import { Link } from 'react-router';

import { useAuth } from '../auth/AuthContext';
import { Spinner } from '../components/Feedback';

export function SignInPage() {
  const { user, checking, pending, signIn, signOut } = useAuth();

  return (
    <section className="auth-page">
      <div className="auth-card">
        <span className="auth-mark" aria-hidden="true">
          <i className="fa-solid fa-microphone-lines" />
        </span>

        {checking ? (
          <Spinner label="Checking your session" />
        ) : user ? (
          <>
            <h1>Welcome, {user.display_name.trim() || user.username}</h1>
            <p>You're signed in and ready to go.</p>
            <Link to="/" className="btn btn-primary btn-block">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <span>Find a song</span>
            </Link>
            <button
              className="btn btn-ghost btn-block"
              type="button"
              disabled={pending}
              onClick={signOut}
            >
              <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </>
        ) : (
          <>
            <h1>Welcome back</h1>
            <p>Sign in to keep your music in one place.</p>
            <button className="btn btn-primary btn-block" type="button" onClick={signIn}>
              <i className="fa-brands fa-google" aria-hidden="true" />
              <span>Continue with Google</span>
            </button>
          </>
        )}

        <Link to="/" className="auth-back">
          Back to search
        </Link>
      </div>
    </section>
  );
}

import { Link } from 'react-router';

import { useAuth } from '../auth/AuthContext';
import { Spinner } from '../components/Feedback';

export function ProfilePage() {
  const { user, checking, pending, signOut } = useAuth();

  return (
    <div className="container page">
      {checking ? (
        <Spinner label="Loading profile" />
      ) : user ? (
        <section className="profile-card">
          <img className="profile-avatar" src={user.avatar_url} alt="" />
          <h1 className="profile-display-name">{user.display_name}</h1>
          <h1 className="profile-name">{user.username}</h1>
          <p className="profile-email">{user.email}</p>

          <dl className="profile-meta">
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            {user.locale ? (
              <div>
                <dt>Locale</dt>
                <dd>{user.locale}</dd>
              </div>
            ) : null}
          </dl>

          <div className="profile-actions">
            <Link to="/" className="btn btn-primary">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <span>Find a song</span>
            </Link>
            <button
              className="btn btn-ghost"
              type="button"
              disabled={pending}
              onClick={signOut}
            >
              <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </div>
        </section>
      ) : (
        <div className="state state-empty">
          <i className="fa-solid fa-circle-user" aria-hidden="true" />
          <h1>You're not signed in</h1>
          <p>Sign in to see your profile and keep your music in one place.</p>
          <Link to="/signin" className="btn btn-primary">
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
}

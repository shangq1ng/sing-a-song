import { Link } from 'react-router';

import { useAuth } from '../auth/AuthContext';

export function AccountMenu() {
  const { user, checking, pending, signOut } = useAuth();

  if (checking) {
    return <span className="account-loading" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <Link to="/signin" className="btn btn-primary">
        <i className="fa-solid fa-right-to-bracket" aria-hidden="true" />
        <span>Sign in</span>
      </Link>
    );
  }

  return (
    <details className="account-menu">
      <summary className="account-summary" aria-label="Account menu">
        <img className="avatar" src={user.avatar_url} alt="" />
        <span className="account-name">{user.display_name.trim() || user.username}</span>
        <i className="fa-solid fa-chevron-down" aria-hidden="true" />
      </summary>
      <div className="account-dropdown">
        <p className="account-email">{user.email}</p>
        <Link to="/profile" className="account-link">
          <i className="fa-solid fa-circle-user" aria-hidden="true" />
          <span>Profile</span>
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
      </div>
    </details>
  );
}

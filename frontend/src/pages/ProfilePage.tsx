import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';

import type { UserProfile } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { Spinner } from '../components/Feedback';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface ProfileCardProps {
  user: UserProfile;
  pending: boolean;
  signOut: () => void;
  updateDisplayName: (displayName: string) => Promise<void>;
}

function ProfileCard({ user, pending, signOut, updateDisplayName }: ProfileCardProps) {
  const [displayName, setDisplayName] = useState(user.display_name);
  const [status, setStatus] = useState<SaveStatus>('idle');

  useEffect(() => {
    setDisplayName(user.display_name);
    setStatus('idle');
  }, [user.display_name]);

  const trimmed = displayName.trim();
  const canSave =
    trimmed.length > 0 &&
    trimmed.length <= 32 &&
    trimmed !== user.display_name &&
    status !== 'saving';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSave) {
      return;
    }

    setStatus('saving');

    try {
      await updateDisplayName(trimmed);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="profile-card">
      <img className="profile-avatar" src={user.avatar_url} alt="" />
      <h1 className="profile-name">{user.display_name.trim() || user.username}</h1>
      <p className="profile-email">{user.email}</p>

      <form className="profile-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Display name</span>
          <input
            className="field-input"
            type="text"
            value={displayName}
            maxLength={32}
            autoComplete="off"
            onChange={event => {
              setDisplayName(event.target.value);
              setStatus('idle');
            }}
          />
        </label>
        <div className="profile-form-actions">
          <button className="btn btn-primary" type="submit" disabled={!canSave}>
            {status === 'saving' ? 'Saving' : 'Save'}
          </button>
          {status === 'saved' ? <span className="form-note form-note-success">Saved</span> : null}
          {status === 'error' ? (
            <span className="form-note form-note-error">Couldn't save. Try again.</span>
          ) : null}
        </div>
      </form>

      <dl className="profile-meta">
        <div>
          <dt>Username</dt>
          <dd>{user.username}</dd>
        </div>
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
        <button className="btn btn-ghost" type="button" disabled={pending} onClick={signOut}>
          <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </section>
  );
}

export function ProfilePage() {
  const { user, checking, pending, signOut, updateDisplayName } = useAuth();

  return (
    <div className="container page">
      {checking ? (
        <Spinner label="Loading profile" />
      ) : user ? (
        <ProfileCard
          user={user}
          pending={pending}
          signOut={signOut}
          updateDisplayName={updateDisplayName}
        />
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

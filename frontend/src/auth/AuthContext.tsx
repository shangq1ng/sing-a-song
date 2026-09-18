import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchCurrentUser, logout as apiLogout, signInUrl } from '../api/client';
import type { UserProfile } from '../api/types';

interface AuthContextValue {
  user: UserProfile | null;
  checking: boolean;
  pending: boolean;
  signIn: () => void;
  signOut: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState(false);

  const refresh = useCallback(() => {
    fetchCurrentUser()
      .then(profile => setUser(profile))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    let active = true;

    fetchCurrentUser()
      .then(profile => {
        if (active) {
          setUser(profile);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setChecking(false);
        }
      });

    const handleFocus = () => refresh();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      active = false;
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refresh]);

  const signIn = useCallback(() => {
    window.location.assign(signInUrl());
  }, []);

  const signOut = useCallback(() => {
    setPending(true);
    apiLogout()
      .catch(() => undefined)
      .finally(() => {
        setUser(null);
        setPending(false);
        window.location.assign('/');
      });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, checking, pending, signIn, signOut, refresh }),
    [user, checking, pending, signIn, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

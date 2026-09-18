import type { Song, SongSummary, UserProfile } from './types';
import { alternateSlug } from '../utils/slug';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export type ApiErrorKind = 'notFound' | 'unauthorized' | 'server' | 'network';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;

  constructor(kind: ApiErrorKind) {
    super(kind);
    this.name = 'ApiError';
    this.kind = kind;
  }
}

export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case 'notFound':
        return "We couldn't find what you were looking for.";
      case 'unauthorized':
        return 'Please sign in to continue.';
      case 'server':
        return 'Something went wrong on our end. Please try again.';
      case 'network':
        return "We couldn't reach the server. Check your connection and try again.";
    }
  }

  return 'Something went wrong. Please try again.';
}

function endpoint(path: string): string {
  return `${API_BASE_URL}${path}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(endpoint(path), { credentials: 'include', ...init });
  } catch {
    throw new ApiError('network');
  }

  if (response.ok) {
    return (await response.json()) as T;
  }

  if (response.status === 404) {
    throw new ApiError('notFound');
  }

  if (response.status === 401 || response.status === 403) {
    throw new ApiError('unauthorized');
  }

  throw new ApiError('server');
}

export function fetchSong(songName: string): Promise<Song> {
  return requestJson<Song>(`/music/${encodeURIComponent(songName)}`);
}

export async function findSong(slug: string): Promise<Song | null> {
  try {
    return await fetchSong(slug);
  } catch (error) {
    if (!(error instanceof ApiError) || error.kind !== 'notFound') {
      throw error;
    }

    const alternate = alternateSlug(slug);

    if (alternate === slug) {
      return null;
    }

    try {
      return await fetchSong(alternate);
    } catch (alternateError) {
      if (alternateError instanceof ApiError && alternateError.kind === 'notFound') {
        return null;
      }
      throw alternateError;
    }
  }
}

export function fetchSongsByArtist(artist: string): Promise<SongSummary[]> {
  return requestJson<SongSummary[]>(`/artist/${encodeURIComponent(artist)}`);
}

export function fetchCurrentUser(): Promise<UserProfile> {
  return requestJson<UserProfile>('/profile/me');
}

export function signInUrl(): string {
  return endpoint('/login');
}

export async function updateDisplayName(displayName: string): Promise<void> {
  let response: Response;

  try {
    response = await fetch(endpoint('/profile/me'), {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: displayName }),
    });
  } catch {
    throw new ApiError('network');
  }

  if (response.ok) {
    return;
  }

  if (response.status === 401 || response.status === 403) {
    throw new ApiError('unauthorized');
  }

  if (response.status === 404) {
    throw new ApiError('notFound');
  }

  throw new ApiError('server');
}

export async function logout(): Promise<void> {
  let response: Response;

  try {
    response = await fetch(endpoint('/logout'), { credentials: 'include' });
  } catch {
    throw new ApiError('network');
  }

  if (response.ok || response.status === 401 || response.status === 403 || response.status === 404) {
    return;
  }

  throw new ApiError('server');
}

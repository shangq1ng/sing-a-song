import { useNavigate, useSearchParams } from 'react-router';

import { ApiError, apiErrorMessage, fetchSongsByArtist, findSong } from '../api/client';
import type { Song, SongSummary } from '../api/types';
import { ArtistResults } from '../components/ArtistResults';
import { EmptyState, ErrorState } from '../components/Feedback';
import { SearchBar } from '../components/SearchBar';
import { SongListSkeleton } from '../components/Skeleton';
import { SongList } from '../components/SongList';
import { useAsync, type AsyncState } from '../hooks/useAsync';
import { searchUrl, slugify, type SearchKind } from '../utils/slug';

type SearchResult =
  | { kind: 'empty' }
  | { kind: 'song'; song: Song | null }
  | { kind: 'artist'; songs: SongSummary[] };

async function runSearch(term: string, kind: SearchKind): Promise<SearchResult> {
  const slug = slugify(term);

  if (!slug) {
    return { kind: 'empty' };
  }

  if (kind === 'artists') {
    try {
      return { kind: 'artist', songs: await fetchSongsByArtist(slug) };
    } catch (error) {
      if (error instanceof ApiError && error.kind === 'notFound') {
        return { kind: 'artist', songs: [] };
      }
      throw error;
    }
  }

  return { kind: 'song', song: await findSong(slug) };
}

function renderResult(state: AsyncState<SearchResult>, term: string, kind: SearchKind) {
  if (state.status === 'loading') {
    return <SongListSkeleton count={kind === 'artists' ? 3 : 1} />;
  }

  if (state.status === 'error') {
    return <ErrorState message={apiErrorMessage(state.error)} />;
  }

  const result = state.data;

  if (result.kind === 'empty') {
    return (
      <EmptyState
        title="Start with a song or an artist"
        message="Type a name above and choose whether to search tracks or artists."
      />
    );
  }

  if (result.kind === 'song') {
    return result.song ? (
      <SongList songs={[result.song]} showArtist />
    ) : (
      <EmptyState
        title="No track found"
        message="We couldn't find a track with that exact title."
      />
    );
  }

  return result.songs.length > 0 ? (
    <ArtistResults artist={term} songs={result.songs} />
  ) : (
    <EmptyState
      title="No artist found"
      message="We couldn't find songs linked to that exact artist name."
    />
  );
}

export function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const term = (params.get('q') ?? '').trim();
  const kind: SearchKind = params.get('type') === 'artists' ? 'artists' : 'tracks';
  const { state } = useAsync(() => runSearch(term, kind), [term, kind]);

  return (
    <div className="container page">
      <div className="tabs" role="tablist" aria-label="Result type">
        <button
          type="button"
          role="tab"
          className={kind === 'tracks' ? 'tab tab-active' : 'tab'}
          aria-selected={kind === 'tracks'}
          onClick={() => navigate(searchUrl(term, 'tracks'))}
        >
          Tracks
        </button>
        <button
          type="button"
          role="tab"
          className={kind === 'artists' ? 'tab tab-active' : 'tab'}
          aria-selected={kind === 'artists'}
          onClick={() => navigate(searchUrl(term, 'artists'))}
        >
          Artists
        </button>
      </div>

      <SearchBar
        key={term}
        initial={term}
        onSubmit={query => navigate(searchUrl(query, kind))}
      />

      <div className="results-head">
        <h1>{term ? `Results for \u201c${term}\u201d` : 'Search'}</h1>
      </div>

      {renderResult(state, term, kind)}
    </div>
  );
}

import { Link, useParams } from 'react-router';

import { apiErrorMessage, findSong } from '../api/client';
import { EmptyState, ErrorState } from '../components/Feedback';
import { SongCardSkeleton } from '../components/Skeleton';
import { SongCard } from '../components/SongCard';
import { useAsync } from '../hooks/useAsync';
import { slugify } from '../utils/slug';

export function SongPage() {
  const { name = '' } = useParams();
  const slug = slugify(name);
  const { state } = useAsync(
    () => (slug ? findSong(slug) : Promise.resolve(null)),
    [slug],
  );

  return (
    <div className="container page">
      <Link to="/" className="back-link">
        <i className="fa-solid fa-arrow-left" aria-hidden="true" />
        <span>Back to search</span>
      </Link>

      {!slug ? (
        <EmptyState
          title="No track selected"
          message="Search for a song by its exact title to open it here."
        />
      ) : null}

      {slug && state.status === 'loading' ? <SongCardSkeleton /> : null}
      {slug && state.status === 'error' ? (
        <ErrorState message={apiErrorMessage(state.error)} />
      ) : null}
      {slug && state.status === 'success' ? (
        state.data ? (
          <SongCard song={state.data} />
        ) : (
          <EmptyState
            title="No track found"
            message="We couldn't find a track with that exact title."
          />
        )
      ) : null}
    </div>
  );
}

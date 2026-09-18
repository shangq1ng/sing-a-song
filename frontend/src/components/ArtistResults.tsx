import { SongList } from './SongList';
import type { SongSummary } from '../api/types';
import { humanizeName } from '../utils/slug';

interface ArtistResultsProps {
  artist: string;
  songs: SongSummary[];
}

export function ArtistResults({ artist, songs }: ArtistResultsProps) {
  return (
    <section className="results">
      <header className="results-head">
        <h2>Songs by {humanizeName(artist)}</h2>
        <span className="results-count">{songs.length} result(s)</span>
      </header>
      <SongList songs={songs} />
    </section>
  );
}

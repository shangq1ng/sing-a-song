import { Link } from 'react-router';

import type { SongSummary } from '../api/types';
import { humanizeName, songUrl } from '../utils/slug';

interface SongListItemProps {
  song: SongSummary;
  showArtist?: boolean;
}

export function SongListItem({ song, showArtist = false }: SongListItemProps) {
  const featured = song.featured_artist ? `feat. ${humanizeName(song.featured_artist)}` : null;
  const meta = [showArtist ? humanizeName(song.artist) : null, featured, song.producer]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link to={songUrl(song.song_name)} className="song-link">
      <span className="song-link-icon" aria-hidden="true">
        <i className="fa-solid fa-music" />
      </span>
      <span className="song-link-body">
        <span className="song-link-title">{humanizeName(song.song_name)}</span>
        <span className="song-link-meta">{meta}</span>
      </span>
      <i className="fa-solid fa-chevron-right" aria-hidden="true" />
    </Link>
  );
}

interface SongListProps {
  songs: SongSummary[];
  showArtist?: boolean;
}

export function SongList({ songs, showArtist = false }: SongListProps) {
  return (
    <ul className="song-list">
      {songs.map(song => (
        <li key={song.song_name}>
          <SongListItem song={song} showArtist={showArtist} />
        </li>
      ))}
    </ul>
  );
}

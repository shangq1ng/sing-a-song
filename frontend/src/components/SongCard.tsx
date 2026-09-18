import type { Song } from '../api/types';

export function SongCard({ song }: { song: Song }) {
  return (
    <article className="song-card">
      <header className="song-card-head">
        <span className="song-icon" aria-hidden="true">
          <i className="fa-solid fa-compact-disc" />
        </span>
        <div>
          <h1 className="song-title">{song.song_name}</h1>
          <p className="song-artist">{song.artist}</p>
        </div>
      </header>

      <dl className="song-meta">
        <div>
          <dt>Artist</dt>
          <dd>{song.artist}</dd>
        </div>
        {song.featured_artist ? (
          <div>
            <dt>Featured</dt>
            <dd>{song.featured_artist}</dd>
          </div>
        ) : null}
        <div>
          <dt>Producer</dt>
          <dd>{song.producer}</dd>
        </div>
      </dl>

      {song.lyric.trim() ? (
        <section className="song-lyrics">
          <h2>Lyrics</h2>
          <pre className="lyrics-body">{song.lyric}</pre>
        </section>
      ) : null}
    </article>
  );
}

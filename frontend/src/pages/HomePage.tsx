import { useNavigate } from 'react-router';

import { SearchBar } from '../components/SearchBar';
import { searchUrl } from '../utils/slug';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <section className="hero">
        <h1>Find the song you're looking for.</h1>
        <p className="hero-sub">
          Search by track or artist and open every detail in a single click.
        </p>
        <SearchBar onSubmit={query => navigate(searchUrl(query, 'tracks'))} autoFocus />
        <p className="hero-note">Search using an exact song title or artist name.</p>
      </section>

      <section className="feature-grid" aria-label="What you can do">
        <article className="feature-card">
          <span className="feature-icon" aria-hidden="true">
            <i className="fa-solid fa-music" />
          </span>
          <h2>Tracks</h2>
          <p>Look up any song and see who performed and produced it.</p>
        </article>
        <article className="feature-card">
          <span className="feature-icon" aria-hidden="true">
            <i className="fa-solid fa-microphone-lines" />
          </span>
          <h2>Artists</h2>
          <p>Browse every song linked to an artist in one list.</p>
        </article>
        <article className="feature-card">
          <span className="feature-icon" aria-hidden="true">
            <i className="fa-solid fa-align-left" />
          </span>
          <h2>Lyrics</h2>
          <p>Read the lyrics attached to a track without leaving the page.</p>
        </article>
      </section>
    </div>
  );
}

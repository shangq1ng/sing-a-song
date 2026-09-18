export interface Song {
  artist: string;
  featured_artist: string | null;
  producer: string;
  song_name: string;
  lyric: string;
}

export interface SongSummary {
  artist: string;
  featured_artist: string | null;
  producer: string;
  song_name: string;
}

export interface UserProfile {
  username: string;
  display_name: string;
  avatar_url: string;
  email: string;
  locale: string | null;
}

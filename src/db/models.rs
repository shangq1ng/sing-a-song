use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::types::Uuid;
use sqlx::types::chrono::{DateTime, Utc};
use crate::error::models::DatabaseError;

// Entities
#[derive(Debug, FromRow)]
pub struct UserEntity {
    pub sub: String,
    pub id: Uuid,
    pub username: String,
    pub display_name: Option<String>,
    pub avatar_url: String,
    pub locale: Option<String>,
    pub email: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, FromRow)]
pub struct SongEntity {
    pub artist: String,
    pub featured_artist: Option<String>,
    pub producer: String,
    pub song_name: String,
    pub lyrics_key: String,
}

// DTOs
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateSongRequest {
    pub artist: String,
    pub featured_artist: Option<String>,
    pub producer: String,
    pub song_name: String,
    pub lyrics_key: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GetAllSongByAnArtist {
    pub artist: String,
    pub featured_artist: Option<String>,
    pub producer: String,
    pub song_name: String,
}


#[derive(Debug, Serialize)]
pub struct UserResponseSong {
    pub artist: String,
    pub featured_artist: Option<String>,
    pub producer: String,
    pub song_name: String,
    pub lyric: String,
}

impl TryFrom<SongEntity> for UserResponseSong {
    type Error = DatabaseError;
    fn try_from(value: SongEntity) -> Result<Self, Self::Error> {
        Ok(Self {
            artist: value.artist,
            featured_artist: value.featured_artist,
            producer: value.producer,
            song_name: value.song_name,
            lyric: value.lyrics_key,
        })
    }
}

#[derive(Debug, Serialize)]
pub struct UserResponseDTO {
    pub username: String,
    pub avatar_url: String,
    pub email: String,
    pub locale: Option<String>,
}

impl TryFrom<UserEntity> for UserResponseDTO {
    type Error = DatabaseError;
    fn try_from(value: UserEntity) -> Result<Self, Self::Error> {
        Ok(Self {
            username: value.username,
            email: value.email,
            avatar_url: value.avatar_url,
            locale: value.locale,
        })
    }
}

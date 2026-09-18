use std::str::FromStr;
use crate::config::models::DatabaseConfig;
use crate::db::models::{CreateSongRequest, GetAllSongByAnArtist, SongEntity, UserEntity, UserResponseDTO, UserResponseSong};
use crate::error::models::DatabaseError;
use axum::Json;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Redirect};
use sqlx::types::Uuid;
use tower_sessions::Session;
use crate::auth::models::ProviderUserResponseDTO;

pub async fn create_user(
    config: DatabaseConfig,
    data: &ProviderUserResponseDTO
) -> Result<String, DatabaseError> {
    if !data.name.is_empty() && !data.email.is_empty() {
         sqlx::query_as!(
            UserEntity,
            "INSERT INTO users (sub, username, email, locale, avatar_url)
             VALUES ($1, $2, $3, $4, $5)",
            data.sub,
            data.name,
            data.email,
            data.locale,
            data.picture,
        )
        .execute(&config.db)
        .await?;
        let usr_data = sqlx::query!("SELECT id from users").fetch_one(&config.db).await?;
        Ok(usr_data.id.to_string())
    } else {
        Err(DatabaseError::Unauthorized)
    }
}

pub async fn create_song(
    State(config): State<DatabaseConfig>,
    Json(payload): Json<CreateSongRequest>,
) -> Result<StatusCode, DatabaseError> {
    if !payload.artist.is_empty() && !payload.song_name.is_empty() {
        sqlx::query_as!(
            SongEntity,
            "INSERT INTO songs (artist, featured_artist, producer, song_name, lyrics_key) VALUES ($1, $2, $3, $4, $5)",
            payload.artist,
            payload.featured_artist,
            payload.producer,
            payload.song_name,
            payload.lyrics_key
        )
        .execute(&config.db)
        .await?;
        Ok(StatusCode::OK)
    } else {
        Err(DatabaseError::Unauthorized)
    }
}

pub async fn get_song_by_name(
    State(config): State<DatabaseConfig>,
    Path(song_name): Path<String>,
) -> Result<Json<UserResponseSong>, DatabaseError> {
    if !song_name.is_empty() {
        let query = sqlx::query_as!(
            SongEntity,
            "SELECT artist, featured_artist, producer, song_name, lyrics_key FROM songs WHERE song_name = $1",
            song_name,
        ).fetch_optional(&config.db).await?;

        match query {
            Some(e) => {
                let response = TryInto::<UserResponseSong>::try_into(e)?;
                 Ok(Json(response))
            }
            None => Err(DatabaseError::NotFound),
        }
    } else {
        Err(DatabaseError::Unauthorized)
    }
}

pub async fn get_user(
    State(config): State<DatabaseConfig>,
    session: Session,
) -> Result<Json<UserResponseDTO>, DatabaseError> {
    let get_id: String = session.get("user_id").await.map_err(|e| {
        tracing::error!("{e:?}");
        DatabaseError::NotFound
    })?.ok_or(DatabaseError::NotFound)?;

    let user_id = Uuid::from_str(&get_id).map_err(|_| DatabaseError::NotFound)?;

    let query = sqlx::query_as!(
        UserEntity,
        "SELECT sub, id, username, display_name, email, created_at, locale, avatar_url
         FROM users WHERE id = $1",
        user_id
        ).fetch_optional(&config.db).await?;

    match query {
        Some(e) => {
                let response = TryInto::<UserResponseDTO>::try_into(e)?;
                Ok(Json(response))
        },
        None => Err(DatabaseError::NotFound),
    }
}

pub async fn get_all_songs_by_artist(
    State(config): State<DatabaseConfig>,
    Path(artist): Path<String>,
) -> Result<Json<Vec<GetAllSongByAnArtist>>, DatabaseError> {
    if !artist.is_empty() {
        let query = sqlx::query_as!(
            SongEntity,
            "SELECT artist, featured_artist, producer, song_name, lyrics_key FROM songs WHERE artist = $1",
            artist,
        ).fetch_all(&config.db).await?;
    let response: Vec<GetAllSongByAnArtist> = query.into_iter().map(|vel| GetAllSongByAnArtist { artist: vel.artist, featured_artist: vel.featured_artist, producer: vel.producer,  song_name: vel.song_name }).collect();
        Ok(Json(response))
    } else {
        Err(DatabaseError::Unauthorized)
    }
}

pub async fn logout(
    State(config): State<DatabaseConfig>,
    session: Session,
) -> Result<impl IntoResponse, DatabaseError> {
    let user_id: String = session.get("user_id").await.map_err(|e| {
        tracing::error!("Couldn't find sub in session {e:?}");
        DatabaseError::NotFound
    })?.ok_or(DatabaseError::NotFound)?;

    let id = Uuid::from_str(&user_id).map_err(|_| DatabaseError::NotFound)?;

    sqlx::query_as!(UserEntity, "DELETE FROM users WHERE id = $1",
    id
    ).execute(&config.db).await?;
    Ok(Redirect::to("/home"))
}
use crate::auth::models::ProviderUserResponseDTO;
use crate::config::models::DatabaseConfig;
use crate::db::models::{
    CreateSongRequest, GetAllSongByAnArtist, SongEntity, UpdateDisplayNameRequestDTO, UserEntity,
    UserResponseDTO, UserResponseSong,
};
use crate::error::models::DatabaseError;
use axum::Json;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Redirect};
use tower_sessions::Session;

pub async fn create_user(
    config: DatabaseConfig,
    data: &ProviderUserResponseDTO,
) -> Result<String, DatabaseError> {
    if !data.name.is_empty() && !data.email.is_empty() {
        let usr_data =sqlx::query!(
            "INSERT INTO users (sub, username, display_name, avatar_url, email) VALUES ($1, $2, $3, $4, $5) RETURNING sub",
            data.sub,
            data.name,
            data.name,
            data.picture,
            data.email
        ).fetch_one(&config.db).await?;

        Ok(usr_data.sub.to_string())
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
    let get_id: String = session
        .get("user_id")
        .await
        .map_err(|e| {
            tracing::error!("{e:?}");
            DatabaseError::NotFound
        })?
        .ok_or(DatabaseError::NotFound)?;

    let query = sqlx::query_as!(
        UserEntity,
        "SELECT sub, id, username, display_name, email, created_at, locale, avatar_url
         FROM users WHERE sub = $1",
        get_id
    )
    .fetch_optional(&config.db)
    .await?;

    match query {
        Some(e) => {
            let response = TryInto::<UserResponseDTO>::try_into(e)?;
            Ok(Json(response))
        }
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
        let response: Vec<GetAllSongByAnArtist> = query
            .into_iter()
            .map(|vel| GetAllSongByAnArtist {
                artist: vel.artist,
                featured_artist: vel.featured_artist,
                producer: vel.producer,
                song_name: vel.song_name,
            })
            .collect();
        Ok(Json(response))
    } else {
        Err(DatabaseError::Unauthorized)
    }
}

pub async fn logout(
    session: Session,
) -> Result<impl IntoResponse, DatabaseError> {
    session.flush().await.map_err(|e| {
        tracing::error!("{e:?}");
        DatabaseError::Unauthorized
    })?;
    Ok(Redirect::to("http://127.0.0.1:3000/"))
}

pub async fn update_display_name(
    State(config): State<DatabaseConfig>,
    session: Session,
    Json(payload): Json<UpdateDisplayNameRequestDTO>,
) -> Result<impl IntoResponse, DatabaseError> {
    let user_id: String = session
        .get("user_id")
        .await
        .map_err(|e| {
            tracing::error!("{e:?}");
            DatabaseError::NotFound
        })?
        .ok_or(DatabaseError::NotFound)?;

    let name = payload.display_name.trim();
    if !name.is_empty() && name.len() <= 32 {
        sqlx::query!(
            "UPDATE users SET display_name = $1 WHERE sub = $2",
            payload.display_name,
            user_id
        )
        .execute(&config.db)
        .await?;
    }

    Ok(StatusCode::NO_CONTENT)
}

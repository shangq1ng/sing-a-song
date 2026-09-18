use crate::auth::handlers::{auth_client, oauth_callback, start_auth};
use crate::auth::models::AuthConfig;
use crate::config::models::DatabaseConfig;
use crate::session::handlers::start_redis;
use axum::Router;
use axum::routing::{get, patch, post};
use dotenvy::dotenv;
use tower_http::trace::{
    DefaultOnFailure, DefaultOnRequest, DefaultOnResponse, TraceLayer,
};
use tracing::Level;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::{EnvFilter, fmt};
use crate::db::handlers::{create_song, get_all_songs_by_artist, get_song_by_name, get_user, logout, update_display_name};

pub mod auth;
pub mod config;
pub mod db;
pub mod error;
pub mod session;

pub async fn app() -> anyhow::Result<()> {
    dotenv().map_err(|e| anyhow::anyhow!(e))?;
    tracing_subscriber::registry()
        .with(EnvFilter::new("debug"))
        .with(fmt::layer())
        .init();
    let session = start_redis().await?;
    let config = DatabaseConfig::new().await?;
    let auth_client = auth_client().await?;
    let state: AuthConfig = AuthConfig {
        config,
        auth_client,
    };

    let app: Router = Router::new()
        .route("/login", get(start_auth))
        .route("/login/callback", get(oauth_callback))
        .route("/new/song", post(create_song))
        .route("/music/{song_name}", get(get_song_by_name))
        .route("/profile/me", get(get_user))
        .route("/artist/{artist}", get(get_all_songs_by_artist))
        .route("/logout", get(logout))
        .route("/profile/me", patch(update_display_name))
        .layer(
            TraceLayer::new_for_http()
                .on_request(DefaultOnRequest::new().level(Level::INFO))
                .on_response(DefaultOnResponse::new().level(Level::INFO))
                .on_failure(DefaultOnFailure::new().level(Level::ERROR)),
        )
        .layer(session)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080").await?;

    axum::serve(listener, app).await?;

    Ok(())
}


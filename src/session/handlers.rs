use crate::error::models::SessionError;
use anyhow::Context;
use std::env;
use tower_sessions::cookie::SameSite;
use tower_sessions::cookie::time::Duration;
use tower_sessions::{Expiry, SessionManagerLayer};
use tower_sessions_redis_store::RedisStore;
use tower_sessions_redis_store::fred::prelude::{ClientLike, Config, Pool};

pub async fn start_redis() -> Result<SessionManagerLayer<RedisStore<Pool>>, SessionError> {
    let client = env::var("REDIS_URL")
        .context("Couldn't find REDIS_URL in .env, Make sure it's not empty")?;
    let config = Config::from_url(&client).context("Couldn't parse REDIS_URL")?;
    let pool = Pool::new(config, None, None, None, 10)?;
    pool.connect();
    pool.wait_for_connect().await?;

    let session_store = RedisStore::new(pool);
    let session_manager = SessionManagerLayer::new(session_store)
        .with_same_site(SameSite::Lax)
        .with_expiry(Expiry::OnInactivity(Duration::hours(24)))
        .with_secure(false)
        .with_http_only(true);

    Ok(session_manager)
}

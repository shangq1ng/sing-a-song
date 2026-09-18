use crate::auth::models::ProviderUserResponseDTO;
use crate::config::models::DatabaseConfig;
use crate::error::models::DatabaseError;

pub async fn check_if_user_already_in(
    state: &DatabaseConfig,
    user: &ProviderUserResponseDTO,
) -> Result<bool, Option<anyhow::Error>> {
    let user = sqlx::query!(
        "SELECT sub FROM users WHERE sub = $1",
        user.sub
    )
    .fetch_optional(&state.db)
    .await.map_err(DatabaseError::from).ok();

    match user {
        Some(_) => Ok(true),
        None => Err(None),
    }
}

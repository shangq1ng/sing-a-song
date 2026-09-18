use crate::auth::models::{AuthConfig, Client, ProviderResponseDTO, ProviderUserResponseDTO};
use crate::db::handlers::create_user;
use crate::db::helpers::check_if_user_already_in;
use crate::error::models::AuthError;
use anyhow::Context;
use axum::extract::{Query, State};
use axum::response::{IntoResponse, Redirect};
use oauth2::{
    AuthUrl, AuthorizationCode, ClientId, ClientSecret, CsrfToken, PkceCodeChallenge,
    PkceCodeVerifier, RedirectUrl, Scope, TokenResponse, TokenUrl, reqwest,
};
use std::env;
use subtle::ConstantTimeEq;
use tower_sessions::Session;

pub async fn auth_client() -> Result<Client, AuthError> {
    let client_id = env::var("CLIENT_ID").context("CLIENT_ID not set")?;
    let client_secret = env::var("CLIENT_SECRET").context("CLIENT_SECRET not set")?;
    let auth_url = env::var("AUTH_URL").context("AUTH_URL not set")?;
    let redirect_url = env::var("REDIRECT_URL").context("REDIRECT_URL not set")?;
    let token_url = env::var("TOKEN_URL").context("TOKEN_URL not set")?;

    let client = oauth2::basic::BasicClient::new(ClientId::new(client_id))
        .set_client_secret(ClientSecret::new(client_secret))
        .set_auth_uri(AuthUrl::new(auth_url)?)
        .set_redirect_uri(RedirectUrl::new(redirect_url)?)
        .set_token_uri(TokenUrl::new(token_url)?);

    Ok(client)
}

pub async fn start_auth(
    State(client): State<Client>,
    session: Session,
) -> Result<impl IntoResponse, AuthError> {
    let (pkce_challenge, pkce_verifier) = PkceCodeChallenge::new_random_sha256();
    session.insert("pkce_verifier", &pkce_verifier).await?;

    let (auth_url, csrf_token) = client
        .authorize_url(CsrfToken::new_random)
        .set_pkce_challenge(pkce_challenge)
        .add_scope(Scope::new("openid".to_string()))
        .add_scope(Scope::new("profile".to_string()))
        .add_scope(Scope::new("email".to_string()))
        .add_extra_param("prompt", "consent select_account")
        .url();

    session.insert("csrf_token", &csrf_token.secret()).await?;

    Ok(Redirect::to(auth_url.as_ref()))
}

pub async fn validate_csrf_token(
    req: &ProviderResponseDTO,
    session: &Session,
) -> Result<(), AuthError> {
    let csrf_token: String = session
        .remove("csrf_token")
        .await
        .map_err(|e| {
            tracing::debug!("Failed to remove csrf_token: {}", e);
            AuthError::NotFound
        })?
        .ok_or(AuthError::NotFound)?;

    let is_valid: bool = csrf_token.as_bytes().ct_eq(req.state.as_bytes()).into();

    match is_valid {
        true => Ok(()),
        false => Err(AuthError::Unauthorized),
    }?;

    Ok(())
}

pub async fn oauth_callback(
    State(client): State<Client>,
    State(config): State<AuthConfig>,
    Query(query): Query<ProviderResponseDTO>,
    session: Session,
) -> Result<impl IntoResponse, AuthError> {
    validate_csrf_token(&query, &session).await?;

    let val = session
        .remove("pkce_verifier")
        .await
        .map_err(|e| {
            tracing::debug!("Failed to remove pkce_verifier: {}", e);
            AuthError::NotFound
        })?
        .ok_or(AuthError::NotFound)?;

    let pkce_verifier = PkceCodeVerifier::new(val);

    let http_client = reqwest::Client::new();

    let token = client
        .exchange_code(AuthorizationCode::new(query.code))
        .set_pkce_verifier(pkce_verifier)
        .request_async(&http_client)
        .await
        .map_err(|e| AuthError::GenericError(e.into()))?;

    let fetch_user_data: ProviderUserResponseDTO = http_client
        .get("https://openidconnect.googleapis.com/v1/userinfo")
        .bearer_auth(token.access_token().secret())
        .send()
        .await?
        .json::<ProviderUserResponseDTO>()
        .await?;

    if check_if_user_already_in(&config.config, &fetch_user_data)
        .await
        .is_ok()
    {
        session.cycle_id().await?;
        session.insert("user_id", fetch_user_data.sub).await?;
        Ok(Redirect::to("http://127.0.0.1:3000/"))
    } else {
        let usr_data = create_user(config.config, &fetch_user_data)
            .await
            .context("Failed to create user")?;
        session.cycle_id().await?;
        session.insert("user_id", &usr_data).await?;
        Ok(Redirect::to("http://127.0.0.1:3000/"))
    }
}

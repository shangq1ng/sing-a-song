use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use oauth2::basic::BasicErrorResponse;
use oauth2::http::Error;
use oauth2::{HttpClientError, RequestTokenError};
use std::env;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error(transparent)]
    ReqwestError(#[from] oauth2::reqwest::Error),
    #[error(transparent)]
    TowerSessionError(#[from] tower_sessions::session::Error),
    #[error(transparent)]
    GenericError(#[from] anyhow::Error),
    #[error(transparent)]
    OauthParseError(#[from] oauth2::url::ParseError),
    #[error(transparent)]
    EnvParseError(#[from] env::VarError),
    #[error("NotFound")]
    NotFound,
    #[error("Forbidden")]
    Forbidden,
    #[error("Unauthorized")]
    Unauthorized,
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let auth_error = match self {
            Self::ReqwestError(e) => {
                tracing::error!("Reqwest Error: {e:?}");
                StatusCode::INTERNAL_SERVER_ERROR
            }
            Self::TowerSessionError(e) => {
                tracing::error!("Tower session error: {e:?}");
                StatusCode::INTERNAL_SERVER_ERROR
            }
            Self::GenericError(e) => {
                tracing::error!("Generic Error: {e:?}");
                StatusCode::INTERNAL_SERVER_ERROR
            }
            Self::OauthParseError(e) => {
                tracing::error!("Oauth Parsing Error: {e:?}");
                StatusCode::INTERNAL_SERVER_ERROR
            }
            Self::EnvParseError(e) => {
                tracing::error!("Env Parsing Error: {e:?}");
                StatusCode::INTERNAL_SERVER_ERROR
            }
            Self::NotFound => StatusCode::NOT_FOUND,
            Self::Forbidden => StatusCode::FORBIDDEN,
            Self::Unauthorized => StatusCode::UNAUTHORIZED,
        };
        auth_error.into_response()
    }
}

impl From<RequestTokenError<HttpClientError<Error>, BasicErrorResponse>> for AuthError {
    fn from(err: RequestTokenError<HttpClientError<Error>, BasicErrorResponse>) -> Self {
        Self::GenericError(err.into())
    }
}
#[derive(Debug, Error)]
pub enum SessionError {
    #[error(transparent)]
    RedisError(#[from] tower_sessions_redis_store::RedisStoreError),
    #[error("Failed to parse env var")]
    FailedToParse(#[from] env::VarError),
    #[error(transparent)]
    TowerSessionError(#[from] tower_sessions_redis_store::fred::error::Error),
    #[error(transparent)]
    GenericError(#[from] anyhow::Error),
}

impl IntoResponse for SessionError {
    fn into_response(self) -> Response {
        let session_error = match self {
            Self::RedisError(e) => {
                tracing::error!("Redis Error: {e:?}");
                StatusCode::INTERNAL_SERVER_ERROR
            }
            Self::FailedToParse(e) => {
                tracing::error!("Failed to parse env var: {}", e);
                StatusCode::BAD_REQUEST
            }
            Self::TowerSessionError(e) => {
                tracing::error!("Tower Session Error: {e:?}");
                StatusCode::INTERNAL_SERVER_ERROR
            }
            Self::GenericError(e) => {
                tracing::error!("Unexpected Error: {e:?}");
                StatusCode::INTERNAL_SERVER_ERROR
            }
        };

        session_error.into_response()
    }
}

#[derive(Debug, Error)]
pub enum DatabaseError {
    #[error(transparent)]
    SqlxError(#[from] sqlx::Error),
    #[error("Conflict")]
    Conflict,
    #[error("NotFound")]
    NotFound,
    #[error("Forbidden")]
    Forbidden,
    #[error("Unauthorized")]
    Unauthorized,
}

impl IntoResponse for DatabaseError {
    fn into_response(self) -> Response {
        let database_error = match self {
            Self::SqlxError(e) => {
                tracing::error!("Sqlx Error: {e:?}");
                StatusCode::INTERNAL_SERVER_ERROR
            }
            Self::Conflict => StatusCode::CONFLICT,
            Self::NotFound => StatusCode::NOT_FOUND,
            Self::Forbidden => StatusCode::FORBIDDEN,
            Self::Unauthorized => StatusCode::UNAUTHORIZED,
        };
        database_error.into_response()
    }
}

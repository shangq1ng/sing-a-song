use crate::config::models::DatabaseConfig;
use axum::extract::FromRef;
use oauth2::{EndpointNotSet, EndpointSet};
use serde::Deserialize;

pub type Client = oauth2::basic::BasicClient<
    EndpointSet,
    EndpointNotSet,
    EndpointNotSet,
    EndpointNotSet,
    EndpointSet,
>;

// Provider Response DTO
#[derive(Debug, Deserialize)]
pub struct ProviderResponseDTO {
    pub state: String,
    pub code: String,
}

#[derive(Debug, Deserialize)]
pub struct ProviderUserResponseDTO {
    pub sub: String,
    pub name: String,
    pub email: String,
    pub locale: Option<String>,
    pub picture: String,
}

#[derive(Clone)]
pub struct AuthConfig {
    pub config: DatabaseConfig,
    pub auth_client: Client,
}

impl FromRef<AuthConfig> for Client {
    fn from_ref(input: &AuthConfig) -> Self {
        input.auth_client.clone()
    }
}

impl FromRef<AuthConfig> for DatabaseConfig {
    fn from_ref(input: &AuthConfig) -> Self {
        input.config.clone()
    }
}

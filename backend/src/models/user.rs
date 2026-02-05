use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

//
// ===== USER STATUS (ENUM MAPPÉ SUR DU TEXT EN DB) =====
//
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum UserStatus {
    #[serde(rename = "online")]
    Online,
    #[serde(rename = "offline")]
    Offline,
}

// Implémentation manuelle de Type pour forcer SQLx à traiter l'enum comme du TEXT
impl sqlx::Type<sqlx::Postgres> for UserStatus {
    fn type_info() -> sqlx::postgres::PgTypeInfo {
        sqlx::postgres::PgTypeInfo::with_name("text")
    }
}

// Conversion du TEXT venant de la DB vers l'Enum Rust
impl<'r> sqlx::Decode<'r, sqlx::Postgres> for UserStatus {
    fn decode(value: sqlx::postgres::PgValueRef<'r>) -> Result<Self, sqlx::error::BoxDynError> {
        let s = <&str as sqlx::Decode<sqlx::Postgres>>::decode(value)?;
        match s {
            "online" => Ok(UserStatus::Online),
            _ => Ok(UserStatus::Offline),
        }
    }
}

// Conversion de l'Enum Rust vers le TEXT pour la DB
impl<'q> sqlx::Encode<'q, sqlx::Postgres> for UserStatus {
    fn encode_by_ref(&self, buf: &mut sqlx::postgres::PgArgumentBuffer) -> Result<sqlx::encode::IsNull, sqlx::error::BoxDynError> {
        let s = match self {
            UserStatus::Online => "online",
            UserStatus::Offline => "offline",
        };
        <&str as sqlx::Encode<sqlx::Postgres>>::encode_by_ref(&s, buf)
    }
}

impl Default for UserStatus {
    fn default() -> Self {
        Self::Offline
    }
}

//
// ===== USER (MODÈLE DE BASE DE DONNÉES) =====
//
#[derive(Debug, Clone, Serialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub username: String,
    pub avatar_url: Option<String>,
    pub status: UserStatus,
    pub created_at: DateTime<Utc>,
}

//
// ===== USER RESPONSE (POUR L'API) =====
//
#[derive(Debug, Clone, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub username: String,
    pub avatar_url: Option<String>,
    pub status: UserStatus,
    pub created_at: DateTime<Utc>,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar_url: user.avatar_url,
            status: user.status,
            created_at: user.created_at,
        }
    }
}

//
// ===== AUTH PAYLOADS =====
//
#[derive(Debug, Deserialize)]
pub struct SignupPayload {
    pub email: String,
    pub username: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginPayload {
    pub email: String,
    pub password: String,
}

//
// ===== AUTH RESPONSE =====
//
#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub user: UserResponse,
    pub token: String,
}

//
// ===== JWT CLAIMS =====
//
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,
    pub email: String,
    pub exp: usize,
    pub iat: usize,
}
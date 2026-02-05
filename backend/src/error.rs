use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde::Serialize;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", content = "data")]
pub enum Error {
    AuthFailNoAuthHeader,
    AuthFailInvalidToken,
    AuthFailTokenExpired,
    InvalidCredentials,
    EmailAlreadyExists,
    UserNotFound,
    ServerNotFound,
    ServerForbidden,
    ServerOwnerCannotLeave,
    ServerAlreadyMember,
    ChannelNotFound,
    ChannelForbidden,
    MessageNotFound,
    MessageForbidden,
    DatabaseError { message: String },
    InternalError { message: String },
    Database,
}

impl core::fmt::Display for Error {
    fn fmt(&self, f: &mut core::fmt::Formatter) -> core::fmt::Result {
        write!(f, "{self:?}")
    }
}

impl std::error::Error for Error {}

impl From<sqlx::Error> for Error {
    fn from(err: sqlx::Error) -> Self {
        Error::DatabaseError {
            message: err.to_string(),
        }
    }
}

impl From<bcrypt::BcryptError> for Error {
    fn from(err: bcrypt::BcryptError) -> Self {
        Error::InternalError {
            message: format!("Password error: {}", err),
        }
    }
}

impl From<jsonwebtoken::errors::Error> for Error {
    fn from(err: jsonwebtoken::errors::Error) -> Self {
        Error::InternalError {
            message: format!("JWT error: {}", err),
        }
    }
}
impl Error {
    pub fn client_status_and_error(&self) -> (StatusCode, &'static str) {
        match self {
            // Cas spécifiques
            Self::Database => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "DATABASE_ERROR",
            ),
            Self::EmailAlreadyExists => (
                StatusCode::BAD_REQUEST,
                "EMAIL_ALREADY_EXISTS",
            ),
            Self::InvalidCredentials => (
                StatusCode::UNAUTHORIZED,
                "INVALID_CREDENTIALS",
            ),
            // Pour tous les autres cas (AuthFail, InternalError, etc.)
            _ => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
            ),
        }
    }
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let (status, client_error) = self.client_status_and_error();

        let body = serde_json::json!({
            "error": client_error,
        });

        (status, Json(body)).into_response()
    }
}
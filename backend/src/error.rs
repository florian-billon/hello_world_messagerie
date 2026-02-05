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

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let (status, client_error) = self.client_status_and_error();

        let body = serde_json::json!({
            "error": client_error,
        });

        (status, Json(body)).into_response()
    }
}

impl Error {
    pub fn client_status_and_error(&self) -> (StatusCode, &'static str) {
        match self {
            Self::AuthFailNoAuthHeader => (StatusCode::UNAUTHORIZED, "Missing authorization header"),
            Self::AuthFailInvalidToken => (StatusCode::UNAUTHORIZED, "Invalid token"),
            Self::AuthFailTokenExpired => (StatusCode::UNAUTHORIZED, "Token expired"),
            Self::InvalidCredentials => (StatusCode::UNAUTHORIZED, "Invalid email or password"),
            Self::EmailAlreadyExists => (StatusCode::CONFLICT, "Email already exists"),
            Self::UserNotFound => (StatusCode::NOT_FOUND, "User not found"),
            Self::ServerNotFound => (StatusCode::NOT_FOUND, "Server not found"),
            Self::ServerForbidden => (StatusCode::FORBIDDEN, "Server access forbidden"),
            Self::ServerOwnerCannotLeave => (StatusCode::BAD_REQUEST, "Owner cannot leave server"),
            Self::ServerAlreadyMember => (StatusCode::CONFLICT, "Already a member"),
            Self::ChannelNotFound => (StatusCode::NOT_FOUND, "Channel not found"),
            Self::ChannelForbidden => (StatusCode::FORBIDDEN, "Channel access forbidden"),
            Self::MessageNotFound => (StatusCode::NOT_FOUND, "Message not found"),
            Self::MessageForbidden => (StatusCode::FORBIDDEN, "Message access forbidden"),
            Self::DatabaseError { .. } => (StatusCode::INTERNAL_SERVER_ERROR, "Database error"),
            Self::InternalError { .. } => (StatusCode::INTERNAL_SERVER_ERROR, "Internal error"),
        }
    }
}


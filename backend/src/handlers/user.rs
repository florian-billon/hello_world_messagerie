use axum::{extract::State, Json};
use axum_extra::TypedHeader;
use headers::{authorization::Bearer, Authorization};

use crate::models::{UpdateMePayload, UserResponse};
use crate::services::{self, verify_token, AuthError};
use crate::AppState;

pub async fn me(
    State(state): State<AppState>,
    TypedHeader(auth): TypedHeader<Authorization<Bearer>>,
) -> Result<Json<UserResponse>, AuthError> {
    let claims = verify_token(auth.token(), &state.jwt_secret)
        .map_err(|_| AuthError::InvalidCredentials)?;

    let user = services::user::get_me(&state.db, claims.sub).await?;
    Ok(Json(user))
}

pub async fn update_me(
    State(state): State<AppState>,
    TypedHeader(auth): TypedHeader<Authorization<Bearer>>,
    Json(payload): Json<UpdateMePayload>,
) -> Result<Json<UserResponse>, AuthError> {
    let claims = verify_token(auth.token(), &state.jwt_secret)
        .map_err(|_| AuthError::InvalidCredentials)?;

    let user = services::user::update_me(&state.db, claims.sub, payload).await?;
    Ok(Json(user))
}
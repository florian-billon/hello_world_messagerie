use axum::{extract::State, http::StatusCode, Json};

use crate::ctx::Ctx;
use crate::error::Result;
use crate::models::{AuthResponse, LoginPayload, SignupPayload, UserResponse};
use crate::services;
use crate::AppState;

pub async fn signup(
    State(state): State<AppState>,
    Json(payload): Json<SignupPayload>,
) -> Result<Json<AuthResponse>> { // <-- Changé UserResponse en AuthResponse
    // On passe &state.jwt_secret comme 3ème argument
    let res = services::signup(&state.user_repo, payload, &state.jwt_secret)
        .await
        .map_err(|e| {
            println!("DEBUG ERROR SIGNUP: {:?}", e);
            e
        })?;

    Ok(Json(res))
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginPayload>,
) -> Result<Json<AuthResponse>> {
    let response = services::login(&state.user_repo, payload, &state.jwt_secret).await?;
    Ok(Json(response))
}

pub async fn logout(
    State(state): State<AppState>,
    ctx: Ctx,
) -> Result<StatusCode> {
    services::logout(&state.user_repo, ctx.user_id()).await?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn me(
    State(state): State<AppState>,
    ctx: Ctx,
) -> Result<Json<UserResponse>> {
    let user = services::get_user_by_id(&state.user_repo, ctx.user_id()).await?;
    Ok(Json(user))
}

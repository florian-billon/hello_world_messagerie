use axum::{extract::State, Json};

use crate::ctx::Ctx;
use crate::models::{UpdateMePayload, UserResponse, UserStatus};
use crate::Error;
use crate::{AppState, Result};

pub async fn me(State(state): State<AppState>, ctx: Ctx) -> Result<Json<UserResponse>> {
    let user = state
        .user_repo
        .find_by_id(ctx.user_id())
        .await?
        .ok_or(Error::UserNotFound)?;

    Ok(Json(user.into()))
}

pub async fn update_me(
    State(state): State<AppState>,
    ctx: Ctx,
    Json(payload): Json<UpdateMePayload>,
) -> Result<Json<UserResponse>> {
    let should_broadcast_presence = payload.status.is_some();

    let user = state
        .user_repo
        .update_profile(ctx.user_id(), payload)
        .await?
        .ok_or(Error::UserNotFound)?;

    if should_broadcast_presence {
        let status = match user.status {
            UserStatus::Online => "online",
            UserStatus::Offline => "offline",
            UserStatus::Dnd => "dnd",
            UserStatus::Invisible => "invisible",
        };

        crate::services::realtime::handle_presence_update(
            &state,
            ctx.user_id(),
            status.to_string(),
        )
        .await;
    }

    Ok(Json(user.into()))
}

use crate::ctx::Ctx;
use crate::models::{CreateDMMessagePayload, CreateDMPayload, DMWithRecipient, DirectMessageItem};
use crate::{AppState, Error, Result};
use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct ListDMMessagesQuery {
    pub limit: Option<i64>,
}

pub async fn create_conversation(
    State(state): State<AppState>,
    ctx: Ctx,
    Json(payload): Json<CreateDMPayload>,
) -> Result<Json<DMWithRecipient>> {
    let target_username = payload.target_username.trim();
    if target_username.is_empty() {
        return Err(Error::BadRequest {
            message: "Target username cannot be empty".to_string(),
        });
    }

    let target_user = state
        .user_repo
        .get_by_username(target_username)
        .await?
        .ok_or(Error::UserNotFound)?;

    if target_user.id == ctx.user_id() {
        return Err(Error::BadRequest {
            message: "Cannot create a private conversation with yourself".to_string(),
        });
    }

    let conversation_id = state
        .dm_repo
        .create_or_get_dm(ctx.user_id(), target_user.id)
        .await?;

    let conversation = state
        .dm_repo
        .get_dm_details(conversation_id, ctx.user_id())
        .await?
        .ok_or(Error::MessageForbidden)?;

    Ok(Json(conversation))
}

pub async fn list_conversations(
    State(state): State<AppState>,
    ctx: Ctx,
) -> Result<Json<Vec<DMWithRecipient>>> {
    let conversations = state.dm_repo.list_user_dms(ctx.user_id()).await?;
    Ok(Json(conversations))
}

pub async fn list_messages(
    State(state): State<AppState>,
    ctx: Ctx,
    Path(dm_id): Path<Uuid>,
    Query(query): Query<ListDMMessagesQuery>,
) -> Result<Json<Vec<DirectMessageItem>>> {
    if !state.dm_repo.user_has_access(dm_id, ctx.user_id()).await? {
        return Err(Error::MessageForbidden);
    }

    let limit = query.limit.unwrap_or(50).clamp(1, 100);
    let messages = state.dm_repo.list_messages(dm_id, limit).await?;
    Ok(Json(messages))
}

pub async fn create_message(
    State(state): State<AppState>,
    ctx: Ctx,
    Path(dm_id): Path<Uuid>,
    Json(payload): Json<CreateDMMessagePayload>,
) -> Result<Json<DirectMessageItem>> {
    let content = payload.content.trim();
    if content.is_empty() {
        return Err(Error::BadRequest {
            message: "Message content cannot be empty".to_string(),
        });
    }

    if !state.dm_repo.user_has_access(dm_id, ctx.user_id()).await? {
        return Err(Error::MessageForbidden);
    }

    let message = state
        .dm_repo
        .create_message(dm_id, ctx.user_id(), content)
        .await?;

    Ok(Json(message))
}

use crate::ctx::Ctx;
use crate::models::{
    CreateDMMessagePayload, CreateDMPayload, DMWithRecipient, DirectMessageItem,
    DirectMessageItemResponse,
};
use crate::{AppState, Error, Result};
use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;
use uuid::Uuid;

fn to_response(message: DirectMessageItem, username: String) -> DirectMessageItemResponse {
    DirectMessageItemResponse {
        id: message.message_id,
        dm_id: message.dm_id,
        author_id: message.author_id,
        username,
        content: message.content,
        created_at: message.created_at,
        edited_at: message.edited_at,
    }
}

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
) -> Result<Json<Vec<DirectMessageItemResponse>>> {
    if !state.dm_repo.user_has_access(dm_id, ctx.user_id()).await? {
        return Err(Error::MessageForbidden);
    }

    let limit = query.limit.unwrap_or(50).clamp(1, 100);
    let messages = state
        .dm_message_repo
        .list_by_dm(dm_id, limit)
        .await
        .map_err(|e| Error::DatabaseError {
            message: format!("MongoDB query failed: {}", e),
        })?;

    if messages.is_empty() {
        return Ok(Json(vec![]));
    }

    let author_ids: Vec<Uuid> = messages.iter().map(|message| message.author_id).collect();
    let usernames = state.user_repo.get_usernames_batch(&author_ids).await?;

    let response = messages
        .into_iter()
        .map(|message| {
            let username = usernames
                .get(&message.author_id)
                .cloned()
                .unwrap_or_else(|| "Unknown".to_string());
            to_response(message, username)
        })
        .collect();

    Ok(Json(response))
}

pub async fn create_message(
    State(state): State<AppState>,
    ctx: Ctx,
    Path(dm_id): Path<Uuid>,
    Json(payload): Json<CreateDMMessagePayload>,
) -> Result<Json<DirectMessageItemResponse>> {
    let content = payload.content.trim();
    if content.is_empty() {
        return Err(Error::BadRequest {
            message: "Message content cannot be empty".to_string(),
        });
    }

    if !state.dm_repo.user_has_access(dm_id, ctx.user_id()).await? {
        return Err(Error::MessageForbidden);
    }

    let message = DirectMessageItem {
        id: None,
        message_id: Uuid::new_v4(),
        dm_id,
        author_id: ctx.user_id(),
        content: content.to_string(),
        created_at: chrono::Utc::now(),
        edited_at: None,
        deleted_at: None,
    };

    state
        .dm_message_repo
        .create(&message)
        .await
        .map_err(|e| Error::DatabaseError {
            message: format!("MongoDB insert failed: {}", e),
        })?;

    let username = state
        .user_repo
        .get_username(ctx.user_id())
        .await?
        .ok_or(Error::UserNotFound)?;

    Ok(Json(to_response(message, username)))
}

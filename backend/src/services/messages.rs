use chrono::Utc;
use uuid::Uuid;

use crate::error::{Error, Result};
use crate::models::{CreateMessagePayload, MessageWithUser, UpdateMessagePayload};
use crate::repositories::{ChannelRepository, MessageRepository, ServerRepository, UserRepository};
use crate::services::{channels, servers};

// ======================
// CREATE MESSAGE
// ======================
pub async fn create_message(
    server_repo: &ServerRepository,
    channel_repo: &ChannelRepository,
    user_repo: &UserRepository,
    message_repo: &MessageRepository,
    channel_id: Uuid,
    user_id: Uuid,
    payload: CreateMessagePayload,
) -> Result<MessageWithUser> {
    // 1. Vérifications de permissions
    let channel = channels::get_channel(server_repo, channel_repo, channel_id, user_id).await?;

    servers::get_member(server_repo, channel.server_id, user_id)
        .await?
        .ok_or(Error::MessageForbidden)?;

    // Dans src/services/messages.rs -> create_message
    let username = user_repo
        .get_username(user_id)
        .await?
        .ok_or(Error::UserNotFound)?;

   // ... après avoir récupéré le username via user_repo
    let message = message_repo
    .create(channel_id, user_id, &username, &payload.content)
    .await
    .map_err(|e| Error::DatabaseError {
        message: format!("PostgreSQL insert failed: {}", e),
    })?;

    // 3. Retour de la réponse
    Ok(MessageWithUser {
        id: message.id, // Utilise l'ID généré par la DB
        server_id: channel.server_id,
        channel_id: message.channel_id,
        author_id: message.user_id,
        username,
        content: message.content,
        created_at: message.created_at,
        edited_at: None,
    })
}

// ======================
// LIST MESSAGES
// ======================
pub async fn list_messages(
    server_repo: &ServerRepository,
    channel_repo: &ChannelRepository,
    user_repo: &UserRepository,
    message_repo: &MessageRepository,
    channel_id: Uuid,
    user_id: Uuid,
    limit: i64,
    before: Option<Uuid>,
) -> Result<Vec<MessageWithUser>> {
    let channel = channels::get_channel(server_repo, channel_repo, channel_id, user_id).await?;

    servers::get_member(server_repo, channel.server_id, user_id)
        .await?
        .ok_or(Error::MessageForbidden)?;

    // Appel à la nouvelle fonction PostgreSQL
    let messages = message_repo
        .list_by_channel(channel_id, limit, before)
        .await
        .map_err(|e| Error::DatabaseError {
            message: format!("PostgreSQL query failed: {}", e),
        })?;

    if messages.is_empty() {
        return Ok(vec![]);
    }

    // Récupération des pseudos pour l'affichage
    let author_ids: Vec<Uuid> = messages.iter().map(|m| m.user_id).collect();
    let usernames = user_repo.get_usernames_batch(&author_ids).await?;

    let mut result: Vec<MessageWithUser> = messages
        .into_iter()
        .map(|m| MessageWithUser {
            id: m.id,
            server_id: channel.server_id,
            channel_id: m.channel_id,
            author_id: m.user_id,
            username: usernames
                .get(&m.user_id)
                .cloned()
                .unwrap_or_else(|| "Unknown".to_string()),
            content: m.content,
            created_at: m.created_at,
            edited_at: None,
        })
        .collect();
    
    // On remet les messages dans l'ordre chronologique pour le front
    result.reverse();
    Ok(result)
}
pub async fn delete_message(message_repo: &MessageRepository, message_id: Uuid, user_id: Uuid) -> Result<()> {
    let message = message_repo.find_by_id(message_id).await
        .map_err(|e| Error::DatabaseError { message: e.to_string() })?
        .ok_or(Error::MessageNotFound)?;

    if message.user_id != user_id { return Err(Error::MessageForbidden); }

    message_repo.soft_delete(message_id).await
        .map_err(|e| Error::DatabaseError { message: e.to_string() })?;
    Ok(())
}

pub async fn update_message(message_repo: &MessageRepository, message_id: Uuid, user_id: Uuid, payload: UpdateMessagePayload) -> Result<MessageWithUser> {
    let message = message_repo.find_by_id(message_id).await
        .map_err(|e| Error::DatabaseError { message: e.to_string() })?
        .ok_or(Error::MessageNotFound)?;

    if message.user_id != user_id { return Err(Error::MessageForbidden); }

    message_repo.update_content(message_id, &payload.content).await
        .map_err(|e| Error::DatabaseError { message: e.to_string() })?;

    Ok(MessageWithUser {
        id: message.id,
        server_id: Uuid::nil(), // Optionnel : à récupérer via channel si besoin
        channel_id: message.channel_id,
        author_id: message.user_id,
        username: String::from("Me"),
        content: payload.content,
        created_at: message.created_at,
        edited_at: Some(Utc::now()),
    })
}
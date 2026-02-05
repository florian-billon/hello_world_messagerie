use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct ChannelMessage {
    pub id: Uuid,
    pub channel_id: Uuid,
    pub user_id: Uuid,
    pub username: String, // Ajoute ce champ s'il manquait
    pub content: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize)]
pub struct MessageWithUser {
    pub id: Uuid,
    pub server_id: Uuid,
    pub channel_id: Uuid,
    pub author_id: Uuid,
    pub username: String,
    pub content: String,
    pub created_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub edited_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateMessagePayload {
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMessagePayload {
    pub content: String,
}
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct DirectMessage {
    pub id: Uuid,
    pub user1_id: Uuid,
    pub user2_id: Uuid,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct DMWithRecipient {
    pub id: Uuid,
    pub recipient_id: Uuid,
    pub username: String,
    pub avatar_url: Option<String>,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDMPayload {
    pub target_username: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateDMMessagePayload {
    pub content: String,
}

#[derive(Debug, Serialize, FromRow)]
pub struct DirectMessageItem {
    pub id: Uuid,
    pub dm_id: Uuid,
    pub author_id: Uuid,
    pub username: String,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub edited_at: Option<DateTime<Utc>>,
}

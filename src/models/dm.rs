use serde::{Deserialize, Serialize};
use sqlx::FromRow; // sqlx avant uuid (ordre alphabétique)
use uuid::Uuid;

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct DirectMessage {
    pub id: Uuid,
    pub user1_id: Uuid,
    pub user2_id: Uuid,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DMWithRecipient {
    pub id: Uuid,
    pub recipient_id: Uuid,
    pub username: String,
    pub avatar_url: Option<String>,
    pub status: String,
}

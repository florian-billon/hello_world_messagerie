use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct DirectMessage {
    pub id: Uuid,
    pub user1_id: Uuid,
    pub user2_id: Uuid,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDMPayload {
    pub target_username: String,
}

#[derive(Debug, Serialize)]
pub struct DMWithRecipient {
    pub id: Uuid,
    pub recipient: RecipientInfo,
    pub last_msg: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct RecipientInfo {
    pub id: Uuid,
    pub username: String,
    pub avatar_url: Option<String>,
    pub status: String,
}
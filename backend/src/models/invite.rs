use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Invite {
    pub id: Uuid,
    pub server_id: Uuid,
    pub code: String,
    pub created_by: Uuid,
    pub expires_at: Option<DateTime<Utc>>,
    pub max_uses: Option<i32>,
    pub uses_count: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateInvitePayload {
    pub expires_at: Option<DateTime<Utc>>,
    pub max_uses: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct JoinServerWithCodePayload {
    pub code: String,
}

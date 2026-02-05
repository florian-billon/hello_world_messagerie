use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

//
// ===== SERVER
//
#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Server {
    pub id: Uuid,
    pub name: String,
    pub owner_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

//
// ===== SERVER MEMBER (role = STRING)
//
#[derive(Debug, Clone, Serialize, FromRow)]
pub struct ServerMember {
    pub server_id: Uuid,
    pub user_id: Uuid,
    pub role: String,
    pub joined_at: DateTime<Utc>,
}

//
// ===== PAYLOADS
//
#[derive(Debug, Deserialize)]
pub struct CreateServerPayload {
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateServerPayload {
    pub name: Option<String>,
}

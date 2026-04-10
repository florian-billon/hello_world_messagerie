use crate::error::Result;
use crate::models::dm::{DirectMessage, DMWithRecipient};
use uuid::Uuid;
use sqlx::PgPool;

#[derive(Clone)]
pub struct DmRepository {
    pool: PgPool,
}

impl DmRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create_or_get_dm(&self, u1: Uuid, u2: Uuid) -> Result<Uuid> {
        let (first, second) = if u1 < u2 { (u1, u2) } else { (u2, u1) };

        let row = sqlx::query!(
            r#"
            INSERT INTO direct_messages (user1_id, user2_id)
            VALUES ($1, $2)
            ON CONFLICT (user1_id, user2_id) DO UPDATE SET created_at = NOW()
            RETURNING id
            "#,
            first, second
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(row.id)
    }

    pub async fn list_user_dms(&self, user_id: Uuid) -> Result<Vec<DMWithRecipient>> {
        let rows = sqlx::query!(
            r#"
            SELECT 
                dm.id,
                u.id as recipient_id,
                u.username,
                u.avatar_url,
                u.status
            FROM direct_messages dm
            JOIN users u ON (u.id = dm.user1_id OR u.id = dm.user2_id)
            WHERE (dm.user1_id = $1 OR dm.user2_id = $1)
              AND u.id != $1
            ORDER BY dm.created_at DESC
            "#,
            user_id
        )
        .fetch_all(&self.pool)
        .await?;

        // Mapping vers ta structure DMWithRecipient
        // ...
    }
}
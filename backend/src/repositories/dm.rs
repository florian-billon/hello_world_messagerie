use crate::error::Result;
use crate::models::dm::{DMWithRecipient, DirectMessage};
use sqlx::PgPool;
use uuid::Uuid;

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

        let row = sqlx::query(
            r#"
            INSERT INTO direct_messages (user1_id, user2_id)
            VALUES ($1, $2)
            ON CONFLICT (user1_id, user2_id) DO UPDATE SET created_at = NOW()
            RETURNING id
            "#,
            first,
            second,
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(row.id)
    }

    pub async fn list_user_dms(&self, user_id: Uuid) -> Result<Vec<DMWithRecipient>> {
        // ... (ton code de list_user_dms ici)
        Ok(vec![]) // Exemple
    }
}

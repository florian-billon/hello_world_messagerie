use sqlx::{PgPool, query_as, query_scalar}; // On utilise les fonctions, pas les macros
use uuid::Uuid;
use crate::models::ChannelMessage;
use chrono::{DateTime, Utc};

#[derive(Clone)]
pub struct MessageRepository {
    pool: PgPool,
}
impl MessageRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, channel_id: Uuid, user_id: Uuid, username: &str, content: &str) -> sqlx::Result<ChannelMessage> {
        query_as::<_, ChannelMessage>(
            r#"
            INSERT INTO messages (id, content, channel_id, user_id, username, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id, content, channel_id, user_id, username, created_at
            "#
        )
        .bind(Uuid::new_v4())
        .bind(content)
        .bind(channel_id)
        .bind(user_id)
        .bind(username)
        .fetch_one(&self.pool)
        .await
    }
    pub async fn find_by_id(&self, id: Uuid) -> sqlx::Result<Option<ChannelMessage>> {
        query_as::<_, ChannelMessage>("SELECT id, channel_id, user_id, content, created_at FROM messages WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }
pub async fn list_by_channel(&self, channel_id: Uuid, limit: i64, before: Option<Uuid>) -> sqlx::Result<Vec<ChannelMessage>> {
    let mut before_ts: Option<DateTime<Utc>> = None;

    if let Some(bid) = before {
        // On récupère la date du message pivot
        before_ts = query_scalar::<_, DateTime<Utc>>("SELECT created_at FROM messages WHERE id = $1")
            .bind(bid)
            .fetch_optional(&self.pool)
            .await?;
    }

    query_as::<_, ChannelMessage>(
        r#"
        SELECT id, content, channel_id, user_id, username, created_at 
        FROM messages
        WHERE channel_id = $1 
          AND ($3::TIMESTAMPTZ IS NULL OR created_at < $3)
        ORDER BY created_at DESC
        LIMIT $2
        "#
    )
    .bind(channel_id)
    .bind(limit)
    .bind(before_ts)
    .fetch_all(&self.pool)
    .await
}

    pub async fn update_content(&self, id: Uuid, content: &str) -> sqlx::Result<()> {
        sqlx::query("UPDATE messages SET content = $1 WHERE id = $2")
            .bind(content)
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn soft_delete(&self, id: Uuid) -> sqlx::Result<()> {
        sqlx::query("DELETE FROM messages WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::Invite;

#[derive(Clone)]
pub struct InviteRepository {
    pool: PgPool,
}

impl InviteRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create(
        &self,
        invite_id: Uuid,
        server_id: Uuid,
        code: &str,
        created_by: Uuid,
        expires_at: Option<chrono::DateTime<chrono::Utc>>,
        max_uses: Option<i32>,
    ) -> sqlx::Result<Invite> {
        sqlx::query_as::<_, Invite>(
            r#"
            INSERT INTO invites (id, server_id, code, created_by, expires_at, max_uses, uses_count, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, 0, NOW())
            RETURNING id, server_id, code, created_by, expires_at, max_uses, uses_count, created_at
            "#,
        )
        .bind(invite_id)
        .bind(server_id)
        .bind(code)
        .bind(created_by)
        .bind(expires_at)
        .bind(max_uses)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn find_by_code(&self, code: &str) -> sqlx::Result<Option<Invite>> {
        sqlx::query_as::<_, Invite>(
            "SELECT id, server_id, code, created_by, expires_at, max_uses, uses_count, created_at FROM invites WHERE code = $1",
        )
        .bind(code)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn list_by_server(&self, server_id: Uuid) -> sqlx::Result<Vec<Invite>> {
        sqlx::query_as::<_, Invite>(
            "SELECT id, server_id, code, created_by, expires_at, max_uses, uses_count, created_at FROM invites WHERE server_id = $1 ORDER BY created_at DESC",
        )
        .bind(server_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn increment_uses(&self, invite_id: Uuid) -> sqlx::Result<()> {
        sqlx::query("UPDATE invites SET uses_count = uses_count + 1 WHERE id = $1")
            .bind(invite_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}

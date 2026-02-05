use sqlx::PgPool;
use uuid::Uuid;

use crate::models::{UpdateMePayload, User, UserStatus};

#[derive(Clone)]
pub struct UserRepository {
    pool: PgPool,
}

impl UserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn find_by_id(&self, user_id: Uuid) -> sqlx::Result<Option<User>> {
        sqlx::query_as::<_, User>(
            "SELECT id, email, password_hash, username, avatar_url, status, created_at FROM users WHERE id = $1",
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn find_by_email(&self, email: &str) -> sqlx::Result<Option<User>> {
        sqlx::query_as::<_, User>(
            "SELECT id, email, password_hash, username, avatar_url, status, created_at FROM users WHERE email = $1",
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn email_exists(&self, email: &str) -> sqlx::Result<bool> {
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users WHERE email = $1")
            .bind(email)
            .fetch_one(&self.pool)
            .await?;

        Ok(count > 0)
    }

    pub async fn create(
        &self,
        id: Uuid,
        email: &str,
        password_hash: &str,
        username: &str,
        status: UserStatus,
    ) -> sqlx::Result<User> {
        sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (id, email, password_hash, username, status, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id, email, password_hash, username, avatar_url, status, created_at
            "#,
        )
        .bind(id)
        .bind(email)
        .bind(password_hash)
        .bind(username)
        .bind(status)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn update_status(&self, user_id: Uuid, status: UserStatus) -> sqlx::Result<()> {
        sqlx::query("UPDATE users SET status = $1 WHERE id = $2")
            .bind(status)
            .bind(user_id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    pub async fn get_usernames_batch(
        &self,
        user_ids: &[Uuid],
    ) -> sqlx::Result<std::collections::HashMap<Uuid, String>> {
        if user_ids.is_empty() {
            return Ok(std::collections::HashMap::new());
        }

        let rows: Vec<(Uuid, String)> = sqlx::query_as(
            "SELECT id, username FROM users WHERE id = ANY($1)"
        )
        .bind(user_ids)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows.into_iter().collect())
    }

    pub async fn get_username(&self, user_id: Uuid) -> sqlx::Result<Option<String>> {
        let username: Option<String> = sqlx::query_scalar("SELECT username FROM users WHERE id = $1")
            .bind(user_id)
            .fetch_optional(&self.pool)
            .await?;
        Ok(username)
    }

    pub async fn update_profile(&self, user_id: Uuid, payload: UpdateMePayload,) -> sqlx::Result<Option<User>> {
        sqlx::query_as::<_, User>(
            "UPDATE users SET 
                username = COALESCE($1, username), 
                avatar_url = COALESCE($2, avatar_url), 
                status = COALESCE($3, status) 
            WHERE id = $4
            RETURNING id, email, password_hash, username, avatar_url, status, created_at",
        )
        .bind(payload.username)
        .bind(payload.avatar_url)
        .bind(payload.status)
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
    }
}


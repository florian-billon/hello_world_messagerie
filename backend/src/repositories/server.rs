use sqlx::PgPool;
use uuid::Uuid;

use crate::models::{MemberRole, Server, ServerMember};

#[derive(Clone)]
pub struct ServerRepository {
    pool: PgPool,
}

impl ServerRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create(
        &self,
        server_id: Uuid,
        name: &str,
        owner_id: Uuid,
    ) -> sqlx::Result<Server> {
        sqlx::query_as::<_, Server>(
            r#"
            INSERT INTO servers (id, name, owner_id, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING id, name, owner_id, created_at, updated_at
            "#,
        )
        .bind(server_id)
        .bind(name)
        .bind(owner_id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn find_by_id(&self, server_id: Uuid) -> sqlx::Result<Option<Server>> {
        sqlx::query_as::<_, Server>(
            "SELECT id, name, owner_id, created_at, updated_at FROM servers WHERE id = $1",
        )
        .bind(server_id)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn list_by_user(&self, user_id: Uuid) -> sqlx::Result<Vec<Server>> {
        sqlx::query_as::<_, Server>(
            r#"
            SELECT s.id, s.name, s.owner_id, s.created_at, s.updated_at
            FROM servers s
            INNER JOIN server_members sm ON s.id = sm.server_id
            WHERE sm.user_id = $1
            ORDER BY s.created_at DESC
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn update(&self, server_id: Uuid, name: Option<String>) -> sqlx::Result<Option<Server>> {
        sqlx::query_as::<_, Server>(
            r#"
            UPDATE servers
            SET name = COALESCE($1, name), updated_at = NOW()
            WHERE id = $2
            RETURNING id, name, owner_id, created_at, updated_at
            "#,
        )
        .bind(name)
        .bind(server_id)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn delete(&self, server_id: Uuid) -> sqlx::Result<()> {
        sqlx::query("DELETE FROM servers WHERE id = $1")
            .bind(server_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn find_member(
        &self,
        server_id: Uuid,
        user_id: Uuid,
    ) -> sqlx::Result<Option<ServerMember>> {
        sqlx::query_as::<_, ServerMember>(
            "SELECT server_id, user_id, role, joined_at FROM server_members WHERE server_id = $1 AND user_id = $2",
        )
        .bind(server_id)
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn add_member(
        &self,
        server_id: Uuid,
        user_id: Uuid,
        role: MemberRole,
    ) -> sqlx::Result<ServerMember> {
        sqlx::query_as::<_, ServerMember>(
            r#"
            INSERT INTO server_members (server_id, user_id, role, joined_at)
            VALUES ($1, $2, $3::member_role, NOW())
            RETURNING server_id, user_id, role, joined_at
            "#,
        )
        .bind(server_id)
        .bind(user_id)
        .bind(role)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn remove_member(&self, server_id: Uuid, user_id: Uuid) -> sqlx::Result<()> {
        sqlx::query("DELETE FROM server_members WHERE server_id = $1 AND user_id = $2")
            .bind(server_id)
            .bind(user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn list_members(&self, server_id: Uuid) -> sqlx::Result<Vec<ServerMember>> {
        sqlx::query_as::<_, ServerMember>(
            "SELECT server_id, user_id, role, joined_at FROM server_members WHERE server_id = $1 ORDER BY joined_at",
        )
        .bind(server_id)
        .fetch_all(&self.pool)
        .await
    }
}


use crate::error::Result;
use crate::models::dm::DMWithRecipient; // On a enlevé DirectMessage car inutilisé
use sqlx::{PgPool, Row}; // Import de Row pour accéder aux colonnes
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
        )
        .bind(first)  // On lie le premier argument ($1)
        .bind(second) // On lie le deuxième argument ($2)
        .fetch_one(&self.pool)
        .await?;

        // Avec query (sans !), on récupère la colonne par son nom ou index
        let id: Uuid = row.get("id"); 
        Ok(id)
    }

    pub async fn list_user_dms(&self, _user_id: Uuid) -> Result<Vec<DMWithRecipient>> {
        // Ajout d'un underscore devant user_id pour dire à Rust qu'il est 
        // normal qu'il soit inutilisé pour l'instant.
        Ok(vec![])
    }
}

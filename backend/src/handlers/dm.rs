use crate::{AppState, Error, Result};
use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize)]
pub struct CreateDMRequest {
    pub target_username: String,
}

#[derive(Serialize)]
pub struct DMResponse {
    pub id: Uuid,
    pub status: String,
}

pub async fn create_conversation(
    State(state): State<AppState>,
    Json(payload): Json<CreateDMRequest>,
) -> Result<Json<DMResponse>> {
    // 1. On cherche l'utilisateur cible (Correction du nom de méthode)
    let target_user = state
        .user_repo
        .get_user_by_username(&payload.target_username) // Adapté selon tes logs
        .await
        .map_err(|_| Error::UserNotFound)?;

    // 2. On crée le DM (il faut ton ID et l'ID de la cible)
    // Note: On utilise u1 et u2 comme demandé par ton DmRepository
    // Pour l'instant, on simule l'ID de l'envoyeur, idéalement il vient de ton JWT/Ctx
    let current_user_id = Uuid::new_v4(); 

    let conversation_id = state
        .dm_repo
        .create_or_get_dm(current_user_id, target_user.id) // Méthode réelle détectée
        .await
        .map_err(|_| Error::InternalError { 
            message: "Erreur lors de la création du DM".to_string() 
        })?;

    // 3. Réponse
    Ok(Json(DMResponse {
        id: conversation_id,
        status: "success".to_string(),
    }))
}
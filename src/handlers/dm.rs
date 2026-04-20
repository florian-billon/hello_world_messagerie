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
    // 1. Chercher l'utilisateur par son pseudo
    let target_user = state
        .user_repo
        .get_by_username(&payload.target_username)
        .await
        .map_err(|_| Error::UserNotFound)?
        .ok_or(Error::UserNotFound)?;

    // 2. Créer ou récupérer le DM (u1, u2)
    // TODO: Récupérer l'ID de l'utilisateur connecté via les claims JWT
    let current_user_id = Uuid::new_v4();

    let conversation_id = state
        .dm_repo
        .create_or_get_dm(current_user_id, target_user.id)
        .await
        .map_err(|_| Error::InternalError {
            message: "Erreur lors de la création du DM".to_string(),
        })?;

    // 3. Réponse JSON
    Ok(Json(DMResponse {
        id: conversation_id,
        status: "success".to_string(),
    }))
}

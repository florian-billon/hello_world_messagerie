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
    // 1. On cherche l'utilisateur cible
    let target_user = state
        .user_repo
        .get_user_by_username(&payload.target_username)
        .await
        .map_err(|_| Error::UserNotFound)?;

    // 2. On crée le DM (il faut ton ID et l'ID de la cible)
    let current_user_id = Uuid::new_v4();

    let conversation_id = state
        .dm_repo
        .create_or_get_dm(current_user_id, target_user.id)
        .await
        .map_err(|_| Error::InternalError {
            message: "Erreur lors de la création du DM".to_string(),
        })?;

    // 3. Réponse
    Ok(Json(DMResponse {
        id: conversation_id,
        status: "success".to_string(),
    }))
}

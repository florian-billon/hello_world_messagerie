use axum::{extract::State, Json};
use crate::{AppState, Error, Result};
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
    // 1. Chercher l'utilisateur cible par son pseudo
    let target_user = state
        .user_repo
        .find_by_username(&payload.target_username)
        .await
        .map_err(|_| Error::UserNotFound)?;

    // 2. Créer la conversation dans ton repository DM
    // Note : Vérifie si ton dm_repo nécessite aussi l'ID de l'utilisateur qui fait la requête
    let conversation = state
        .dm_repo
        .create_dm(target_user.id) 
        .await
        .map_err(|_| Error::InternalServer)?;

    // 3. Retourner l'ID au frontend pour redirection
    Ok(Json(DMResponse {
        id: conversation.id,
        status: "success".to_string(),
    }))
}
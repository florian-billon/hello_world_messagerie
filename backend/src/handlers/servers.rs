use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::AppState;

/// Modèle Server (temporaire - sera remplacé par PostgreSQL)
#[derive(Clone, Serialize, Deserialize)]
pub struct Server {
    pub id: Uuid,
    pub name: String,
    pub description: String,
}

#[derive(Deserialize)]
pub struct CreateServerPayload {
    pub name: String,
    pub description: String,
}

#[derive(Deserialize)]
pub struct UpdateServerPayload {
    pub name: Option<String>,
    pub description: Option<String>,
}

/// POST /servers - Créer un serveur
pub async fn create_server(
    State(state): State<AppState>,
    Json(payload): Json<CreateServerPayload>,
) -> Json<Server> {
    let server = Server {
        id: Uuid::new_v4(),
        name: payload.name,
        description: payload.description,
    };

    let mut servers = state.servers.lock().await;
    servers.insert(server.id, server.clone());

    Json(server)
}

/// GET /servers - Lister les serveurs
pub async fn list_servers(State(state): State<AppState>) -> Json<Vec<Server>> {
    let servers = state.servers.lock().await;
    let server_list: Vec<Server> = servers.values().cloned().collect();

    Json(server_list)
}

/// GET /servers/{id} - Obtenir un serveur
pub async fn get_server(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Server>, StatusCode> {
    let servers = state.servers.lock().await;
    servers
        .get(&id)
        .cloned()
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

/// PUT /servers/{id} - Mettre à jour un serveur
pub async fn update_server(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateServerPayload>,
) -> Result<Json<Server>, StatusCode> {
    let mut servers = state.servers.lock().await;

    let server = servers.get_mut(&id).ok_or(StatusCode::NOT_FOUND)?;

    if let Some(name) = payload.name {
        server.name = name;
    }
    if let Some(description) = payload.description {
        server.description = description;
    }

    Ok(Json(server.clone()))
}

/// DELETE /servers/{id} - Supprimer un serveur
pub async fn delete_server(State(state): State<AppState>, Path(id): Path<Uuid>) -> StatusCode {
    let mut servers = state.servers.lock().await;

    match servers.remove(&id) {
        Some(_) => StatusCode::NO_CONTENT,
        None => StatusCode::NOT_FOUND,
    }
}


//! Gestion de la présence utilisateur (online/offline)

use uuid::Uuid;

use crate::web::ws::protocol::ServerEvent;
use crate::AppState;

/// Marque un utilisateur comme en ligne lors de la connexion WebSocket
pub async fn handle_user_online(state: &AppState, user_id: Uuid) {
    // Mettre à jour le statut en DB (optionnel, pour persistance)
    // Pour l'instant, on broadcast juste l'événement

    let event = ServerEvent::PresenceUpdate {
        user_id,
        status: "online".to_string(),
    };

    // Broadcast à tous les serveurs où l'utilisateur est membre
    // Pour simplifier, on broadcast à toutes les connexions pour l'instant
    // Dans une vraie app, on devrait filtrer par serveurs communs
    state.ws_hub.send_to_user(user_id, &event).await;
}

/// Marque un utilisateur comme hors ligne lors de la déconnexion WebSocket
pub async fn handle_user_offline(state: &AppState, user_id: Uuid) {
    let event = ServerEvent::PresenceUpdate {
        user_id,
        status: "offline".to_string(),
    };

    // Broadcast à tous les serveurs où l'utilisateur est membre
    state.ws_hub.send_to_user(user_id, &event).await;
}

/// Traite une mise à jour de présence manuelle (dnd, invisible, etc.)
pub async fn handle_presence_update(state: &AppState, user_id: Uuid, status: String) {
    // Valider le statut
    let valid_statuses = ["online", "offline", "dnd", "invisible"];
    if !valid_statuses.contains(&status.as_str()) {
        return;
    }

    let event = ServerEvent::PresenceUpdate {
        user_id,
        status: status.clone(),
    };

    // Broadcast
    state.ws_hub.send_to_user(user_id, &event).await;

    // Optionnel : sauvegarder en DB
    // state.user_repo.update_status(user_id, status).await?;
}

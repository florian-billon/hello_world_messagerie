use axum::{routing::{get, post}, Router};
use crate::{handlers, AppState};

pub fn routes() -> Router<AppState> {
    Router::new()
        // public: voir une invite (preview)
        .route("/invites/{code}", get(handlers::invite::get_invite))
        // protected: accepter l'invite
        .route("/invites/{code}/accept", post(handlers::invite::accept_invite))
        // protected: créer une invite pour un serveur
        .route("/servers/{server_id}/invites", post(handlers::invite::create_invite))
}
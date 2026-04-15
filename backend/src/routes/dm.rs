use axum::{routing::post, Router};
use crate::AppState;
use crate::handlers; // Assure-toi que tes handlers existent

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/conversations", post(handlers::dm::create_conversation))
}
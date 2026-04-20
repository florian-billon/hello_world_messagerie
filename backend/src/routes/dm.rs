use crate::handlers;
use crate::AppState;
use axum::{routing::get, Router};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/conversations",
            get(handlers::dm::list_conversations).post(handlers::dm::create_conversation),
        )
        .route(
            "/conversations/{dm_id}/messages",
            get(handlers::dm::list_messages).post(handlers::dm::create_message),
        )
}

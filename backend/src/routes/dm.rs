use crate::handlers;
use crate::AppState;
use axum::{routing::post, Router};

pub fn routes() -> Router<AppState> {
    Router::new().route("/conversations", post(handlers::dm::create_conversation))
}

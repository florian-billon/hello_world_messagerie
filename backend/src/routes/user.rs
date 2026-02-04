use axum::{routing::{get, patch}, Router};
use crate::{handlers::user, AppState};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/me", get(user::me))
        .route("/me", patch(user::update_me))
}
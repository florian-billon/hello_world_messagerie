use axum::{routing::post, Router};
use crate::handlers::auth;
use crate::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/auth/signup", post(auth::signup))
        .route("/auth/login", post(auth::login))
}

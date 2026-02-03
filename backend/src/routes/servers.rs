#[allow(unused_imports)]
use axum::{routing::delete, routing::get, routing::post, routing::put, Router};

use crate::handlers::servers;
use crate::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/servers", post(servers::create_server).get(servers::list_servers))
        .route(
            "/servers/{id}",
            get(servers::get_server)
                .put(servers::update_server)
                .delete(servers::delete_server),
        )
        .route("/servers/{id}/join", post(servers::join_server))
        .route("/servers/{id}/leave", delete(servers::leave_server))
        .route("/servers/{id}/members", get(servers::list_members))
}


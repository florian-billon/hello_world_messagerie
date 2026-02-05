use axum::{
    routing::{delete, get, post},
    Router,
};

use crate::handlers::servers;
use crate::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        // -------- SERVERS --------
        .route("/servers", post(servers::create_server).get(servers::list_servers))
        .route(
            "/servers/{id}",
            get(servers::get_server)
                .delete(servers::delete_server),
        )

        // -------- MEMBERS --------
        .route("/servers/{id}/join", post(servers::join_server))
        .route("/servers/{id}/leave", delete(servers::leave_server))
        .route("/servers/{id}/members", get(servers::list_members))
}

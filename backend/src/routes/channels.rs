#[allow(unused_imports)]
use axum::{routing::delete, routing::get, routing::post, routing::put, Router};

use crate::handlers::channels;
use crate::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/servers/{server_id}/channels",
            post(channels::create_channel).get(channels::list_channels),
        )
        .route(
            "/channels/{id}",
            get(channels::get_channel)
                .put(channels::update_channel)
                .delete(channels::delete_channel),
        )
}


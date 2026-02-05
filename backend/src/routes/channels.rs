use axum::{
    routing::{get, post, delete, put},
    Router,
};

use crate::handlers::channels;
use crate::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        // -------- CHANNELS PAR SERVEUR --------
        .route(
            "/servers/{id}/channels",
            get(channels::list_channels)
                .post(channels::create_channel),
        )

        // -------- CHANNEL UNIQUE --------
        .route(
            "/channels/{id}",
            get(channels::get_channel)
                .put(channels::update_channel)
                .delete(channels::delete_channel),
        )
}

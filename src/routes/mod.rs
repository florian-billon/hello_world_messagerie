pub mod auth;
pub mod channels;
pub mod dm;
pub mod invites;
pub mod messages;
pub mod servers;

use crate::AppState;
use axum::Router;

pub fn create_router() -> Router<AppState> {
    Router::new()
        .nest("/servers", servers::routes())
        .merge(channels::routes())
        .merge(messages::routes())
        .merge(invites::routes())
        .merge(dm::routes())
}

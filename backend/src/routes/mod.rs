pub mod auth;
pub mod channels;
pub mod invites;
pub mod messages;
pub mod servers;
pub mod dm; // <--- 1. Ajoute cette ligne (ou 'pub mod conversations' selon le nom du fichier)

use axum::Router;
use crate::AppState;

pub fn create_router() -> Router<AppState> {
    Router::new()
        .nest("/servers", servers::routes())
        .merge(channels::routes())
        .merge(messages::routes())
        .merge(invites::routes())
        .merge(dm::routes()) // <--- 2. Ajoute cette ligne pour inclure les routes de DM
}
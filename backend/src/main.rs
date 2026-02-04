<<<<<<< HEAD
//! Real-time chat application backend

pub use self::error::{Error, Result};

use axum::{
    middleware,
    routing::{get, post},
    Router,
};
use mongodb::{Client as MongoClient, Database as MongoDatabase};
=======
use axum::routing::get;
>>>>>>> 4f1952a (arch backend)
use sqlx::postgres::PgPoolOptions;
use tower_http::cors::{Any, CorsLayer};

mod ctx;
mod error;
mod handlers;
mod models;
mod repositories;
mod routes;
mod services;
<<<<<<< HEAD
mod web;
use repositories::{ChannelRepository, MessageRepository, ServerRepository, UserRepository};

=======
mod repositories;
mod routes;

use handlers::servers;

/// État partagé de l'application
>>>>>>> 4f1952a (arch backend)
#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::PgPool,
    pub mongo: MongoDatabase,
    pub jwt_secret: String,
    pub user_repo: UserRepository,
    pub server_repo: ServerRepository,
    pub channel_repo: ChannelRepository,
    pub message_repo: MessageRepository,
}

async fn health() -> &'static str {
    "OK"
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5433/helloworld".to_string());
    let jwt_secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "super_secret_jwt_key_change_in_production".to_string());

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await
        .expect("Failed to connect to PostgreSQL");

    let mongodb_url = std::env::var("MONGODB_URL")
        .unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
    let mongo_client = MongoClient::with_uri_str(&mongodb_url)
        .await
        .expect("Failed to connect to MongoDB");
    let mongo_db = mongo_client.database("helloworld");

    let user_repo = UserRepository::new(pool.clone());
    let server_repo = ServerRepository::new(pool.clone());
    let channel_repo = ChannelRepository::new(pool.clone());
    let message_repo = MessageRepository::new(mongo_db.clone());

    let state = AppState {
        db: pool,
        mongo: mongo_db,
        jwt_secret,
        user_repo,
        server_repo,
        channel_repo,
        message_repo,
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

<<<<<<< HEAD
    let routes_protected = routes::create_router()
        .route("/me", get(handlers::auth::me))
        .route("/auth/logout", post(handlers::auth::logout))
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            web::mw_require_auth,
        ));

    let routes_public = Router::new()
        .route("/health", get(health))
        .merge(routes::auth::routes());

    let app = Router::new()
        .merge(routes_public)
        .merge(routes_protected)
        .layer(middleware::from_fn_with_state(
            state.clone(),
            web::mw_ctx_resolver,
        ))
        .layer(cors)
        .with_state(state);

    let port = std::env::var("PORT").unwrap_or_else(|_| "3001".to_string());
    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr)
=======
    let app = routes::app_routes()
        .route("/health", get(health))
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
>>>>>>> 4f1952a (arch backend)
        .await
        .unwrap_or_else(|_| panic!("Failed to bind to port {}", port));

<<<<<<< HEAD
    println!("Server running on http://localhost:{}", port);
=======
    println!("Backend running on http://localhost:3001");
>>>>>>> 4f1952a (arch backend)

    axum::serve(listener, app)
        .await
        .expect("Server failed to start");
}
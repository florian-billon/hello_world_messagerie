use axum::{
    routing::{get, post},
    Router,
};
use sqlx::postgres::PgPoolOptions;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::cors::{Any, CorsLayer};
use uuid::Uuid;

mod handlers;
mod models;
mod services;

use handlers::{auth, servers};

/// État partagé de l'application
#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::PgPool,
    pub jwt_secret: String,
    pub servers: Arc<Mutex<HashMap<Uuid, servers::Server>>>, // Temporaire
}

/// Health check
async fn health() -> &'static str {
    "OK"
}

#[tokio::main]
async fn main() {
    // Charger les variables d'environnement
    dotenvy::dotenv().ok();

    // Configuration
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/helloworld".to_string());
    let jwt_secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "super_secret_jwt_key_change_in_production".to_string());

    // Connexion à PostgreSQL
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await
        .expect("Failed to connect to PostgreSQL");

    println!("Connected to PostgreSQL");

    // État de l'application
    let state = AppState {
        db: pool,
        jwt_secret,
        servers: Arc::new(Mutex::new(HashMap::new())),
    };

    // CORS pour le frontend
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Routes
    let app = Router::new()
        // Health
        .route("/health", get(health))
        // Auth
        .route("/auth/signup", post(auth::signup))
        .route("/auth/login", post(auth::login))
        .route("/auth/logout", post(auth::logout))
        .route("/me", get(auth::me))
        // Servers (temporaire - in-memory)
        .route("/servers", post(servers::create_server).get(servers::list_servers))
        .route(
            "/servers/{id}",
            get(servers::get_server)
                .put(servers::update_server)
                .delete(servers::delete_server),
        )
        .layer(cors)
        .with_state(state);

    // Démarrage du serveur
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .expect("Failed to bind to port 3001");

    println!("Backend running on http://localhost:3001");
    println!("Endpoints:");
    println!("   POST /auth/signup  - Create account");
    println!("   POST /auth/login   - Login");
    println!("   POST /auth/logout  - Logout");
    println!("   GET  /me           - Get current user");
    println!("   GET  /health       - Health check");

    axum::serve(listener, app)
        .await
        .expect("Server failed to start");
}

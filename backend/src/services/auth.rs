use sqlx::PgPool;
use uuid::Uuid;

use crate::models::{AuthResponse, LoginPayload, SignupPayload, User, UserResponse, UserStatus};
use crate::services::{create_token, hash_password, verify_password};

/// Erreurs d'authentification
#[derive(Debug, thiserror::Error)]
pub enum AuthError {
    #[error("Email already exists")]
    EmailExists,
    #[error("Invalid credentials")]
    InvalidCredentials,
    #[error("User not found")]
    UserNotFound,
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Password hash error: {0}")]
    PasswordHash(#[from] bcrypt::BcryptError),
    #[error("JWT error: {0}")]
    Jwt(#[from] jsonwebtoken::errors::Error),
}

/// Crée un nouvel utilisateur
pub async fn signup(
    pool: &PgPool,
    payload: SignupPayload,
    jwt_secret: &str,
) -> Result<AuthResponse, AuthError> {
    // Vérifier si l'email existe déjà
    let existing = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM users WHERE email = $1")
        .bind(&payload.email)
        .fetch_one(pool)
        .await?;

    if existing > 0 {
        return Err(AuthError::EmailExists);
    }

    // Hasher le mot de passe
    let password_hash = hash_password(&payload.password)?;

    // Créer l'utilisateur
    let user = sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (id, email, password_hash, username, status, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id, email, password_hash, username, avatar_url, status, created_at
        "#,
    )
    .bind(Uuid::new_v4())
    .bind(&payload.email)
    .bind(&password_hash)
    .bind(&payload.username)
    .bind(UserStatus::Online)
    .fetch_one(pool)
    .await?;

    // Générer le token
    let token = create_token(user.id, &user.email, jwt_secret)?;

    Ok(AuthResponse {
        user: user.into(),
        token,
    })
}

/// Connecte un utilisateur
pub async fn login(
    pool: &PgPool,
    payload: LoginPayload,
    jwt_secret: &str,
) -> Result<AuthResponse, AuthError> {
    // Récupérer l'utilisateur par email
    let user = sqlx::query_as::<_, User>(
        "SELECT id, email, password_hash, username, avatar_url, status, created_at FROM users WHERE email = $1",
    )
    .bind(&payload.email)
    .fetch_optional(pool)
    .await?
    .ok_or(AuthError::InvalidCredentials)?;

    // Vérifier le mot de passe
    if !verify_password(&payload.password, &user.password_hash)? {
        return Err(AuthError::InvalidCredentials);
    }

    // Mettre à jour le statut en ligne
    sqlx::query("UPDATE users SET status = $1 WHERE id = $2")
        .bind(UserStatus::Online)
        .bind(user.id)
        .execute(pool)
        .await?;

    // Générer le token
    let token = create_token(user.id, &user.email, jwt_secret)?;

    Ok(AuthResponse {
        user: user.into(),
        token,
    })
}

/// Récupère un utilisateur par son ID
pub async fn get_user_by_id(pool: &PgPool, user_id: Uuid) -> Result<UserResponse, AuthError> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, email, password_hash, username, avatar_url, status, created_at FROM users WHERE id = $1",
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?
    .ok_or(AuthError::UserNotFound)?;

    Ok(user.into())
}

/// Déconnecte un utilisateur (met son statut offline)
pub async fn logout(pool: &PgPool, user_id: Uuid) -> Result<(), AuthError> {
    sqlx::query("UPDATE users SET status = $1 WHERE id = $2")
        .bind(UserStatus::Offline)
        .bind(user_id)
        .execute(pool)
        .await?;

    Ok(())
}


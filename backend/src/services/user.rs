use std::result::Result;

use sqlx::PgPool;
use uuid::Uuid;

use crate::models::{UpdateMePayload, UserResponse};
use crate::repositories::user_repo;
use crate::services::AuthError;

pub async fn get_me(db: &PgPool, user_id: Uuid) -> Result<UserResponse, AuthError> {
    let user = user_repo::get_user_by_id(db, user_id)
        .await
        .map_err(AuthError::Database)?
        .ok_or(AuthError::UserNotFound)?;

    Ok(user.into())
}

pub async fn update_me(db: &PgPool, user_id: Uuid, payload: UpdateMePayload) -> Result<UserResponse, AuthError> {
    if let Some(ref username) = payload.username {
        let u = username.trim();
        if u.len() < 3 || u.len() > 20 {
            return Err(AuthError::InvalidCredentials);
        }
    }
    let user = user_repo::update_user_by_id(db, user_id, payload)
        .await
        .map_err(AuthError::Database)?
        .ok_or(AuthError::UserNotFound)?;
    Ok(user.into())
    
}


use uuid::Uuid;
use crate::error::{Error, Result};
use crate::models::{AuthResponse, LoginPayload, SignupPayload, UserResponse};
use crate::repositories::UserRepository;
use crate::services::{create_token, hash_password, verify_password};

//
// ======================
// SIGNUP
// ======================
//

// Modifie le retour : Result<UserResponse> -> Result<AuthResponse>
// Ajoute jwt_secret dans les arguments
pub async fn signup(
    user_repo: &UserRepository,
    payload: SignupPayload,
    jwt_secret: &str, // On ajoute le secret ici
) -> Result<AuthResponse> {
    let password_hash = hash_password(&payload.password)?;

    let user_id = Uuid::new_v4();

    // ⚠️ Attention à l'ordre des arguments ici, vérifie qu'il matche ton UserRepository::create
    let user = user_repo
        .create(
            user_id,
            &payload.email,
            &password_hash,
            &payload.username,
        )
        .await
        .map_err(|_| Error::Database)?;

    // GÉNÉRATION DU TOKEN
    let token = create_token(user.id, &user.email, jwt_secret)?;

    // ON RENVOIE L'AUTHRESPONSE COMPLÈTE
    Ok(AuthResponse {
        user: user.into(),
        token,
    })
}

//
// ======================
// LOGIN
// ======================
//
pub async fn login(
    user_repo: &UserRepository,
    payload: LoginPayload,
    jwt_secret: &str,
) -> Result<AuthResponse> {
    let user = user_repo
        .find_by_email(&payload.email)
        .await?
        .ok_or(Error::InvalidCredentials)?;

    if !verify_password(&payload.password, &user.password_hash)? {
        return Err(Error::InvalidCredentials);
    }

    let token = create_token(user.id, &user.email, jwt_secret)?;

    Ok(AuthResponse {
        user: user.into(),
        token,
    })
}

//
// ======================
// GET CURRENT USER
// ======================
//
pub async fn get_user_by_id(
    user_repo: &UserRepository,
    user_id: Uuid,
) -> Result<UserResponse> {
    let user = user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(Error::UserNotFound)?;

    Ok(user.into())
}

//
// ======================
// LOGOUT
// ======================
//
pub async fn logout(
    _user_repo: &UserRepository,
    _user_id: Uuid,
) -> Result<()> {
    // Pas de session serveur → logout côté client uniquement
    Ok(())
}

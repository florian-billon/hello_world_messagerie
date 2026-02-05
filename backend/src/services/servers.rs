use uuid::Uuid;

use crate::error::{Error, Result};
use crate::models::{
    CreateServerPayload,
    Server,
    ServerMember,
    UpdateServerPayload,
};
use crate::repositories::{ServerRepository, UserRepository};

//
// ======================
// CREATE SERVER
// ======================
//
pub async fn create_server(
    server_repo: &ServerRepository,
    user_repo: &UserRepository,
    owner_id: Uuid,
    payload: CreateServerPayload,
) -> Result<Server> {
    // Vérifier que l'utilisateur existe
    user_repo
        .find_by_id(owner_id)
        .await?
        .ok_or(Error::UserNotFound)?;

    let server_id = Uuid::new_v4();

    // Créer le serveur
    let server = server_repo
        .create(server_id, &payload.name, owner_id)
        .await?;

    // Ajouter le créateur comme OWNER
    server_repo
        .add_member(server_id, owner_id, "owner")
        .await?;

    Ok(server)
}

//
// ======================
// LIST USER SERVERS
// ======================
//
pub async fn list_user_servers(
    server_repo: &ServerRepository,
    user_id: Uuid,
) -> Result<Vec<Server>> {
    Ok(server_repo.list_by_user(user_id).await?)
}

//
// ======================
// GET SERVER
// ======================
//
pub async fn get_server(
    server_repo: &ServerRepository,
    server_id: Uuid,
) -> Result<Server> {
    server_repo
        .find_by_id(server_id)
        .await?
        .ok_or(Error::ServerNotFound)
}

//
// ======================
// GET MEMBER
// ======================
//
pub async fn get_member(
    server_repo: &ServerRepository,
    server_id: Uuid,
    user_id: Uuid,
) -> Result<Option<ServerMember>> {
    Ok(server_repo.find_member(server_id, user_id).await?)
}

//
// ======================
// UPDATE SERVER
// ======================
//
pub async fn update_server(
    server_repo: &ServerRepository,
    server_id: Uuid,
    user_id: Uuid,
    payload: UpdateServerPayload,
) -> Result<Server> {
    let member = server_repo
        .find_member(server_id, user_id)
        .await?
        .ok_or(Error::ServerForbidden)?;

    if member.role != "owner" {
        return Err(Error::ServerForbidden);
    }

    server_repo
        .update(server_id, payload.name)
        .await?
        .ok_or(Error::ServerNotFound)
}

//
// ======================
// DELETE SERVER
// ======================
//
pub async fn delete_server(
    server_repo: &ServerRepository,
    server_id: Uuid,
    user_id: Uuid,
) -> Result<()> {
    let server = server_repo
        .find_by_id(server_id)
        .await?
        .ok_or(Error::ServerNotFound)?;

    if server.owner_id != user_id {
        return Err(Error::ServerForbidden);
    }

    server_repo.delete(server_id).await?;
    Ok(())
}

//
// ======================
// JOIN SERVER
// ======================
//
pub async fn join_server(
    server_repo: &ServerRepository,
    server_id: Uuid,
    user_id: Uuid,
) -> Result<ServerMember> {
    server_repo
        .find_by_id(server_id)
        .await?
        .ok_or(Error::ServerNotFound)?;

    if server_repo.find_member(server_id, user_id).await?.is_some() {
        return Err(Error::ServerAlreadyMember);
    }

    Ok(
        server_repo
            .add_member(server_id, user_id, "member")
            .await?
    )
}

//
// ======================
// LEAVE SERVER
// ======================
//
pub async fn leave_server(
    server_repo: &ServerRepository,
    server_id: Uuid,
    user_id: Uuid,
) -> Result<()> {
    let server = server_repo
        .find_by_id(server_id)
        .await?
        .ok_or(Error::ServerNotFound)?;

    if server.owner_id == user_id {
        return Err(Error::ServerOwnerCannotLeave);
    }

    server_repo.remove_member(server_id, user_id).await?;
    Ok(())
}

//
// ======================
// LIST MEMBERS
// ======================
//
pub async fn list_members(
    server_repo: &ServerRepository,
    server_id: Uuid,
) -> Result<Vec<ServerMember>> {
    Ok(server_repo.list_members(server_id).await?)
}

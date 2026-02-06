use uuid::Uuid;

use crate::error::{Error, Result};
use crate::models::{
    CreateServerPayload, MemberRole, Server, ServerMember, TransferOwnershipPayload,
    UpdateServerPayload,
};
use crate::repositories::{ServerRepository, UserRepository};

pub async fn create_server(
    server_repo: &ServerRepository,
    user_repo: &UserRepository,
    owner_id: Uuid,
    payload: CreateServerPayload,
) -> Result<Server> {
    user_repo
        .find_by_id(owner_id)
        .await?
        .ok_or(Error::UserNotFound)?;

    let server_id = Uuid::new_v4();

    let server = server_repo
        .create(server_id, &payload.name, owner_id)
        .await
        .map_err(|e| {
            let err_str = e.to_string();
            if err_str.contains("owner_id_fkey") || err_str.contains("servers_owner_id_fkey") {
                Error::UserNotFound
            } else {
                Error::from(e)
            }
        })?;

    server_repo
        .add_member(server_id, owner_id, MemberRole::Owner)
        .await
        .map_err(|e| {
            let err_str = e.to_string();
            if err_str.contains("duplicate key") || err_str.contains("server_members_pkey") {
                Error::ServerAlreadyMember
            } else {
                Error::from(e)
            }
        })?;

    Ok(server)
}

pub async fn list_user_servers(
    server_repo: &ServerRepository,
    user_id: Uuid,
) -> Result<Vec<Server>> {
    let servers = server_repo.list_by_user(user_id).await?;
    Ok(servers)
}

pub async fn get_server(server_repo: &ServerRepository, server_id: Uuid) -> Result<Server> {
    let server = server_repo
        .find_by_id(server_id)
        .await?
        .ok_or(Error::ServerNotFound)?;

    Ok(server)
}

pub async fn get_member(
    server_repo: &ServerRepository,
    server_id: Uuid,
    user_id: Uuid,
) -> Result<Option<ServerMember>> {
    let member = server_repo.find_member(server_id, user_id).await?;
    Ok(member)
}

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

    if member.role == MemberRole::Member {
        return Err(Error::ServerForbidden);
    }

    let server = server_repo
        .update(server_id, payload.name)
        .await?
        .ok_or(Error::ServerNotFound)?;

    Ok(server)
}

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

    let member = server_repo
        .add_member(server_id, user_id, MemberRole::Member)
        .await?;

    Ok(member)
}

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

pub async fn list_members(
    server_repo: &ServerRepository,
    server_id: Uuid,
) -> Result<Vec<ServerMember>> {
    let members = server_repo.list_members(server_id).await?;
    Ok(members)
}

pub async fn update_member_role(
    server_repo: &ServerRepository,
    server_id: Uuid,
    target_user_id: Uuid,
    new_role: MemberRole,
    requester_id: Uuid,
) -> Result<ServerMember> {
    // Vérifier que le serveur existe
    let server = server_repo
        .find_by_id(server_id)
        .await?
        .ok_or(Error::ServerNotFound)?;

    // Vérifier que seul l'Owner peut gérer les rôles
    if server.owner_id != requester_id {
        return Err(Error::ServerForbidden);
    }

    // Vérifier que le membre existe
    let member = server_repo
        .find_member(server_id, target_user_id)
        .await?
        .ok_or(Error::UserNotFound)?;

    // Empêcher de changer le rôle de l'Owner
    if member.role == MemberRole::Owner {
        return Err(Error::ServerForbidden);
    }

    // Empêcher de créer un autre Owner
    if new_role == MemberRole::Owner {
        return Err(Error::ServerForbidden);
    }

    // Mettre à jour le rôle
    let updated_member = server_repo
        .update_member_role(server_id, target_user_id, new_role)
        .await?
        .ok_or(Error::UserNotFound)?;

    Ok(updated_member)
}

pub async fn transfer_ownership(
    server_repo: &ServerRepository,
    server_id: Uuid,
    payload: TransferOwnershipPayload,
    requester_id: Uuid,
) -> Result<Server> {
    // Vérifier que le serveur existe
    let server = server_repo
        .find_by_id(server_id)
        .await?
        .ok_or(Error::ServerNotFound)?;

    // Vérifier que seul l'Owner actuel peut transférer la propriété
    if server.owner_id != requester_id {
        return Err(Error::ServerForbidden);
    }

    // Vérifier que le nouveau propriétaire est différent de l'actuel
    if payload.new_owner_id == requester_id {
        return Err(Error::ServerForbidden);
    }

    // Vérifier que le nouveau propriétaire est membre du serveur
    server_repo
        .find_member(server_id, payload.new_owner_id)
        .await?
        .ok_or(Error::UserNotFound)?;

    // Mettre à jour le owner_id du serveur
    let updated_server = server_repo
        .update_owner(server_id, payload.new_owner_id)
        .await?
        .ok_or(Error::ServerNotFound)?;

    // Mettre à jour le rôle de l'ancien Owner en Admin
    server_repo
        .update_member_role(server_id, requester_id, MemberRole::Admin)
        .await?;

    // Mettre à jour le rôle du nouveau Owner en Owner
    server_repo
        .update_member_role(server_id, payload.new_owner_id, MemberRole::Owner)
        .await?;

    Ok(updated_server)
}

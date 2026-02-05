use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;

use crate::ctx::Ctx;
use crate::error::Result;
use crate::models::{CreateServerPayload, Server, ServerMember, UpdateServerPayload};
use crate::services;
use crate::AppState;

pub async fn create_server(
    State(state): State<AppState>,
    ctx: Ctx,
    Json(payload): Json<CreateServerPayload>,
) -> Result<Json<Server>> {
    let server = services::create_server(&state.server_repo, &state.user_repo, ctx.user_id(), payload).await?;
    Ok(Json(server))
}

pub async fn list_servers(
    State(state): State<AppState>,
    ctx: Ctx,
) -> Result<Json<Vec<Server>>> {
    let servers = services::list_user_servers(&state.server_repo, ctx.user_id()).await?;
    Ok(Json(servers))
}

pub async fn get_server(
    State(state): State<AppState>,
    ctx: Ctx,
    Path(id): Path<Uuid>,
) -> Result<Json<Server>> {
    let member = services::get_member(&state.server_repo, id, ctx.user_id()).await?;
    if member.is_none() {
        return Err(crate::Error::ServerForbidden);
    }

    let server = services::get_server(&state.server_repo, id).await?;
    Ok(Json(server))
}

pub async fn update_server(
    State(state): State<AppState>,
    ctx: Ctx,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateServerPayload>,
) -> Result<Json<Server>> {
    let server = services::update_server(&state.server_repo, id, ctx.user_id(), payload).await?;
    Ok(Json(server))
}

pub async fn delete_server(
    State(state): State<AppState>,
    ctx: Ctx,
    Path(id): Path<Uuid>,
) -> Result<StatusCode> {
    services::delete_server(&state.server_repo, id, ctx.user_id()).await?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn join_server(
    State(state): State<AppState>,
    ctx: Ctx,
    Path(id): Path<Uuid>,
) -> Result<Json<ServerMember>> {
    let member = services::join_server(&state.server_repo, id, ctx.user_id()).await?;
    Ok(Json(member))
}

pub async fn leave_server(
    State(state): State<AppState>,
    ctx: Ctx,
    Path(id): Path<Uuid>,
) -> Result<StatusCode> {
    services::leave_server(&state.server_repo, id, ctx.user_id()).await?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn list_members(
    State(state): State<AppState>,
    ctx: Ctx,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<ServerMember>>> {
    let member = services::get_member(&state.server_repo, id, ctx.user_id()).await?;
    if member.is_none() {
        return Err(crate::Error::ServerForbidden);
    }

    let members = services::list_members(&state.server_repo, id).await?;
    Ok(Json(members))
}

use crate::web::api::dms::{create_dm, list_dms, get_dm_messages}; // Ajoute get_dm_messages si tu gères l'historique


pub async fn create_dm(
    State(state): State<AppState>,
    ctx: Ctx,
    Json(payload): Json<CreateDMPayload>,
) -> Result<Json<DMWithRecipient>> {
    let dm_id = services::dm::start_dm_by_username(
        &state.user_repo,
        &state.dm_repo,
        ctx.user_id(),
        payload.target_username
    ).await?;

    // Récupérer les détails complets pour le front
    let dm_info = state.dm_repo.get_dm_details(dm_id, ctx.user_id()).await?;
    Ok(Json(dm_info))
}
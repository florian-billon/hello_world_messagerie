pub async fn start_dm_by_username(
    user_repo: &UserRepository,
    dm_repo: &DmRepository,
    current_user_id: Uuid,
    target_username: String,
) -> Result<Uuid> {
    let target_user = user_repo
        .find_by_username(&target_username)
        .await?
        .ok_or(Error::UserNotFound)?;

    if target_user.id == current_user_id {
        return Err(Error::BadRequest("Self-chat not allowed".into()));
    }

    dm_repo.create_or_get_dm(current_user_id, target_user.id).await
}
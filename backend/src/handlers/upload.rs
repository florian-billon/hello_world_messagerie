use axum::{
    extract::{Multipart, State},
    Json,
};
use serde::Serialize;
use std::path::PathBuf;
use tokio::fs;
use uuid::Uuid;

use crate::ctx::Ctx;
use crate::error::Error;
use crate::error::Result;
use crate::AppState;

#[derive(Serialize)]
pub struct UploadResponse {
    pub url: String,
    pub filename: String,
}

pub async fn upload_file(
    State(_state): State<AppState>,
    _ctx: Ctx,
    mut multipart: Multipart,
) -> Result<Json<UploadResponse>> {
    let upload_dir = PathBuf::from("uploads");
    fs::create_dir_all(&upload_dir)
        .await
        .map_err(|err| Error::InternalError {
            message: format!("Failed to create upload directory: {err}"),
        })?;

    if let Some(field) = multipart
        .next_field()
        .await
        .map_err(|err| Error::BadRequest {
            message: format!("Invalid multipart payload: {err}"),
        })?
    {
        let original_name = field.file_name().unwrap_or("fichier").to_string();

        let extension = original_name
            .rsplit('.')
            .next()
            .filter(|ext| !ext.is_empty())
            .unwrap_or("bin");
        let unique_name = format!("{}.{}", Uuid::new_v4(), extension);

        let data = field.bytes().await.map_err(|err| Error::BadRequest {
            message: format!("Invalid upload body: {err}"),
        })?;

        let file_path = upload_dir.join(&unique_name);
        fs::write(&file_path, &data)
            .await
            .map_err(|err| Error::InternalError {
                message: format!("Failed to persist uploaded file: {err}"),
            })?;

        Ok(Json(UploadResponse {
            url: format!("/files/{}", unique_name),
            filename: original_name,
        }))
    } else {
        Err(Error::BadRequest {
            message: "Aucun fichier reçu".to_string(),
        })
    }
}

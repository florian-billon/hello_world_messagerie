use axum::{extract::{Multipart, State},Json,};
use serde::Serialize;
use std::path::PathBuf;
use tokio::fs;
use uuid::Uuid;

use crate::ctx::Ctx;
use crate::error::Result;
use crate::AppState;

#[derive(Serialize)]
pub struct UploadResponse { //class objet pour la réponse de l'upload
    pub url: String,
    pub filename: String,
}

pub async fn upload_file( //pub = public , async = fonction asynchrone, upload_file = nom de la fonction
    State(_state): State<AppState>,
    _ctx: Ctx,
    mut multipart: Multipart,
) -> Result<Json<UploadResponse>> {
    // Créer le dossier uploads s'il n'existe pas
    let upload_dir = PathBuf::from("uploads"); //let = déclaration d'une variable immuable, upload_dir = nom de la variable, PathBuf::from("uploads") = chemin du dossier
    fs::create_dir_all(&upload_dir).await.unwrap();

    while let Some(field) = multipart.next_field().await.unwrap() {
        // Récupérer le nom original du fichier
        let original_name = field
            .file_name()
            .unwrap_or("fichier")
            .to_string();

        // Générer un nom unique pour éviter les conflits
        let extension = original_name
            .split('.')
            .last()
            .unwrap_or("bin");
        let unique_name = format!("{}.{}", Uuid::new_v4(), extension);

        // Lire le contenu du fichier
        let data = field.bytes().await.unwrap();

        // Sauvegarder sur le disque
        let file_path = upload_dir.join(&unique_name);
        fs::write(&file_path, &data).await.unwrap();

        // Retourner l'URL de téléchargement
        return Ok(Json(UploadResponse {
            url: format!("/files/{}", unique_name),
            filename: original_name,
        }));
    }

    // Si aucun fichier reçu
    Err(crate::error::Error::BadRequest { message: "Aucun fichier reçu".to_string() })
}
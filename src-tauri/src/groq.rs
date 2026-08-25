use crate::audio_convert;
use std::path::Path;
use tauri::AppHandle;

const GROQ_TRANSCRIPTIONS_URL: &str = "https://api.groq.com/openai/v1/audio/transcriptions";
const MAX_FILE_BYTES: u64 = 25 * 1024 * 1024;
const WHISPER_MODEL: &str = "whisper-large-v3";
const TRANSCRIPTION_LANGUAGE: &str = "fr";

pub async fn transcribe_audio_file(
    app: &AppHandle,
    file_path: &str,
    api_key: &str,
) -> Result<String, String> {
    ensure_api_key_present(api_key)?;

    let source = Path::new(file_path);
    let upload_file = audio_convert::prepare_upload_file(app, source).await?;

    ensure_file_within_size_limit(&upload_file.path).await?;

    let form = build_upload_form(&upload_file.path).await?;
    let response = send_transcription_request(form, api_key).await?;

    read_transcription_response(response).await
}

fn ensure_api_key_present(api_key: &str) -> Result<(), String> {
    if api_key.trim().is_empty() {
        return Err("Aucune clé API Groq renseignée.".to_string());
    }
    Ok(())
}

async fn ensure_file_within_size_limit(path: &Path) -> Result<(), String> {
    let metadata = tokio::fs::metadata(path)
        .await
        .map_err(|_| "Fichier introuvable.".to_string())?;

    if metadata.len() > MAX_FILE_BYTES {
        let size_mb = metadata.len() as f64 / 1024.0 / 1024.0;
        return Err(format!(
            "Fichier trop volumineux ({size_mb:.1} Mo, limite 25 Mo)."
        ));
    }
    Ok(())
}

async fn build_upload_form(path: &Path) -> Result<reqwest::multipart::Form, String> {
    let bytes = tokio::fs::read(path)
        .await
        .map_err(|e| format!("Lecture du fichier impossible : {e}"))?;

    let file_part = build_file_part(path, bytes)?;

    Ok(reqwest::multipart::Form::new()
        .part("file", file_part)
        .text("model", WHISPER_MODEL)
        .text("language", TRANSCRIPTION_LANGUAGE)
        .text("response_format", "text"))
}

fn build_file_part(path: &Path, bytes: Vec<u8>) -> Result<reqwest::multipart::Part, String> {
    let file_name = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("audio")
        .to_string();

    let mime = mime_guess::from_path(path)
        .first_or_octet_stream()
        .to_string();

    reqwest::multipart::Part::bytes(bytes)
        .file_name(file_name)
        .mime_str(&mime)
        .map_err(|e| e.to_string())
}

async fn send_transcription_request(
    form: reqwest::multipart::Form,
    api_key: &str,
) -> Result<reqwest::Response, String> {
    reqwest::Client::new()
        .post(GROQ_TRANSCRIPTIONS_URL)
        .bearer_auth(api_key)
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Erreur réseau : {e}"))
}

async fn read_transcription_response(response: reqwest::Response) -> Result<String, String> {
    let status = response.status();
    let body = response
        .text()
        .await
        .map_err(|e| format!("Réponse illisible : {e}"))?;

    if !status.is_success() {
        return Err(describe_groq_error(status, &body));
    }
    Ok(body.trim().to_string())
}

fn describe_groq_error(status: reqwest::StatusCode, body: &str) -> String {
    match status.as_u16() {
        401 => "Clé API invalide.".to_string(),
        413 => "Fichier trop volumineux pour Groq.".to_string(),
        429 => "Trop de requêtes, réessayez dans un instant.".to_string(),
        _ => format!("Erreur Groq ({status}) : {body}"),
    }
}

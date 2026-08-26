use crate::audio_convert;
use crate::error::{from_groq_status, AppError};
use crate::retry::send_with_rate_limit_retry;
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
) -> Result<String, AppError> {
    ensure_api_key_present(api_key)?;

    let source = Path::new(file_path);
    let upload_file = audio_convert::prepare_upload_file(app, source).await?;

    ensure_file_within_size_limit(&upload_file.path).await?;

    let bytes = read_upload_bytes(&upload_file.path).await?;
    let response = send_transcription_request(&upload_file.path, &bytes, api_key).await?;

    read_transcription_response(response).await
}

fn ensure_api_key_present(api_key: &str) -> Result<(), AppError> {
    if api_key.trim().is_empty() {
        return Err(AppError::MissingApiKey);
    }
    Ok(())
}

async fn ensure_file_within_size_limit(path: &Path) -> Result<(), AppError> {
    let metadata = tokio::fs::metadata(path)
        .await
        .map_err(|_| AppError::FileNotFound)?;

    if metadata.len() > MAX_FILE_BYTES {
        let size_mb = metadata.len() as f64 / 1024.0 / 1024.0;
        return Err(AppError::FileTooLarge { size_mb });
    }
    Ok(())
}

async fn read_upload_bytes(path: &Path) -> Result<Vec<u8>, AppError> {
    tokio::fs::read(path)
        .await
        .map_err(|e| AppError::ReadFailed(e.to_string()))
}

fn build_file_part(path: &Path, bytes: Vec<u8>) -> Result<reqwest::multipart::Part, AppError> {
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
        .map_err(|e| AppError::Other(e.to_string()))
}

async fn send_transcription_request(
    path: &Path,
    bytes: &[u8],
    api_key: &str,
) -> Result<reqwest::Response, AppError> {
    send_with_rate_limit_retry(|| async {
        let file_part = build_file_part(path, bytes.to_vec())?;
        let form = reqwest::multipart::Form::new()
            .part("file", file_part)
            .text("model", WHISPER_MODEL)
            .text("language", TRANSCRIPTION_LANGUAGE)
            .text("response_format", "text");

        reqwest::Client::new()
            .post(GROQ_TRANSCRIPTIONS_URL)
            .bearer_auth(api_key)
            .multipart(form)
            .send()
            .await
            .map_err(|e| AppError::NetworkError(e.to_string()))
    })
    .await
}

async fn read_transcription_response(response: reqwest::Response) -> Result<String, AppError> {
    let status = response.status();
    let body = response
        .text()
        .await
        .map_err(|e| AppError::NetworkError(format!("Réponse illisible : {e}")))?;

    if !status.is_success() {
        return Err(from_groq_status(status, &body));
    }
    Ok(body.trim().to_string())
}

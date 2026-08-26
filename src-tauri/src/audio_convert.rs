use crate::error::AppError;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::AppHandle;
use tauri_plugin_shell::ShellExt;

const GROQ_NATIVE_EXTENSIONS: &[&str] = &[
    "flac", "mp3", "mp4", "mpeg", "mpga", "m4a", "ogg", "opus", "wav", "webm",
];

/// A file on disk that should be transcribed. If it was converted from an
/// unsupported format, the converted copy is removed once this value is dropped.
pub struct UploadFile {
    pub path: PathBuf,
    is_temporary: bool,
}

impl Drop for UploadFile {
    fn drop(&mut self) {
        if self.is_temporary {
            let _ = std::fs::remove_file(&self.path);
        }
    }
}

/// Groq accepts a fixed set of audio containers. Anything else (e.g. the
/// Olympus `.dss` dictaphone format) must be transcoded to MP3 first.
fn is_natively_supported(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| GROQ_NATIVE_EXTENSIONS.contains(&ext.to_lowercase().as_str()))
        .unwrap_or(false)
}

fn is_dss(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.eq_ignore_ascii_case("dss"))
        .unwrap_or(false)
}

pub async fn prepare_upload_file(app: &AppHandle, source: &Path) -> Result<UploadFile, AppError> {
    if is_natively_supported(source) {
        return Ok(UploadFile {
            path: source.to_path_buf(),
            is_temporary: false,
        });
    }

    let converted_path = convert_to_mp3(app, source).await?;
    Ok(UploadFile {
        path: converted_path,
        is_temporary: true,
    })
}

async fn convert_to_mp3(app: &AppHandle, source: &Path) -> Result<PathBuf, AppError> {
    let output_path = temp_output_path();

    let sidecar = app
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| AppError::ConversionUnavailable(e.to_string()))?;

    let output = sidecar
        .args([
            "-y",
            "-i",
            source
                .to_str()
                .ok_or_else(|| AppError::Other("Chemin de fichier invalide.".to_string()))?,
            "-ar",
            "16000",
            "-ac",
            "1",
            "-c:a",
            "libmp3lame",
            "-b:a",
            "48k",
            output_path
                .to_str()
                .ok_or_else(|| AppError::Other("Chemin de sortie invalide.".to_string()))?,
        ])
        .output()
        .await
        .map_err(|e| {
            AppError::ConversionUnavailable(format!("Impossible de lancer la conversion audio : {e}"))
        })?;

    if !output.status.success() {
        #[cfg(debug_assertions)]
        eprintln!(
            "[DEBUG ffmpeg stderr]\n{}",
            String::from_utf8_lossy(&output.stderr)
        );
        return Err(AppError::ConversionFailed {
            is_dss: is_dss(source),
        });
    }

    Ok(output_path)
}

fn temp_output_path() -> PathBuf {
    let unique = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or_default();
    std::env::temp_dir().join(format!("juryaissist-{unique}.mp3"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn recognizes_natively_supported_extensions_case_insensitively() {
        assert!(is_natively_supported(Path::new("memo.MP3")));
        assert!(is_natively_supported(Path::new("memo.wav")));
        assert!(!is_natively_supported(Path::new("memo.dss")));
        assert!(!is_natively_supported(Path::new("memo")));
    }

    #[test]
    fn recognizes_dss_extension_case_insensitively() {
        assert!(is_dss(Path::new("memo.DSS")));
        assert!(!is_dss(Path::new("memo.wav")));
    }
}

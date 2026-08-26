use serde::{Serialize, Serializer};
use std::fmt;

/// Every failure the app's Tauri commands can produce, in a form the frontend
/// can branch on (`kind`) instead of pattern-matching translated text.
#[derive(Debug)]
pub enum AppError {
    MissingApiKey,
    FileNotFound,
    FileTooLarge { size_mb: f64 },
    Unauthorized,
    PayloadTooLarge,
    RateLimited,
    GroqError { status: String, body: String },
    ConversionFailed { is_dss: bool },
    ReadFailed(String),
    NetworkError(String),
    ConversionUnavailable(String),
    InvalidResponse(String),
    Other(String),
}

impl AppError {
    fn kind(&self) -> &'static str {
        match self {
            AppError::MissingApiKey => "MissingApiKey",
            AppError::FileNotFound => "FileNotFound",
            AppError::FileTooLarge { .. } => "FileTooLarge",
            AppError::Unauthorized => "Unauthorized",
            AppError::PayloadTooLarge => "PayloadTooLarge",
            AppError::RateLimited => "RateLimited",
            AppError::GroqError { .. } => "GroqError",
            AppError::ConversionFailed { .. } => "ConversionFailed",
            AppError::ReadFailed(_) => "ReadFailed",
            AppError::NetworkError(_) => "NetworkError",
            AppError::ConversionUnavailable(_) => "ConversionUnavailable",
            AppError::InvalidResponse(_) => "InvalidResponse",
            AppError::Other(_) => "Other",
        }
    }
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::MissingApiKey => write!(f, "Aucune clé API Groq renseignée."),
            AppError::FileNotFound => write!(f, "Fichier introuvable."),
            AppError::FileTooLarge { size_mb } => {
                write!(f, "Fichier trop volumineux ({size_mb:.1} Mo, limite 25 Mo).")
            }
            AppError::Unauthorized => write!(f, "Clé API invalide."),
            AppError::PayloadTooLarge => write!(f, "Fichier trop volumineux pour Groq."),
            AppError::RateLimited => write!(f, "Trop de requêtes, réessayez dans un instant."),
            AppError::GroqError { status, body } => write!(f, "Erreur Groq ({status}) : {body}"),
            AppError::ConversionFailed { is_dss: true } => write!(
                f,
                "Ce fichier DSS n'a pas pu être converti. S'il a été enregistré en \
                 « DSS Pro » ou « DS2 » sur le dictaphone, réglez-le sur DSS classique, \
                 WAV ou MP3."
            ),
            AppError::ConversionFailed { is_dss: false } => {
                write!(f, "Ce format de fichier audio n'a pas pu être converti.")
            }
            AppError::ReadFailed(detail) => write!(f, "Lecture du fichier impossible : {detail}"),
            AppError::NetworkError(detail) => write!(f, "Erreur réseau : {detail}"),
            AppError::ConversionUnavailable(detail) => {
                write!(f, "Conversion audio indisponible : {detail}")
            }
            AppError::InvalidResponse(detail) => write!(f, "{detail}"),
            AppError::Other(detail) => write!(f, "{detail}"),
        }
    }
}

impl std::error::Error for AppError {}

/// Tauri serializes command errors to the frontend via `Serialize`. Every
/// variant collapses to the same `{ kind, message }` shape so the frontend
/// never has to know about the enum's internal payloads.
impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        #[derive(Serialize)]
        struct ErrorPayload<'a> {
            kind: &'a str,
            message: String,
        }

        ErrorPayload {
            kind: self.kind(),
            message: self.to_string(),
        }
        .serialize(serializer)
    }
}

/// Maps a Groq HTTP response status to the corresponding domain error.
pub(crate) fn from_groq_status(status: reqwest::StatusCode, body: &str) -> AppError {
    match status.as_u16() {
        401 => AppError::Unauthorized,
        413 => AppError::PayloadTooLarge,
        429 => AppError::RateLimited,
        _ => AppError::GroqError {
            status: status.to_string(),
            body: body.to_string(),
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn file_too_large_reports_size_in_megabytes() {
        let error = AppError::FileTooLarge { size_mb: 27.456 };
        assert_eq!(
            error.to_string(),
            "Fichier trop volumineux (27.5 Mo, limite 25 Mo)."
        );
    }

    #[test]
    fn conversion_failed_gives_dss_specific_guidance() {
        assert!(AppError::ConversionFailed { is_dss: true }
            .to_string()
            .contains("DSS Pro"));
        assert_eq!(
            AppError::ConversionFailed { is_dss: false }.to_string(),
            "Ce format de fichier audio n'a pas pu être converti."
        );
    }

    #[test]
    fn from_groq_status_maps_known_codes() {
        assert!(matches!(
            from_groq_status(reqwest::StatusCode::UNAUTHORIZED, ""),
            AppError::Unauthorized
        ));
        assert!(matches!(
            from_groq_status(reqwest::StatusCode::TOO_MANY_REQUESTS, ""),
            AppError::RateLimited
        ));
        assert!(matches!(
            from_groq_status(reqwest::StatusCode::INTERNAL_SERVER_ERROR, "boom"),
            AppError::GroqError { .. }
        ));
    }

    #[test]
    fn serializes_to_kind_and_message() {
        let payload = serde_json::to_value(AppError::MissingApiKey).unwrap();
        assert_eq!(payload["kind"], "MissingApiKey");
        assert_eq!(payload["message"], "Aucune clé API Groq renseignée.");
    }
}

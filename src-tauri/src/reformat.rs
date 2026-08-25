use crate::groq::describe_groq_error;
use serde_json::json;

const GROQ_CHAT_URL: &str = "https://api.groq.com/openai/v1/chat/completions";
const CHAT_MODEL: &str = "openai/gpt-oss-120b";

const SYSTEM_PROMPT: &str = "Tu es un assistant qui met en forme des transcriptions audio \
pour un usage juridique, selon des règles métier fournies par l'utilisatrice. Applique \
strictement ces règles de mise en forme et d'organisation. Ne modifie jamais le sens du \
texte, n'invente rien, ne supprime aucune information factuelle. Corrige uniquement la \
ponctuation et les erreurs évidentes de transcription. Réponds uniquement avec le texte \
final, sans commentaire ni introduction.";

/// Reorganizes a raw transcript according to business rules dictated by the user,
/// via a Groq chat model. Returns the transcript unchanged if no rules were given.
pub async fn reformat_transcript(
    raw_text: &str,
    business_rules: &str,
    api_key: &str,
) -> Result<String, String> {
    if business_rules.trim().is_empty() {
        return Ok(raw_text.to_string());
    }

    let response = send_chat_request(raw_text, business_rules, api_key).await?;
    read_chat_response(response).await
}

async fn send_chat_request(
    raw_text: &str,
    business_rules: &str,
    api_key: &str,
) -> Result<reqwest::Response, String> {
    let user_message = format!("Règles métier :\n{business_rules}\n\nTranscription brute :\n{raw_text}");

    let body = json!({
        "model": CHAT_MODEL,
        "temperature": 0.2,
        "messages": [
            { "role": "system", "content": SYSTEM_PROMPT },
            { "role": "user", "content": user_message }
        ]
    });

    reqwest::Client::new()
        .post(GROQ_CHAT_URL)
        .bearer_auth(api_key)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Erreur réseau (mise en forme) : {e}"))
}

async fn read_chat_response(response: reqwest::Response) -> Result<String, String> {
    let status = response.status();
    let body = response
        .text()
        .await
        .map_err(|e| format!("Réponse illisible : {e}"))?;

    if !status.is_success() {
        return Err(describe_groq_error(status, &body));
    }

    extract_message_content(&body)
}

fn extract_message_content(body: &str) -> Result<String, String> {
    let parsed: serde_json::Value =
        serde_json::from_str(body).map_err(|e| format!("Réponse Groq invalide : {e}"))?;

    parsed["choices"][0]["message"]["content"]
        .as_str()
        .map(|s| s.trim().to_string())
        .ok_or_else(|| "Réponse Groq inattendue.".to_string())
}

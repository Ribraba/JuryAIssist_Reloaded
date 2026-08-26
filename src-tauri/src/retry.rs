use crate::error::AppError;
use std::time::Duration;

const MAX_RATE_LIMIT_ATTEMPTS: u32 = 4;
const RATE_LIMIT_BASE_DELAY_MS: u64 = 2000;

/// Retries a Groq HTTP request with exponential backoff when the response is
/// a 429 (rate limit). Any other status, or a transport error, is returned as-is.
pub(crate) async fn send_with_rate_limit_retry<F, Fut>(
    mut send_request: F,
) -> Result<reqwest::Response, AppError>
where
    F: FnMut() -> Fut,
    Fut: std::future::Future<Output = Result<reqwest::Response, AppError>>,
{
    for attempt in 0..MAX_RATE_LIMIT_ATTEMPTS {
        let response = send_request().await?;
        let is_last_attempt = attempt == MAX_RATE_LIMIT_ATTEMPTS - 1;
        if response.status() != reqwest::StatusCode::TOO_MANY_REQUESTS || is_last_attempt {
            return Ok(response);
        }
        tokio::time::sleep(Duration::from_millis(RATE_LIMIT_BASE_DELAY_MS * 2u64.pow(attempt))).await;
    }
    unreachable!("loop always returns on the last attempt")
}

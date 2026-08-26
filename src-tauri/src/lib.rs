mod audio_convert;
mod groq;
mod reformat;
mod retry;

#[tauri::command]
async fn transcribe(
    app: tauri::AppHandle,
    file_path: String,
    api_key: String,
    business_rules: String,
) -> Result<String, String> {
    let raw_text = groq::transcribe_audio_file(&app, &file_path, &api_key).await?;
    reformat::reformat_transcript(&raw_text, &business_rules, &api_key).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![transcribe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

export const AUDIO_EXTENSIONS = [
  "mp3",
  "wav",
  "m4a",
  "ogg",
  "flac",
  "webm",
  "mp4",
  "mpga",
  "dss",
];

export const COPY_FEEDBACK_DURATION_MS = 1500;

// Le tier gratuit Groq plafonne whisper-large-v3 à ~20-30 requêtes/min, et
// chaque fichier déclenche 2 appels séquentiels (transcription + reformulation).
// 3 fichiers en parallèle maximise le débit sans risquer des erreurs 429.
export const MAX_CONCURRENT_TRANSCRIPTIONS = 3;

export const RESULT_SAVE_DEBOUNCE_MS = 400;

export const DEFAULT_ERROR_MESSAGE = "Une erreur est survenue.";
export const MISSING_API_KEY_MESSAGE = "Aucune clé API Groq renseignée.";

# JuryAIssist

POC de transcription audio pour usage juridique : glisser-déposer un fichier audio,
transcription via l'API Speech-to-Text de Groq (Whisper), texte copiable en un clic.

App de bureau native (Tauri v2 + React + TypeScript + Tailwind). Le format Olympus
`.dss` est converti automatiquement en MP3 via `ffmpeg` avant l'envoi (les formats
`.wav`, `.mp3`, `.m4a`, `.ogg`, `.flac`, `.webm` sont envoyés tels quels).

## Prérequis

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) (LTS)
- Une clé API [Groq](https://console.groq.com/) (à renseigner dans l'app au premier lancement)
- Un binaire `ffmpeg` placé dans `src-tauri/binaries/ffmpeg-<target-triple>` (voir
  [le guide sidecar de Tauri](https://v2.tauri.app/develop/sidecar/)) — nécessaire
  uniquement pour la conversion des fichiers `.dss`

## Développement

```bash
npm install
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

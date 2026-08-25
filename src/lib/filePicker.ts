import { open } from "@tauri-apps/plugin-dialog";
import { AUDIO_EXTENSIONS } from "../constants";

export async function pickAudioFile(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    filters: [{ name: "Audio", extensions: AUDIO_EXTENSIONS }],
  });
  return typeof selected === "string" ? selected : null;
}

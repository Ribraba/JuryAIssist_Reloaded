import { open } from "@tauri-apps/plugin-dialog";
import { AUDIO_EXTENSIONS } from "../constants";

export async function pickAudioFiles(): Promise<string[]> {
  const selected = await open({
    multiple: true,
    filters: [{ name: "Audio", extensions: AUDIO_EXTENSIONS }],
  });
  if (!selected) return [];
  return Array.isArray(selected) ? selected : [selected];
}

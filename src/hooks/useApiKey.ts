import { useEffect, useState } from "react";
import { settingsStore } from "../lib/store";

const API_KEY_STORE_ENTRY = "apiKey";

export function useApiKey() {
  const [apiKey, setApiKey] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadStoredKey();
  }, []);

  async function loadStoredKey() {
    const saved = (await settingsStore.get<string>(API_KEY_STORE_ENTRY)) ?? "";
    setApiKey(saved);
    setIsLoaded(true);
  }

  async function saveApiKey(key: string) {
    setApiKey(key);
    await settingsStore.set(API_KEY_STORE_ENTRY, key);
    await settingsStore.save();
  }

  return { apiKey, isLoaded, saveApiKey };
}

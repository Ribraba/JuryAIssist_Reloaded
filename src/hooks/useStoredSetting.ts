import { useEffect, useState } from "react";
import { settingsStore } from "../lib/store";

export function useStoredSetting(storeKey: string) {
  const [value, setValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadStoredValue();
  }, []);

  async function loadStoredValue() {
    const saved = (await settingsStore.get<string>(storeKey)) ?? "";
    setValue(saved);
    setIsLoaded(true);
  }

  async function save(next: string) {
    setValue(next);
    await settingsStore.set(storeKey, next);
    await settingsStore.save();
  }

  return { value, isLoaded, save };
}

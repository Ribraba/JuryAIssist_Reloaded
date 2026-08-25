import { useEffect, useState } from "react";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export type UpdateStage = "idle" | "available" | "installing" | "error";

const GENERIC_UPDATE_ERROR = "La mise à jour a échoué.";

export function useAppUpdate() {
  const [update, setUpdate] = useState<Update | null>(null);
  const [stage, setStage] = useState<UpdateStage>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    checkForUpdate();
  }, []);

  async function checkForUpdate() {
    try {
      const found = await check();
      if (found) {
        setUpdate(found);
        setStage("available");
      }
    } catch {
      // A failed check (offline, GitHub unreachable, ...) should stay silent.
    }
  }

  async function installUpdate() {
    if (!update) return;
    setStage("installing");
    try {
      await update.downloadAndInstall();
      await relaunch();
    } catch (error) {
      setErrorMessage(typeof error === "string" ? error : GENERIC_UPDATE_ERROR);
      setStage("error");
    }
  }

  function dismiss() {
    setStage("idle");
  }

  return {
    stage,
    version: update?.version,
    errorMessage,
    installUpdate,
    dismiss,
  };
}

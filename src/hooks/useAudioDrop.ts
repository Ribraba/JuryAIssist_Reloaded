import { useEffect, useRef, useState } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";

/**
 * Listens to the OS-level file drag & drop over the window and reports
 * hover state. Ignores drops while `disabled` (e.g. a transcription is running).
 */
export function useAudioDrop(onDrop: (filePath: string) => void, disabled: boolean) {
  const [isDragging, setIsDragging] = useState(false);

  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  useEffect(() => {
    const unlistenPromise = getCurrentWebview().onDragDropEvent(({ payload }) => {
      if (disabledRef.current) return;

      if (payload.type === "enter" || payload.type === "over") {
        setIsDragging(true);
      } else if (payload.type === "leave") {
        setIsDragging(false);
      } else if (payload.type === "drop") {
        setIsDragging(false);
        const filePath = payload.paths[0];
        if (filePath) onDropRef.current(filePath);
      }
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  return { isDragging };
}

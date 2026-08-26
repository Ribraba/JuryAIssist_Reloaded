import { useEffect, useRef, useState } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { AUDIO_EXTENSIONS } from "../constants";

/**
 * Listens to the OS-level file drag & drop over the window and reports
 * hover state. Non-audio files dropped alongside audio ones are ignored.
 */
export function useAudioDrop(onDrop: (filePaths: string[]) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedCount, setDraggedCount] = useState(0);

  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  useEffect(() => {
    const unlistenPromise = getCurrentWebview().onDragDropEvent(({ payload }) => {
      if (payload.type === "enter") {
        setIsDragging(true);
        setDraggedCount(payload.paths.filter(isAudioFile).length);
      } else if (payload.type === "leave") {
        setIsDragging(false);
        setDraggedCount(0);
      } else if (payload.type === "drop") {
        setIsDragging(false);
        setDraggedCount(0);
        const audioPaths = payload.paths.filter(isAudioFile);
        if (audioPaths.length > 0) onDropRef.current(audioPaths);
      }
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  return { isDragging, draggedCount };
}

function isAudioFile(path: string): boolean {
  const extension = path.split(".").pop()?.toLowerCase();
  return !!extension && AUDIO_EXTENSIONS.includes(extension);
}

import { useEffect, useState } from "react";
import { Play, Square } from "lucide-react";
import { formatDuration } from "../lib/time";
import type { WorkSession } from "../types";

type Props = {
  activeSession: WorkSession | null;
  onClockIn: () => void;
  onClockOut: () => void;
};

export default function ClockWidget({ activeSession, onClockIn, onClockOut }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const activeSessionId = activeSession?.id ?? null;

  useEffect(() => {
    if (!activeSessionId) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, [activeSessionId]);

  if (!activeSession) {
    return (
      <button
        type="button"
        onClick={onClockIn}
        title="Démarrer le chronomètre"
        aria-label="Démarrer le chronomètre"
        className="flex cursor-pointer items-center justify-center rounded-full p-2 text-ink-soft transition-colors duration-150 hover:bg-primary-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Play className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClockOut}
      aria-label="Arrêter le chronomètre"
      title="Arrêter le chronomètre"
      className="flex cursor-pointer items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary transition-colors duration-150 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary motion-safe:animate-pulse" />
      {formatDuration(now - activeSession.startedAt)}
      <Square className="h-3 w-3 shrink-0" strokeWidth={2} fill="currentColor" />
    </button>
  );
}

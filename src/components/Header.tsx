import { FileAudio, History, Scale, Settings } from "lucide-react";
import ClockWidget from "./ClockWidget";
import type { WorkSession } from "../types";

type View = "transcription" | "timesheet";

type Props = {
  onOpenSettings: () => void;
  activeView: View;
  onToggleView: () => void;
  activeSession: WorkSession | null;
  onClockIn: () => void;
  onClockOut: () => void;
};

export default function Header({
  onOpenSettings,
  activeView,
  onToggleView,
  activeSession,
  onClockIn,
  onClockOut,
}: Props) {
  const isJournal = activeView === "timesheet";

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft">
          <Scale className="h-4 w-4 text-primary" strokeWidth={2} />
        </span>
        <h1 className="font-display text-lg font-semibold tracking-wide text-ink">
          JuryAIssist
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <ClockWidget activeSession={activeSession} onClockIn={onClockIn} onClockOut={onClockOut} />
        <button
          type="button"
          aria-label={isJournal ? "Retour aux fichiers" : "Journal des heures"}
          title={isJournal ? "Retour aux fichiers" : "Journal des heures"}
          onClick={onToggleView}
          className="cursor-pointer rounded-lg p-2 text-ink-soft transition-colors duration-150 hover:bg-primary-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {isJournal ? (
            <FileAudio className="h-4.5 w-4.5" strokeWidth={2} />
          ) : (
            <History className="h-4.5 w-4.5" strokeWidth={2} />
          )}
        </button>
        <button
          type="button"
          aria-label="Paramètres"
          title="Paramètres"
          onClick={onOpenSettings}
          className="cursor-pointer rounded-lg p-2 text-ink-soft transition-colors duration-150 hover:bg-primary-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Settings className="h-4.5 w-4.5" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

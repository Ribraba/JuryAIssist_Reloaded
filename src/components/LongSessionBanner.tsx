import { Clock, X } from "lucide-react";
import { formatDuration } from "../lib/time";

type Props = {
  elapsedMs: number;
  onStopNow: () => void;
  onOpenJournal: () => void;
  onDismiss: () => void;
};

export default function LongSessionBanner({
  elapsedMs,
  onStopNow,
  onOpenJournal,
  onDismiss,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-primary-soft px-4 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <Clock className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
        <span className="truncate text-xs font-medium text-ink">
          Cette session tourne depuis {formatDuration(elapsedMs)}, toujours en cours ?
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenJournal}
          className="cursor-pointer rounded-lg px-3 py-1 text-xs font-medium text-ink-soft transition-colors duration-150 hover:bg-card hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Voir le journal
        </button>
        <button
          type="button"
          onClick={onStopNow}
          className="cursor-pointer rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          Arrêter maintenant
        </button>
        <button
          type="button"
          aria-label="Ignorer"
          onClick={onDismiss}
          className="cursor-pointer rounded-md p-1 text-ink-soft transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

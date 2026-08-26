import type { LucideIcon } from "lucide-react";
import { AlertCircle, Clock, FileAudio, Loader2, RotateCcw } from "lucide-react";
import { formatClockTime } from "../lib/time";
import type { JobStatus, TranscriptionJob } from "../types";

type Props = {
  job: TranscriptionJob;
  isSelected: boolean;
  isSelectable: boolean;
  isChecked: boolean;
  onSelect: () => void;
  onRetry: () => void;
  onToggleChecked: () => void;
};

export default function JobListItem({
  job,
  isSelected,
  isSelectable,
  isChecked,
  onSelect,
  onRetry,
  onToggleChecked,
}: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary ${
        isSelected ? "bg-primary-soft" : "hover:bg-primary-soft/60"
      }`}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {isSelectable && (
          <input
            type="checkbox"
            checked={isChecked}
            onClick={(e) => e.stopPropagation()}
            onChange={onToggleChecked}
            aria-label={`Sélectionner ${job.fileName}`}
            className="h-3.5 w-3.5 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        )}
      </span>
      <StatusIcon status={job.status} />
      <span
        className={`min-w-0 flex-1 truncate text-sm ${
          isSelected ? "font-medium text-ink" : "text-ink-soft"
        }`}
      >
        {job.fileName}
      </span>
      {job.status === "error" && (
        <button
          type="button"
          aria-label="Réessayer"
          title="Réessayer"
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
          className="shrink-0 cursor-pointer rounded-md p-1.5 text-ink-soft transition-colors duration-150 hover:bg-card hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      )}
      {job.status === "done" && job.completedAt && (
        <span className="shrink-0 text-[11px] text-ink-soft">
          {formatClockTime(job.completedAt)}
        </span>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: JobStatus }) {
  const { icon: Icon, bg, text, spin } = STATUS_ICON_CONFIG[status];
  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
      <Icon className={`h-4 w-4 ${text} ${spin ? "animate-spin" : ""}`} strokeWidth={2} />
    </span>
  );
}

const STATUS_ICON_CONFIG: Record<
  JobStatus,
  { icon: LucideIcon; bg: string; text: string; spin?: boolean }
> = {
  queued: { icon: Clock, bg: "bg-surface", text: "text-ink-soft" },
  processing: { icon: Loader2, bg: "bg-primary-soft", text: "text-primary", spin: true },
  done: { icon: FileAudio, bg: "bg-surface", text: "text-ink-soft" },
  error: { icon: AlertCircle, bg: "bg-danger-soft", text: "text-danger" },
};

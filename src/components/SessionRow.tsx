import { useEffect, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import DateTimeField from "./DateTimeField";
import { formatClockTime, formatDuration } from "../lib/time";
import { durationMs } from "../lib/timesheet";
import type { WorkSession } from "../types";

type Props = {
  session: WorkSession;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (changes: { startedAt: number; endedAt: number }) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
};

export default function SessionRow({
  session,
  isEditing,
  onStartEdit,
  onSave,
  onCancelEdit,
  onDelete,
}: Props) {
  const [startedAt, setStartedAt] = useState(session.startedAt);
  const [endedAt, setEndedAt] = useState(session.endedAt ?? Date.now());

  useEffect(() => {
    if (!isEditing) return;
    setStartedAt(session.startedAt);
    setEndedAt(session.endedAt ?? Date.now());
  }, [isEditing, session]);

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <DateTimeField value={startedAt} onChange={setStartedAt} />
          <span className="shrink-0 text-xs text-ink-soft">→</span>
          <DateTimeField value={endedAt} onChange={setEndedAt} />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelEdit}
            title="Annuler"
            aria-label="Annuler"
            className="cursor-pointer rounded-md p-1.5 text-ink-soft transition-colors duration-150 hover:bg-primary-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => onSave({ startedAt, endedAt })}
            title="Enregistrer"
            aria-label="Enregistrer"
            className="cursor-pointer rounded-md bg-primary p-1.5 text-white transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-primary-soft/60">
      <span className="min-w-0 flex-1 text-sm text-ink">
        {formatClockTime(session.startedAt)} –{" "}
        {session.endedAt ? formatClockTime(session.endedAt) : "en cours"}
      </span>
      <span className="shrink-0 text-xs text-ink-soft">
        {formatDuration(durationMs(session, Date.now()))}
      </span>
      <button
        type="button"
        aria-label="Modifier"
        title="Modifier"
        onClick={onStartEdit}
        className="shrink-0 cursor-pointer rounded-md p-1.5 text-ink-soft transition-colors duration-150 hover:bg-card hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="Supprimer"
        title="Supprimer"
        onClick={onDelete}
        className="shrink-0 cursor-pointer rounded-md p-1.5 text-ink-soft transition-colors duration-150 hover:bg-card hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Plus, Trash2, X } from "lucide-react";
import JobListItem from "./JobListItem";
import ConfirmDialog from "./ConfirmDialog";
import type { TranscriptionJob } from "../types";

type Props = {
  jobs: TranscriptionJob[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRetry: (id: string) => void;
  onRemoveMany: (ids: string[]) => void;
  onClearFinished: () => void;
};

function isDeletable(job: TranscriptionJob): boolean {
  return job.status === "done" || job.status === "error";
}

export default function JobList({
  jobs,
  selectedId,
  onSelect,
  onAdd,
  onRetry,
  onRemoveMany,
  onClearFinished,
}: Props) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [pendingConfirm, setPendingConfirm] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const finishedCount = jobs.filter(isDeletable).length;
  const checkedDeletableIds = jobs.filter((job) => isDeletable(job) && checkedIds.has(job.id));

  function toggleChecked(id: string) {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function requestDeleteSelected() {
    const ids = checkedDeletableIds.map((job) => job.id);
    if (ids.length === 0) return;

    setPendingConfirm({
      message: `Supprimer ${ids.length} fichier${ids.length > 1 ? "s" : ""} ?`,
      onConfirm: () => {
        onRemoveMany(ids);
        setCheckedIds(new Set());
        setPendingConfirm(null);
      },
    });
  }

  function requestClearFinished() {
    if (finishedCount === 0) return;

    setPendingConfirm({
      message: `Vider l'historique (${finishedCount} fichier${finishedCount > 1 ? "s" : ""}) ?`,
      onConfirm: () => {
        onClearFinished();
        setPendingConfirm(null);
      },
    });
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-border">
      <div className="flex items-center justify-between px-3 pb-3 pt-6">
        {checkedDeletableIds.length > 0 ? (
          <>
            <span className="px-1 text-xs font-medium text-ink-soft">
              {checkedDeletableIds.length} sélectionné{checkedDeletableIds.length > 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-1">
              <HeaderIconButton
                icon={X}
                label="Annuler la sélection"
                onClick={() => setCheckedIds(new Set())}
              />
              <HeaderIconButton
                icon={Trash2}
                label="Supprimer la sélection"
                onClick={requestDeleteSelected}
              />
            </div>
          </>
        ) : (
          <>
            <span className="px-1 text-xs font-medium uppercase tracking-wide text-ink-soft">
              Fichiers
            </span>
            <div className="flex items-center gap-1">
              <HeaderIconButton icon={Plus} label="Ajouter des fichiers" onClick={onAdd} />
              <HeaderIconButton
                icon={Trash2}
                label="Vider l'historique"
                onClick={requestClearFinished}
                disabled={finishedCount === 0}
              />
            </div>
          </>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {jobs.map((job) => (
          <JobListItem
            key={job.id}
            job={job}
            isSelected={job.id === selectedId}
            isSelectable={isDeletable(job)}
            isChecked={checkedIds.has(job.id)}
            onSelect={() => onSelect(job.id)}
            onRetry={() => onRetry(job.id)}
            onToggleChecked={() => toggleChecked(job.id)}
          />
        ))}
      </div>

      {pendingConfirm && (
        <ConfirmDialog
          message={pendingConfirm.message}
          onConfirm={pendingConfirm.onConfirm}
          onCancel={() => setPendingConfirm(null)}
        />
      )}
    </aside>
  );
}

function HeaderIconButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer rounded-md p-1.5 text-ink-soft transition-colors duration-150 hover:bg-primary-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-30"
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}

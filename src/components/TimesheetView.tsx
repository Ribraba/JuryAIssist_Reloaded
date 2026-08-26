import { useState } from "react";
import { Plus } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import SessionRow from "./SessionRow";
import { formatDuration } from "../lib/time";
import { durationMs, groupByDay, startOfDay, startOfWeek, sumDurationMsSince } from "../lib/timesheet";
import type { WorkSession } from "../types";

type Props = {
  sessions: WorkSession[];
  onSave: (id: string, changes: { startedAt: number; endedAt: number }) => void;
  onDelete: (id: string) => void;
  onAddManual: () => string;
};

export default function TimesheetView({ sessions, onSave, onDelete, onAddManual }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const now = Date.now();
  const todayTotal = sumDurationMsSince(sessions, startOfDay(new Date()), now);
  const weekTotal = sumDurationMsSince(sessions, startOfWeek(new Date()), now);
  const groups = groupByDay(sessions);

  function handleAdd() {
    setEditingId(onAddManual());
  }

  function handleSave(id: string, changes: { startedAt: number; endedAt: number }) {
    onSave(id, changes);
    setEditingId(null);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-8">
          <Stat label="Aujourd'hui" value={formatDuration(todayTotal)} />
          <Stat label="Cette semaine" value={formatDuration(weekTotal)} />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          title="Ajouter une session"
          aria-label="Ajouter une session"
          className="flex cursor-pointer items-center justify-center rounded-lg border border-border p-2 text-ink transition-colors duration-150 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 && (
          <p className="mt-10 text-center text-sm text-ink-soft">Aucune session enregistrée.</p>
        )}
        {groups.map(({ day, sessions: daySessions }) => (
          <div key={day.toISOString()} className="mb-5">
            <div className="mb-2 flex items-baseline justify-between px-1">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                {formatDayLabel(day)}
              </span>
              <span className="text-xs text-ink-soft">
                {formatDuration(daySessions.reduce((total, s) => total + durationMs(s, now), 0))}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {daySessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  isEditing={editingId === session.id}
                  onStartEdit={() => setEditingId(session.id)}
                  onSave={(changes) => handleSave(session.id, changes)}
                  onCancelEdit={() => setEditingId(null)}
                  onDelete={() => setPendingDeleteId(session.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {pendingDeleteId && (
        <ConfirmDialog
          message="Supprimer cette session ?"
          onConfirm={() => {
            onDelete(pendingDeleteId);
            setPendingDeleteId(null);
          }}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

function formatDayLabel(day: Date): string {
  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (day.getTime() === today.getTime()) return "Aujourd'hui";
  if (day.getTime() === yesterday.getTime()) return "Hier";
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(day);
}

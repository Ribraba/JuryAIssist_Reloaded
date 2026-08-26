import { useEffect, useRef, useState } from "react";
import { loadSessions, saveSessions } from "../lib/timesheet";
import type { WorkSession } from "../types";

export function useTimesheet() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const sessionsRef = useRef<WorkSession[]>([]);

  useEffect(() => {
    loadSessions().then(applySessions);
  }, []);

  function applySessions(next: WorkSession[]) {
    sessionsRef.current = next;
    setSessions(next);
  }

  function commit(next: WorkSession[]) {
    applySessions(next);
    saveSessions(next);
  }

  const activeSession = sessions.find((session) => session.endedAt === null) ?? null;

  function clockIn() {
    if (sessionsRef.current.some((session) => session.endedAt === null)) return;
    const session: WorkSession = { id: crypto.randomUUID(), startedAt: Date.now(), endedAt: null };
    commit([...sessionsRef.current, session]);
  }

  function clockOut() {
    const active = sessionsRef.current.find((session) => session.endedAt === null);
    if (!active) return;
    commit(
      sessionsRef.current.map((session) =>
        session.id === active.id ? { ...session, endedAt: Date.now() } : session,
      ),
    );
  }

  function updateSession(id: string, changes: { startedAt: number; endedAt: number }) {
    commit(
      sessionsRef.current.map((session) =>
        session.id === id ? { ...session, ...changes } : session,
      ),
    );
  }

  function deleteSession(id: string) {
    commit(sessionsRef.current.filter((session) => session.id !== id));
  }

  function createManualSession(): string {
    const now = Date.now();
    const session: WorkSession = { id: crypto.randomUUID(), startedAt: now, endedAt: now };
    commit([...sessionsRef.current, session]);
    return session.id;
  }

  return {
    sessions,
    activeSession,
    clockIn,
    clockOut,
    updateSession,
    deleteSession,
    createManualSession,
  };
}

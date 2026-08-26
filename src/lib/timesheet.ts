import { timesheetStore } from "./store";
import { LONG_SESSION_WARNING_MS } from "../constants";
import type { WorkSession } from "../types";

const SESSIONS_KEY = "sessions";

export async function loadSessions(): Promise<WorkSession[]> {
  return (await timesheetStore.get<WorkSession[]>(SESSIONS_KEY)) ?? [];
}

export async function saveSessions(sessions: WorkSession[]): Promise<void> {
  await timesheetStore.set(SESSIONS_KEY, sessions);
  await timesheetStore.save();
}

export function isRunningLong(session: WorkSession, now: number): boolean {
  return session.endedAt === null && now - session.startedAt > LONG_SESSION_WARNING_MS;
}

export function durationMs(session: WorkSession, now: number): number {
  return (session.endedAt ?? now) - session.startedAt;
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function startOfWeek(date: Date): Date {
  const result = startOfDay(date);
  const daysSinceMonday = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - daysSinceMonday);
  return result;
}

export function sumDurationMsSince(sessions: WorkSession[], since: Date, now: number): number {
  const sinceMs = since.getTime();
  return sessions
    .filter((session) => session.startedAt >= sinceMs)
    .reduce((total, session) => total + durationMs(session, now), 0);
}

export function groupByDay(sessions: WorkSession[]): { day: Date; sessions: WorkSession[] }[] {
  const groups = new Map<string, { day: Date; sessions: WorkSession[] }>();

  for (const session of sessions) {
    const day = startOfDay(new Date(session.startedAt));
    const key = day.toISOString();
    if (!groups.has(key)) groups.set(key, { day, sessions: [] });
    groups.get(key)!.sessions.push(session);
  }

  return [...groups.values()]
    .map((group) => ({
      day: group.day,
      sessions: group.sessions.sort((a, b) => b.startedAt - a.startedAt),
    }))
    .sort((a, b) => b.day.getTime() - a.day.getTime());
}

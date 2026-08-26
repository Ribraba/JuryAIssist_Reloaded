export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function addMonths(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(next.getMonth() + amount);
  return next;
}

/** 42 days (6 weeks), Monday-first, covering the full weeks a month spans. */
export function getMonthGrid(monthAnchor: Date): Date[] {
  const firstOfMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  const daysSinceMonday = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = addDays(firstOfMonth, -daysSinceMonday);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

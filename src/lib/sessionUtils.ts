export interface Session {
  id: string;
  userId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  checkInPhoto: string | null;
  checkOutPhoto: string | null;
  complete: boolean;
}

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function getWeekSessions(
  sessions: Session[],
  userId: string,
  weekMode: 'fixed' | 'rolling',
): number {
  const today = new Date();
  let weekStart: Date;
  if (weekMode === 'rolling') {
    weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
  } else {
    weekStart = getMonday(today);
  }
  const todayStr = localDateString(today);
  const weekStartStr = localDateString(weekStart);
  return sessions.filter(
    (s) => s.userId === userId && s.complete && s.date >= weekStartStr && s.date <= todayStr,
  ).length;
}

export function getMonthSessions(sessions: Session[], userId: string): number {
  const today = new Date();
  const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  return sessions.filter((s) => s.userId === userId && s.complete && s.date.startsWith(monthStr)).length;
}

export function hasSessionToday(sessions: Session[], userId: string): boolean {
  const todayStr = localDateString(new Date());
  return sessions.some((s) => s.userId === userId && s.date === todayStr);
}

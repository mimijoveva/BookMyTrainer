// Local date as "YYYY-MM-DD" (toISOString would use UTC and can return yesterday)
export function toDateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

// The next `count` days starting today, as "YYYY-MM-DD"
export function nextDays(count: number): string[] {
  const days: string[] = [];
  const d = new Date();
  for (let i = 0; i < count; i++) {
    days.push(toDateKey(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
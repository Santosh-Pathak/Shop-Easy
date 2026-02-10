export function formatDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isValidDate(date: unknown): boolean {
  const d = date instanceof Date ? date : new Date(date as string | number);
  return !isNaN(d.getTime());
}

export function addDays(date: Date, days: number): Date {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
}

export function subtractDays(date: Date, days: number): Date {
  const out = new Date(date);
  out.setDate(out.getDate() - days);
  return out;
}

export function getDaysDifference(date1: Date, date2: Date): number {
  return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
}

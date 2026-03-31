/**
 * Local calendar dates for DB "YYYY-MM-DD" fields.
 * Avoids UTC shifts from Date.toISOString() and from parsing "YYYY-MM-DD" as UTC midnight.
 */

export function formatLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatLocalMonthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Parse stored date as a local calendar day (no off-by-one in non-UTC timezones). */
export function parseStoredCalendarDate(value: string | Date): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  const s = typeof value === "string" ? value : String(value);
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    return new Date(y, mo, d, 12, 0, 0, 0);
  }
  return new Date(s);
}

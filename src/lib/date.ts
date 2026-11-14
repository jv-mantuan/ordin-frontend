const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Today as "YYYY-MM-DD" in the browser's local time zone.
 * Not toISOString(): after 21:00 in UTC−3 that is already tomorrow.
 */
export function todayISO(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** "2026-11-14" → "14/11/2026", by string split (no Date parsing, no time zone shift). */
export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/** The local calendar month containing `date`, as ISO instants: `from` inclusive, `to` exclusive. */
export function monthRange(date: Date): { from: string; to: string } {
  const from = new Date(date.getFullYear(), date.getMonth(), 1)
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  return { from: from.toISOString(), to: to.toISOString() }
}

/** The browser's IANA time zone (the API groups days in it). */
export function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

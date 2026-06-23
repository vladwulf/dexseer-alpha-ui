/**
 * Parse a candle time string into integer Unix seconds.
 * Normalizes the space separator to 'T' for cross-browser ISO 8601 compatibility
 * (Safari/JavaScriptCore rejects non-ISO date strings with space separators).
 *
 * Handles:
 *   - "2026-06-23 10:30:00.000"   (space-separated, no tz → local time)
 *   - "2026-06-23T10:30:00.000Z"  (ISO 8601)
 *   - "2000-01-01 00:00:00+00"    (space-separated with timezone)
 */
export function parseCandleTime(time: string): number {
  return Math.floor(new Date(time.replace(" ", "T")).getTime() / 1000);
}

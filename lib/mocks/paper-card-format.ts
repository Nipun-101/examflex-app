/** Compact remaining / elapsed time for in-progress paper cards. */
export function formatPaperCardClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Human duration for completed attempt footers (e.g. "7m 40s"). */
export function formatPaperCardDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  if (safe < 60) return `${safe}s`;
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  if (seconds === 0) return `${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

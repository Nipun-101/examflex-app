/** Pause overlay: "1h 05m 09s" or "12m 04s". */
export function formatElapsed(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  }
  return `${mins}m ${String(secs).padStart(2, "0")}s`;
}

/** Header countdown: "04:09" or "1:04:09". */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Results time taken. Full mocks run for hours, so keep it short at any length. */
export function formatTimeTaken(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

/** Up to two decimals without trailing zeros: 4 → "4", 3.5 → "3.5". */
export function formatScore(value: number): string {
  return String(parseFloat(value.toFixed(2)));
}

export type TimerTone = "normal" | "warning" | "critical";

/** Timer colour band: amber at 5 minutes, red at 1 minute. */
export function timerTone(secondsLeft: number): TimerTone {
  if (secondsLeft <= 60) return "critical";
  if (secondsLeft <= 300) return "warning";
  return "normal";
}

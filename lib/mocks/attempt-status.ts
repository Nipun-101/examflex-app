/** Scored attempts: results exist, the runner must not reopen. */
export function isAttemptFinished(status: string): boolean {
  return status === "SUBMITTED" || status === "EXPIRED";
}

export function isAttemptPaused(status: string): boolean {
  return status === "PAUSED";
}

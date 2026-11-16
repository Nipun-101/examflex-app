import { getCurrentSession } from "@/lib/mocks/attempt-sessions";
import type { AttemptMockTestData } from "@/types/attempt";

/** Length of the running timer: the current section, else the paper. */
export function timerDurationSeconds(meta: AttemptMockTestData): number {
  const session = getCurrentSession(meta);
  return (session?.durationInMinutes ?? meta.durationInMinutes) * 60;
}

/** Seconds used on the running timer. The paused server value wins. */
export function runningConsumedSeconds(
  durationSeconds: number,
  secondsLeft: number,
  pausedConsumed: number | null
): number {
  return pausedConsumed ?? Math.max(0, durationSeconds - secondsLeft);
}

/**
 * Whole-paper seconds used. Session-wise papers add finished sections to the
 * running one; the paused server total wins when present.
 */
export function paperConsumedSeconds(
  meta: AttemptMockTestData,
  currentConsumed: number,
  pausedTotalConsumed: number | null
): number {
  if (!meta.isSessionWise) return currentConsumed;
  if (pausedTotalConsumed !== null) return pausedTotalConsumed;
  const currentIndex = meta.currentSessionIndex ?? 0;
  return (meta.sessions ?? []).reduce(
    (total, session, index) =>
      total + (index === currentIndex ? currentConsumed : session.timeConsumed),
    0
  );
}

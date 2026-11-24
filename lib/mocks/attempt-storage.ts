import type { ResumeAttemptData, StartAttemptData } from "@/types/attempt";

export const ATTEMPT_STORAGE_PREFIX = "examflex:mockAttempt:";
export const AUTO_RESUME_STORAGE_PREFIX = "examflex:mockAttemptAutoResume:";

/**
 * One-shot hand-off from the paper list: the student pressed Resume on a
 * paused attempt, so the attempt page should unpause it once it has loaded
 * (instead of the list unpausing it before the runner is even on screen).
 */
export function markAutoResume(attemptId: string): void {
  try {
    sessionStorage.setItem(`${AUTO_RESUME_STORAGE_PREFIX}${attemptId}`, "1");
  } catch {
    // ignore quota / unavailable
  }
}

/** Read and clear the auto-resume flag. True at most once per Resume press. */
export function consumeAutoResume(attemptId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = `${AUTO_RESUME_STORAGE_PREFIX}${attemptId}`;
    const marked = sessionStorage.getItem(key) === "1";
    sessionStorage.removeItem(key);
    return marked;
  } catch {
    return false;
  }
}

export function cacheAttempt(
  data: StartAttemptData | ResumeAttemptData
): void {
  try {
    sessionStorage.setItem(
      `${ATTEMPT_STORAGE_PREFIX}${data.attemptId}`,
      JSON.stringify(data)
    );
  } catch {
    // ignore quota / unavailable
  }
}

export function clearCachedAttempt(attemptId: string): void {
  try {
    sessionStorage.removeItem(`${ATTEMPT_STORAGE_PREFIX}${attemptId}`);
  } catch {
    // ignore
  }
}

export function readCachedAttempt(
  attemptId: string
): StartAttemptData | ResumeAttemptData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(
      `${ATTEMPT_STORAGE_PREFIX}${attemptId}`
    );
    if (!raw) return null;
    return JSON.parse(raw) as StartAttemptData | ResumeAttemptData;
  } catch {
    return null;
  }
}

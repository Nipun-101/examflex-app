import type { ResumeAttemptData, StartAttemptData } from "@/types/attempt";

export const ATTEMPT_STORAGE_PREFIX = "examflex:mockAttempt:";

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

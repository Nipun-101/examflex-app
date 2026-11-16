import type { AttemptLanguage } from "@/types/attempt";

const LANGUAGE_PREFIX = "examflex:attemptLanguage:";

export function isAttemptLanguage(value: unknown): value is AttemptLanguage {
  return value === "en" || value === "ml";
}

/** Hand the runner's language to the results route (same tab only). */
export function rememberAttemptLanguage(
  attemptId: string,
  language: AttemptLanguage
): void {
  try {
    sessionStorage.setItem(`${LANGUAGE_PREFIX}${attemptId}`, language);
  } catch {
    // ignore quota / unavailable
  }
}

export function readAttemptLanguage(attemptId: string): AttemptLanguage {
  try {
    const value = sessionStorage.getItem(`${LANGUAGE_PREFIX}${attemptId}`);
    return isAttemptLanguage(value) ? value : "en";
  } catch {
    return "en";
  }
}

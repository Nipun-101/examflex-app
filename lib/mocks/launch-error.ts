import type { ApiResult } from "@/lib/api/parse-envelope";

export const ENTITLEMENT_REQUIRED = "ENTITLEMENT_REQUIRED";

export const ENTITLEMENT_REQUIRED_MESSAGE =
  "This test needs an active plan. View plans to unlock it.";

/** Attempt state codes (`details.code`) from start/resume. */
export const ATTEMPT_EXPIRED = "ATTEMPT_EXPIRED";
export const ATTEMPT_CLOSED = "ATTEMPT_CLOSED";
export const ATTEMPT_ALREADY_ACTIVE = "ATTEMPT_ALREADY_ACTIVE";
export const RETAKE_NOT_ALLOWED = "RETAKE_NOT_ALLOWED";

const STALE_ATTEMPT_COPY: Record<string, string> = {
  [ATTEMPT_EXPIRED]:
    "Time ran out on this attempt, so it was submitted with the answers you saved. Review it or start a fresh attempt.",
  [ATTEMPT_CLOSED]:
    "This attempt was already submitted. Review it or start a fresh attempt.",
  [ATTEMPT_ALREADY_ACTIVE]:
    "You already have this test in progress. Resume it to carry on.",
};

/**
 * Codes meaning the paper list is out of date (a dead Resume, a Start on a
 * paper that is already running). The list should reload when it sees one.
 */
const STALE_ATTEMPT_CODES = new Set([
  ATTEMPT_EXPIRED,
  ATTEMPT_CLOSED,
  ATTEMPT_ALREADY_ACTIVE,
  RETAKE_NOT_ALLOWED,
]);

export function isStaleAttemptError(error: { code?: string } | null): boolean {
  return Boolean(error?.code && STALE_ATTEMPT_CODES.has(error.code));
}

/** Launch error for an attempt the server already scored (found via GET). */
export function finishedAttemptLaunchError(status: string): LaunchError {
  const code = status === "EXPIRED" ? ATTEMPT_EXPIRED : ATTEMPT_CLOSED;
  return { message: STALE_ATTEMPT_COPY[code]!, code };
}

export type LaunchError = {
  message: string;
  code?: string;
  /** Set only for ENTITLEMENT_REQUIRED so the banner can open View plans. */
  testId?: string;
};

export type ApiFailure = Extract<ApiResult<never>, { ok: false }>;

export function toLaunchError(
  failure: ApiFailure,
  testId: string
): LaunchError {
  if (failure.code === ENTITLEMENT_REQUIRED) {
    return {
      message: ENTITLEMENT_REQUIRED_MESSAGE,
      code: ENTITLEMENT_REQUIRED,
      testId,
    };
  }
  const staleCopy = failure.code ? STALE_ATTEMPT_COPY[failure.code] : undefined;
  return {
    message: staleCopy ?? failure.message,
    ...(failure.code ? { code: failure.code } : {}),
  };
}

export function launchErrorPlansTestId(error: LaunchError | null): string | null {
  return error?.code === ENTITLEMENT_REQUIRED && error.testId
    ? error.testId
    : null;
}

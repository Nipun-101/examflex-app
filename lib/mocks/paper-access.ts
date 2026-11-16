import type { PaperAccessFields } from "@/types/access";

/** True when the API denied this paper. Missing access is treated as allowed. */
export function isAccessDenied(paper: {
  access?: { allowed: boolean };
}): boolean {
  return paper.access?.allowed === false;
}

/**
 * Start and retake are replaced by View plans when access is denied.
 * An in-progress resume stays available (the API does not re-check entitlement).
 */
export function isStartBlocked(paper: PaperAccessFields): boolean {
  if (paper.userAttemptAction === "RESUME" && paper.resumeAttemptId) {
    return false;
  }
  return isAccessDenied(paper);
}

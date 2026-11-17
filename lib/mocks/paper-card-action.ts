import { isStartBlocked } from "@/lib/mocks/paper-access";
import { attemptResultPath } from "@/lib/mocks/exam-test-routes";
import type { PaperAccessFields, UserAttemptAction } from "@/types/access";

export type LaunchIntent =
  | { type: "start" }
  | { type: "resume"; attemptId: string };

export type PaperCardAction =
  | { kind: "view-plans" }
  | {
      kind: "attempt";
      action: UserAttemptAction;
      label: string;
      loadingLabel: string;
    };

const ATTEMPT_COPY: Record<
  UserAttemptAction,
  { label: string; loadingLabel: string }
> = {
  START: { label: "Start", loadingLabel: "Starting..." },
  RETAKE: { label: "Retry", loadingLabel: "Starting..." },
  RESUME: { label: "Resume →", loadingLabel: "Resuming..." },
};

export type PaperCardReviewAction = {
  kind: "review";
  href: string;
  label: string;
};

/**
 * Secondary Review CTA when a finished attempt id is available.
 * Also shown while a retake is in progress so prior results stay reachable.
 */
export function resolvePaperCardReviewAction(input: {
  lastAttemptId?: string;
  status?: "new" | "in_progress" | "completed";
  attemptCount?: number;
}): PaperCardReviewAction | null {
  if (!input.lastAttemptId) return null;
  const hasFinishedHistory =
    input.status === "completed" ||
    (input.status === "in_progress" && (input.attemptCount ?? 0) > 0);
  if (!hasFinishedHistory) return null;
  return {
    kind: "review",
    href: attemptResultPath(input.lastAttemptId),
    label: "Review",
  };
}

/** RESUME only counts when the API gave us an attempt to resume. */
export function effectiveAttemptAction(
  paper: PaperAccessFields
): UserAttemptAction {
  if (paper.userAttemptAction === "RESUME") {
    return paper.resumeAttemptId ? "RESUME" : "START";
  }
  return paper.userAttemptAction ?? "START";
}

export function resolveLaunchIntent(paper: PaperAccessFields): LaunchIntent {
  if (effectiveAttemptAction(paper) === "RESUME" && paper.resumeAttemptId) {
    return { type: "resume", attemptId: paper.resumeAttemptId };
  }
  return { type: "start" };
}

/** What the primary button on a paper card does for this user. */
export function resolvePaperCardAction(
  paper: PaperAccessFields
): PaperCardAction {
  if (isStartBlocked(paper)) return { kind: "view-plans" };
  const action = effectiveAttemptAction(paper);
  return { kind: "attempt", action, ...ATTEMPT_COPY[action] };
}

import { isStartBlocked } from "@/lib/mocks/paper-access";
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
  RETAKE: { label: "Retake", loadingLabel: "Starting..." },
  RESUME: { label: "Resume", loadingLabel: "Resuming..." },
};

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

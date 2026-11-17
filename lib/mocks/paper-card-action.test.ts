import { describe, expect, it } from "vitest";
import {
  effectiveAttemptAction,
  resolveLaunchIntent,
  resolvePaperCardAction,
  resolvePaperCardReviewAction,
} from "@/lib/mocks/paper-card-action";

const denied = { allowed: false, reason: "ENTITLEMENT_REQUIRED" };

describe("effectiveAttemptAction", () => {
  it("defaults to START", () => {
    expect(effectiveAttemptAction({})).toBe("START");
  });

  it("keeps RETAKE", () => {
    expect(effectiveAttemptAction({ userAttemptAction: "RETAKE" })).toBe(
      "RETAKE"
    );
  });

  it("only keeps RESUME when an attempt id exists", () => {
    expect(
      effectiveAttemptAction({
        userAttemptAction: "RESUME",
        resumeAttemptId: "a1",
      })
    ).toBe("RESUME");
    expect(effectiveAttemptAction({ userAttemptAction: "RESUME" })).toBe(
      "START"
    );
  });
});

describe("resolveLaunchIntent", () => {
  it("resumes the in-progress attempt", () => {
    expect(
      resolveLaunchIntent({
        userAttemptAction: "RESUME",
        resumeAttemptId: "a1",
      })
    ).toEqual({ type: "resume", attemptId: "a1" });
  });

  it("starts for START, RETAKE and RESUME without an attempt id", () => {
    expect(resolveLaunchIntent({ userAttemptAction: "START" })).toEqual({
      type: "start",
    });
    expect(resolveLaunchIntent({ userAttemptAction: "RETAKE" })).toEqual({
      type: "start",
    });
    expect(resolveLaunchIntent({ userAttemptAction: "RESUME" })).toEqual({
      type: "start",
    });
  });
});

describe("resolvePaperCardAction", () => {
  it("shows Start, Retry and Resume when access is allowed", () => {
    expect(resolvePaperCardAction({})).toEqual({
      kind: "attempt",
      action: "START",
      label: "Start",
      loadingLabel: "Starting...",
    });
    expect(
      resolvePaperCardAction({
        userAttemptAction: "RETAKE",
        access: { allowed: true, reason: "" },
      })
    ).toMatchObject({ kind: "attempt", action: "RETAKE", label: "Retry" });
    expect(
      resolvePaperCardAction({
        userAttemptAction: "RESUME",
        resumeAttemptId: "a1",
      })
    ).toMatchObject({
      kind: "attempt",
      action: "RESUME",
      label: "Resume →",
      loadingLabel: "Resuming...",
    });
  });

  it("replaces Start and Retry with View plans when denied", () => {
    expect(
      resolvePaperCardAction({ userAttemptAction: "START", access: denied })
    ).toEqual({ kind: "view-plans" });
    expect(
      resolvePaperCardAction({ userAttemptAction: "RETAKE", access: denied })
    ).toEqual({ kind: "view-plans" });
  });

  it("keeps Resume available when denied", () => {
    expect(
      resolvePaperCardAction({
        userAttemptAction: "RESUME",
        resumeAttemptId: "a1",
        access: denied,
      })
    ).toMatchObject({ kind: "attempt", action: "RESUME" });
  });

  it("shows View plans for a denied RESUME with no attempt id", () => {
    expect(
      resolvePaperCardAction({ userAttemptAction: "RESUME", access: denied })
    ).toEqual({ kind: "view-plans" });
  });

  it("treats missing access as allowed", () => {
    expect(resolvePaperCardAction({ accessMode: "ENTITLED" })).toMatchObject({
      kind: "attempt",
    });
  });
});

describe("resolvePaperCardReviewAction", () => {
  it("returns a results href for completed papers with a last attempt", () => {
    expect(
      resolvePaperCardReviewAction({
        status: "completed",
        lastAttemptId: "a9",
      })
    ).toEqual({
      kind: "review",
      href: "/mocks/attempt/a9/result",
      label: "Review",
    });
  });

  it("skips Review without a finished last attempt", () => {
    expect(
      resolvePaperCardReviewAction({ status: "completed" })
    ).toBeNull();
    expect(
      resolvePaperCardReviewAction({
        status: "in_progress",
        lastAttemptId: "a9",
        attemptCount: 0,
      })
    ).toBeNull();
  });

  it("keeps Review while a retake is in progress if prior attempts exist", () => {
    expect(
      resolvePaperCardReviewAction({
        status: "in_progress",
        lastAttemptId: "a9",
        attemptCount: 2,
      })
    ).toEqual({
      kind: "review",
      href: "/mocks/attempt/a9/result",
      label: "Review",
    });
  });
});

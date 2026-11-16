import { describe, expect, it } from "vitest";
import {
  effectiveAttemptAction,
  resolveLaunchIntent,
  resolvePaperCardAction,
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
  it("shows Start, Retake and Resume when access is allowed", () => {
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
    ).toMatchObject({ kind: "attempt", action: "RETAKE", label: "Retake" });
    expect(
      resolvePaperCardAction({
        userAttemptAction: "RESUME",
        resumeAttemptId: "a1",
      })
    ).toMatchObject({
      kind: "attempt",
      action: "RESUME",
      loadingLabel: "Resuming...",
    });
  });

  it("replaces Start and Retake with View plans when denied", () => {
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

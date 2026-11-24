import { describe, expect, it } from "vitest";
import {
  ENTITLEMENT_REQUIRED,
  ENTITLEMENT_REQUIRED_MESSAGE,
  finishedAttemptLaunchError,
  isStaleAttemptError,
  launchErrorPlansTestId,
  toLaunchError,
} from "@/lib/mocks/launch-error";

describe("toLaunchError", () => {
  it("uses the banner message and remembers the paper for ENTITLEMENT_REQUIRED", () => {
    expect(
      toLaunchError(
        {
          ok: false,
          message: "server text",
          status: 403,
          code: ENTITLEMENT_REQUIRED,
        },
        "t1"
      )
    ).toEqual({
      message: ENTITLEMENT_REQUIRED_MESSAGE,
      code: ENTITLEMENT_REQUIRED,
      testId: "t1",
    });
  });

  it("passes other errors through without a test id", () => {
    expect(
      toLaunchError({ ok: false, message: "Nope", code: "OTHER" }, "t1")
    ).toEqual({ message: "Nope", code: "OTHER" });
    expect(toLaunchError({ ok: false, message: "Offline" }, "t1")).toEqual({
      message: "Offline",
    });
  });
});

describe("launchErrorPlansTestId", () => {
  it("returns the paper only for entitlement errors that have one", () => {
    expect(launchErrorPlansTestId(null)).toBeNull();
    expect(launchErrorPlansTestId({ message: "x" })).toBeNull();
    expect(
      launchErrorPlansTestId({ message: "x", code: ENTITLEMENT_REQUIRED })
    ).toBeNull();
    expect(
      launchErrorPlansTestId({
        message: "x",
        code: ENTITLEMENT_REQUIRED,
        testId: "t1",
      })
    ).toBe("t1");
  });
});

describe("stale attempt errors", () => {
  it("swaps server text for student copy and keeps the code", () => {
    expect(
      toLaunchError(
        { ok: false, status: 400, message: "Use GET /:id", code: "ATTEMPT_EXPIRED" },
        "t1"
      )
    ).toEqual({
      message: expect.stringContaining("Time ran out on this attempt"),
      code: "ATTEMPT_EXPIRED",
    });
  });

  it("keeps the server message for RETAKE_NOT_ALLOWED", () => {
    expect(
      toLaunchError(
        { ok: false, status: 409, message: "No retakes", code: "RETAKE_NOT_ALLOWED" },
        "t1"
      )
    ).toEqual({ message: "No retakes", code: "RETAKE_NOT_ALLOWED" });
  });

  it("flags only list-staleness codes", () => {
    for (const code of [
      "ATTEMPT_EXPIRED",
      "ATTEMPT_CLOSED",
      "ATTEMPT_ALREADY_ACTIVE",
      "RETAKE_NOT_ALLOWED",
    ]) {
      expect(isStaleAttemptError({ code })).toBe(true);
    }
    expect(isStaleAttemptError({ code: ENTITLEMENT_REQUIRED })).toBe(false);
    expect(isStaleAttemptError({})).toBe(false);
    expect(isStaleAttemptError(null)).toBe(false);
  });

  it("maps a finished status found via GET", () => {
    expect(finishedAttemptLaunchError("EXPIRED").code).toBe("ATTEMPT_EXPIRED");
    expect(finishedAttemptLaunchError("SUBMITTED").code).toBe("ATTEMPT_CLOSED");
  });
});

import { describe, expect, it } from "vitest";
import { isAccessDenied, isStartBlocked } from "@/lib/mocks/paper-access";

const denied = { allowed: false, reason: "NO_ENTITLEMENT" };
const allowed = { allowed: true, reason: "ENTITLED" };

describe("isAccessDenied", () => {
  it("is true only when the API explicitly denied access", () => {
    expect(isAccessDenied({ access: denied })).toBe(true);
  });

  it("treats allowed or missing access as not denied", () => {
    expect(isAccessDenied({ access: allowed })).toBe(false);
    expect(isAccessDenied({})).toBe(false);
  });
});

describe("isStartBlocked", () => {
  it("blocks start and retake when access is denied", () => {
    expect(isStartBlocked({ access: denied, userAttemptAction: "START" })).toBe(
      true
    );
    expect(
      isStartBlocked({ access: denied, userAttemptAction: "RETAKE" })
    ).toBe(true);
    expect(isStartBlocked({ access: denied })).toBe(true);
  });

  it("does not block when access is allowed or missing", () => {
    expect(isStartBlocked({ access: allowed, userAttemptAction: "START" })).toBe(
      false
    );
    expect(isStartBlocked({ userAttemptAction: "START" })).toBe(false);
    expect(isStartBlocked({})).toBe(false);
  });

  it("keeps an in-progress resume available even when denied", () => {
    expect(
      isStartBlocked({
        access: denied,
        userAttemptAction: "RESUME",
        resumeAttemptId: "a1",
      })
    ).toBe(false);
  });

  it("still blocks a RESUME action without a resume attempt id", () => {
    expect(
      isStartBlocked({ access: denied, userAttemptAction: "RESUME" })
    ).toBe(true);
    expect(
      isStartBlocked({
        access: denied,
        userAttemptAction: "START",
        resumeAttemptId: "a1",
      })
    ).toBe(true);
  });
});

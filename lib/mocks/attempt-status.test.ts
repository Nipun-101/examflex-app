import { describe, expect, it } from "vitest";
import { isAttemptFinished, isAttemptPaused } from "@/lib/mocks/attempt-status";

describe("attempt status", () => {
  it("treats submitted and expired as finished", () => {
    expect(isAttemptFinished("SUBMITTED")).toBe(true);
    expect(isAttemptFinished("EXPIRED")).toBe(true);
    expect(isAttemptFinished("IN_PROGRESS")).toBe(false);
    expect(isAttemptFinished("PAUSED")).toBe(false);
  });

  it("detects paused", () => {
    expect(isAttemptPaused("PAUSED")).toBe(true);
    expect(isAttemptPaused("IN_PROGRESS")).toBe(false);
  });
});

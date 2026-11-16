import { describe, expect, it } from "vitest";
import {
  paperConsumedSeconds,
  runningConsumedSeconds,
  timerDurationSeconds,
} from "@/lib/mocks/attempt-time";
import type { AttemptMockTestData, AttemptSession } from "@/types/attempt";

function session(order: number, consumed: number, minutes = 30): AttemptSession {
  return {
    subject: "S",
    order,
    durationInMinutes: minutes,
    startIndex: 0,
    endIndex: 0,
    status: "IN_PROGRESS",
    timeConsumed: consumed,
  };
}

function meta(overrides: Partial<AttemptMockTestData> = {}): AttemptMockTestData {
  return {
    title: null,
    durationInMinutes: 60,
    totalQuestions: 1,
    startedAt: "",
    marksPerQuestion: 1,
    negativeMarking: 0,
    passingScore: null,
    exam: { id: "e", name: "NEET", description: "" },
    ...overrides,
  };
}

describe("timerDurationSeconds", () => {
  it("uses the paper length for ordinary papers", () => {
    expect(timerDurationSeconds(meta())).toBe(3600);
  });

  it("uses the current section for session-wise papers", () => {
    expect(
      timerDurationSeconds(
        meta({
          isSessionWise: true,
          sessions: [session(0, 0, 20), session(1, 0, 45)],
          currentSessionIndex: 1,
        })
      )
    ).toBe(2700);
  });
});

describe("runningConsumedSeconds", () => {
  it("derives from time left or uses the paused value", () => {
    expect(runningConsumedSeconds(3600, 3000, null)).toBe(600);
    expect(runningConsumedSeconds(3600, 4000, null)).toBe(0);
    expect(runningConsumedSeconds(3600, 3000, 123)).toBe(123);
  });
});

describe("paperConsumedSeconds", () => {
  const sessionWise = meta({
    isSessionWise: true,
    sessions: [session(0, 100), session(1, 0), session(2, 50)],
    currentSessionIndex: 1,
  });

  it("is the running time for ordinary papers", () => {
    expect(paperConsumedSeconds(meta(), 42, 999)).toBe(42);
  });

  it("sums finished sections plus the running one", () => {
    expect(paperConsumedSeconds(sessionWise, 30, null)).toBe(180);
  });

  it("prefers the paused server total", () => {
    expect(paperConsumedSeconds(sessionWise, 30, 500)).toBe(500);
  });

  it("defaults to the first section when no index is set", () => {
    expect(
      paperConsumedSeconds(
        meta({ isSessionWise: true, sessions: [session(0, 10), session(1, 20)] }),
        5,
        null
      )
    ).toBe(25);
  });

  it("copes with session-wise papers that have no sessions", () => {
    expect(paperConsumedSeconds(meta({ isSessionWise: true }), 7, null)).toBe(0);
  });
});

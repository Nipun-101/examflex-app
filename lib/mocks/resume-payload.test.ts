import { describe, expect, it } from "vitest";
import {
  mockTestDataFromResume,
  resumeSessionIndex,
  resumeSessionIsOpen,
} from "@/lib/mocks/resume-payload";
import type { AttemptSession, ResumeAttemptData } from "@/types/attempt";

function session(status: string): AttemptSession {
  return {
    subject: "S",
    order: 0,
    durationInMinutes: 10,
    startIndex: 0,
    endIndex: 0,
    status,
    timeConsumed: 0,
  };
}

function payload(overrides: Partial<ResumeAttemptData> = {}): ResumeAttemptData {
  return {
    attemptId: "a",
    mockTestData: {
      title: null,
      durationInMinutes: 10,
      totalQuestions: 1,
      startedAt: "",
      marksPerQuestion: 1,
      negativeMarking: 0,
      passingScore: null,
      exam: { id: "e", name: "NEET", description: "" },
    },
    questions: [],
    timeElapsed: 0,
    timeRemaining: 600,
    ...overrides,
  };
}

describe("mockTestDataFromResume", () => {
  it("folds root session state into mockTestData", () => {
    const merged = mockTestDataFromResume(
      payload({ sessions: [session("IN_PROGRESS")], currentSessionIndex: 0 })
    );
    expect(merged.sessions).toHaveLength(1);
    expect(merged.currentSessionIndex).toBe(0);
  });

  it("prefers values already on mockTestData", () => {
    const base = payload();
    const merged = mockTestDataFromResume(
      payload({
        mockTestData: {
          ...base.mockTestData,
          sessions: [session("PAUSED"), session("LOCKED")],
          currentSessionIndex: 1,
        },
        sessions: [session("IN_PROGRESS")],
        currentSessionIndex: 0,
      })
    );
    expect(merged.sessions).toHaveLength(2);
    expect(merged.currentSessionIndex).toBe(1);
  });

  it("leaves plain papers untouched", () => {
    const merged = mockTestDataFromResume(payload());
    expect(merged).not.toHaveProperty("sessions");
    expect(merged).not.toHaveProperty("currentSessionIndex");
  });
});

describe("resumeSessionIndex / resumeSessionIsOpen", () => {
  it("reads the index from either place and defaults to 0", () => {
    expect(resumeSessionIndex(payload())).toBe(0);
    expect(resumeSessionIndex(payload({ currentSessionIndex: 2 }))).toBe(2);
  });

  it("is open for in-progress or paused sections only", () => {
    expect(
      resumeSessionIsOpen(payload({ sessions: [session("IN_PROGRESS")] }))
    ).toBe(true);
    expect(resumeSessionIsOpen(payload({ sessions: [session("PAUSED")] }))).toBe(
      true
    );
    expect(
      resumeSessionIsOpen(payload({ sessions: [session("SUBMITTED")] }))
    ).toBe(false);
    expect(resumeSessionIsOpen(payload())).toBe(false);
  });
});

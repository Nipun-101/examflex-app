import { beforeEach, describe, expect, it } from "vitest";
import {
  ATTEMPT_STORAGE_PREFIX,
  cacheAttempt,
  clearCachedAttempt,
  consumeAutoResume,
  markAutoResume,
  readCachedAttempt,
} from "@/lib/mocks/attempt-storage";
import type { StartAttemptData } from "@/types/attempt";

const sample: StartAttemptData = {
  attemptId: "att-1",
  mockTestData: {
    title: "Practice",
    durationInMinutes: 30,
    totalQuestions: 1,
    startedAt: "2024-01-01T00:00:00.000Z",
    marksPerQuestion: 4,
    negativeMarking: 0,
    passingScore: null,
    exam: { id: "ex1", name: "NEET", description: "" },
  },
  questions: [],
};

describe("attempt storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("round-trips cached attempts", () => {
    cacheAttempt(sample);
    expect(sessionStorage.getItem(`${ATTEMPT_STORAGE_PREFIX}att-1`)).toBeTruthy();
    expect(readCachedAttempt("att-1")?.attemptId).toBe("att-1");
    clearCachedAttempt("att-1");
    expect(readCachedAttempt("att-1")).toBeNull();
  });
});

describe("auto-resume hand-off", () => {
  beforeEach(() => sessionStorage.clear());

  it("is read once, then cleared", () => {
    expect(consumeAutoResume("att1")).toBe(false);
    markAutoResume("att1");
    expect(consumeAutoResume("att2")).toBe(false);
    expect(consumeAutoResume("att1")).toBe(true);
    expect(consumeAutoResume("att1")).toBe(false);
  });
});

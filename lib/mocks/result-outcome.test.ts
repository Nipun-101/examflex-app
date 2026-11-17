import { describe, expect, it } from "vitest";
import { optionLetter, resultOutcome } from "@/lib/mocks/result-outcome";
import type { SubmittedQuestionResult } from "@/types/attempt";

function result(
  overrides: Partial<SubmittedQuestionResult>
): SubmittedQuestionResult {
  return {
    questionId: "q1",
    selectedOption: null,
    correctAnswer: "a",
    isCorrect: false,
    marksAwarded: 0,
    ...overrides,
  };
}

describe("resultOutcome", () => {
  it("treats missing or unanswered as skipped", () => {
    expect(resultOutcome(undefined)).toBe("skipped");
    expect(resultOutcome(result({ selectedOption: null }))).toBe("skipped");
  });

  it("distinguishes correct and wrong picks", () => {
    expect(
      resultOutcome(
        result({ selectedOption: "a", correctAnswer: "a", isCorrect: true })
      )
    ).toBe("correct");
    expect(
      resultOutcome(
        result({ selectedOption: "b", correctAnswer: "a", isCorrect: false })
      )
    ).toBe("wrong");
  });
});

describe("optionLetter", () => {
  it("maps indexes to A–D", () => {
    expect(optionLetter(0)).toBe("A");
    expect(optionLetter(3)).toBe("D");
  });
});

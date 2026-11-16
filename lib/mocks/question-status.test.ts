import { describe, expect, it } from "vitest";
import {
  countStatus,
  deriveQuestionStatuses,
  summarizeStatuses,
} from "@/lib/mocks/question-status";
import type { AttemptQuestion } from "@/types/attempt";

function question(id: string): AttemptQuestion {
  return {
    _id: id,
    questionText: {
      en: { text: id, imageUrl: null },
      ml: { text: id, imageUrl: null },
    },
    options: [],
    subject: "PHY",
  };
}

const questions = ["a", "b", "c", "d", "e"].map(question);

describe("deriveQuestionStatuses", () => {
  it("maps answered, marked, visited and untouched questions", () => {
    const statuses = deriveQuestionStatuses(
      questions,
      new Map([
        ["a", "o1"],
        ["c", "o2"],
      ]),
      new Set(["b", "c"]),
      new Set([0, 1, 2, 3])
    );
    expect(statuses).toEqual([
      "answered",
      "marked",
      "marked-answered",
      "not-answered",
      "not-visited",
    ]);
  });
});

describe("countStatus / summarizeStatuses", () => {
  const statuses = [
    "answered",
    "marked",
    "marked-answered",
    "not-answered",
    "not-visited",
    "not-visited",
  ] as const;

  it("counts one status", () => {
    expect(countStatus(statuses, "not-visited")).toBe(2);
  });

  it("summarises answered and marked including combined state", () => {
    expect(summarizeStatuses(statuses)).toEqual({
      total: 6,
      answered: 2,
      notAnswered: 1,
      marked: 2,
      notVisited: 2,
    });
  });
});

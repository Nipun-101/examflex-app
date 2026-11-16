import { describe, expect, it } from "vitest";
import {
  computeAttemptSecondsLeft,
  getCurrentSession,
  hydrateAnswers,
  isLastSession,
  visibleAttemptQuestions,
} from "@/lib/mocks/attempt-sessions";
import type {
  AttemptMockTestData,
  AttemptQuestion,
  StartAttemptData,
} from "@/types/attempt";

const questions: AttemptQuestion[] = [
  {
    _id: "q1",
    questionText: {
      en: { text: "1", imageUrl: null },
      ml: { text: "1", imageUrl: null },
    },
    options: [],
    subject: "PHY",
    sessionOrder: 1,
    selectedOption: "a",
  },
  {
    _id: "q2",
    questionText: {
      en: { text: "2", imageUrl: null },
      ml: { text: "2", imageUrl: null },
    },
    options: [],
    subject: "CHE",
    sessionOrder: 2,
  },
];

const sessionMeta: AttemptMockTestData = {
  title: "Full",
  durationInMinutes: 180,
  totalQuestions: 2,
  startedAt: "2024-01-01T00:00:00.000Z",
  marksPerQuestion: 4,
  negativeMarking: 1,
  passingScore: null,
  exam: { id: "ex1", name: "NEET", description: "" },
  isSessionWise: true,
  currentSessionIndex: 0,
  sessions: [
    {
      subject: "PHY",
      order: 1,
      durationInMinutes: 60,
      startIndex: 0,
      endIndex: 0,
      status: "IN_PROGRESS",
      timeConsumed: 0,
      questionIds: ["q1"],
    },
    {
      subject: "CHE",
      order: 2,
      durationInMinutes: 60,
      startIndex: 1,
      endIndex: 1,
      status: "LOCKED",
      timeConsumed: 0,
      questionIds: ["q2"],
    },
  ],
};

describe("attempt sessions", () => {
  it("filters to the current session", () => {
    expect(getCurrentSession(sessionMeta)?.subject).toBe("PHY");
    expect(visibleAttemptQuestions(questions, sessionMeta)).toHaveLength(1);
    expect(isLastSession(sessionMeta)).toBe(false);
  });

  it("hydrates selected answers", () => {
    expect(hydrateAnswers(questions).get("q1")).toBe("a");
  });

  it("prefers server timeRemaining", () => {
    const data: StartAttemptData & { timeRemaining: number } = {
      attemptId: "a1",
      mockTestData: sessionMeta,
      questions,
      timeRemaining: 42,
    };
    expect(computeAttemptSecondsLeft(data)).toBe(42);
  });
});

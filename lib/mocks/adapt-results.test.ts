import { describe, expect, it } from "vitest";
import {
  adaptAttemptDetailsToResults,
  buildSectionBreakdown,
  wallClockSeconds,
} from "@/lib/mocks/adapt-results";
import type {
  AttemptDetails,
  AttemptDetailsQuestion,
  AttemptMockTestData,
  AttemptQuestion,
  AttemptSession,
  SubmittedQuestionResult,
} from "@/types/attempt";

function detailsQuestion(
  id: string,
  extra: Partial<AttemptDetailsQuestion> = {}
): AttemptDetailsQuestion {
  return {
    _id: id,
    questionText: {
      en: { text: id, imageUrl: null },
      ml: { text: id, imageUrl: null },
    },
    options: [{ id: "a", type: "text", en: "A", ml: "A", imageUrl: null }],
    subject: "PHY",
    ...extra,
  };
}

function details(overrides: Partial<AttemptDetails> = {}): AttemptDetails {
  return {
    attemptId: "att1",
    status: "SUBMITTED",
    test: {
      title: "Practice",
      durationInMinutes: 60,
      totalQuestions: 2,
      startedAt: "2026-01-01T00:00:00.000Z",
      marksPerQuestion: 4,
      negativeMarking: 1,
      passingScore: 4,
      exam: { id: "ex1", name: "NEET", description: "" },
      paperType: "TOPIC_WISE",
      subject: { id: "s1", name: "Physics" },
      topic: { id: "t1", name: "Optics" },
    },
    questions: [
      detailsQuestion("q1", {
        selectedOption: "a",
        correctAnswer: "a",
        isCorrect: true,
        marksAwarded: 4,
        difficultyLevel: "easy",
        optionType: "text",
        topic: "Optics",
        sessionOrder: 0,
        explanation: { en: "why", ml: null, imageUrl: null },
      }),
      detailsQuestion("q2", {
        correctAnswer: "a",
        isCorrect: false,
        marksAwarded: 0,
      }),
    ],
    score: 4,
    totalScore: 8,
    submittedAt: "2026-01-01T00:30:00.000Z",
    correctAnswers: 1,
    incorrectAnswers: 0,
    unansweredQuestions: 1,
    isPassed: true,
    timeTaken: 900,
    ...overrides,
  };
}

describe("wallClockSeconds", () => {
  it("measures the gap and guards invalid dates", () => {
    expect(
      wallClockSeconds("2026-01-01T00:00:00Z", "2026-01-01T00:01:30Z")
    ).toBe(90);
    expect(wallClockSeconds("2026-01-01T00:01:00Z", "2026-01-01T00:00:00Z")).toBe(
      0
    );
    expect(wallClockSeconds("nope", "2026-01-01T00:00:00Z")).toBe(0);
  });
});

describe("adaptAttemptDetailsToResults", () => {
  it("maps a fully scored attempt", () => {
    const adapted = adaptAttemptDetailsToResults(details());
    expect(adapted.answerKeyAvailable).toBe(true);
    expect(adapted.result).toMatchObject({
      attemptId: "att1",
      score: 4,
      totalScore: 8,
      passed: true,
      timeTaken: 900,
      correctAnswers: 1,
      unansweredQuestions: 1,
    });
    expect(adapted.result.questionResults).toHaveLength(2);
    expect(adapted.result.questionResults[0]?.explanation?.en).toBe("why");
    expect(adapted.questions[1]?.selectedOption).toBeNull();
    expect(adapted.questions[0]?.difficultyLevel).toBe("easy");
    expect(adapted.mockTestData.paperType).toBe("TOPIC_WISE");
    expect(adapted.mockTestData.topic?.name).toBe("Optics");
  });

  it("falls back when server aggregates are missing", () => {
    const adapted = adaptAttemptDetailsToResults(
      details({
        score: undefined,
        totalScore: undefined,
        isPassed: undefined,
        timeTaken: undefined,
        correctAnswers: undefined,
        incorrectAnswers: undefined,
        unansweredQuestions: undefined,
      })
    );
    expect(adapted.result.score).toBe(4);
    expect(adapted.result.totalScore).toBe(8);
    expect(adapted.result.passed).toBe(true);
    expect(adapted.result.timeTaken).toBe(1800);
    expect(adapted.result.correctAnswers).toBe(0);
    expect(adapted.result.incorrectAnswers).toBe(0);
    expect(adapted.result.unansweredQuestions).toBe(0);
  });

  it("defaults a scored question that lacks per-question fields", () => {
    const { result } = adaptAttemptDetailsToResults(
      details({ questions: [detailsQuestion("q1", { correctAnswer: "a" })] })
    );
    expect(result.questionResults).toEqual([
      {
        questionId: "q1",
        selectedOption: null,
        correctAnswer: "a",
        isCorrect: false,
        marksAwarded: 0,
      },
    ]);
  });

  it("does not pass without a passing score and handles missing keys", () => {
    const base = details();
    const adapted = adaptAttemptDetailsToResults(
      details({
        isPassed: undefined,
        submittedAt: undefined,
        test: { ...base.test, passingScore: null, marksPerQuestion: null },
        totalScore: 0,
        questions: [detailsQuestion("q1")],
      })
    );
    expect(adapted.answerKeyAvailable).toBe(false);
    expect(adapted.result.passed).toBe(false);
    expect(adapted.result.totalScore).toBe(0);
    expect(adapted.result.submittedAt).toBe("");
  });

  it("carries session-wise fields from the details root or test", () => {
    const sessions: AttemptSession[] = [
      {
        subject: "PHY",
        order: 0,
        durationInMinutes: 30,
        startIndex: 0,
        endIndex: 1,
        status: "SUBMITTED",
        timeConsumed: 100,
      },
    ];
    const adapted = adaptAttemptDetailsToResults(
      details({ isSessionWise: true, sessions, currentSessionIndex: 0 })
    );
    expect(adapted.mockTestData.isSessionWise).toBe(true);
    expect(adapted.mockTestData.sessions).toEqual(sessions);
    expect(adapted.mockTestData.currentSessionIndex).toBe(0);

    const base = details();
    const fromTest = adaptAttemptDetailsToResults(
      details({
        test: {
          ...base.test,
          isSessionWise: true,
          sessions,
          currentSessionIndex: 0,
        },
      })
    );
    expect(fromTest.mockTestData.sessions).toEqual(sessions);
  });
});

describe("buildSectionBreakdown", () => {
  const meta: AttemptMockTestData = {
    title: null,
    durationInMinutes: 60,
    totalQuestions: 3,
    startedAt: "",
    marksPerQuestion: 4,
    negativeMarking: 1,
    passingScore: null,
    exam: { id: "e", name: "NEET", description: "" },
    isSessionWise: true,
    sessions: [
      {
        subject: "CHEM",
        name: "  ",
        order: 1,
        durationInMinutes: 30,
        startIndex: 2,
        endIndex: 2,
        status: "SUBMITTED",
        timeConsumed: 0,
      },
      {
        subject: "PHY",
        name: "Physics",
        order: 0,
        durationInMinutes: 30,
        startIndex: 0,
        endIndex: 1,
        status: "SUBMITTED",
        timeConsumed: 600,
      },
      {
        subject: "BIO",
        order: 2,
        durationInMinutes: 30,
        startIndex: 5,
        endIndex: 4,
        status: "SUBMITTED",
        timeConsumed: 0,
      },
    ],
  };
  const questions: AttemptQuestion[] = ["q1", "q2", "q3"].map((id) =>
    detailsQuestion(id)
  );
  const results = new Map<string, SubmittedQuestionResult>([
    [
      "q1",
      { questionId: "q1", selectedOption: "a", correctAnswer: "a", isCorrect: true, marksAwarded: 4 },
    ],
    [
      "q2",
      { questionId: "q2", selectedOption: "b", correctAnswer: "a", isCorrect: false, marksAwarded: -1 },
    ],
  ]);

  it("tallies each section in order and drops empty ones", () => {
    const sections = buildSectionBreakdown(meta, questions, results);
    expect(sections.map((s) => s.name)).toEqual(["Physics", "Section 2"]);
    expect(sections[0]).toMatchObject({
      correct: 1,
      wrong: 1,
      skipped: 0,
      timeConsumed: 600,
      questionIds: ["q1", "q2"],
    });
    expect(sections[1]).toMatchObject({ correct: 0, wrong: 0, skipped: 1 });
  });

  it("is empty for papers without sessions", () => {
    expect(
      buildSectionBreakdown({ ...meta, sessions: undefined }, questions, results)
    ).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import {
  parseAttemptDetails,
  parseAttemptMockTestData,
  parseAttemptQuestion,
  parseAttemptSession,
  parseCompleteSessionResult,
  parsePauseAttemptData,
  parseResumeAttemptData,
  parseStartAttemptData,
  parseSubmitAttemptResult,
} from "@/lib/api/parse-attempt";

const question = {
  _id: "q1",
  questionText: {
    en: { text: "What?", imageUrl: null },
    ml: { text: "എന്ത്?", imageUrl: "https://img.test/ml.png" },
  },
  optionType: "text",
  options: [
    { id: "a", type: "text", en: "A", ml: "എ", imageUrl: null },
    { id: "b", type: "image", en: "", ml: "", imageUrl: "https://img.test/b.png" },
  ],
  subject: "s1",
  topic: "t1",
  difficultyLevel: "easy",
  sessionOrder: 0,
  selectedOption: "a",
};

const session = {
  subject: "s1",
  name: "Physics",
  order: 0,
  durationInMinutes: 50,
  startIndex: 0,
  endIndex: 44,
  questionIds: ["q1", "q2"],
  questionCount: 2,
  status: "IN_PROGRESS",
  startedAt: "2026-01-01T00:00:00.000Z",
  submittedAt: "2026-01-01T00:50:00.000Z",
  timeConsumed: 120,
};

const mockTestData = {
  title: "Kinematics",
  durationInMinutes: 30,
  totalQuestions: 20,
  startedAt: "2026-01-01T00:00:00.000Z",
  marksPerQuestion: 4,
  negativeMarking: 1,
  passingScore: 40,
  exam: {
    id: "e1",
    name: "NEET",
    description: "Medical",
    hasMultiLingualSupport: true,
    performanceBands: [{ key: "excellent", minPercent: 80 }],
  },
  paperType: "FULL_EXAM",
  subject: { id: "s1", name: "Physics" },
  topic: { id: "t1", name: "Kinematics" },
  isSessionWise: true,
  sessions: [session],
  currentSessionIndex: 0,
};

const startData = {
  attemptId: "a1",
  mockTestData,
  questions: [question],
};

const questionResult = {
  questionId: "q1",
  selectedOption: "a",
  correctAnswer: "b",
  isCorrect: false,
  marksAwarded: -1,
  explanation: {
    en: "Because",
    ml: null,
    imageUrl: "https://img.test/e.png",
    imageUrls: ["https://img.test/e2.png"],
  },
};

const submitResult = {
  attemptId: "a1",
  score: 36,
  totalScore: 80,
  passingScore: 40,
  passed: false,
  correctAnswers: 10,
  incorrectAnswers: 4,
  unansweredQuestions: 6,
  submittedAt: "2026-01-01T00:30:00.000Z",
  timeTaken: 1700,
  questionResults: [questionResult],
};

describe("parseAttemptQuestion", () => {
  it("parses a full question", () => {
    expect(parseAttemptQuestion(question)).toEqual(question);
  });

  it("applies defaults for a sparse question", () => {
    const parsed = parseAttemptQuestion({ _id: "q1" });
    expect(parsed).toEqual({
      _id: "q1",
      questionText: {
        en: { text: "", imageUrl: null },
        ml: { text: "", imageUrl: null },
      },
      options: [],
      subject: "",
    });
    expect(parsed).not.toHaveProperty("selectedOption");
    expect(parsed).not.toHaveProperty("optionType");
  });

  it("keeps null selections and normalizes bad nested values", () => {
    const parsed = parseAttemptQuestion({
      ...question,
      selectedOption: null,
      optionType: "image",
      difficultyLevel: "impossible",
      questionText: { en: "oops", ml: { text: 1, imageUrl: 2 } },
      options: [
        null,
        { id: 1 },
        { id: "c", type: "weird", en: null, ml: undefined },
      ],
    });
    expect(parsed).toMatchObject({
      selectedOption: null,
      optionType: "image",
      questionText: {
        en: { text: "", imageUrl: null },
        ml: { text: "", imageUrl: null },
      },
      options: [
        { id: "c", type: "text", en: "", ml: "", imageUrl: null },
      ],
    });
    expect(parsed).not.toHaveProperty("difficultyLevel");
    expect(
      parseAttemptQuestion({ ...question, optionType: "other" })
    ).not.toHaveProperty("optionType");
    expect(
      parseAttemptQuestion({ ...question, questionText: "x", options: "x" })
    ).toMatchObject({ options: [] });
  });

  it("rejects invalid questions", () => {
    expect(parseAttemptQuestion(null)).toBeNull();
    expect(parseAttemptQuestion({ _id: 1 })).toBeNull();
  });
});

describe("parseAttemptSession", () => {
  it("parses a full session", () => {
    expect(parseAttemptSession(session)).toEqual(session);
  });

  it("defaults timeConsumed and omits optional fields", () => {
    const parsed = parseAttemptSession({
      subject: "s1",
      order: 1,
      durationInMinutes: 50,
      startIndex: 45,
      endIndex: 89,
      status: "LOCKED",
    });
    expect(parsed).toEqual({
      subject: "s1",
      order: 1,
      durationInMinutes: 50,
      startIndex: 45,
      endIndex: 89,
      status: "LOCKED",
      timeConsumed: 0,
    });
    expect(parsed).not.toHaveProperty("name");
  });

  it.each([
    ["not a record", null],
    ["subject", { ...session, subject: 1 }],
    ["status", { ...session, status: undefined }],
    ["order", { ...session, order: "0" }],
    ["durationInMinutes", { ...session, durationInMinutes: null }],
    ["startIndex", { ...session, startIndex: undefined }],
    ["endIndex", { ...session, endIndex: "44" }],
  ])("rejects invalid %s", (_label, value) => {
    expect(parseAttemptSession(value)).toBeNull();
  });
});

describe("parseAttemptMockTestData", () => {
  it("parses a full payload", () => {
    expect(parseAttemptMockTestData(mockTestData)).toEqual(mockTestData);
  });

  it("applies defaults for a sparse payload", () => {
    const parsed = parseAttemptMockTestData({
      durationInMinutes: 30,
      totalQuestions: 10,
      exam: { id: "e1", name: "NEET" },
      subject: { id: 1 },
      topic: "x",
      sessions: "x",
      paperType: "OTHER",
    });
    expect(parsed).toEqual({
      title: null,
      durationInMinutes: 30,
      totalQuestions: 10,
      startedAt: "",
      marksPerQuestion: null,
      negativeMarking: null,
      passingScore: null,
      exam: { id: "e1", name: "NEET", description: "" },
    });
  });

  it("drops invalid performance bands", () => {
    const parsed = parseAttemptMockTestData({
      ...mockTestData,
      exam: {
        id: "e1",
        name: "NEET",
        performanceBands: [
          { key: "ok", minPercent: 10 },
          null,
          { key: 1, minPercent: 10 },
          { key: "bad" },
        ],
      },
    });
    expect(parsed?.exam.performanceBands).toEqual([
      { key: "ok", minPercent: 10 },
    ]);
  });

  it("accepts every paper type", () => {
    for (const paperType of ["TOPIC_WISE", "FULL_EXAM", "SPRINT"] as const) {
      expect(
        parseAttemptMockTestData({ ...mockTestData, paperType })?.paperType
      ).toBe(paperType);
    }
  });

  it.each([
    ["not a record", null],
    ["exam", { ...mockTestData, exam: null }],
    ["exam id", { ...mockTestData, exam: { name: "NEET" } }],
    ["exam name", { ...mockTestData, exam: { id: "e1", name: 1 } }],
    ["duration", { ...mockTestData, durationInMinutes: "30" }],
    ["totalQuestions", { ...mockTestData, totalQuestions: undefined }],
  ])("rejects invalid %s", (_label, value) => {
    expect(parseAttemptMockTestData(value)).toBeNull();
  });
});

describe("parseStartAttemptData / parseResumeAttemptData", () => {
  it("parses start data and drops bad questions", () => {
    expect(parseStartAttemptData(startData)).toEqual(startData);
    expect(
      parseStartAttemptData({ ...startData, questions: [question, null] })
    ).toEqual(startData);
  });

  it("rejects invalid start data", () => {
    expect(parseStartAttemptData(null)).toBeNull();
    expect(parseStartAttemptData({ ...startData, attemptId: 1 })).toBeNull();
    expect(
      parseStartAttemptData({ ...startData, mockTestData: null })
    ).toBeNull();
    expect(
      parseStartAttemptData({ ...startData, questions: "x" })
    ).toBeNull();
  });

  const resume = {
    ...startData,
    timeElapsed: 100,
    timeRemaining: 1700,
    pauseCount: 1,
    timeConsumed: 100,
    sessions: [session],
    currentSessionIndex: 0,
  };

  it("parses resume data", () => {
    expect(parseResumeAttemptData(resume)).toEqual(resume);
  });

  it("parses resume data without optionals", () => {
    const parsed = parseResumeAttemptData({
      ...startData,
      timeElapsed: 0,
      timeRemaining: 60,
    });
    expect(parsed).toEqual({ ...startData, timeElapsed: 0, timeRemaining: 60 });
    expect(parsed).not.toHaveProperty("pauseCount");
  });

  it("rejects invalid resume data", () => {
    expect(parseResumeAttemptData(null)).toBeNull();
    expect(parseResumeAttemptData({ ...startData })).toBeNull();
    expect(
      parseResumeAttemptData({ ...resume, attemptId: undefined })
    ).toBeNull();
    expect(
      parseResumeAttemptData({ ...resume, timeElapsed: "1" })
    ).toBeNull();
    expect(
      parseResumeAttemptData({ ...resume, timeRemaining: null })
    ).toBeNull();
  });
});

describe("parsePauseAttemptData", () => {
  const pause = {
    attemptId: "a1",
    testTitle: "Kinematics",
    status: "PAUSED",
    timeConsumed: 100,
    totalTimeConsumed: 300,
    timeRemaining: 1700,
    pausedAt: "2026-01-01T00:10:00.000Z",
    pauseCount: 2,
  };

  it("parses pause data", () => {
    expect(parsePauseAttemptData(pause)).toEqual(pause);
    const sparse = parsePauseAttemptData({
      ...pause,
      testTitle: undefined,
      totalTimeConsumed: undefined,
    });
    expect(sparse).toMatchObject({ testTitle: null });
    expect(sparse).not.toHaveProperty("totalTimeConsumed");
  });

  it.each([
    ["not a record", null],
    ["attemptId", { ...pause, attemptId: 1 }],
    ["status", { ...pause, status: undefined }],
    ["pausedAt", { ...pause, pausedAt: 5 }],
    ["timeConsumed", { ...pause, timeConsumed: "1" }],
    ["timeRemaining", { ...pause, timeRemaining: null }],
    ["pauseCount", { ...pause, pauseCount: undefined }],
  ])("rejects invalid %s", (_label, value) => {
    expect(parsePauseAttemptData(value)).toBeNull();
  });
});

describe("parseSubmitAttemptResult", () => {
  it("parses a full result", () => {
    expect(parseSubmitAttemptResult(submitResult)).toEqual(submitResult);
  });

  it("defaults results when keys are hidden", () => {
    const { questionResults: _hidden, ...rest } = submitResult;
    void _hidden;
    expect(
      parseSubmitAttemptResult({ ...rest, passingScore: undefined })
    ).toEqual({ ...rest, passingScore: null, questionResults: [] });
  });

  it("drops invalid question results and parses sparse ones", () => {
    const parsed = parseSubmitAttemptResult({
      ...submitResult,
      questionResults: [
        { ...questionResult, explanation: undefined, selectedOption: undefined },
        { ...questionResult, explanation: "text" },
        null,
        { ...questionResult, questionId: 1 },
        { ...questionResult, correctAnswer: 1 },
        { ...questionResult, isCorrect: "no" },
        { ...questionResult, marksAwarded: "4" },
        {
          ...questionResult,
          explanation: { en: 1, ml: 2, imageUrl: 3, imageUrls: "x" },
        },
      ],
    });
    expect(parsed?.questionResults).toEqual([
      {
        questionId: "q1",
        selectedOption: null,
        correctAnswer: "b",
        isCorrect: false,
        marksAwarded: -1,
      },
      {
        questionId: "q1",
        selectedOption: "a",
        correctAnswer: "b",
        isCorrect: false,
        marksAwarded: -1,
      },
      {
        questionId: "q1",
        selectedOption: "a",
        correctAnswer: "b",
        isCorrect: false,
        marksAwarded: -1,
        explanation: { en: null, ml: null, imageUrl: null },
      },
    ]);
  });

  it.each([
    ["not a record", null],
    ["attemptId", { ...submitResult, attemptId: 1 }],
    ["passed", { ...submitResult, passed: "no" }],
    ["submittedAt", { ...submitResult, submittedAt: undefined }],
    ["score", { ...submitResult, score: "1" }],
    ["totalScore", { ...submitResult, totalScore: null }],
    ["correctAnswers", { ...submitResult, correctAnswers: undefined }],
    ["incorrectAnswers", { ...submitResult, incorrectAnswers: "1" }],
    ["unansweredQuestions", { ...submitResult, unansweredQuestions: null }],
    ["timeTaken", { ...submitResult, timeTaken: "9" }],
  ])("rejects invalid %s", (_label, value) => {
    expect(parseSubmitAttemptResult(value)).toBeNull();
  });
});

describe("parseCompleteSessionResult", () => {
  const next = { ...startData, timeElapsed: 0, timeRemaining: 3000 };

  it("parses a mid-paper completion with the next session", () => {
    expect(
      parseCompleteSessionResult({
        paperCompleted: false,
        sessions: [session],
        currentSessionIndex: 1,
        nextSession: next,
      })
    ).toEqual({
      paperCompleted: false,
      sessions: [session],
      currentSessionIndex: 1,
      nextSession: next,
    });
  });

  it("parses a final completion with results", () => {
    const parsed = parseCompleteSessionResult({
      paperCompleted: true,
      sessions: [session, null],
      currentSessionIndex: 2,
      results: submitResult,
    });
    expect(parsed).toEqual({
      paperCompleted: true,
      sessions: [session],
      currentSessionIndex: 2,
      results: submitResult,
    });
    expect(parsed).not.toHaveProperty("nextSession");
  });

  it("rejects invalid payloads", () => {
    const valid = {
      paperCompleted: true,
      sessions: [session],
      currentSessionIndex: 0,
    };
    expect(parseCompleteSessionResult(null)).toBeNull();
    expect(
      parseCompleteSessionResult({ ...valid, paperCompleted: "yes" })
    ).toBeNull();
    expect(parseCompleteSessionResult({ ...valid, sessions: {} })).toBeNull();
    expect(
      parseCompleteSessionResult({ ...valid, currentSessionIndex: "0" })
    ).toBeNull();
  });
});

describe("parseAttemptDetails", () => {
  const scoredQuestion = {
    ...question,
    correctAnswer: "b",
    isCorrect: false,
    marksAwarded: -1,
    explanation: { en: "Because", ml: null, imageUrl: null },
  };

  const details = {
    attemptId: "a1",
    status: "SUBMITTED",
    test: { ...mockTestData, showResultsImmediately: true },
    questions: [scoredQuestion],
    score: 36,
    totalScore: 80,
    submittedAt: "2026-01-01T00:30:00.000Z",
    correctAnswers: 10,
    incorrectAnswers: 4,
    unansweredQuestions: 6,
    isPassed: false,
    timeElapsed: 1700,
    timeRemaining: 100,
    timeTaken: 1700,
    isSessionWise: true,
    sessions: [session],
    currentSessionIndex: 0,
  };

  it("parses a scored attempt", () => {
    expect(parseAttemptDetails(details)).toEqual(details);
  });

  it("parses an in-progress attempt without scoring fields", () => {
    const parsed = parseAttemptDetails({
      attemptId: "a1",
      status: "IN_PROGRESS",
      test: mockTestData,
      questions: [question, null, { subject: "no id" }],
    });
    expect(parsed).toEqual({
      attemptId: "a1",
      status: "IN_PROGRESS",
      test: mockTestData,
      questions: [question],
    });
    expect(parsed).not.toHaveProperty("score");
    expect(parsed?.test).not.toHaveProperty("showResultsImmediately");
    expect(parsed?.questions[0]).not.toHaveProperty("correctAnswer");
  });

  it("rejects invalid payloads", () => {
    expect(parseAttemptDetails(null)).toBeNull();
    expect(parseAttemptDetails({ ...details, attemptId: 1 })).toBeNull();
    expect(parseAttemptDetails({ ...details, status: undefined })).toBeNull();
    expect(parseAttemptDetails({ ...details, test: null })).toBeNull();
    expect(
      parseAttemptDetails({ ...details, test: { ...mockTestData, exam: 1 } })
    ).toBeNull();
    expect(parseAttemptDetails({ ...details, questions: {} })).toBeNull();
  });
});

import type {
  AttemptDetails,
  AttemptDetailsQuestion,
  AttemptMockTestData,
  AttemptQuestion,
  AttemptSession,
  ResumeAttemptData,
  StartAttemptData,
  SubmitAttemptResult,
} from "@/types/attempt";

export function makeQuestion(
  id: string,
  overrides: Partial<AttemptQuestion> = {}
): AttemptQuestion {
  return {
    _id: id,
    questionText: {
      en: { text: `Question ${id}`, imageUrl: null },
      ml: { text: `പ്രശ്നം ${id}`, imageUrl: null },
    },
    options: [
      { id: `${id}-a`, type: "text", en: `A of ${id}`, ml: `എ ${id}`, imageUrl: null },
      { id: `${id}-b`, type: "text", en: `B of ${id}`, ml: `ബി ${id}`, imageUrl: null },
    ],
    subject: "PHY",
    selectedOption: null,
    ...overrides,
  };
}

export function makeMockTestData(
  overrides: Partial<AttemptMockTestData> = {}
): AttemptMockTestData {
  return {
    title: "Kinematics practice",
    durationInMinutes: 60,
    totalQuestions: 3,
    startedAt: "2026-01-01T00:00:00.000Z",
    marksPerQuestion: 4,
    negativeMarking: 1,
    passingScore: null,
    exam: {
      id: "exam1",
      name: "NEET",
      description: "NEET UG",
      hasMultiLingualSupport: true,
    },
    paperType: "TOPIC_WISE",
    subject: { id: "s1", name: "Physics" },
    ...overrides,
  };
}

export function makeSession(
  order: number,
  overrides: Partial<AttemptSession> = {}
): AttemptSession {
  return {
    subject: `SUB${order}`,
    name: `Section ${order + 1}`,
    order,
    durationInMinutes: 30,
    startIndex: order * 2,
    endIndex: order * 2 + 1,
    questionIds: [`q${order * 2 + 1}`, `q${order * 2 + 2}`],
    status: order === 0 ? "IN_PROGRESS" : "LOCKED",
    timeConsumed: 0,
    ...overrides,
  };
}

export function makeStartData(
  overrides: Partial<StartAttemptData> = {}
): StartAttemptData {
  return {
    attemptId: "att1",
    mockTestData: makeMockTestData(),
    questions: [makeQuestion("q1"), makeQuestion("q2"), makeQuestion("q3")],
    ...overrides,
  };
}

export function makeResumeData(
  overrides: Partial<ResumeAttemptData> = {}
): ResumeAttemptData {
  return {
    ...makeStartData(),
    timeElapsed: 100,
    timeRemaining: 3500,
    ...overrides,
  };
}

export function makeSubmitResult(
  overrides: Partial<SubmitAttemptResult> = {}
): SubmitAttemptResult {
  return {
    attemptId: "att1",
    score: 4,
    totalScore: 12,
    passingScore: null,
    passed: false,
    correctAnswers: 1,
    incorrectAnswers: 1,
    unansweredQuestions: 1,
    submittedAt: "2026-01-01T00:30:00.000Z",
    timeTaken: 900,
    questionResults: [],
    ...overrides,
  };
}

export function makeDetailsQuestion(
  id: string,
  overrides: Partial<AttemptDetailsQuestion> = {}
): AttemptDetailsQuestion {
  return { ...makeQuestion(id), ...overrides };
}

export function makeDetails(
  overrides: Partial<AttemptDetails> = {}
): AttemptDetails {
  return {
    attemptId: "att1",
    status: "SUBMITTED",
    test: makeMockTestData(),
    questions: [
      makeDetailsQuestion("q1", {
        selectedOption: "q1-a",
        correctAnswer: "q1-a",
        isCorrect: true,
        marksAwarded: 4,
        difficultyLevel: "easy",
        explanation: { en: "Because physics", ml: null, imageUrl: null },
      }),
      makeDetailsQuestion("q2", {
        selectedOption: "q2-b",
        correctAnswer: "q2-a",
        isCorrect: false,
        marksAwarded: -1,
      }),
      makeDetailsQuestion("q3", {
        correctAnswer: "q3-a",
        isCorrect: false,
        marksAwarded: 0,
      }),
    ],
    score: 3,
    totalScore: 12,
    submittedAt: "2026-01-01T00:30:00.000Z",
    correctAnswers: 1,
    incorrectAnswers: 1,
    unansweredQuestions: 1,
    isPassed: false,
    timeTaken: 900,
    ...overrides,
  };
}

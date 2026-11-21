import { isApiRecord } from "@/lib/api/parse-envelope";
import {
  optionalField,
  parseList,
  readBoolean,
  readNumber,
  readNumberOrNull,
  readString,
  readStringList,
  readStringOrNull,
} from "@/lib/api/parse-fields";
import type {
  AttemptDetails,
  AttemptDetailsQuestion,
  AttemptDetailsTest,
  AttemptDifficulty,
  AttemptExamRef,
  AttemptExplanation,
  AttemptMockTestData,
  AttemptPerformanceBand,
  AttemptQuestion,
  AttemptQuestionOption,
  AttemptQuestionText,
  AttemptQuestionTextEntry,
  AttemptSession,
  AttemptSubjectRef,
  AttemptTopicRef,
  CompleteSessionResult,
  PauseAttemptData,
  ResumeAttemptData,
  StartAttemptData,
  SubmitAttemptResult,
  SubmittedQuestionResult,
} from "@/types/attempt";
import type { PaperType } from "@/types/mock-test";

const PAPER_TYPES: readonly PaperType[] = ["TOPIC_WISE", "FULL_EXAM", "SPRINT"];
const DIFFICULTIES: readonly AttemptDifficulty[] = ["easy", "medium", "hard"];

function parsePaperType(value: unknown): PaperType | undefined {
  return PAPER_TYPES.find((type) => type === value);
}

function parseDifficulty(value: unknown): AttemptDifficulty | undefined {
  return DIFFICULTIES.find((level) => level === value);
}

function parseTextEntry(value: unknown): AttemptQuestionTextEntry {
  if (!isApiRecord(value)) return { text: "", imageUrl: null };
  return {
    text: readString(value.text) ?? "",
    imageUrl: readStringOrNull(value.imageUrl),
  };
}

function parseQuestionText(value: unknown): AttemptQuestionText {
  const record = isApiRecord(value) ? value : {};
  return { en: parseTextEntry(record.en), ml: parseTextEntry(record.ml) };
}

function parseOption(value: unknown): AttemptQuestionOption | null {
  if (!isApiRecord(value)) return null;
  if (typeof value.id !== "string") return null;
  return {
    id: value.id,
    type: value.type === "image" ? "image" : "text",
    en: readString(value.en) ?? "",
    ml: readString(value.ml) ?? "",
    imageUrl: readStringOrNull(value.imageUrl),
  };
}

function parseOptionType(value: unknown): "text" | "image" | undefined {
  if (value === "text" || value === "image") return value;
  return undefined;
}

/** Parse a question from start / resume / detail payloads. */
export function parseAttemptQuestion(value: unknown): AttemptQuestion | null {
  if (!isApiRecord(value)) return null;
  if (typeof value._id !== "string") return null;
  const selected = value.selectedOption;
  return {
    _id: value._id,
    questionText: parseQuestionText(value.questionText),
    options: parseList(value.options, parseOption) ?? [],
    subject: readString(value.subject) ?? "",
    ...optionalField("optionType", parseOptionType(value.optionType)),
    ...optionalField("topic", readString(value.topic)),
    ...optionalField("difficultyLevel", parseDifficulty(value.difficultyLevel)),
    ...optionalField("sessionOrder", readNumber(value.sessionOrder)),
    ...optionalField(
      "selectedOption",
      selected === null ? null : readString(selected)
    ),
  };
}

export function parseAttemptSession(value: unknown): AttemptSession | null {
  if (!isApiRecord(value)) return null;
  const order = readNumber(value.order);
  const durationInMinutes = readNumber(value.durationInMinutes);
  const startIndex = readNumber(value.startIndex);
  const endIndex = readNumber(value.endIndex);
  if (
    typeof value.subject !== "string" ||
    typeof value.status !== "string" ||
    order === undefined ||
    durationInMinutes === undefined ||
    startIndex === undefined ||
    endIndex === undefined
  ) {
    return null;
  }
  return {
    subject: value.subject,
    order,
    durationInMinutes,
    startIndex,
    endIndex,
    status: value.status,
    timeConsumed: readNumber(value.timeConsumed) ?? 0,
    ...optionalField("name", readString(value.name)),
    ...optionalField("questionIds", readStringList(value.questionIds)),
    ...optionalField("questionCount", readNumber(value.questionCount)),
    ...optionalField("startedAt", readString(value.startedAt)),
    ...optionalField("submittedAt", readString(value.submittedAt)),
  };
}

function parseSessions(value: unknown): AttemptSession[] | undefined {
  return parseList(value, parseAttemptSession) ?? undefined;
}

function parsePerformanceBand(value: unknown): AttemptPerformanceBand | null {
  if (!isApiRecord(value)) return null;
  const minPercent = readNumber(value.minPercent);
  if (typeof value.key !== "string" || minPercent === undefined) return null;
  return { key: value.key, minPercent };
}

function parseExamRef(value: unknown): AttemptExamRef | null {
  if (!isApiRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }
  const bands = parseList(value.performanceBands, parsePerformanceBand);
  return {
    id: value.id,
    name: value.name,
    description: readString(value.description) ?? "",
    ...optionalField(
      "hasMultiLingualSupport",
      readBoolean(value.hasMultiLingualSupport)
    ),
    ...optionalField("performanceBands", bands ?? undefined),
  };
}

function parseIdName(
  value: unknown
): AttemptSubjectRef | AttemptTopicRef | undefined {
  if (!isApiRecord(value)) return undefined;
  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return undefined;
  }
  return { id: value.id, name: value.name };
}

/** `mockTestData` on start/resume, `test` on attempt details. */
export function parseAttemptMockTestData(
  value: unknown
): AttemptMockTestData | null {
  if (!isApiRecord(value)) return null;
  const exam = parseExamRef(value.exam);
  const durationInMinutes = readNumber(value.durationInMinutes);
  const totalQuestions = readNumber(value.totalQuestions);
  if (
    !exam ||
    durationInMinutes === undefined ||
    totalQuestions === undefined
  ) {
    return null;
  }
  return {
    ...optionalField("mockTestId", readString(value.mockTestId)),
    title: readStringOrNull(value.title),
    durationInMinutes,
    totalQuestions,
    startedAt: readString(value.startedAt) ?? "",
    marksPerQuestion: readNumberOrNull(value.marksPerQuestion),
    negativeMarking: readNumberOrNull(value.negativeMarking),
    passingScore: readNumberOrNull(value.passingScore),
    exam,
    ...optionalField("paperType", parsePaperType(value.paperType)),
    ...optionalField("subject", parseIdName(value.subject)),
    ...optionalField("topic", parseIdName(value.topic)),
    ...optionalField("isSessionWise", readBoolean(value.isSessionWise)),
    ...optionalField("sessions", parseSessions(value.sessions)),
    ...optionalField(
      "currentSessionIndex",
      readNumber(value.currentSessionIndex)
    ),
  };
}

export function parseStartAttemptData(value: unknown): StartAttemptData | null {
  if (!isApiRecord(value)) return null;
  const mockTestData = parseAttemptMockTestData(value.mockTestData);
  const questions = parseList(value.questions, parseAttemptQuestion);
  if (typeof value.attemptId !== "string" || !mockTestData || !questions) {
    return null;
  }
  return { attemptId: value.attemptId, mockTestData, questions };
}

export function parseResumeAttemptData(
  value: unknown
): ResumeAttemptData | null {
  if (!isApiRecord(value)) return null;
  const start = parseStartAttemptData(value);
  if (!start) return null;
  const timeElapsed = readNumber(value.timeElapsed);
  const timeRemaining = readNumber(value.timeRemaining);
  if (timeElapsed === undefined || timeRemaining === undefined) return null;
  return {
    ...start,
    timeElapsed,
    timeRemaining,
    ...optionalField("pauseCount", readNumber(value.pauseCount)),
    ...optionalField("timeConsumed", readNumber(value.timeConsumed)),
    ...optionalField("sessions", parseSessions(value.sessions)),
    ...optionalField(
      "currentSessionIndex",
      readNumber(value.currentSessionIndex)
    ),
  };
}

export function parsePauseAttemptData(value: unknown): PauseAttemptData | null {
  if (!isApiRecord(value)) return null;
  const timeConsumed = readNumber(value.timeConsumed);
  const timeRemaining = readNumber(value.timeRemaining);
  const pauseCount = readNumber(value.pauseCount);
  if (
    typeof value.attemptId !== "string" ||
    typeof value.status !== "string" ||
    typeof value.pausedAt !== "string" ||
    timeConsumed === undefined ||
    timeRemaining === undefined ||
    pauseCount === undefined
  ) {
    return null;
  }
  return {
    attemptId: value.attemptId,
    testTitle: readStringOrNull(value.testTitle),
    status: value.status,
    timeConsumed,
    timeRemaining,
    pausedAt: value.pausedAt,
    pauseCount,
    ...optionalField("totalTimeConsumed", readNumber(value.totalTimeConsumed)),
  };
}

function parseExplanation(value: unknown): AttemptExplanation | undefined {
  if (!isApiRecord(value)) return undefined;
  return {
    en: readStringOrNull(value.en),
    ml: readStringOrNull(value.ml),
    imageUrl: readStringOrNull(value.imageUrl),
    ...optionalField("imageUrls", readStringList(value.imageUrls)),
  };
}

function parseQuestionResult(value: unknown): SubmittedQuestionResult | null {
  if (!isApiRecord(value)) return null;
  const marksAwarded = readNumber(value.marksAwarded);
  if (
    typeof value.questionId !== "string" ||
    typeof value.correctAnswer !== "string" ||
    typeof value.isCorrect !== "boolean" ||
    marksAwarded === undefined
  ) {
    return null;
  }
  return {
    questionId: value.questionId,
    selectedOption: readStringOrNull(value.selectedOption),
    correctAnswer: value.correctAnswer,
    isCorrect: value.isCorrect,
    marksAwarded,
    ...optionalField("explanation", parseExplanation(value.explanation)),
  };
}

export function parseSubmitAttemptResult(
  value: unknown
): SubmitAttemptResult | null {
  if (!isApiRecord(value)) return null;
  const score = readNumber(value.score);
  const totalScore = readNumber(value.totalScore);
  const correctAnswers = readNumber(value.correctAnswers);
  const incorrectAnswers = readNumber(value.incorrectAnswers);
  const unansweredQuestions = readNumber(value.unansweredQuestions);
  const timeTaken = readNumber(value.timeTaken);
  if (
    typeof value.attemptId !== "string" ||
    typeof value.passed !== "boolean" ||
    typeof value.submittedAt !== "string" ||
    score === undefined ||
    totalScore === undefined ||
    correctAnswers === undefined ||
    incorrectAnswers === undefined ||
    unansweredQuestions === undefined ||
    timeTaken === undefined
  ) {
    return null;
  }
  return {
    attemptId: value.attemptId,
    score,
    totalScore,
    passingScore: readNumberOrNull(value.passingScore),
    passed: value.passed,
    correctAnswers,
    incorrectAnswers,
    unansweredQuestions,
    submittedAt: value.submittedAt,
    timeTaken,
    questionResults: parseList(value.questionResults, parseQuestionResult) ?? [],
  };
}

export function parseCompleteSessionResult(
  value: unknown
): CompleteSessionResult | null {
  if (!isApiRecord(value)) return null;
  const sessions = parseList(value.sessions, parseAttemptSession);
  const currentSessionIndex = readNumber(value.currentSessionIndex);
  if (
    typeof value.paperCompleted !== "boolean" ||
    !sessions ||
    currentSessionIndex === undefined
  ) {
    return null;
  }
  const nextSession = parseResumeAttemptData(value.nextSession);
  const results = parseSubmitAttemptResult(value.results);
  return {
    paperCompleted: value.paperCompleted,
    sessions,
    currentSessionIndex,
    ...optionalField("nextSession", nextSession ?? undefined),
    ...optionalField("results", results ?? undefined),
  };
}

function parseDetailsQuestion(value: unknown): AttemptDetailsQuestion | null {
  if (!isApiRecord(value)) return null;
  const question = parseAttemptQuestion(value);
  if (!question) return null;
  return {
    ...question,
    ...optionalField("correctAnswer", readString(value.correctAnswer)),
    ...optionalField("isCorrect", readBoolean(value.isCorrect)),
    ...optionalField("marksAwarded", readNumber(value.marksAwarded)),
    ...optionalField("explanation", parseExplanation(value.explanation)),
  };
}

export function parseAttemptDetails(value: unknown): AttemptDetails | null {
  if (!isApiRecord(value)) return null;
  const testRecord = isApiRecord(value.test) ? value.test : null;
  const testData = parseAttemptMockTestData(testRecord);
  const questions = parseList(value.questions, parseDetailsQuestion);
  if (
    typeof value.attemptId !== "string" ||
    typeof value.status !== "string" ||
    !testRecord ||
    !testData ||
    !questions
  ) {
    return null;
  }
  const test: AttemptDetailsTest = {
    ...testData,
    ...optionalField(
      "showResultsImmediately",
      readBoolean(testRecord.showResultsImmediately)
    ),
  };
  return {
    attemptId: value.attemptId,
    status: value.status,
    test,
    questions,
    ...optionalField("score", readNumber(value.score)),
    ...optionalField("totalScore", readNumber(value.totalScore)),
    ...optionalField("submittedAt", readString(value.submittedAt)),
    ...optionalField("correctAnswers", readNumber(value.correctAnswers)),
    ...optionalField("incorrectAnswers", readNumber(value.incorrectAnswers)),
    ...optionalField(
      "unansweredQuestions",
      readNumber(value.unansweredQuestions)
    ),
    ...optionalField("isPassed", readBoolean(value.isPassed)),
    ...optionalField("timeElapsed", readNumber(value.timeElapsed)),
    ...optionalField("timeRemaining", readNumber(value.timeRemaining)),
    ...optionalField("timeTaken", readNumber(value.timeTaken)),
    ...optionalField("isSessionWise", readBoolean(value.isSessionWise)),
    ...optionalField("sessions", parseSessions(value.sessions)),
    ...optionalField(
      "currentSessionIndex",
      readNumber(value.currentSessionIndex)
    ),
  };
}

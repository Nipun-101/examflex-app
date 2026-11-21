import type { PaperType } from "@/types/mock-test";

export type AttemptLanguage = "en" | "ml";

export interface AttemptQuestionTextEntry {
  text: string;
  imageUrl: string | null;
}

export type AttemptQuestionText = Record<
  AttemptLanguage,
  AttemptQuestionTextEntry
>;

export interface AttemptQuestionOption {
  id: string;
  type: "text" | "image";
  en: string;
  ml: string;
  imageUrl: string | null;
}

export type AttemptDifficulty = "easy" | "medium" | "hard";

export interface AttemptQuestion {
  _id: string;
  questionText: AttemptQuestionText;
  optionType?: "text" | "image";
  options: AttemptQuestionOption[];
  /** Subject id. */
  subject: string;
  /** Display name of the subject, when the API resolved it. */
  subjectName?: string;
  topic?: string;
  difficultyLevel?: AttemptDifficulty;
  /** Session-wise papers: matches `sessions[].order`. Omitted otherwise. */
  sessionOrder?: number;
  selectedOption?: string | null;
}

/** Known values: LOCKED, IN_PROGRESS, PAUSED, SUBMITTED, EXPIRED. */
export type AttemptSessionStatus = string;

export interface AttemptSession {
  subject: string;
  name?: string;
  order: number;
  durationInMinutes: number;
  startIndex: number;
  endIndex: number;
  questionIds?: string[];
  questionCount?: number;
  status: AttemptSessionStatus;
  startedAt?: string;
  submittedAt?: string;
  /** Seconds used in this session. */
  timeConsumed: number;
}

export interface AttemptPerformanceBand {
  key: string;
  minPercent: number;
}

export interface AttemptExamRef {
  id: string;
  name: string;
  description: string;
  /** When false, hide the language toggle during attempt / results. */
  hasMultiLingualSupport?: boolean;
  performanceBands?: AttemptPerformanceBand[];
}

export interface AttemptSubjectRef {
  id: string;
  name: string;
}

export interface AttemptTopicRef {
  id: string;
  name: string;
}

export interface AttemptMockTestData {
  /** Paper this attempt belongs to; present on attempt details (results page). */
  mockTestId?: string;
  title: string | null;
  durationInMinutes: number;
  totalQuestions: number;
  startedAt: string;
  marksPerQuestion: number | null;
  negativeMarking: number | null;
  passingScore: number | null;
  exam: AttemptExamRef;
  /** TOPIC_WISE → Chapter Wise, FULL_EXAM → Full Mocks, SPRINT → Sprint Tests. */
  paperType?: PaperType;
  subject?: AttemptSubjectRef;
  topic?: AttemptTopicRef;
  isSessionWise?: boolean;
  sessions?: AttemptSession[];
  currentSessionIndex?: number;
}

export interface StartAttemptData {
  attemptId: string;
  mockTestData: AttemptMockTestData;
  questions: AttemptQuestion[];
}

export interface ResumeAttemptData extends StartAttemptData {
  /** Seconds elapsed on the paper timer (current session when session-wise). */
  timeElapsed: number;
  /** Seconds remaining on the paper timer (current session when session-wise). */
  timeRemaining: number;
  pauseCount?: number;
  timeConsumed?: number;
  sessions?: AttemptSession[];
  currentSessionIndex?: number;
}

export interface PauseAttemptData {
  attemptId: string;
  testTitle: string | null;
  /** Known values: PAUSED. */
  status: string;
  /** Running timer only — the current section on session-wise papers. */
  timeConsumed: number;
  /** Whole paper, summed across sections on session-wise papers. */
  totalTimeConsumed?: number;
  timeRemaining: number;
  pausedAt: string;
  pauseCount: number;
}

export interface AttemptAnswerInput {
  questionId: string;
  selectedOptionId: string;
}

export interface AttemptExplanation {
  en: string | null;
  ml: string | null;
  imageUrl: string | null;
  imageUrls?: string[];
}

export interface SubmittedQuestionResult {
  questionId: string;
  selectedOption: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  marksAwarded: number;
  explanation?: AttemptExplanation;
}

export interface SubmitAttemptResult {
  attemptId: string;
  score: number;
  totalScore: number;
  passingScore: number | null;
  passed: boolean;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  submittedAt: string;
  /** Seconds, excluding paused time. */
  timeTaken: number;
  /** Empty unless the paper shows results immediately. */
  questionResults: SubmittedQuestionResult[];
}

export interface CompleteSessionResult {
  paperCompleted: boolean;
  sessions: AttemptSession[];
  currentSessionIndex: number;
  /** Present when `paperCompleted` is false. */
  nextSession?: ResumeAttemptData;
  /** Present when `paperCompleted` is true. */
  results?: SubmitAttemptResult;
}

/**
 * Question inside `GET /mock-test-attempts/:id`. Key, correctness and marks are
 * only present once the attempt is scored (submitted / expired).
 */
export interface AttemptDetailsQuestion extends AttemptQuestion {
  correctAnswer?: string;
  isCorrect?: boolean;
  marksAwarded?: number;
  explanation?: AttemptExplanation;
}

export interface AttemptDetailsTest extends AttemptMockTestData {
  showResultsImmediately?: boolean;
}

export interface AttemptDetails {
  attemptId: string;
  /** Known values: SUBMITTED, EXPIRED, PAUSED, IN_PROGRESS. */
  status: string;
  test: AttemptDetailsTest;
  questions: AttemptDetailsQuestion[];
  score?: number;
  /** Max possible marks (sum of per-question marks). */
  totalScore?: number;
  submittedAt?: string;
  correctAnswers?: number;
  incorrectAnswers?: number;
  unansweredQuestions?: number;
  isPassed?: boolean;
  /** Present while in progress or paused. */
  timeElapsed?: number;
  timeRemaining?: number;
  /** Present once submitted or expired — whole paper, all sections. */
  timeTaken?: number;
  isSessionWise?: boolean;
  sessions?: AttemptSession[];
  currentSessionIndex?: number;
}

import { optionalField } from "@/lib/api/parse-fields";
import { filterSessionQuestions } from "@/lib/mocks/attempt-sessions";
import type {
  AttemptDetails,
  AttemptMockTestData,
  AttemptQuestion,
  SubmitAttemptResult,
  SubmittedQuestionResult,
} from "@/types/attempt";
import type { SectionBreakdown } from "@/types/attempt-runner";

export interface AdaptedResults {
  mockTestData: AttemptMockTestData;
  questions: AttemptQuestion[];
  result: SubmitAttemptResult;
  /** False when the paper hides the key (no correct answers on any question). */
  answerKeyAvailable: boolean;
}

export function wallClockSeconds(
  startedAt: string,
  submittedAt: string
): number {
  const startMs = new Date(startedAt).getTime();
  const submittedMs = new Date(submittedAt).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(submittedMs)) return 0;
  return Math.max(0, Math.floor((submittedMs - startMs) / 1000));
}

/** Turn `GET /mock-test-attempts/:id` into the shapes the results UI renders. */
export function adaptAttemptDetailsToResults(
  details: AttemptDetails
): AdaptedResults {
  const { test } = details;

  const mockTestData: AttemptMockTestData = {
    title: test.title,
    durationInMinutes: test.durationInMinutes,
    totalQuestions: test.totalQuestions,
    startedAt: test.startedAt,
    marksPerQuestion: test.marksPerQuestion,
    negativeMarking: test.negativeMarking,
    passingScore: test.passingScore,
    exam: test.exam,
    ...optionalField("paperType", test.paperType),
    ...optionalField("subject", test.subject),
    ...optionalField("topic", test.topic),
    ...optionalField("isSessionWise", details.isSessionWise ?? test.isSessionWise),
    ...optionalField("sessions", details.sessions ?? test.sessions),
    ...optionalField(
      "currentSessionIndex",
      details.currentSessionIndex ?? test.currentSessionIndex
    ),
  };

  const questions: AttemptQuestion[] = details.questions.map((q) => ({
    _id: q._id,
    questionText: q.questionText,
    ...optionalField("optionType", q.optionType),
    options: q.options,
    subject: q.subject,
    ...optionalField("topic", q.topic),
    ...optionalField("difficultyLevel", q.difficultyLevel),
    ...optionalField("sessionOrder", q.sessionOrder),
    selectedOption: q.selectedOption ?? null,
  }));

  const questionResults: SubmittedQuestionResult[] = [];
  for (const q of details.questions) {
    if (q.correctAnswer === undefined) continue;
    questionResults.push({
      questionId: q._id,
      selectedOption: q.selectedOption ?? null,
      correctAnswer: q.correctAnswer,
      isCorrect: q.isCorrect ?? false,
      marksAwarded: q.marksAwarded ?? 0,
      ...optionalField("explanation", q.explanation),
    });
  }

  const score =
    details.score ??
    questionResults.reduce((sum, item) => sum + item.marksAwarded, 0);
  const submittedAt = details.submittedAt ?? "";
  // Server time excludes pauses; wall clock is only a last resort.
  const timeTaken =
    details.timeTaken ?? wallClockSeconds(test.startedAt, submittedAt);
  const totalScore =
    details.totalScore && details.totalScore > 0
      ? details.totalScore
      : test.totalQuestions * (test.marksPerQuestion ?? 0);
  const passed =
    details.isPassed ??
    (test.passingScore !== null ? score >= test.passingScore : false);

  const result: SubmitAttemptResult = {
    attemptId: details.attemptId,
    score,
    totalScore,
    passingScore: test.passingScore,
    passed,
    correctAnswers: details.correctAnswers ?? 0,
    incorrectAnswers: details.incorrectAnswers ?? 0,
    unansweredQuestions: details.unansweredQuestions ?? 0,
    submittedAt,
    timeTaken,
    questionResults,
  };

  return {
    mockTestData,
    questions,
    result,
    answerKeyAvailable: questionResults.length > 0,
  };
}

/** Per-section tallies for session-wise papers; empty otherwise. */
export function buildSectionBreakdown(
  mockTestData: AttemptMockTestData,
  questions: readonly AttemptQuestion[],
  resultsByQuestion: ReadonlyMap<string, SubmittedQuestionResult>
): SectionBreakdown[] {
  const sessions = mockTestData.sessions;
  if (!sessions?.length) return [];

  return [...sessions]
    .sort((a, b) => a.order - b.order)
    .map((session, index) => {
      const sectionQuestions = filterSessionQuestions([...questions], session);
      let correct = 0;
      let wrong = 0;
      let skipped = 0;
      for (const question of sectionQuestions) {
        const qResult = resultsByQuestion.get(question._id);
        if (!qResult?.selectedOption) skipped += 1;
        else if (qResult.isCorrect) correct += 1;
        else wrong += 1;
      }
      return {
        order: session.order,
        name: session.name?.trim() || `Section ${index + 1}`,
        questionIds: sectionQuestions.map((question) => question._id),
        correct,
        wrong,
        skipped,
        timeConsumed: session.timeConsumed,
      };
    })
    .filter((section) => section.questionIds.length > 0);
}

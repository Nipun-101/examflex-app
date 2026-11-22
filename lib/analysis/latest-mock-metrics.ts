import type { AnalysisLatestFullMock } from "@/types/analysis";

export type LatestMockMetrics = {
  score: number;
  maxScore: number;
  correct: number;
  incorrect: number;
  skipped: number;
  attempted: number;
  totalQuestions: number;
  marksPerCorrect: number;
  negativeMarking: number;
  durationSeconds: number | null;
  timeTakenSeconds: number | null;
};

export type AccuracyView = {
  accuracy01: number;
  breakEven01: number | null;
};

export type MarksView = {
  /** Marks still on the table from skipped questions. */
  leftOnTable: number;
  /** Gross marks earned from correct answers. */
  earnedGross: number;
  /** Potential marks lost on wrong answers (before the penalty). */
  wrongPotential: number;
  /** Extra marks the penalty took away. */
  penalty: number;
  /** Marks gained by turning ten skips into right answers. */
  perTenSkips: number;
};

export type TimeView = {
  usedMinutes: number;
  durationMinutes: number;
  used01: number;
  avgSecondsPerAttempted: number | null;
  allottedSecondsPerQuestion: number;
};

export type NextGoalView =
  | { done: true }
  | {
      done: false;
      milestone: number;
      correctNeeded: number;
      score: number;
      milestone01: number;
      score01: number;
    };

/** Null when the API did not send the counts (older build / no attempt). */
export function latestMockMetrics(
  latest: AnalysisLatestFullMock | null
): LatestMockMetrics | null {
  if (
    !latest ||
    latest.correctCount === undefined ||
    latest.incorrectCount === undefined ||
    latest.skippedCount === undefined
  ) {
    return null;
  }
  const correct = latest.correctCount;
  const incorrect = latest.incorrectCount;
  const skipped = latest.skippedCount;
  const totalQuestions = correct + incorrect + skipped;
  if (totalQuestions <= 0) return null;

  const marksPerCorrect =
    latest.marksPerCorrect && latest.marksPerCorrect > 0
      ? latest.marksPerCorrect
      : latest.maxScore / totalQuestions;

  return {
    score: latest.score,
    maxScore: Math.max(1, latest.maxScore),
    correct,
    incorrect,
    skipped,
    attempted: correct + incorrect,
    totalQuestions,
    marksPerCorrect,
    negativeMarking: Math.max(0, latest.negativeMarking ?? 0),
    durationSeconds:
      latest.durationInMinutes && latest.durationInMinutes > 0
        ? latest.durationInMinutes * 60
        : null,
    timeTakenSeconds:
      latest.timeTakenSeconds !== undefined ? latest.timeTakenSeconds : null,
  };
}

export function accuracyView(m: LatestMockMetrics): AccuracyView | null {
  if (m.attempted <= 0) return null;
  const denom = m.marksPerCorrect + m.negativeMarking;
  return {
    accuracy01: m.correct / m.attempted,
    // Accuracy at which expected marks per attempt equal zero.
    breakEven01: m.negativeMarking > 0 && denom > 0 ? m.negativeMarking / denom : null,
  };
}

export function marksView(m: LatestMockMetrics): MarksView {
  return {
    leftOnTable: m.skipped * m.marksPerCorrect,
    earnedGross: m.correct * m.marksPerCorrect,
    wrongPotential: m.incorrect * m.marksPerCorrect,
    penalty: m.incorrect * m.negativeMarking,
    perTenSkips: 10 * m.marksPerCorrect,
  };
}

export function timeView(m: LatestMockMetrics): TimeView | null {
  if (m.timeTakenSeconds === null || m.durationSeconds === null) return null;
  return {
    usedMinutes: m.timeTakenSeconds / 60,
    durationMinutes: m.durationSeconds / 60,
    used01: Math.min(1, m.timeTakenSeconds / m.durationSeconds),
    avgSecondsPerAttempted:
      m.attempted > 0 ? m.timeTakenSeconds / m.attempted : null,
    allottedSecondsPerQuestion: m.durationSeconds / m.totalQuestions,
  };
}

export const GOAL_STEP = 100;

export function nextGoalView(m: LatestMockMetrics): NextGoalView {
  const next = (Math.floor(m.score / GOAL_STEP) + 1) * GOAL_STEP;
  const milestone = Math.min(next, m.maxScore);
  if (m.score >= m.maxScore || m.marksPerCorrect <= 0) return { done: true };
  return {
    done: false,
    milestone,
    correctNeeded: Math.ceil((milestone - m.score) / m.marksPerCorrect),
    score: m.score,
    milestone01: milestone / m.maxScore,
    score01: Math.min(1, Math.max(0, m.score / m.maxScore)),
  };
}

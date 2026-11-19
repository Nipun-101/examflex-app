import type { TodayMockAttempt } from "@/types/today";

export type ScoreBarDatum = TodayMockAttempt & {
  heightPercent: number;
  isLatest: boolean;
  isEmpty: boolean;
};

const MIN_VISUAL_PERCENT = 40;
const MAX_VISUAL_PERCENT = 100;

function clampScore(score: number, maxScore: number): number {
  const nonNegative = Math.max(score, 0);
  return maxScore > 0 ? Math.min(nonNegative, maxScore) : nonNegative;
}

/**
 * Maps mock attempts to bar heights with amplified relative scale.
 * Using exam max (720) alone makes 512–548 look flat; scale within the set.
 * Null scores become empty placeholder bars (height 0).
 */
export function buildScoreBars(
  attempts: readonly TodayMockAttempt[],
  maxScore: number
): ScoreBarDatum[] {
  if (attempts.length === 0) {
    return [];
  }

  const scored = attempts.filter(
    (attempt): attempt is TodayMockAttempt & { score: number } =>
      attempt.score !== null
  );

  if (scored.length === 0) {
    return attempts.map((attempt, index) => ({
      ...attempt,
      heightPercent: 0,
      isLatest: index === attempts.length - 1,
      isEmpty: true,
    }));
  }

  const scores = scored.map((attempt) => clampScore(attempt.score, maxScore));
  const minScore = Math.min(...scores);
  const maxAttemptScore = Math.max(...scores);
  const range = Math.max(maxAttemptScore - minScore, 1);
  const visualRange = MAX_VISUAL_PERCENT - MIN_VISUAL_PERCENT;

  return attempts.map((attempt, index) => {
    if (attempt.score === null) {
      return {
        ...attempt,
        heightPercent: 0,
        isLatest: index === attempts.length - 1,
        isEmpty: true,
      };
    }

    const clamped = clampScore(attempt.score, maxScore);
    const relative = (clamped - minScore) / range;
    const heightPercent = Math.round(
      MIN_VISUAL_PERCENT + relative * visualRange
    );

    return {
      ...attempt,
      heightPercent,
      isLatest: index === attempts.length - 1,
      isEmpty: false,
    };
  });
}

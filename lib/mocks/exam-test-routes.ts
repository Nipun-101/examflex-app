import type { PaperType } from "@/types/mock-test";

export interface ExamTestRouteOptions {
  /** Treat an unknown paper type as a full mock (default: chapter-wise). */
  treatMissingAsFullMock?: boolean;
}

/** Hub for one exam: `/mocks/exam/:examId`. */
export function examHubPath(examId: string): string {
  return `/mocks/exam/${encodeURIComponent(examId)}`;
}

/** Mistake Book review for one paper: `/mistake-book/:mockTestId`. */
export function mistakeBookPath(mockTestId: string): string {
  return `/mistake-book/${encodeURIComponent(mockTestId)}`;
}

/** Attempt runner / results: `/mocks/attempt/:attemptId`. */
export function attemptPath(attemptId: string): string {
  return `/mocks/attempt/${encodeURIComponent(attemptId)}`;
}

/** Submitted attempt results: `/mocks/attempt/:attemptId/result`. */
export function attemptResultPath(attemptId: string): string {
  return `${attemptPath(attemptId)}/result`;
}

function isFullMock(
  paperType: PaperType | string | null | undefined,
  options: ExamTestRouteOptions
): boolean {
  return (
    paperType === "FULL_EXAM" ||
    (!paperType && options.treatMissingAsFullMock === true)
  );
}

/**
 * Where a finished or paused attempt returns inside an exam.
 * TOPIC_WISE (and unknown types) → Chapter Wise, FULL_EXAM → Full Mocks,
 * SPRINT → Rapid Rounds.
 *
 * COSMETIC RENAME: "Sprint Tests" are shown to users as "Rapid Rounds", and the
 * web route segment is `rapid-rounds`. This is frontend-only — the backend paper
 * type is still `SPRINT` and its endpoint is still `/api/v1/sprint-tests`.
 */
export function examTestListPath(
  examId: string,
  paperType?: PaperType | string | null,
  options: ExamTestRouteOptions = {}
): string {
  const hub = examHubPath(examId);
  if (paperType === "SPRINT") return `${hub}/rapid-rounds`;
  if (isFullMock(paperType, options)) return `${hub}/full-mocks`;
  return `${hub}/chapter-wise`;
}

/** Label for the exit / back action matching {@link examTestListPath}. */
export function examTestExitLabel(
  paperType?: PaperType | string | null,
  options: ExamTestRouteOptions = {}
): string {
  if (paperType === "SPRINT") return "Exit to Rapid Rounds";
  if (isFullMock(paperType, options)) return "Exit to Full Mocks";
  return "Exit to Chapter Wise";
}

import type { EquationExamOption } from "@/types/equation-book";

export type ResolveExamInput = {
  /** Profile preferred exam id, when present. */
  preferredExamId?: string;
  /** Exams already filtered to active + showInApp (e.g. mocks hub catalog). */
  availableExams: readonly EquationExamOption[];
  /** Optional: further restrict to exams tagged on an equation. */
  allowedExamIds?: readonly string[];
};

export type ResolveExamResult =
  | { kind: "resolved"; exam: EquationExamOption }
  | { kind: "choose"; exams: EquationExamOption[] }
  | { kind: "none" };

/**
 * Prefer the student's target exam when it is listed for the app.
 * Otherwise auto-pick a single candidate, or ask when multiple remain.
 */
export function resolveEquationExam(
  input: ResolveExamInput
): ResolveExamResult {
  const allowed = new Set(input.allowedExamIds ?? []);
  const pool = input.availableExams.filter((exam) =>
    allowed.size === 0 ? true : allowed.has(exam.id)
  );

  if (pool.length === 0) {
    return { kind: "none" };
  }

  if (input.preferredExamId) {
    const preferred = pool.find((exam) => exam.id === input.preferredExamId);
    if (preferred) {
      return { kind: "resolved", exam: preferred };
    }
  }

  if (pool.length === 1) {
    return { kind: "resolved", exam: pool[0]! };
  }

  return { kind: "choose", exams: [...pool] };
}

export function chapterWiseMockHref(
  examId: string,
  subjectId: string,
  topicId: string
): string {
  const query = new URLSearchParams({
    subjectId,
    topicId,
  });
  return `/mocks/exam/${encodeURIComponent(examId)}/chapter-wise?${query.toString()}`;
}

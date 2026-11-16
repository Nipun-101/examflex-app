import type { AttemptQuestion } from "@/types/attempt";
import type {
  QuestionStatus,
  QuestionStatusSummary,
} from "@/types/attempt-runner";

/**
 * Palette status per visible question. Mark-for-review is client-only; the API
 * only knows answers.
 */
export function deriveQuestionStatuses(
  questions: readonly AttemptQuestion[],
  answers: ReadonlyMap<string, string>,
  marked: ReadonlySet<string>,
  visited: ReadonlySet<number>
): QuestionStatus[] {
  return questions.map((question, index) => {
    const isAnswered = answers.has(question._id);
    const isMarked = marked.has(question._id);
    if (isMarked && isAnswered) return "marked-answered";
    if (isMarked) return "marked";
    if (isAnswered) return "answered";
    if (visited.has(index)) return "not-answered";
    return "not-visited";
  });
}

export function countStatus(
  statuses: readonly QuestionStatus[],
  status: QuestionStatus
): number {
  return statuses.filter((value) => value === status).length;
}

export function summarizeStatuses(
  statuses: readonly QuestionStatus[]
): QuestionStatusSummary {
  return {
    total: statuses.length,
    answered: statuses.filter(
      (value) => value === "answered" || value === "marked-answered"
    ).length,
    notAnswered: countStatus(statuses, "not-answered"),
    marked: statuses.filter(
      (value) => value === "marked" || value === "marked-answered"
    ).length,
    notVisited: countStatus(statuses, "not-visited"),
  };
}

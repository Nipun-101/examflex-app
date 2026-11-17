import type { SubmittedQuestionResult } from "@/types/attempt";

export type ResultOutcome = "correct" | "wrong" | "skipped";

/** Map a scored question to the outcome chip used on results. */
export function resultOutcome(
  result: SubmittedQuestionResult | undefined
): ResultOutcome {
  if (!result?.selectedOption) return "skipped";
  return result.isCorrect ? "correct" : "wrong";
}

/** A, B, C… for option index (0-based). */
export function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

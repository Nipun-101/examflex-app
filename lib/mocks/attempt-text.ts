import { sanitizeAttemptRichText } from "@/lib/mocks/sanitize-attempt-text";
import type { AttemptLanguage, AttemptQuestion } from "@/types/attempt";

type OptionLike = AttemptQuestion["options"][number];

/** Question stem in the chosen language, falling back to whichever exists. */
export function questionStem(
  question: AttemptQuestion,
  language: AttemptLanguage
): string {
  return sanitizeAttemptRichText(
    question.questionText[language].text ||
      question.questionText.en.text ||
      question.questionText.ml.text
  );
}

export function questionImageUrl(
  question: AttemptQuestion,
  language: AttemptLanguage
): string | null {
  return (
    question.questionText[language].imageUrl ??
    question.questionText.en.imageUrl ??
    question.questionText.ml.imageUrl
  );
}

export function optionLabel(
  option: OptionLike,
  language: AttemptLanguage
): string {
  return sanitizeAttemptRichText(option[language] || option.en || option.ml);
}

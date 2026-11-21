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

/** An option shows its picture whenever the API sent a URL, whatever its `type`. */
export function optionHasImage(option: OptionLike): boolean {
  return Boolean(option.imageUrl);
}

/**
 * True when an option has nothing to show but a picture (or is flagged as an
 * image option): summaries refer to it by letter instead of printing text.
 */
export function isImageOnlyOption(
  option: OptionLike,
  language: AttemptLanguage
): boolean {
  return (
    (option.type === "image" || optionHasImage(option)) &&
    optionLabel(option, language).length === 0
  );
}

export function optionLabel(
  option: OptionLike,
  language: AttemptLanguage
): string {
  return sanitizeAttemptRichText(option[language] || option.en || option.ml);
}

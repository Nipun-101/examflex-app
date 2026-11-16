/** Max characters shown for the hub exam-card description before ellipsis. */
export const EXAM_CARD_DESCRIPTION_MAX = 110;

/** Clip long exam descriptions so hub cards keep a consistent height. */
export function clipExamDescription(
  text: string,
  max = EXAM_CARD_DESCRIPTION_MAX
): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trimEnd()}...`;
}

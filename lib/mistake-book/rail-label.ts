import { MISTAKE_BOOK_COPY, type MistakeItem } from "@/types/mistake-book";

/** Single-line rail row: Qn · subject · mock title. */
export function mistakeRailLabel(
  mistake: Pick<MistakeItem, "questionNumber" | "subjectLabel">,
  mockLabel: string
): string {
  const title = mockLabel.trim() || MISTAKE_BOOK_COPY.railGenericMockLabel;
  return `${mistake.questionNumber} · ${mistake.subjectLabel} · ${title}`;
}

import type {
  MistakeChapterOption,
  MistakeItem,
  MistakeSubjectFilterId,
} from "@/types/mistake-book";

export function chaptersForSubjectFilter(
  chapters: readonly MistakeChapterOption[],
  subjectId: MistakeSubjectFilterId
): MistakeChapterOption[] {
  if (subjectId === "all") {
    return [...chapters];
  }

  return chapters.filter((chapter) => chapter.subjectId === subjectId);
}

export function filterMistakes(
  mistakes: readonly MistakeItem[],
  subjectId: MistakeSubjectFilterId,
  chapterId: string
): MistakeItem[] {
  return mistakes.filter((mistake) => {
    const subjectMatch =
      subjectId === "all" ? true : mistake.subjectId === subjectId;
    const chapterMatch =
      chapterId === "all" ? true : mistake.chapterId === chapterId;
    return subjectMatch && chapterMatch;
  });
}

export function progressPercent(currentIndex: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  const position = Math.min(Math.max(currentIndex + 1, 0), total);
  return Math.round((position / total) * 100);
}

export function remainingSubtitle(mockLabel: string, remaining: number): string {
  const noun = remaining === 1 ? "mistake" : "mistakes";
  return `${mockLabel}  ·  ${remaining} ${noun} remaining`;
}

export function paperTypeLabel(paperType: string): string {
  switch (paperType) {
    case "FULL_EXAM":
      return "Full mock";
    case "SPRINT":
      return "Sprint";
    case "TOPIC_WISE":
      return "Chapter wise";
    default:
      return "Mock";
  }
}

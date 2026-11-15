import type {
  MistakeChapterOption,
  MistakeItem,
  MistakeSubjectId,
} from "@/types/mistake-book";

export function chaptersForSubjectFilter(
  chapters: readonly MistakeChapterOption[],
  subjectId: MistakeSubjectId
): MistakeChapterOption[] {
  if (subjectId === "all") {
    return [...chapters];
  }

  return chapters.filter((chapter) => chapter.subjectId === subjectId);
}

export function filterMistakes(
  mistakes: readonly MistakeItem[],
  subjectId: MistakeSubjectId,
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

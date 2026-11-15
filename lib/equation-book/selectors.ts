import type {
  EquationCard,
  EquationChapter,
  EquationSubjectId,
} from "@/types/equation-book";

export function chaptersForSubject(
  chapters: readonly EquationChapter[],
  subjectId: EquationSubjectId
): EquationChapter[] {
  return chapters.filter((chapter) => chapter.subjectId === subjectId);
}

export function cardsForChapter(
  cards: readonly EquationCard[],
  chapterId: string
): EquationCard[] {
  return cards.filter((card) => card.chapterId === chapterId);
}

export function progressPercent(currentIndex: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  const position = Math.min(Math.max(currentIndex + 1, 0), total);
  return Math.round((position / total) * 100);
}

export function mockCtaLabel(chapterLabel: string): string {
  return `Take ${chapterLabel} mock  →`;
}

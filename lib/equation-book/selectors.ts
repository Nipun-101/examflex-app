import type { ApiSubjectForExam } from "@/types/exam";
import type { EquationItem } from "@/types/equation-book";

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

export function subjectsFromCatalog(
  subjects: readonly ApiSubjectForExam[]
): { id: string; label: string }[] {
  return subjects.map((subject) => ({
    id: subject.id,
    label: subject.name,
  }));
}

export function chaptersFromSubject(
  subjects: readonly ApiSubjectForExam[],
  subjectId: string
): { id: string; label: string }[] {
  const subject = subjects.find((item) => item.id === subjectId);
  if (!subject) return [];
  return subject.topics.map((topic) => ({
    id: topic.id,
    label: topic.name,
  }));
}

/** Prefer URL/query ids when valid; otherwise first subject + first chapter. */
export function defaultSubjectAndChapter(
  subjects: readonly ApiSubjectForExam[],
  preferredSubjectId = "",
  preferredTopicId = ""
): { subjectId: string; topicId: string } {
  const subjectOptions = subjectsFromCatalog(subjects);
  const subjectId =
    preferredSubjectId &&
    subjectOptions.some((subject) => subject.id === preferredSubjectId)
      ? preferredSubjectId
      : (subjectOptions[0]?.id ?? "");
  const chapters = chaptersFromSubject(subjects, subjectId);
  const topicId =
    preferredTopicId &&
    chapters.some((chapter) => chapter.id === preferredTopicId)
      ? preferredTopicId
      : (chapters[0]?.id ?? "");
  return { subjectId, topicId };
}

export function findCardIndex(
  cards: readonly EquationItem[],
  equationId: string | undefined
): number {
  if (!equationId) return 0;
  const index = cards.findIndex((card) => card.id === equationId);
  return index >= 0 ? index : 0;
}

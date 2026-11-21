import { treatMissingAsFullMock } from "@/lib/mocks/attempt-meta";
import type { AttemptMockTestData, AttemptQuestion } from "@/types/attempt";

/** One subject's slice of the palette. `indices` point into the visible question list. */
export type PaletteGroup = {
  id: string;
  name: string;
  indices: number[];
};

/** Full mocks only. Sprint and topic-wise papers keep the flat palette. */
export function isFullMockAttempt(meta: AttemptMockTestData): boolean {
  return (
    meta.paperType === "FULL_EXAM" ||
    (!meta.paperType && treatMissingAsFullMock(meta))
  );
}

/**
 * Groups the palette by subject for full mocks, in order of first appearance.
 * Each question keeps its paper number, so a paper that interleaves subjects
 * still shows every question under its own subject.
 *
 * Returns null (flat palette) for other paper types, session-wise papers
 * (the palette already shows one section), single-subject papers, and
 * payloads that carry no subject information.
 */
export function buildPaletteGroups(
  meta: AttemptMockTestData,
  questions: readonly AttemptQuestion[],
): PaletteGroup[] | null {
  if (!isFullMockAttempt(meta) || meta.isSessionWise) return null;

  const groups = new Map<string, PaletteGroup>();
  questions.forEach((question, index) => {
    const id = question.subject;
    if (!id) return;
    const existing = groups.get(id);
    if (existing) {
      existing.indices.push(index);
      if (!existing.name && question.subjectName) {
        existing.name = question.subjectName;
      }
      return;
    }
    groups.set(id, {
      id,
      name: question.subjectName?.trim() ?? "",
      indices: [index],
    });
  });

  const grouped = [...groups.values()];
  const covered = grouped.reduce((sum, g) => sum + g.indices.length, 0);
  // Some question had no subject id: do not hide it, fall back to flat.
  if (grouped.length < 2 || covered !== questions.length) return null;

  return grouped.map((group, position) => ({
    ...group,
    name: group.name || `Section ${position + 1}`,
  }));
}

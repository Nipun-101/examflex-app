import {
  examTestExitLabel,
  examTestListPath,
} from "@/lib/mocks/exam-test-routes";
import type { AttemptMockTestData, AttemptSession } from "@/types/attempt";
import type { PaperType } from "@/types/mock-test";

/**
 * Older payloads omit `paperType`. A paper with neither subject nor topic is a
 * full mock, matching how the exam hub groups papers.
 */
export function treatMissingAsFullMock(meta: AttemptMockTestData): boolean {
  return !meta.subject && !meta.topic;
}

/** Where leaving the attempt (pause/exit/back to list) should land. */
export function attemptExitHref(meta: AttemptMockTestData): string {
  if (!meta.exam.id) return "/mocks";
  return examTestListPath(meta.exam.id, meta.paperType, {
    treatMissingAsFullMock: treatMissingAsFullMock(meta),
  });
}

export function attemptExitLabel(meta: AttemptMockTestData): string {
  return examTestExitLabel(meta.paperType, {
    treatMissingAsFullMock: treatMissingAsFullMock(meta),
  });
}

/** Human name of the paper list ("Chapter Wise", "Full Mocks", "Sprint Tests"). */
export function paperListLabel(
  paperType: PaperType | undefined,
  missingAsFullMock: boolean
): string {
  if (paperType === "SPRINT") return "Sprint Tests";
  if (paperType === "FULL_EXAM" || (!paperType && missingAsFullMock)) {
    return "Full Mocks";
  }
  return "Chapter Wise";
}

export function attemptTitle(meta: AttemptMockTestData): string {
  if (meta.title) return meta.title;
  const examName = meta.exam.name.trim();
  return meta.topic?.name ? `${examName} - ${meta.topic.name}` : examName;
}

/** Section name for session-wise papers, else subject, else exam name. */
export function attemptSectionLabel(
  meta: AttemptMockTestData,
  session: AttemptSession | null
): string {
  return session?.name || meta.subject?.name || meta.exam.name;
}

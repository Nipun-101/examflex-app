import type { AttemptMockTestData, ResumeAttemptData } from "@/types/attempt";

/**
 * Resume/next-section payloads may carry session state at the root instead of
 * inside `mockTestData`. Fold it in so the runner reads one place.
 */
export function mockTestDataFromResume(
  data: ResumeAttemptData
): AttemptMockTestData {
  const sessions = data.mockTestData.sessions ?? data.sessions;
  const currentSessionIndex =
    data.mockTestData.currentSessionIndex ?? data.currentSessionIndex;
  return {
    ...data.mockTestData,
    ...(sessions ? { sessions } : {}),
    ...(currentSessionIndex !== undefined ? { currentSessionIndex } : {}),
  };
}

/** Index of the section the payload says is current (0 for plain papers). */
export function resumeSessionIndex(data: ResumeAttemptData): number {
  return data.mockTestData.currentSessionIndex ?? data.currentSessionIndex ?? 0;
}

/** True when that section is still open (can be completed). */
export function resumeSessionIsOpen(data: ResumeAttemptData): boolean {
  const merged = mockTestDataFromResume(data);
  const status = merged.sessions?.[resumeSessionIndex(data)]?.status;
  return status === "IN_PROGRESS" || status === "PAUSED";
}

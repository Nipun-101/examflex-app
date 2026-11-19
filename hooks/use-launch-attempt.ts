"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudyLoadingOverlay } from "@/components/study/study-loading-provider";
import { resumeAttempt, startMockTestAttempt } from "@/lib/api/attempts";
import { STUDY_LOADING_HOLD } from "@/lib/study/loading-holds";
import { STUDY_ROUTE_LOADING_LABEL } from "@/lib/study/loading";
import type { ApiResult } from "@/lib/api/parse-envelope";
import { toLaunchError, type LaunchError } from "@/lib/mocks/launch-error";
import { attemptPath } from "@/lib/mocks/exam-test-routes";
import { cacheAttempt } from "@/lib/mocks/attempt-storage";
import {
  resolveLaunchIntent,
  type LaunchIntent,
} from "@/lib/mocks/paper-card-action";
import type { PaperAccessFields } from "@/types/access";
import type { ResumeAttemptData, StartAttemptData } from "@/types/attempt";

export type LaunchAttemptController = {
  /** Paper currently being started or resumed, or null when idle. */
  startingTestId: string | null;
  startError: LaunchError | null;
  start: (testId: string) => Promise<void>;
  resume: (testId: string, attemptId: string) => Promise<void>;
  /** Start or resume depending on the paper's attempt action. */
  launch: (paper: PaperAccessFields & { id: string }) => Promise<void>;
  clearError: () => void;
};

/**
 * Start or resume a paper, then open the attempt runner.
 * Only one launch runs at a time; further calls are ignored until it settles.
 * The lock always releases after success or failure so Soft Nav / back
 * navigation cannot leave paper CTAs stuck disabled.
 */
export function useLaunchAttempt(): LaunchAttemptController {
  const router = useRouter();
  const studyLoading = useStudyLoadingOverlay();
  const lockRef = useRef(false);
  const [startingTestId, setStartingTestId] = useState<string | null>(null);
  const [startError, setStartError] = useState<LaunchError | null>(null);

  const releaseLock = useCallback(() => {
    lockRef.current = false;
    setStartingTestId(null);
  }, []);

  const run = useCallback(
    async (
      testId: string,
      label: string,
      request: () => Promise<ApiResult<StartAttemptData | ResumeAttemptData>>
    ): Promise<void> => {
      if (lockRef.current) return;
      lockRef.current = true;
      setStartingTestId(testId);
      setStartError(null);

      try {
        studyLoading.hold(STUDY_LOADING_HOLD.manual, { label });
        const result = await request();
        if (!result.ok) {
          studyLoading.release(STUDY_LOADING_HOLD.manual);
          setStartError(toLaunchError(result, testId));
          return;
        }
        cacheAttempt(result.data);
        // Hand Soft Nav the same portal before releasing the launch hold.
        studyLoading.hold(STUDY_LOADING_HOLD.softNav, {
          label: STUDY_ROUTE_LOADING_LABEL,
        });
        studyLoading.release(STUDY_LOADING_HOLD.manual);
        router.push(attemptPath(result.data.attemptId));
      } catch (error) {
        studyLoading.release(STUDY_LOADING_HOLD.manual);
        studyLoading.release(STUDY_LOADING_HOLD.softNav);
        throw error;
      } finally {
        releaseLock();
      }
    },
    [releaseLock, router, studyLoading]
  );

  const start = useCallback(
    (testId: string) =>
      run(testId, "Starting your test...", () => startMockTestAttempt(testId)),
    [run]
  );

  const resume = useCallback(
    (testId: string, attemptId: string) =>
      run(testId, "Resuming your test...", () => resumeAttempt(attemptId)),
    [run]
  );

  const launch = useCallback(
    (paper: PaperAccessFields & { id: string }) => {
      const intent: LaunchIntent = resolveLaunchIntent(paper);
      return intent.type === "resume"
        ? resume(paper.id, intent.attemptId)
        : start(paper.id);
    },
    [resume, start]
  );

  const clearError = useCallback(() => setStartError(null), []);

  return { startingTestId, startError, start, resume, launch, clearError };
}

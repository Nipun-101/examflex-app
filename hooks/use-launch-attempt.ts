"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudyLoadingOverlay } from "@/components/study/study-loading-provider";
import {
  attemptDetailsToRunnerData,
  getAttempt,
  startMockTestAttempt,
} from "@/lib/api/attempts";
import { STUDY_LOADING_HOLD } from "@/lib/study/loading-holds";
import { STUDY_ROUTE_LOADING_LABEL } from "@/lib/study/loading";
import {
  finishedAttemptLaunchError,
  isStaleAttemptError,
  toLaunchError,
  type LaunchError,
} from "@/lib/mocks/launch-error";
import { attemptPath } from "@/lib/mocks/exam-test-routes";
import { cacheAttempt, markAutoResume } from "@/lib/mocks/attempt-storage";
import {
  isAttemptFinished,
  isAttemptPaused,
} from "@/lib/mocks/attempt-status";
import {
  resolveLaunchIntent,
  type LaunchIntent,
} from "@/lib/mocks/paper-card-action";
import type { PaperAccessFields } from "@/types/access";
import type { ResumeAttemptData } from "@/types/attempt";

export type LaunchAttemptOptions = {
  /**
   * The server says the list's view of this paper is out of date (the attempt
   * expired or was submitted, or a Start hit an attempt that is still running).
   * The list should reload so the card shows the real state.
   */
  onStaleAttempt?: (testId: string) => void;
};

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

type LaunchOutcome =
  | { ok: true; attemptId: string }
  | { ok: false; error: LaunchError };

/**
 * Start or resume a paper, then open the attempt runner.
 * Only one launch runs at a time; further calls are ignored until it settles.
 * The lock always releases after success or failure so Soft Nav / back
 * navigation cannot leave paper CTAs stuck disabled.
 *
 * Resume never unpauses from here: it checks the attempt with the read-only
 * GET (which also lets the server close an attempt whose time ran out) and
 * leaves unpausing to the attempt page once the runner is ready.
 */
export function useLaunchAttempt(
  options: LaunchAttemptOptions = {}
): LaunchAttemptController {
  const router = useRouter();
  const studyLoading = useStudyLoadingOverlay();
  const lockRef = useRef(false);
  const [startingTestId, setStartingTestId] = useState<string | null>(null);
  const [startError, setStartError] = useState<LaunchError | null>(null);
  const onStaleRef = useRef(options.onStaleAttempt);

  useEffect(() => {
    onStaleRef.current = options.onStaleAttempt;
  }, [options.onStaleAttempt]);

  const releaseLock = useCallback(() => {
    lockRef.current = false;
    setStartingTestId(null);
  }, []);

  const run = useCallback(
    async (
      testId: string,
      label: string,
      request: () => Promise<LaunchOutcome>
    ): Promise<void> => {
      if (lockRef.current) return;
      lockRef.current = true;
      setStartingTestId(testId);
      setStartError(null);

      try {
        studyLoading.hold(STUDY_LOADING_HOLD.manual, { label });
        const outcome = await request();
        if (!outcome.ok) {
          studyLoading.release(STUDY_LOADING_HOLD.manual);
          setStartError(outcome.error);
          if (isStaleAttemptError(outcome.error)) {
            onStaleRef.current?.(testId);
          }
          return;
        }
        // Hand Soft Nav the same portal before releasing the launch hold.
        studyLoading.hold(STUDY_LOADING_HOLD.softNav, {
          label: STUDY_ROUTE_LOADING_LABEL,
        });
        studyLoading.release(STUDY_LOADING_HOLD.manual);
        router.push(attemptPath(outcome.attemptId));
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
      run(testId, "Starting your test...", async () => {
        const result = await startMockTestAttempt(testId);
        if (!result.ok) {
          return { ok: false, error: toLaunchError(result, testId) };
        }
        cacheAttempt(result.data);
        return { ok: true, attemptId: result.data.attemptId };
      }),
    [run]
  );

  const resume = useCallback(
    (testId: string, attemptId: string) =>
      run(testId, "Resuming your test...", async () => {
        const result = await getAttempt(attemptId);
        if (!result.ok) {
          return { ok: false, error: toLaunchError(result, testId) };
        }
        const details = result.data;
        if (isAttemptFinished(details.status)) {
          return {
            ok: false,
            error: finishedAttemptLaunchError(details.status),
          };
        }
        if (isAttemptPaused(details.status)) {
          markAutoResume(attemptId);
        } else {
          // Running clock: keep the offline rescue copy (with the server
          // clock, as the old resume payload had) like a fresh start.
          cacheAttempt({
            ...attemptDetailsToRunnerData(details),
            timeElapsed: details.timeElapsed ?? 0,
            ...(details.timeRemaining !== undefined
              ? { timeRemaining: details.timeRemaining }
              : {}),
          } as ResumeAttemptData);
        }
        return { ok: true, attemptId: details.attemptId };
      }),
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

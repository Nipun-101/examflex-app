"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AttemptErrorState } from "@/components/attempt/attempt-error-state";
import { preloadMathpix } from "@/components/attempt/mathpix-boundary";
import { MockTestRunner } from "@/components/attempt/mock-test-runner";
import { StudyButton, StudyControlLink } from "@/components/study/study-button";
import { StudyLoadingOverlay } from "@/components/study/study-loading-overlay";
import { attemptDetailsToRunnerData, getAttempt } from "@/lib/api/attempts";
import { rememberAttemptLanguage } from "@/lib/mocks/attempt-language";
import { isAttemptFinished, isAttemptPaused } from "@/lib/mocks/attempt-status";
import {
  clearCachedAttempt,
  readCachedAttempt,
} from "@/lib/mocks/attempt-storage";
import { computeAttemptSecondsLeft } from "@/lib/mocks/attempt-sessions";
import { attemptResultPath } from "@/lib/mocks/exam-test-routes";
import type { StartAttemptData } from "@/types/attempt";

type AttemptPageClientProps = {
  attemptId: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "redirecting" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      data: StartAttemptData;
      initialSeconds: number;
      initialPaused: boolean;
    };

const LINK_CLASS =
  "inline-flex h-11 min-w-[11rem] items-center justify-center rounded-[10px] px-4 text-sm font-semibold";

/**
 * Loads the authoritative attempt, then hands it to the runner. The
 * sessionStorage cache only rescues a flaky network; the server clock always wins.
 */
export function AttemptPageClient({ attemptId }: AttemptPageClientProps) {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [loadCount, setLoadCount] = useState(0);

  useEffect(() => {
    preloadMathpix();
    let cancelled = false;

    void getAttempt(attemptId).then((result) => {
      if (cancelled) return;

      if (result.ok) {
        const details = result.data;
        if (isAttemptFinished(details.status)) {
          clearCachedAttempt(attemptId);
          setState({ status: "redirecting" });
          router.replace(attemptResultPath(attemptId));
          return;
        }
        const data = attemptDetailsToRunnerData(details);
        setState({
          status: "ready",
          data,
          initialSeconds:
            details.timeRemaining ?? computeAttemptSecondsLeft(data),
          initialPaused: isAttemptPaused(details.status),
        });
        return;
      }

      // Offline or flaky network (no HTTP status): fall back to the payload we
      // launched with so an in-flight test is not lost. HTTP errors never use it.
      const cached =
        result.status === undefined ? readCachedAttempt(attemptId) : null;
      if (cached) {
        setState({
          status: "ready",
          data: cached,
          initialSeconds: computeAttemptSecondsLeft(cached),
          initialPaused: false,
        });
        return;
      }

      setState({ status: "error", message: result.message });
    });

    return () => {
      cancelled = true;
    };
  }, [attemptId, loadCount, router]);

  if (state.status === "loading" || state.status === "redirecting") {
    return (
      <StudyLoadingOverlay
        open
        scope="viewport"
        label={
          state.status === "loading"
            ? "Loading your test..."
            : "Opening your results..."
        }
      />
    );
  }

  if (state.status === "error") {
    return (
      <AttemptErrorState
        title="Attempt unavailable"
        message={state.message}
        actions={
          <>
            <StudyButton
              variant="solid"
              className={LINK_CLASS}
              onClick={() => {
                setState({ status: "loading" });
                setLoadCount((value) => value + 1);
              }}
            >
              Try again
            </StudyButton>
            <StudyControlLink
              href="/mocks"
              variant="surface"
              className={LINK_CLASS}
            >
              Back to Mocks
            </StudyControlLink>
          </>
        }
      />
    );
  }

  return (
    <MockTestRunner
      key={state.data.attemptId}
      attemptId={state.data.attemptId}
      mockTestData={state.data.mockTestData}
      questions={state.data.questions}
      initialSecondsLeft={state.initialSeconds}
      initialPaused={state.initialPaused}
      onFinished={(language) => {
        rememberAttemptLanguage(attemptId, language);
        router.replace(attemptResultPath(attemptId));
      }}
    />
  );
}

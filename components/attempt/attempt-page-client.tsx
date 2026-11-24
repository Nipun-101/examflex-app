"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AttemptErrorState } from "@/components/attempt/attempt-error-state";
import { preloadMathpix } from "@/components/attempt/mathpix-boundary";
import { MockTestRunner } from "@/components/attempt/mock-test-runner";
import { StudyButton, StudyControlLink } from "@/components/study/study-button";
import { StudyRouteLoading } from "@/components/study/study-route-loading";
import {
  attemptDetailsToRunnerData,
  getAttempt,
  resumeAttempt,
} from "@/lib/api/attempts";
import { rememberAttemptLanguage } from "@/lib/mocks/attempt-language";
import { isAttemptFinished, isAttemptPaused } from "@/lib/mocks/attempt-status";
import {
  cacheAttempt,
  clearCachedAttempt,
  consumeAutoResume,
  readCachedAttempt,
} from "@/lib/mocks/attempt-storage";
import { computeAttemptSecondsLeft } from "@/lib/mocks/attempt-sessions";
import { attemptResultPath } from "@/lib/mocks/exam-test-routes";
import { mockTestDataFromResume } from "@/lib/mocks/resume-payload";
import type { StartAttemptData } from "@/types/attempt";

type AttemptPageClientProps = {
  attemptId: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "redirecting" }
  | { status: "error"; message: string; fetchKey: string }
  | {
      status: "ready";
      data: StartAttemptData;
      initialSeconds: number;
      initialPaused: boolean;
      fetchKey: string;
      /** Bumps whenever Soft Nav re-activates this route so the runner remounts. */
      visitId: number;
    };

const LINK_CLASS =
  "inline-flex h-11 min-w-[11rem] items-center justify-center rounded-[10px] px-4 text-sm font-semibold";

function isAttemptRouteActive(pathname: string, attemptId: string): boolean {
  const base = `/mocks/attempt/${attemptId}`;
  return pathname === base || pathname.startsWith(`${base}/`);
}

/**
 * Loads the authoritative attempt, then hands it to the runner. The
 * sessionStorage cache only rescues a flaky network; the server clock always wins.
 *
 * Soft Nav can keep this page mounted after exit. We render nothing while the
 * route is inactive (so fixed pause modals cannot cover the list), and reload
 * from the server whenever the route becomes active again.
 */
export function AttemptPageClient({ attemptId }: AttemptPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = isAttemptRouteActive(pathname, attemptId);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [loadCount, setLoadCount] = useState(0);
  const [routeEpoch, setRouteEpoch] = useState(0);
  const [wasActive, setWasActive] = useState(isActive);

  // Soft Nav re-entry: bump epoch during render so the current result is stale
  // without a synchronous setState inside an effect.
  if (wasActive !== isActive) {
    setWasActive(isActive);
    if (isActive) {
      setRouteEpoch((epoch) => epoch + 1);
    }
  }

  const fetchKey = `${attemptId}:${loadCount}:${routeEpoch}`;

  useEffect(() => {
    if (!isActive) return;

    preloadMathpix();
    let cancelled = false;
    const key = fetchKey;

    void getAttempt(attemptId).then((result) => {
      if (cancelled) return;
      // One-shot hand-off from the list's Resume. Consumed on every settled
      // load (even a failed one) so it can never unpause a later visit.
      const autoResume = consumeAutoResume(attemptId);

      if (result.ok) {
        const details = result.data;
        if (isAttemptFinished(details.status)) {
          clearCachedAttempt(attemptId);
          setState({ status: "redirecting" });
          router.replace(attemptResultPath(attemptId));
          return;
        }
        const data = attemptDetailsToRunnerData(details);
        const paused = isAttemptPaused(details.status);
        const showDetails = () =>
          setState({
            status: "ready",
            data,
            initialSeconds:
              details.timeRemaining ?? computeAttemptSecondsLeft(data),
            initialPaused: paused,
            fetchKey: key,
            visitId: Date.now(),
          });

        // Resume pressed on the paper list: unpause only now that the runner
        // is about to render. A later reload lands on the pause overlay.
        if (!autoResume || !paused) {
          showDetails();
          return;
        }
        void resumeAttempt(attemptId).then((resumed) => {
          if (cancelled) return;
          if (!resumed.ok) {
            // Still paused on the server: the overlay's Resume Test retries.
            showDetails();
            return;
          }
          cacheAttempt(resumed.data);
          setState({
            status: "ready",
            data: {
              attemptId: resumed.data.attemptId,
              mockTestData: mockTestDataFromResume(resumed.data),
              questions: resumed.data.questions,
            },
            initialSeconds: resumed.data.timeRemaining,
            initialPaused: false,
            fetchKey: key,
            visitId: Date.now(),
          });
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
          fetchKey: key,
          visitId: Date.now(),
        });
        return;
      }

      setState({ status: "error", message: result.message, fetchKey: key });
    });

    return () => {
      cancelled = true;
    };
  }, [isActive, attemptId, fetchKey, router]);

  // Soft Nav: keep this tree mounted but inert so fixed overlays cannot leak.
  if (!isActive) return null;

  const isStale =
    state.status === "loading" ||
    (state.status !== "redirecting" && state.fetchKey !== fetchKey);

  if (isStale || state.status === "redirecting") {
    return <StudyRouteLoading busy />;
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
              onClick={() => setLoadCount((value) => value + 1)}
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
      key={`${state.data.attemptId}-${state.visitId}`}
      attemptId={state.data.attemptId}
      mockTestData={state.data.mockTestData}
      questions={state.data.questions}
      initialSecondsLeft={state.initialSeconds}
      initialPaused={state.initialPaused}
      onFinished={(language) => {
        rememberAttemptLanguage(attemptId, language);
        setState({ status: "redirecting" });
        router.replace(attemptResultPath(attemptId));
      }}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import { PlayCircle, RefreshCw } from "lucide-react";
import { AttemptErrorState } from "@/components/attempt/attempt-error-state";
import { MockTestResults } from "@/components/attempt/mock-test-results";
import { StudyButton, StudyControlLink } from "@/components/study/study-button";
import { StudyRouteLoading } from "@/components/study/study-route-loading";
import { getAttempt } from "@/lib/api/attempts";
import { adaptAttemptDetailsToResults } from "@/lib/mocks/adapt-results";
import { readAttemptLanguage } from "@/lib/mocks/attempt-language";
import { isAttemptFinished } from "@/lib/mocks/attempt-status";
import { attemptPath } from "@/lib/mocks/exam-test-routes";
import type { AttemptDetails } from "@/types/attempt";

type AttemptResultClientProps = {
  attemptId: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; details: AttemptDetails };

const LINK_CLASS =
  "inline-flex h-11 min-w-[11rem] items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold";

export function AttemptResultClient({ attemptId }: AttemptResultClientProps) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void getAttempt(attemptId).then((result) => {
      if (cancelled) return;
      setState(
        result.ok
          ? { status: "ready", details: result.data }
          : { status: "error", message: result.message }
      );
    });
    return () => {
      cancelled = true;
    };
  }, [attemptId, attempt]);

  if (state.status === "loading") {
    return <StudyRouteLoading busy />;
  }

  if (state.status === "error") {
    return (
      <AttemptErrorState
        title="Result unavailable"
        message={state.message}
        actions={
          <>
            <StudyButton
              variant="solid"
              className={LINK_CLASS}
              onClick={() => {
                setState({ status: "loading" });
                setAttempt((value) => value + 1);
              }}
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Retry
            </StudyButton>
            <StudyControlLink href="/mocks" variant="surface" className={LINK_CLASS}>
              Back to Mocks
            </StudyControlLink>
          </>
        }
      />
    );
  }

  const { details } = state;

  if (!isAttemptFinished(details.status)) {
    return (
      <AttemptErrorState
        title="Attempt still in progress"
        message="This attempt hasn't been submitted yet. Resume the test to continue or submit it before viewing results."
        icon={<PlayCircle className="h-6 w-6" aria-hidden />}
        actions={
          <>
            <StudyControlLink
              href={attemptPath(attemptId)}
              variant="solid"
              className={LINK_CLASS}
            >
              Resume Attempt
            </StudyControlLink>
            <StudyControlLink href="/mocks" variant="surface" className={LINK_CLASS}>
              Back to Mocks
            </StudyControlLink>
          </>
        }
      />
    );
  }

  const adapted = adaptAttemptDetailsToResults(details);

  return (
    <MockTestResults
      result={adapted.result}
      mockTestData={adapted.mockTestData}
      questions={adapted.questions}
      answerKeyAvailable={adapted.answerKeyAvailable}
      initialLanguage={readAttemptLanguage(attemptId)}
    />
  );
}

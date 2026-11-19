"use client";

import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { ExamHubShell } from "@/components/mocks/exam-hub-shell";
import { StudyControlLink } from "@/components/study/study-button";
import { StudyRouteLoading } from "@/components/study/study-route-loading";
import { isMongoObjectId, normalizeRouteParam } from "@/lib/api/mongo-id";

type ExamHubLayoutClientProps = {
  children: ReactNode;
};

/** Client leaf that reads `params` — kept under `<Suspense>` in the server layout. */
export function ExamHubLayoutClient({ children }: ExamHubLayoutClientProps) {
  const params = useParams();
  const id = normalizeRouteParam(
    params.id as string | string[] | undefined
  );

  // Instant Soft Nav can briefly omit the param — wait instead of calling the API.
  // Keep `{children}` mounted so Instant Soft Nav can validate tab page segments.
  if (!id) {
    return (
      <>
        <StudyRouteLoading busy />
        <div className="hidden" aria-hidden>
          {children}
        </div>
      </>
    );
  }

  if (!isMongoObjectId(id)) {
    return (
      <>
        <div
          role="alert"
          className="rounded-[14px] border border-study-divider bg-white px-4 py-8 text-center"
        >
          <p className="text-sm text-study-ink">
            This exam link is invalid or incomplete.
          </p>
          <StudyControlLink
            href="/mocks"
            className="mt-4 inline-flex h-11 min-w-[11rem] items-center justify-center rounded-[10px] bg-study-green px-4 text-sm font-semibold text-white"
          >
            Back to Mocks
          </StudyControlLink>
        </div>
        <div className="hidden" aria-hidden>
          {children}
        </div>
      </>
    );
  }

  return <ExamHubShell examId={id}>{children}</ExamHubShell>;
}

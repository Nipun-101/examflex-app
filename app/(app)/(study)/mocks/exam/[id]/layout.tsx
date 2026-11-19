import { Suspense, type ReactNode } from "react";
import { ExamHubLayoutClient } from "@/app/(app)/(study)/mocks/exam/[id]/exam-hub-layout-client";
import { StudyRouteLoadingFallback } from "@/components/study/study-route-loading";

type ExamLayoutProps = {
  children: ReactNode;
};

/**
 * Server layout: URL `params` stay out of the instant App Shell via Suspense.
 * Tab pages must not `await params` either — they read the exam id from context.
 */
export default function ExamLayout({ children }: ExamLayoutProps) {
  return (
    <Suspense fallback={<StudyRouteLoadingFallback />}>
      <ExamHubLayoutClient>{children}</ExamHubLayoutClient>
    </Suspense>
  );
}

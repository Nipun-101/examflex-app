import type { Metadata } from "next";
import { Suspense } from "react";
import { AttemptPageClient } from "@/components/attempt/attempt-page-client";
import { StudyRouteLoadingFallback } from "@/components/study/study-route-loading";

export const metadata: Metadata = {
  title: "Mock test",
};

type AttemptPageProps = PageProps<"/mocks/attempt/[attemptId]">;

/** Reads the URL param inside Suspense so the shell stays instant. */
async function AttemptContent({ params }: Pick<AttemptPageProps, "params">) {
  const { attemptId } = await params;
  return <AttemptPageClient attemptId={attemptId} />;
}

export default function AttemptPage({ params }: AttemptPageProps) {
  return (
    <Suspense fallback={<StudyRouteLoadingFallback />}>
      <AttemptContent params={params} />
    </Suspense>
  );
}

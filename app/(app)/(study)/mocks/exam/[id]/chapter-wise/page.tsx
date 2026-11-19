import type { Metadata } from "next";
import { Suspense } from "react";
import { ChapterWiseList } from "@/components/mocks/chapter-wise-list";
import { StudyRouteLoadingFallback } from "@/components/study/study-route-loading";

export const metadata: Metadata = {
  title: "Chapter Wise",
};

/** Sync server page — id comes from ExamPageProvider in the client layout. */
export default function ChapterWisePage() {
  return (
    <Suspense fallback={<StudyRouteLoadingFallback />}>
      <ChapterWiseList />
    </Suspense>
  );
}

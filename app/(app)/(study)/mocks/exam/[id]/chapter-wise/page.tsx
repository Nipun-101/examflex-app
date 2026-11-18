import type { Metadata } from "next";
import { Suspense } from "react";
import { ChapterWiseList } from "@/components/mocks/chapter-wise-list";
import { StudyLoadingOverlay } from "@/components/study/study-loading-overlay";

export const metadata: Metadata = {
  title: "Chapter Wise",
};

/** Sync server page — id comes from ExamPageProvider in the client layout. */
export default function ChapterWisePage() {
  return (
    <Suspense
      fallback={
        <StudyLoadingOverlay open scope="parent" label="Loading papers..." />
      }
    >
      <ChapterWiseList />
    </Suspense>
  );
}

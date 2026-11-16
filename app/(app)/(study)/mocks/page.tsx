import type { Metadata } from "next";
import { Suspense } from "react";
import { MocksHome } from "@/components/mocks/mocks-home";
import { StudyLoadingOverlay } from "@/components/study/study-loading-overlay";

export const metadata: Metadata = {
  title: "Mocks",
};

export default function MocksPage() {
  return (
    <Suspense
      fallback={
        <StudyLoadingOverlay
          open
          scope="viewport"
          label="Loading mock exams..."
        />
      }
    >
      <MocksHome />
    </Suspense>
  );
}

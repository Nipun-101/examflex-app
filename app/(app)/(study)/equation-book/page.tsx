import type { Metadata } from "next";
import { Suspense } from "react";
import { EquationBookClient } from "@/components/equation-book/equation-book-client";
import { StudyLoadingOverlay } from "@/components/study/study-loading-overlay";

export const metadata: Metadata = {
  title: "Equation Book",
  description:
    "Recall key ExamFlex equations one card at a time — flip to reveal, then lock it in.",
};

export default function EquationBookPage() {
  return (
    <Suspense
      fallback={
        <StudyLoadingOverlay
          open
          scope="viewport"
          label="Loading Equation Book..."
        />
      }
    >
      <EquationBookClient />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { AnalysisPageClient } from "@/components/analysis/analysis-page-client";

export const metadata: Metadata = {
  title: "Analysis",
  description:
    "Full-mock outlook, course pathways, and chapter-wise subject insights for your target exam.",
};

export default function AnalysisPage() {
  return <AnalysisPageClient />;
}

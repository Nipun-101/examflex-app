import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/study/placeholder-page";

export const metadata: Metadata = {
  title: "Analysis",
};

export default function AnalysisPage() {
  return (
    <PlaceholderPage
      title="Analysis"
      description="Subject trends, attempt history, and fix-next insights will live here. Static placeholder until the analysis API is connected."
    />
  );
}

import type { Metadata } from "next";
import { AnalysisView } from "@/components/analysis/analysis-view";
import { ANALYSIS_PAGE_DATA } from "@/lib/analysis/static-data";

export const metadata: Metadata = {
  title: "Analysis",
  description:
    "Illustrative marks-only outlook for your latest mock — static Analysis until the API is connected.",
};

export default function AnalysisPage() {
  return <AnalysisView data={ANALYSIS_PAGE_DATA} />;
}

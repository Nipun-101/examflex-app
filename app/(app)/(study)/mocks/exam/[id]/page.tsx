import type { Metadata } from "next";
import { ExamOverview } from "@/components/mocks/exam-overview";

export const metadata: Metadata = {
  title: "Exam overview",
};

export default function ExamOverviewPage() {
  return <ExamOverview />;
}

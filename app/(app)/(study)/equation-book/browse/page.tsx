import type { Metadata } from "next";
import { EquationBrowseView } from "@/components/equation-book/equation-browse-view";

export const metadata: Metadata = {
  title: "Browse Equations",
  description: "Search ExamFlex equations by title across chapters.",
};

export default function EquationBookBrowsePage() {
  return <EquationBrowseView />;
}

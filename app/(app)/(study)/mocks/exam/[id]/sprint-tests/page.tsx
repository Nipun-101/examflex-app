import type { Metadata } from "next";
import { SprintTestsList } from "@/components/mocks/sprint-tests-list";

export const metadata: Metadata = {
  title: "Sprint Tests",
};

/** Sync server page — id comes from ExamPageProvider in the client layout. */
export default function SprintTestsPage() {
  return <SprintTestsList />;
}

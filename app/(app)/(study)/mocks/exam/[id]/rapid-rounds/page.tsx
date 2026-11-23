import type { Metadata } from "next";
import { SprintTestsList } from "@/components/mocks/sprint-tests-list";

export const metadata: Metadata = {
  title: "Rapid Rounds",
};

/**
 * "Rapid Rounds" is the user-facing name for backend SPRINT papers (cosmetic
 * rename only — see lib/mocks/exam-test-routes.ts). Route folder is
 * `rapid-rounds`; the old `/sprint-tests` URL no longer exists (no redirect).
 * Sync server page — id comes from ExamPageProvider in the client layout. */
export default function SprintTestsPage() {
  return <SprintTestsList />;
}

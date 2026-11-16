import type { ReactNode } from "react";
import { StudyShell } from "@/components/study/study-shell";
import { requireSession } from "@/lib/auth/session";

type AuthenticatedStudyAreaProps = {
  children: ReactNode;
};

/**
 * @deprecated Prefer `AuthenticatedAppArea` + `(study)/layout` StudyShell.
 * Kept for tests and legacy composition that needs auth + study chrome together.
 */
export async function AuthenticatedStudyArea({
  children,
}: AuthenticatedStudyAreaProps) {
  await requireSession();
  return <StudyShell>{children}</StudyShell>;
}

import type { ReactNode } from "react";
import { StudyShell } from "@/components/study/study-shell";
import { requireSession } from "@/lib/auth/session";

type AuthenticatedStudyAreaProps = {
  children: ReactNode;
};

/**
 * Request-time auth gate for the study shell.
 * Must render inside `<Suspense>` (Cache Components + cookies()).
 */
export async function AuthenticatedStudyArea({
  children,
}: AuthenticatedStudyAreaProps) {
  await requireSession();
  return <StudyShell>{children}</StudyShell>;
}

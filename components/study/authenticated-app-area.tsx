import type { ReactNode } from "react";
import { requireSession } from "@/lib/auth/session";

type AuthenticatedAppAreaProps = {
  children: ReactNode;
};

/**
 * Request-time auth gate for all signed-in app routes (study + attempt).
 * Must render inside `<Suspense>` (Cache Components + cookies()).
 * Shell chrome is provided by nested `(study)` / `(attempt)` layouts.
 */
export async function AuthenticatedAppArea({
  children,
}: AuthenticatedAppAreaProps) {
  await requireSession();
  return children;
}

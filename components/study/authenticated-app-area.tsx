import type { ReactNode } from "react";
import { ProfileGate } from "@/components/onboarding/profile-gate";
import { hasProfileCompleteHint, requireSession } from "@/lib/auth/session";

type AuthenticatedAppAreaProps = {
  children: ReactNode;
};

/**
 * Request-time auth gate for all signed-in app routes (study + attempt).
 * Must render inside `<Suspense>` (Cache Components + cookies()).
 * Shell chrome is provided by nested `(study)` / `(attempt)` layouts.
 *
 * ProfileGate then holds everything back until the learner has a verified
 * mobile number, a name and a target exam. A learner this browser has already
 * seen finish onboarding gets the real app rendered on the server straight
 * away (the hint cookie); anyone else waits for the API's answer.
 */
export async function AuthenticatedAppArea({
  children,
}: AuthenticatedAppAreaProps) {
  await requireSession();
  const initiallyComplete = await hasProfileCompleteHint();
  return <ProfileGate initiallyComplete={initiallyComplete}>{children}</ProfileGate>;
}

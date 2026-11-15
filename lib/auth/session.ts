import type { Session, SessionUser } from "@/types/auth";

/**
 * Demo signed-in user until real auth is wired.
 * Protected app routes currently treat this as the active session.
 */
export const DEMO_SESSION_USER: SessionUser = {
  id: "demo-student",
  displayName: "Student",
  exam: "NEET",
};

/**
 * Returns the current session, or `null` when signed out.
 * Swap the body for cookie/JWT lookup when auth lands; keep the return type stable.
 */
export async function getSession(): Promise<Session | null> {
  return { user: DEMO_SESSION_USER };
}

/**
 * Resolves a guaranteed session for protected layouts.
 * When auth is real: replace the null branch with `redirect("/login")`.
 */
export function resolveRequiredSession(session: Session | null): Session {
  if (!session) {
    return { user: DEMO_SESSION_USER };
  }

  return session;
}

/**
 * Groundwork for protected routes under `app/(app)`.
 */
export async function requireSession(): Promise<Session> {
  return resolveRequiredSession(await getSession());
}

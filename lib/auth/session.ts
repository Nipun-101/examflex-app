import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AUTH_SESSION_COOKIE,
  PROFILE_COMPLETE_COOKIE,
} from "@/lib/auth/cookie-names";
import type { Session, SessionUser } from "@/types/auth";

/** Minimal placeholder user when only the Edge marker cookie is present. */
export const MARKER_SESSION_USER: SessionUser = {
  id: "session",
  displayName: "Student",
  exam: "NEET",
};

function hasAuthMarker(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): boolean {
  return Boolean(cookieStore.get(AUTH_SESSION_COOKIE)?.value);
}

/**
 * Returns the current session, or `null` when signed out.
 * Presence is driven by the authSession marker (access JWT lives in client memory).
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  if (!hasAuthMarker(cookieStore)) {
    return null;
  }
  return { user: MARKER_SESSION_USER };
}

/**
 * Resolves a guaranteed session for protected layouts.
 * Redirects to /login when unauthenticated.
 */
export function resolveRequiredSession(session: Session | null): Session {
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Auth gate for protected routes under `app/(app)`.
 */
export async function requireSession(): Promise<Session> {
  return resolveRequiredSession(await getSession());
}

/**
 * True when this browser previously saw a completed profile. Lets the server
 * render the app shell right away; the client still re-checks with the API and
 * the API enforces the rule regardless.
 */
export async function hasProfileCompleteHint(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(PROFILE_COMPLETE_COOKIE)?.value);
}

/** Shared cookie names for auth (Edge-safe: no client APIs). */

/** Non-JWT presence marker for Edge middleware. */
export const AUTH_SESSION_COOKIE = "authSession";

/**
 * Non-secret hint that this browser's learner already finished onboarding, so
 * the server can render the real app shell instead of a loading fallback. It is
 * only a rendering hint: the API enforces the rule on every request.
 */
export const PROFILE_COMPLETE_COOKIE = "profileComplete";

export const LOGOUT_RESUME_PATH_COOKIE = "logoutResumePath";

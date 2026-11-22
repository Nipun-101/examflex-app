/**
 * Student web sessions: access JWT in memory; refresh via HttpOnly examflex_rt.
 */

import { logoutSession, refreshSession } from "@/lib/api/auth";
import {
  AUTH_SESSION_COOKIE,
  LOGOUT_RESUME_PATH_COOKIE,
} from "@/lib/auth/cookie-names";
import { getWindow } from "@/lib/auth/runtime-env";
import { isSafeRedirectPath } from "@/lib/auth/safe-redirect";

/**
 * Web idle window (mirrors the API's WEB_SESSION_IDLE_TTL_SEC). The marker is
 * rewritten on every refresh, so it slides with the session. It must follow
 * the session length, not the 15m access JWT.
 */
const SESSION_DAYS = 30;
const SESSION_MARKER_TTL_SEC = SESSION_DAYS * 24 * 60 * 60;
const LOGOUT_RESUME_DAYS = 7;

type AuthListener = () => void;
const listeners = new Set<AuthListener>();

/** In-memory access token (never written to localStorage). */
let memoryAccessToken: string | null = null;

/**
 * One in-flight cookie refresh for the whole tab.
 * Redis rotates refresh tokens; parallel refresh looks like theft and revokes.
 */
let refreshFlight: Promise<string | null> | null = null;

function notifyAuthListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore listener errors
    }
  });
}

/** Subscribe to login/logout/token changes (client only). */
export function subscribeAuthChange(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function cookieSecureSuffix(protocol: string): string {
  return protocol === "https:" ? "; Secure" : "";
}

function setCookie(
  name: string,
  value: string,
  maxAgeSec: number = SESSION_MARKER_TTL_SEC
): void {
  const win = getWindow();
  // Callers only invoke cookie helpers in a browser context.
  if (!win) {
    return;
  }
  const secure = cookieSecureSuffix(win.location.protocol);
  win.document.cookie = `${name}=${value}; path=/; max-age=${Math.max(1, Math.floor(maxAgeSec))}; SameSite=Lax${secure}`;
}

function removeCookie(name: string): void {
  const win = getWindow();
  if (!win) {
    return;
  }
  const secure = cookieSecureSuffix(win.location.protocol);
  win.document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

function hasSessionMarkerCookie(): boolean {
  const win = getWindow();
  if (!win) {
    return false;
  }
  return win.document.cookie.split(";").some((part) => {
    const trimmed = part.trim();
    return trimmed.startsWith(`${AUTH_SESSION_COOKIE}=`);
  });
}

function writeSessionMarkerCookie(
  maxAgeSec: number = SESSION_MARKER_TTL_SEC
): void {
  setCookie(AUTH_SESSION_COOKIE, "1", maxAgeSec);
}

/** Reset module flags for unit tests. */
export function resetAuthTokenStateForTests(): void {
  memoryAccessToken = null;
  refreshFlight = null;
  listeners.clear();
}

/** Test helper for Secure cookie attribute selection. */
export function cookieSecureSuffixForTests(protocol: string): string {
  return cookieSecureSuffix(protocol);
}

/** Test helper to exercise cookie helper guards when window is missing. */
export function exerciseCookieGuardsForTests(): void {
  setCookie("examflex-test", "1");
  removeCookie("examflex-test");
  void hasSessionMarkerCookie();
}

export function getAuthToken(): string | null {
  if (!getWindow()) return null;
  return memoryAccessToken;
}

/**
 * Store access token in memory and renew the sliding middleware presence marker.
 * The refresh credential stays in the HttpOnly `examflex_rt` cookie.
 */
export function setAuthTokens(accessToken: string): void {
  if (!getWindow()) return;
  memoryAccessToken = accessToken;
  writeSessionMarkerCookie(SESSION_MARKER_TTL_SEC);
  notifyAuthListeners();
}

export function removeAuthToken(): void {
  if (!getWindow()) return;
  memoryAccessToken = null;
  removeCookie(AUTH_SESSION_COOKIE);
  notifyAuthListeners();
}

/**
 * Align marker with memory access after boot refresh.
 */
export function healAuthSessionCookies(): void {
  if (!getWindow()) return;
  if (memoryAccessToken && !hasSessionMarkerCookie()) {
    writeSessionMarkerCookie();
    return;
  }
  if (!memoryAccessToken && hasSessionMarkerCookie() && !refreshFlight) {
    removeCookie(AUTH_SESSION_COOKIE);
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

function clearExamflexSessionCaches(): void {
  const win = getWindow();
  if (!win) return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < win.sessionStorage.length; i += 1) {
      const key = win.sessionStorage.key(i);
      if (key && (key.includes("attempt") || key.startsWith("examflex."))) {
        keys.push(key);
      }
    }
    keys.forEach((key) => win.sessionStorage.removeItem(key));
  } catch {
    // ignore
  }
}

/**
 * Best-effort server logout, then clear local session and hard-navigate home.
 */
export async function logout(): Promise<void> {
  const win = getWindow();
  if (win) {
    const path = `${win.location.pathname}${win.location.search}`;
    if (isSafeRedirectPath(path)) {
      setCookie(LOGOUT_RESUME_PATH_COOKIE, path, LOGOUT_RESUME_DAYS * 24 * 60 * 60);
    }

    await logoutSession(getAuthToken());
  }

  clearExamflexSessionCaches();
  removeAuthToken();
  if (win) {
    win.location.href = "/";
  }
}

const REFRESH_LOCK_NAME = "examflex-auth-refresh";

/**
 * Refresh requests from different tabs must not overlap: each one rotates the
 * HttpOnly cookie, and an overlap can leave the browser holding an
 * already-rotated token. The Web Locks API serialises them across tabs, so
 * each tab sends the cookie the previous tab just received. Browsers without
 * it fall back to the API's short grace window.
 */
function refreshAcrossTabs() {
  const locks = getWindow()?.navigator?.locks;
  if (locks && typeof locks.request === "function") {
    return locks.request(REFRESH_LOCK_NAME, () => refreshSession());
  }
  return refreshSession();
}

/**
 * Silent refresh via HttpOnly cookie. Single-flight across boot + 401 recovery.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (!getWindow()) return null;
  if (refreshFlight) {
    return refreshFlight;
  }

  const tokenAtStart = memoryAccessToken;

  refreshFlight = (async () => {
    try {
      const result = await refreshAcrossTabs();
      if (!result.ok) {
        if (result.status === 401) {
          // A login may have completed while this refresh was in flight
          // (e.g. the Google return page boots a refresh and exchanges the
          // code at the same time). Never wipe a token newer than the one
          // this refresh was answering for.
          if (memoryAccessToken !== tokenAtStart) {
            return memoryAccessToken;
          }
          // Definitive: the session ended (revoked, expired, or reused).
          // Drop the in-memory token too so callers send the user to login
          // instead of retrying with a token the API will keep rejecting.
          memoryAccessToken = null;
          removeCookie(AUTH_SESSION_COOKIE);
          notifyAuthListeners();
          return null;
        }
        if (!memoryAccessToken) {
          // Transient failure (503 outage, 5xx, offline) with nothing in
          // memory: we cannot prove the user is signed in. Clear only the
          // Edge marker so middleware and the client login redirect cannot
          // bounce between /login and /today. The HttpOnly cookie is left
          // alone, so the next successful refresh restores the session.
          removeCookie(AUTH_SESSION_COOKIE);
          notifyAuthListeners();
        }
        return memoryAccessToken;
      }
      setAuthTokens(result.data.accessToken);
      return result.data.accessToken;
    } catch {
      return memoryAccessToken;
    } finally {
      refreshFlight = null;
    }
  })();

  return refreshFlight;
}

/**
 * Student web sessions: access JWT in memory; refresh via HttpOnly examflex_rt.
 */

import { logoutSession, refreshSession } from "@/lib/api/auth";
import {
  AUTH_SESSION_COOKIE,
  AUTH_TOKEN_COOKIE,
  LOGOUT_RESUME_PATH_COOKIE,
} from "@/lib/auth/cookie-names";
import { getWindow } from "@/lib/auth/runtime-env";
import { isSafeRedirectPath } from "@/lib/auth/safe-redirect";

const ACCESS_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "authRefreshToken";
/** Absolute web session length — middleware marker must match this, not the 15m access JWT. */
const SESSION_DAYS = 7;
const SESSION_MARKER_TTL_SEC = SESSION_DAYS * 24 * 60 * 60;

type AuthListener = () => void;
const listeners = new Set<AuthListener>();

/** In-memory access token (never written to localStorage). */
let memoryAccessToken: string | null = null;
let legacyStorageWiped = false;

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
  maxAgeSec: number = SESSION_DAYS * 24 * 60 * 60
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
    return (
      trimmed.startsWith(`${AUTH_SESSION_COOKIE}=`) ||
      trimmed.startsWith(`${AUTH_TOKEN_COOKIE}=`)
    );
  });
}

function writeSessionMarkerCookie(
  maxAgeSec: number = SESSION_MARKER_TTL_SEC
): void {
  setCookie(AUTH_SESSION_COOKIE, "1", maxAgeSec);
  removeCookie(AUTH_TOKEN_COOKIE);
}

/**
 * One-time cutover: remove XSS-readable legacy tokens so old sessions cannot linger.
 */
export function wipeLegacyAuthStorage(): void {
  const win = getWindow();
  if (!win || legacyStorageWiped) return;
  legacyStorageWiped = true;
  try {
    win.localStorage.removeItem(ACCESS_TOKEN_KEY);
    win.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
  removeCookie(AUTH_TOKEN_COOKIE);
}

/** Reset module flags for unit tests. */
export function resetAuthTokenStateForTests(): void {
  memoryAccessToken = null;
  legacyStorageWiped = false;
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
 * Store access token in memory and renew the 7d middleware presence marker.
 */
export function setAuthTokens(
  accessToken: string,
  refreshToken?: string | null,
  expiresInSec?: number
): void {
  // Refresh stays HttpOnly (`examflex_rt`); expiresIn is reserved for call-site parity.
  void refreshToken;
  void expiresInSec;

  if (!getWindow()) return;
  wipeLegacyAuthStorage();
  memoryAccessToken = accessToken;
  writeSessionMarkerCookie(SESSION_MARKER_TTL_SEC);
  notifyAuthListeners();
}

export function removeAuthToken(): void {
  if (!getWindow()) return;
  memoryAccessToken = null;
  wipeLegacyAuthStorage();
  removeCookie(AUTH_TOKEN_COOKIE);
  removeCookie(AUTH_SESSION_COOKIE);
  notifyAuthListeners();
}

/**
 * Align marker with memory access after boot refresh.
 */
export function healAuthSessionCookies(): void {
  if (!getWindow()) return;
  wipeLegacyAuthStorage();
  if (memoryAccessToken && !hasSessionMarkerCookie()) {
    writeSessionMarkerCookie();
    return;
  }
  if (!memoryAccessToken && hasSessionMarkerCookie() && !refreshFlight) {
    removeCookie(AUTH_TOKEN_COOKIE);
    removeCookie(AUTH_SESSION_COOKIE);
  }
}

export function isAuthRefreshInFlight(): boolean {
  return refreshFlight !== null;
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
      setCookie(LOGOUT_RESUME_PATH_COOKIE, path, SESSION_DAYS * 24 * 60 * 60);
    }

    await logoutSession(getAuthToken());
  }

  clearExamflexSessionCaches();
  removeAuthToken();
  if (win) {
    win.location.href = "/";
  }
}

/**
 * Silent refresh via HttpOnly cookie. Single-flight across boot + 401 recovery.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (!getWindow()) return null;
  if (refreshFlight) {
    return refreshFlight;
  }

  refreshFlight = (async () => {
    try {
      const result = await refreshSession();
      if (!result.ok) {
        if (result.status === 401 && !memoryAccessToken) {
          removeCookie(AUTH_TOKEN_COOKIE);
          removeCookie(AUTH_SESSION_COOKIE);
          notifyAuthListeners();
        }
        return memoryAccessToken;
      }
      setAuthTokens(
        result.data.accessToken,
        result.data.refreshToken,
        result.data.expiresIn
      );
      return result.data.accessToken;
    } catch {
      return memoryAccessToken;
    } finally {
      refreshFlight = null;
    }
  })();

  return refreshFlight;
}

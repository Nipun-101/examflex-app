"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getWindow } from "@/lib/auth/runtime-env";
import { buildLoginUrl } from "@/lib/auth/safe-redirect";
import {
  getAuthToken,
  healAuthSessionCookies,
  isAuthenticated,
  refreshAccessToken,
  subscribeAuthChange,
  wipeLegacyAuthStorage,
} from "@/lib/auth/tokens";
import type { AuthStatus } from "@/types/auth";

type AuthSessionContextValue = {
  status: AuthStatus;
  isAuthenticated: boolean;
  token: string | null;
  refresh: () => void;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

/** Mirrors middleware protected prefixes — used when marker outlives Redis session. */
const PROTECTED_PREFIXES = [
  "/today",
  "/mocks",
  "/equation-book",
  "/mistake-book",
  "/analysis",
  "/profile",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Module-level boot so React Strict Mode remount shares one hydrate. */
let bootPromise: Promise<void> | null = null;

function bootAuthSession(): Promise<void> {
  if (!bootPromise) {
    bootPromise = (async () => {
      wipeLegacyAuthStorage();
      await refreshAccessToken();
    })();
  }
  return bootPromise;
}

/** Reset boot single-flight for unit tests. */
export function resetAuthSessionBootForTests(): void {
  bootPromise = null;
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [bootComplete, setBootComplete] = useState(false);

  const syncFromMemory = useCallback(() => {
    healAuthSessionCookies();
    const next = getAuthToken();
    setToken(next);
    setStatus(next ? "authenticated" : "unauthenticated");
  }, []);

  const refresh = useCallback(() => {
    syncFromMemory();
  }, [syncFromMemory]);

  useEffect(() => {
    let cancelled = false;

    void bootAuthSession().finally(() => {
      if (!cancelled) {
        syncFromMemory();
        setBootComplete(true);
      }
    });

    const unsubscribe = subscribeAuthChange(() => {
      if (!cancelled) syncFromMemory();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [syncFromMemory]);

  useEffect(() => {
    if (!bootComplete || status !== "unauthenticated") return;
    const win = getWindow();
    if (!win) return;
    if (!isProtectedPath(win.location.pathname)) return;
    win.location.replace(buildLoginUrl());
  }, [bootComplete, status]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      status,
      isAuthenticated: status === "authenticated" && isAuthenticated(),
      token,
      refresh,
    }),
    [status, token, refresh]
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionContextValue {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }
  return ctx;
}

import { exchangeGoogleCode } from "@/lib/api/auth";
import { getWindow } from "@/lib/auth/runtime-env";
import {
  DEFAULT_POST_LOGIN_PATH,
  getSafeRedirectPath,
} from "@/lib/auth/safe-redirect";

const STATE_KEY = "examflex.google.oauth.state";
const VERIFIER_KEY = "examflex.google.oauth.verifier";
const REDIRECT_KEY = "examflex.google.oauth.redirect";
const NEXT_KEY = "examflex.google.oauth.next";

const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";

/**
 * Redirect URIs registered for ExamFlex.
 * NEXT_PUBLIC_GOOGLE_REDIRECT_URI overrides when set.
 */
const REGISTERED_REDIRECTS: Record<string, string> = {
  "http://localhost:3002": "http://localhost:3002",
  "https://www.examflex.in": "https://www.examflex.in/",
  "https://examflex.in": "https://www.examflex.in/",
};

export type StoredGoogleReturn = {
  code: string;
  state: string;
  redirectUri: string;
  codeVerifier: string;
  nextPath: string;
};

export type GoogleSessionResult =
  | {
      ok: true;
      accessToken: string;
      expiresIn?: number;
      nextPath: string;
    }
  | { ok: false; message: string };

let pendingSession: Promise<GoogleSessionResult> | null = null;

export function googleClientId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";
}

export function googleRedirectUri(origin?: string): string {
  const fromEnv = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  const resolvedOrigin = origin ?? getWindow()?.location.origin;
  if (!resolvedOrigin) {
    return "";
  }
  return REGISTERED_REDIRECTS[resolvedOrigin] ?? "";
}

export function isGoogleSignInConfigured(): boolean {
  return Boolean(googleClientId() && googleRedirectUri());
}

export async function startGoogleSignIn(nextPath?: string): Promise<void> {
  const clientId = googleClientId();
  const redirectUri = googleRedirectUri();
  const win = getWindow();
  if (!clientId || !redirectUri || !win) {
    throw new Error("Google sign-in is not configured");
  }

  const state = randomUrlSafe(32);
  const verifier = randomUrlSafe(64);
  const challenge = await sha256Base64Url(verifier);
  const next = nextPath
    ? nextPath
    : getSafeRedirectPath(
        new URLSearchParams(win.location.search).get("redirect")
      );

  win.sessionStorage.setItem(STATE_KEY, state);
  win.sessionStorage.setItem(VERIFIER_KEY, verifier);
  win.sessionStorage.setItem(REDIRECT_KEY, redirectUri);
  win.sessionStorage.setItem(NEXT_KEY, next);

  const url = new URL(GOOGLE_AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("prompt", "select_account");
  win.location.assign(url.toString());
}

/**
 * One exchange per redirect, including React's extra mount in development.
 */
export function completeGoogleSession(): Promise<GoogleSessionResult> {
  if (pendingSession) {
    return pendingSession;
  }

  const parsed = readGoogleReturn();
  if (!parsed.ok) {
    return Promise.resolve(parsed);
  }

  pendingSession = exchangeGoogleCode({
    code: parsed.value.code,
    redirectUri: parsed.value.redirectUri,
    codeVerifier: parsed.value.codeVerifier,
  })
    .then((result) => {
      if (!result.ok) {
        clearGoogleHandoff();
        return {
          ok: false as const,
          message: result.message,
        };
      }

      clearGoogleHandoff();
      if (typeof result.data.expiresIn === "number") {
        return {
          ok: true as const,
          accessToken: result.data.accessToken,
          expiresIn: result.data.expiresIn,
          nextPath: getSafeRedirectPath(parsed.value.nextPath),
        };
      }
      return {
        ok: true as const,
        accessToken: result.data.accessToken,
        nextPath: getSafeRedirectPath(parsed.value.nextPath),
      };
    })
    .catch(() => {
      clearGoogleHandoff();
      return {
        ok: false as const,
        message: "Google sign-in could not be completed. Please try again.",
      };
    })
    .finally(() => {
      pendingSession = null;
    });

  return pendingSession;
}

export function readGoogleReturn():
  | { ok: true; value: StoredGoogleReturn }
  | { ok: false; message: string } {
  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get("error");
  if (oauthError) {
    clearGoogleHandoff();
    return {
      ok: false,
      message:
        oauthError === "access_denied"
          ? "Google sign-in was cancelled."
          : "Google sign-in could not be completed.",
    };
  }

  const code = params.get("code")?.trim() || "";
  const state = params.get("state")?.trim() || "";
  const expectedState = sessionStorage.getItem(STATE_KEY);
  const codeVerifier = sessionStorage.getItem(VERIFIER_KEY) || "";
  const redirectUri = sessionStorage.getItem(REDIRECT_KEY) || "";
  const nextPath = sessionStorage.getItem(NEXT_KEY) || DEFAULT_POST_LOGIN_PATH;

  if (!code) {
    return { ok: false, message: "Google did not return a sign-in code." };
  }
  if (!state || !expectedState || state !== expectedState) {
    clearGoogleHandoff();
    return {
      ok: false,
      message: "Google sign-in could not be verified. Please try again.",
    };
  }
  if (!codeVerifier || !redirectUri) {
    clearGoogleHandoff();
    return {
      ok: false,
      message: "Google sign-in expired. Please try again.",
    };
  }

  return {
    ok: true,
    value: { code, state, redirectUri, codeVerifier, nextPath },
  };
}

export function clearGoogleHandoff(): void {
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(REDIRECT_KEY);
  sessionStorage.removeItem(NEXT_KEY);
}

/** Reset single-flight for unit tests. */
export function resetGoogleSessionForTests(): void {
  pendingSession = null;
}

function randomUrlSafe(bytes: number): string {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return base64Url(values);
}

async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  return base64Url(new Uint8Array(digest));
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

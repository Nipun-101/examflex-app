import { apiUrl } from "@/lib/api/config";
import { parseApiMessage, parseAuthResponse } from "@/lib/api/parse-auth";
import type { AuthResponse } from "@/types/auth";

export type AuthApiResult =
  | { ok: true; data: AuthResponse }
  | { ok: false; message: string; status?: number };

async function postAuth(
  path: string,
  body: Record<string, unknown>
): Promise<AuthApiResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(apiUrl(path), {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
    });

    const raw: unknown = await response.json().catch(() => null);
    const parsed = parseAuthResponse(raw);

    if (!response.ok || !parsed) {
      return {
        ok: false,
        status: response.status,
        message:
          parseApiMessage(raw) ??
          "Authentication failed. Please try again.",
      };
    }

    return { ok: true, data: parsed };
  } catch {
    return {
      ok: false,
      message: "Could not reach ExamFlex. Check your connection and try again.",
    };
  }
}

export function verifyOtp(accessToken: string): Promise<AuthApiResult> {
  return postAuth("/api/v1/auth/verify-otp", {
    accessToken,
    client: "web",
  });
}

export function exchangeGoogleCode(input: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<AuthApiResult> {
  return postAuth("/api/v1/auth/google", {
    code: input.code,
    redirectUri: input.redirectUri,
    codeVerifier: input.codeVerifier,
    client: "web",
  });
}

export function refreshSession(): Promise<AuthApiResult> {
  return postAuth("/api/v1/auth/refresh", {});
}

export async function logoutSession(
  bearer: string | null
): Promise<{ ok: boolean }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (bearer) {
      headers.Authorization = `Bearer ${bearer}`;
    }
    await fetch(apiUrl("/api/v1/auth/logout"), {
      method: "POST",
      headers,
      credentials: "include",
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

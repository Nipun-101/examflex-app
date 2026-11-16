import { apiUrl } from "@/lib/api/config";
import { getWindow } from "@/lib/auth/runtime-env";
import {
  getAuthToken,
  refreshAccessToken,
  removeAuthToken,
} from "@/lib/auth/tokens";
import { buildLoginUrl } from "@/lib/auth/safe-redirect";

export type ApiFetchInit = RequestInit & {
  /** Skip Authorization header (auth endpoints that use cookie only). */
  skipAuth?: boolean;
  /** Skip 401 → refresh → retry (refresh/logout themselves). */
  skipRefresh?: boolean;
};

function redirectToLogin(): void {
  const win = getWindow();
  if (!win) return;
  removeAuthToken();
  win.location.assign(buildLoginUrl());
}

/**
 * Authenticated API fetch: credentials include, Bearer from memory,
 * single 401 refresh retry then login redirect.
 */
export async function apiFetch(
  path: string,
  init: ApiFetchInit = {}
): Promise<Response> {
  const { skipAuth = false, skipRefresh = false, headers, ...rest } = init;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type") && rest.body) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(apiUrl(path), {
    ...rest,
    headers: requestHeaders,
    credentials: "include",
  });

  if (response.status !== 401 || skipRefresh || skipAuth) {
    return response;
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    redirectToLogin();
    return response;
  }

  const retryHeaders = new Headers(headers);
  if (!retryHeaders.has("Content-Type") && rest.body) {
    retryHeaders.set("Content-Type", "application/json");
  }
  retryHeaders.set("Authorization", `Bearer ${refreshed}`);

  return fetch(apiUrl(path), {
    ...rest,
    headers: retryHeaders,
    credentials: "include",
  });
}

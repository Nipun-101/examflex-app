import { apiFetch, type ApiFetchInit } from "@/lib/api/client";
import {
  failApiResult,
  networkApiFailure,
  readJsonBody,
  unwrapApiData,
  type ApiResult,
} from "@/lib/api/parse-envelope";

export const NETWORK_ERROR_MESSAGE =
  "Could not reach ExamFlex. Check your connection and try again.";

export type QueryParams = Record<string, string | number | undefined>;

/** Build `?a=1&b=x`; skips undefined and empty-string values. Empty → "". */
export function buildQueryString(params: QueryParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

/**
 * Parser for a successful response. Receives the unwrapped `data` and the raw
 * envelope (needed for siblings like `pagination`). Return `null` when the
 * payload does not match the expected shape.
 */
export type ResponseParser<T> = (data: unknown, raw: unknown) => T | null;

/**
 * Call the API and parse the JSON envelope at the boundary.
 * Never throws: network errors and bad payloads become `{ ok: false }`.
 */
export async function requestParsed<T>(
  path: string,
  init: ApiFetchInit,
  parse: ResponseParser<T>,
  fallbackMessage: string
): Promise<ApiResult<T>> {
  try {
    const response = await apiFetch(path, init);
    const raw = await readJsonBody(response);
    if (!response.ok) {
      return failApiResult(raw, response.status, fallbackMessage);
    }
    const data = parse(unwrapApiData(raw), raw);
    if (data === null) {
      return failApiResult(raw, response.status, fallbackMessage);
    }
    return { ok: true, data };
  } catch {
    return networkApiFailure(NETWORK_ERROR_MESSAGE);
  }
}

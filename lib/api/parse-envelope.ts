import { parseApiMessage } from "@/lib/api/parse-auth";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isApiRecord(
  value: unknown
): value is Record<string, unknown> {
  return isRecord(value);
}

/** Extract `data` from `{ message?, data }` envelopes. */
export function unwrapApiData(body: unknown): unknown {
  if (!isRecord(body)) return null;
  return body.data ?? null;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; status?: number; code?: string };

export async function readJsonBody(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

/** Machine-readable `details.code` on error envelopes (e.g. ENTITLEMENT_REQUIRED). */
export function parseApiErrorCode(body: unknown): string | undefined {
  if (!isRecord(body) || !isRecord(body.details)) return undefined;
  const { code } = body.details;
  return typeof code === "string" && code.trim() ? code : undefined;
}

/**
 * Drop raw driver / framework messages that should never reach the UI.
 * Prefer the caller's fallback copy instead.
 */
export function sanitizeApiMessage(
  message: string | null | undefined,
  fallback: string
): string {
  if (!message) return fallback;
  if (
    /24 character hex string|Uint8Array|BSONError|not a valid ObjectId|Invalid _id:/i.test(
      message
    )
  ) {
    return fallback;
  }
  return message;
}

export function failApiResult(
  raw: unknown,
  status: number,
  fallback: string
): ApiResult<never> {
  const code = parseApiErrorCode(raw);
  return {
    ok: false,
    status,
    message: sanitizeApiMessage(parseApiMessage(raw), fallback),
    ...(code ? { code } : {}),
  };
}

export function networkApiFailure(fallback: string): ApiResult<never> {
  return { ok: false, message: fallback };
}

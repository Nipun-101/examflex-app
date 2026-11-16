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
  | { ok: false; message: string; status?: number };

export async function readJsonBody(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

export function failApiResult(
  raw: unknown,
  status: number,
  fallback: string
): ApiResult<never> {
  return {
    ok: false,
    status,
    message: parseApiMessage(raw) ?? fallback,
  };
}

export function networkApiFailure(fallback: string): ApiResult<never> {
  return { ok: false, message: fallback };
}

import { isApiRecord, type ApiResult } from "@/lib/api/parse-envelope";
import { readString } from "@/lib/api/parse-fields";
import { requestParsed } from "@/lib/api/request";
import type {
  CounselingActiveRequest,
  CounselingMe,
  CreateCounselingRequestPayload,
} from "@/types/counseling";

function parseActiveStatus(
  value: unknown
): CounselingActiveRequest["status"] | null {
  if (value === "booked" || value === "acknowledged" || value === "responded") {
    return value;
  }
  return null;
}

function parseActiveRequest(value: unknown): CounselingActiveRequest | null {
  if (value === null) return null;
  if (!isApiRecord(value)) return null;
  const id = readString(value.id);
  const status = parseActiveStatus(value.status);
  const createdAt = readString(value.createdAt);
  if (!id || !status || !createdAt) return null;
  return { id, status, createdAt };
}

export function parseCounselingMe(value: unknown): CounselingMe | null {
  if (!isApiRecord(value)) return null;
  if (typeof value.canRequest !== "boolean") return null;
  if (!("activeRequest" in value)) return null;
  const activeRequest = parseActiveRequest(value.activeRequest);
  if (value.activeRequest !== null && activeRequest === null) return null;
  return {
    canRequest: value.canRequest,
    activeRequest,
  };
}

export function getMyCounseling(): Promise<ApiResult<CounselingMe>> {
  return requestParsed(
    "/api/v1/counseling/me",
    { method: "GET" },
    parseCounselingMe,
    "Could not load counseling status."
  );
}

export function createCounselingRequest(
  payload: CreateCounselingRequestPayload
): Promise<ApiResult<{ id: string }>> {
  return requestParsed(
    "/api/v1/counseling",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    (value) => {
      if (!isApiRecord(value)) return null;
      const id = readString(value.id);
      if (!id) return null;
      return { id };
    },
    "Could not submit your counseling request."
  );
}

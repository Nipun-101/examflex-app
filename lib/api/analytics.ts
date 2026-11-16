import { apiFetch } from "@/lib/api/client";
import {
  failApiResult,
  isApiRecord,
  networkApiFailure,
  readJsonBody,
  unwrapApiData,
  type ApiResult,
} from "@/lib/api/parse-envelope";
import type { BadgesSummary, UserBadge } from "@/types/analytics";

function parseUserBadge(value: unknown): UserBadge | null {
  if (!isApiRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }
  if (
    typeof value.description !== "string" ||
    typeof value.category !== "string" ||
    typeof value.criteria !== "string" ||
    typeof value.isEarned !== "boolean"
  ) {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    description: value.description,
    category: value.category,
    criteria: value.criteria,
    isEarned: value.isEarned,
  };
}

/** Parse badges summary from analytics API. */
export function parseBadgesSummary(value: unknown): BadgesSummary | null {
  if (!isApiRecord(value)) return null;
  if (!Array.isArray(value.badges)) return null;
  if (
    typeof value.earnedCount !== "number" ||
    typeof value.totalCount !== "number"
  ) {
    return null;
  }

  const badges = value.badges
    .map(parseUserBadge)
    .filter((badge): badge is UserBadge => badge !== null);

  return {
    badges,
    earnedCount: value.earnedCount,
    totalCount: value.totalCount,
  };
}

export async function getBadges(): Promise<ApiResult<BadgesSummary>> {
  try {
    const response = await apiFetch("/api/v1/analytics/badges", {
      method: "GET",
    });
    const raw = await readJsonBody(response);
    if (!response.ok) {
      return failApiResult(
        raw,
        response.status,
        "Could not load badges. Please try again."
      );
    }
    const data = parseBadgesSummary(unwrapApiData(raw));
    if (!data) {
      return failApiResult(
        raw,
        response.status,
        "Could not load badges. Please try again."
      );
    }
    return { ok: true, data };
  } catch {
    return networkApiFailure(
      "Could not reach ExamFlex. Check your connection and try again."
    );
  }
}

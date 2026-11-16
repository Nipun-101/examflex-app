import { apiFetch } from "@/lib/api/client";
import {
  failApiResult,
  isApiRecord,
  networkApiFailure,
  readJsonBody,
  unwrapApiData,
  type ApiResult,
} from "@/lib/api/parse-envelope";
import type {
  ApiTargetExam,
  ApiUserLocation,
  ApiUserProfile,
  MembershipTier,
  UpdateMyProfilePayload,
} from "@/types/user";

const MEMBERSHIP_TIERS = new Set<MembershipTier>([
  "none",
  "bronze",
  "silver",
  "gold",
  "platinum",
]);

function parseTargetExam(value: unknown): ApiTargetExam | null {
  if (!isApiRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }
  return { id: value.id, name: value.name };
}

function parseLocation(value: unknown): ApiUserLocation | undefined {
  if (!isApiRecord(value)) return undefined;
  const location: ApiUserLocation = {};
  if (typeof value.city === "string") location.city = value.city;
  if (typeof value.state === "string") location.state = value.state;
  if (typeof value.country === "string") location.country = value.country;
  if (typeof value.timezone === "string") location.timezone = value.timezone;
  return location;
}

function parseMembershipTier(value: unknown): MembershipTier | undefined {
  if (typeof value !== "string") return undefined;
  if (!MEMBERSHIP_TIERS.has(value as MembershipTier)) return undefined;
  return value as MembershipTier;
}

function toIsoString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  return null;
}

/** Parse a user profile payload from the API. */
export function parseApiUserProfile(value: unknown): ApiUserProfile | null {
  if (!isApiRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }
  if (typeof value.email !== "string" || typeof value.role !== "string") {
    return null;
  }
  if (typeof value.isActive !== "boolean") return null;

  const createdAt = toIsoString(value.createdAt);
  const updatedAt = toIsoString(value.updatedAt);
  if (!createdAt || !updatedAt) return null;

  const profile: ApiUserProfile = {
    id: value.id,
    name: value.name,
    email: value.email,
    role: value.role,
    isActive: value.isActive,
    createdAt,
    updatedAt,
  };

  if (typeof value.phoneNumber === "string") {
    profile.phoneNumber = value.phoneNumber;
  }
  if (typeof value.bio === "string") profile.bio = value.bio;
  if (typeof value.avatarUrl === "string") profile.avatarUrl = value.avatarUrl;

  const location = parseLocation(value.location);
  if (location) profile.location = location;

  if (Array.isArray(value.targetExams)) {
    const exams = value.targetExams
      .map(parseTargetExam)
      .filter((exam): exam is ApiTargetExam => exam !== null);
    if (exams.length > 0) profile.targetExams = exams;
  }

  const targetExam = parseTargetExam(value.targetExam);
  if (targetExam) profile.targetExam = targetExam;

  const targetExamDate = toIsoString(value.targetExamDate);
  if (targetExamDate) profile.targetExamDate = targetExamDate;

  const tier = parseMembershipTier(value.membershipTier);
  if (tier) profile.membershipTier = tier;

  if (typeof value.badgesEarnedCount === "number") {
    profile.badgesEarnedCount = value.badgesEarnedCount;
  }

  return profile;
}

async function parseProfileResponse(
  response: Response,
  fallback: string
): Promise<ApiResult<ApiUserProfile>> {
  const raw = await readJsonBody(response);
  if (!response.ok) {
    return failApiResult(raw, response.status, fallback);
  }
  const data = parseApiUserProfile(unwrapApiData(raw));
  if (!data) {
    return failApiResult(raw, response.status, fallback);
  }
  return { ok: true, data };
}

export async function getMyProfile(): Promise<ApiResult<ApiUserProfile>> {
  try {
    const response = await apiFetch("/api/v1/users/me", { method: "GET" });
    return parseProfileResponse(
      response,
      "Could not load your profile. Please try again."
    );
  } catch {
    return networkApiFailure(
      "Could not reach ExamFlex. Check your connection and try again."
    );
  }
}

export async function updateMyProfile(
  payload: UpdateMyProfilePayload
): Promise<ApiResult<ApiUserProfile>> {
  try {
    const response = await apiFetch("/api/v1/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return parseProfileResponse(
      response,
      "Could not save your details. Please try again."
    );
  } catch {
    return networkApiFailure(
      "Could not reach ExamFlex. Check your connection and try again."
    );
  }
}

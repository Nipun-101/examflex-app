import type { ApiUserProfile } from "@/types/user";
import type {
  ProfileContact,
  ProfileSignInMethod,
  ProfileUser,
} from "@/types/profile";
import type { UpdateMyProfilePayload } from "@/types/user";

const TEMP_EMAIL_SUFFIX = "@temp.examflex.com";
const GOOGLE_AVATAR_HOST = "googleusercontent.com";

export function isTempExamflexEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(TEMP_EMAIL_SUFFIX);
}

export function displayEmailFromApi(email: string): string {
  if (isTempExamflexEmail(email)) return "";
  return email.trim();
}

/** Strip country code for the 10-digit mobile field. */
export function displayPhoneFromApi(phoneNumber: string | undefined): string {
  if (!phoneNumber) return "";
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 10) return digits;
  return digits;
}

export function toE164IndianMobile(phoneDigits: string): string {
  const digits = phoneDigits.replace(/\D/g, "");
  const ten =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits;
  return `+91${ten}`;
}

export function inferSignInMethod(
  avatarUrl: string | null | undefined
): ProfileSignInMethod {
  if (
    typeof avatarUrl === "string" &&
    avatarUrl.toLowerCase().includes(GOOGLE_AVATAR_HOST)
  ) {
    return "google";
  }
  return "otp";
}

export function examTrackFromProfile(profile: ApiUserProfile): string {
  if (profile.targetExam?.name) return profile.targetExam.name;
  const primary = profile.targetExams?.[0];
  if (primary?.name) return primary.name;
  return "ExamFlex";
}

export function formatMemberSinceLabel(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "On ExamFlex";
  }
  const label = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
  return `On ExamFlex since ${label}`;
}

export function mapApiUserToProfileUser(profile: ApiUserProfile): ProfileUser {
  const phone = displayPhoneFromApi(profile.phoneNumber);
  const avatarUrl =
    typeof profile.avatarUrl === "string" && profile.avatarUrl.trim()
      ? profile.avatarUrl.trim()
      : null;

  return {
    name: profile.name,
    phone,
    email: displayEmailFromApi(profile.email),
    avatarUrl,
    signInMethod: inferSignInMethod(avatarUrl),
    examTrack: examTrackFromProfile(profile),
    memberSinceLabel: formatMemberSinceLabel(profile.createdAt),
    membershipTier: profile.membershipTier ?? "none",
    phoneLocked: phone.length > 0,
  };
}

export function contactFromProfileUser(user: ProfileUser): ProfileContact {
  return {
    name: user.name,
    phone: user.phone,
    email: user.email,
  };
}

/**
 * Build a sparse PATCH body from sanitized draft vs last-saved contact.
 * Locked phones are never sent.
 */
export function buildUpdatePayload(
  draft: ProfileContact,
  saved: ProfileContact,
  phoneLocked: boolean
): UpdateMyProfilePayload {
  const payload: UpdateMyProfilePayload = {};

  if (draft.name !== saved.name) {
    payload.name = draft.name;
  }

  if (draft.email !== saved.email) {
    payload.email = draft.email;
  }

  if (!phoneLocked && draft.phone !== saved.phone && draft.phone.length > 0) {
    payload.phoneNumber = toE164IndianMobile(draft.phone);
  }

  return payload;
}

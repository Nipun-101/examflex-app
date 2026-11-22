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

  const targetExamId =
    profile.targetExam?.id ?? profile.targetExams?.[0]?.id ?? null;

  const email = displayEmailFromApi(profile.email);

  return {
    name: profile.name,
    phone,
    email,
    avatarUrl,
    signInMethod: inferSignInMethod(avatarUrl),
    examTrack: examTrackFromProfile(profile),
    targetExamId,
    memberSinceLabel: formatMemberSinceLabel(profile.createdAt),
    membershipTier: profile.membershipTier ?? "none",
    // Phone can only be set by verifying it with an OTP, never by editing.
    phoneLocked: true,
    // A real email is fixed. The placeholder given to OTP sign-ups displays as
    // empty, so those learners can still add their own once.
    emailLocked: email.length > 0,
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
 * The phone number is never sent: it can only change by verifying it with an
 * OTP, and the API rejects it on this endpoint. A locked email is never sent
 * either: only a missing email can be added.
 */
export function buildUpdatePayload(
  draft: ProfileContact,
  saved: ProfileContact,
  options: { emailLocked?: boolean } = {}
): UpdateMyProfilePayload {
  const payload: UpdateMyProfilePayload = {};

  if (draft.name !== saved.name) {
    payload.name = draft.name;
  }

  if (!options.emailLocked && draft.email !== saved.email) {
    payload.email = draft.email;
  }

  return payload;
}

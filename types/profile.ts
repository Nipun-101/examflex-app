import type { BadgesSummary } from "@/types/analytics";
import type { MembershipTier } from "@/types/user";

export type ProfileContact = {
  name: string;
  phone: string;
  email: string;
};

export type ProfileSignInMethod = "google" | "otp";

export type ProfileUser = ProfileContact & {
  /** Google profile photo URL when signed in with Google; ignored for OTP. */
  avatarUrl: string | null;
  signInMethod: ProfileSignInMethod;
  /** Display label for the primary target exam (or ExamFlex fallback). */
  examTrack: string;
  /** Primary target exam id when set. */
  targetExamId: string | null;
  memberSinceLabel: string;
  membershipTier: MembershipTier;
  /** The mobile number is always captured and verified at sign-up: never editable here. */
  phoneLocked: boolean;
  /** True when the account already has a real email: only a missing email can be added. */
  emailLocked: boolean;
};

export type ProfileSnapshotStat = {
  id: string;
  label: string;
  value: string;
  hint: string;
};

export type ProfilePrivacyNote = {
  title: string;
  body: string;
};

export type ProfileFieldKey = keyof ProfileContact;

export type ProfileFieldErrors = Partial<Record<ProfileFieldKey, string>>;

export type ProfilePageChrome = {
  title: string;
  tagline: string;
  examBadge: string;
  contactSectionTitle: string;
  contactSectionSubtitle: string;
  snapshotTitle: string;
  snapshotSubtitle: string;
  privacyNote: ProfilePrivacyNote;
  saveLabel: string;
  resetLabel: string;
};

export type ProfilePageData = ProfilePageChrome & {
  user: ProfileUser;
  snapshot: readonly ProfileSnapshotStat[];
};

export type ProfileBadgesState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; summary: BadgesSummary };

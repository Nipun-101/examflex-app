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
  examTrack: string;
  memberSinceLabel: string;
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

export type ProfilePageData = {
  title: string;
  tagline: string;
  examBadge: string;
  identityHint: string;
  contactSectionTitle: string;
  contactSectionSubtitle: string;
  snapshotTitle: string;
  snapshotSubtitle: string;
  privacyNote: ProfilePrivacyNote;
  saveLabel: string;
  resetLabel: string;
  user: ProfileUser;
  snapshot: readonly ProfileSnapshotStat[];
};

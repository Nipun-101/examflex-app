import type { ProfilePageData } from "@/types/profile";

/** Chrome copy + fixture profile for tests. Live data comes from the API. */
export const PROFILE_PAGE_DATA: ProfilePageData = {
  title: "Your desk",
  tagline: "A quiet corner for the details that travel with you.",
  examBadge: "examflex",
  identityHint:
    "Google photo when you sign in with Google · initials for mobile OTP.",
  contactSectionTitle: "How we reach you",
  contactSectionSubtitle: "Name, phone, and email for your ExamFlex account.",
  snapshotTitle: "Prep pulse",
  snapshotSubtitle: "Badges and tier from your recent prep.",
  privacyNote: {
    title: "KEPT LIGHT ON PURPOSE",
    body: "ExamFlex only needs what helps your prep. Rank, category, and counselling details stay out of this screen until you choose to add them later.",
  },
  saveLabel: "Save details",
  resetLabel: "Reset",
  user: {
    name: "Aarav Mehta",
    phone: "9876543210",
    email: "aarav.mehta@example.com",
    avatarUrl: null,
    signInMethod: "otp",
    examTrack: "ExamFlex",
    memberSinceLabel: "On ExamFlex since March 2025",
    membershipTier: "none",
    phoneLocked: true,
  },
  snapshot: [],
};

import type { ProfilePageData } from "@/types/profile";

/** Static Profile content — replace with API payloads later. */
export const PROFILE_PAGE_DATA: ProfilePageData = {
  title: "Your desk",
  tagline: "A quiet corner for the details that travel with you.",
  examBadge: "NEET  /  examflex",
  identityHint:
    "Google photo when you sign in with Google · initials for mobile OTP.",
  contactSectionTitle: "How we reach you",
  contactSectionSubtitle: "Name, phone, and email — placeholders for now.",
  snapshotTitle: "Prep pulse",
  snapshotSubtitle: "Sample signals from your recent mocks.",
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
    examTrack: "NEET · Class 12",
    memberSinceLabel: "On ExamFlex since Mock 1",
  },
  snapshot: [
    {
      id: "mocks",
      label: "MOCKS LOGGED",
      value: "12",
      hint: "Sample count",
    },
    {
      id: "streak",
      label: "STUDY STREAK",
      value: "5 days",
      hint: "Placeholder rhythm",
    },
    {
      id: "focus",
      label: "FOCUS",
      value: "Physics",
      hint: "From last week",
    },
  ],
};

export type MembershipTier =
  | "none"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum";

export type ApiTargetExam = {
  id: string;
  name: string;
};

export type ApiUserLocation = {
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
};

/** Student profile from `GET/PATCH /api/v1/users/me`. */
export type ApiUserProfile = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  /** True once the number was proven with an OTP. */
  phoneVerified?: boolean;
  /** True once the email was proven with an OTP (or comes from Google). */
  emailVerified?: boolean;
  /** True once name + target exam were confirmed on first run. */
  onboardingCompleted?: boolean;
  /** Verified number AND onboarding done. Students without it are gated. */
  profileComplete?: boolean;
  role: string;
  isActive: boolean;
  bio?: string;
  avatarUrl?: string;
  location?: ApiUserLocation;
  targetExams?: ApiTargetExam[];
  targetExam?: ApiTargetExam;
  targetExamDate?: string;
  membershipTier?: MembershipTier;
  badgesEarnedCount?: number;
  createdAt: string;
  updatedAt: string;
};

/** Email is not editable here: it is only added through email verification. */
export type UpdateMyProfilePayload = {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  location?: ApiUserLocation;
  /** Primary target exam id. Send null to clear. */
  targetExam?: string | null;
  targetExamDate?: string;
};

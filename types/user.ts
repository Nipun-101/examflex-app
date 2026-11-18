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

export type UpdateMyProfilePayload = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  location?: ApiUserLocation;
  /** Primary target exam id. Send null to clear. */
  targetExam?: string | null;
  targetExamDate?: string;
};

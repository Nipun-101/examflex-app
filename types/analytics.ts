export type BadgeCategory =
  | "Milestone"
  | "Consistency"
  | "Performance"
  | "Mastery"
  | string;

export type UserBadge = {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  criteria: string;
  isEarned: boolean;
};

export type BadgesSummary = {
  badges: UserBadge[];
  earnedCount: number;
  totalCount: number;
};

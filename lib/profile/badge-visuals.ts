import type { LucideIcon } from "lucide-react";
import {
  Award,
  CheckCircle2,
  Flame,
  GraduationCap,
  Star,
  Target,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";

export type BadgeVisual = {
  Icon: LucideIcon;
};

const ID_VISUALS: Record<string, BadgeVisual> = {
  "first-test": { Icon: Star },
  "streak-7": { Icon: Flame },
  "streak-30": { Icon: Zap },
  "tests-10": { Icon: Trophy },
  "tests-50": { Icon: Trophy },
  "top-scorer": { Icon: Award },
  "perfect-score": { Icon: CheckCircle2 },
  "speed-demon": { Icon: Timer },
  "accuracy-master": { Icon: Target },
  "subject-expert": { Icon: GraduationCap },
};

const CATEGORY_FALLBACK: Record<string, BadgeVisual> = {
  Milestone: { Icon: Star },
  Consistency: { Icon: Flame },
  Performance: { Icon: Award },
  Mastery: { Icon: GraduationCap },
};

export function badgeVisualFor(
  id: string,
  category: string
): BadgeVisual {
  return (
    ID_VISUALS[id] ??
    CATEGORY_FALLBACK[category] ?? { Icon: Award }
  );
}

export function formatMembershipTier(tier: string): string {
  if (!tier || tier === "none") return "Starter";
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

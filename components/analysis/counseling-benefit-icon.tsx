import {
  ArrowRight,
  CheckSquare,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import type { CounselingBenefit } from "@/lib/counseling/constants";

type CounselingBenefitIconProps = {
  icon: CounselingBenefit["icon"];
  className?: string;
};

export function CounselingBenefitIcon({
  icon,
  className = "",
}: CounselingBenefitIconProps) {
  const iconClass = `h-4 w-4 ${className}`.trim();
  switch (icon) {
    case "doubt":
      return <MessageCircle className={iconClass} aria-hidden />;
    case "paths":
      return <ArrowRight className={iconClass} aria-hidden />;
    case "colleges":
      return <GraduationCap className={iconClass} aria-hidden />;
    case "plan":
      return <CheckSquare className={iconClass} aria-hidden />;
    default: {
      const _exhaustive: never = icon;
      return _exhaustive;
    }
  }
}

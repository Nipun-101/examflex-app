import { User } from "lucide-react";

type CounselingExpertAvatarProps = {
  size?: "sm" | "md";
};

/** Silhouette avatar with multi-color ring — matches Analysis premium card design. */
export function CounselingExpertAvatar({
  size = "md",
}: CounselingExpertAvatarProps) {
  const dim = size === "sm" ? "h-12 w-12" : "h-14 w-14";
  const icon = size === "sm" ? "h-5 w-5" : "h-6 w-6";

  return (
    <div
      className={`box-border flex shrink-0 items-center justify-center rounded-full p-[3px] ${dim}`}
      style={{
        background:
          "conic-gradient(from 210deg, #8b5cf6, #3b82f6, #22c55e, #f59e0b, #f97316, #8b5cf6)",
      }}
      aria-hidden
    >
      <div className="flex h-full w-full items-center justify-center rounded-full bg-[#d1d5db] text-[#4b5563]">
        <User className={icon} strokeWidth={1.75} />
      </div>
    </div>
  );
}

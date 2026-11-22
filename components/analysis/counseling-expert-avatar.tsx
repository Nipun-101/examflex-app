import Image from "next/image";
import {
  COUNSELING_EXPERT_NAME,
  COUNSELING_EXPERT_PHOTO_URL,
} from "@/lib/counseling/constants";

type CounselingExpertAvatarProps = {
  size?: "sm" | "md";
};

/** Expert photo with multi-color ring — matches Analysis premium card design. */
export function CounselingExpertAvatar({
  size = "md",
}: CounselingExpertAvatarProps) {
  const dim = size === "sm" ? "h-12 w-12" : "h-[72px] w-[72px] sm:h-20 sm:w-20";
  const px = size === "sm" ? 48 : 80;

  return (
    <div
      className={`box-border flex shrink-0 items-center justify-center rounded-full p-[3px] ${dim}`}
      style={{
        background:
          "conic-gradient(from 210deg, #8b5cf6, #3b82f6, #22c55e, #f59e0b, #f97316, #8b5cf6)",
      }}
    >
      <Image
        src={COUNSELING_EXPERT_PHOTO_URL}
        alt={COUNSELING_EXPERT_NAME}
        width={px}
        height={px}
        unoptimized
        className="h-full w-full rounded-full bg-[#d1d5db] object-cover"
      />
    </div>
  );
}

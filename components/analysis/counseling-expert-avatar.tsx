import Image from "next/image";
import {
  COUNSELING_EXPERT_NAME,
  COUNSELING_EXPERT_PHOTO_URL,
} from "@/lib/counseling/constants";

type CounselingExpertAvatarProps = {
  size?: "sm" | "md";
};

/** Expert photo with single soft-gold ring — matches Analysis premium card design. */
export function CounselingExpertAvatar({
  size = "md",
}: CounselingExpertAvatarProps) {
  const dim = size === "sm" ? "h-12 w-12" : "h-[72px] w-[72px] sm:h-20 sm:w-20";
  const px = size === "sm" ? 48 : 80;

  return (
    <div
      className={`box-border flex shrink-0 items-center justify-center rounded-full bg-[#e8c27a] p-[3px] ${dim}`}
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

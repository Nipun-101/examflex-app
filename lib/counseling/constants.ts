export const COUNSELING_EXPERT_NAME = "Anandu Narayanan";
export const COUNSELING_EXPERT_PHOTO_URL =
  "https://res.cloudinary.com/itztxiph/image/upload/v1795349409/138972.jpg";

export type CounselingBenefit = {
  id: string;
  title: string;
  body: string;
  icon: "doubt" | "paths" | "colleges" | "plan";
  iconClassName: string;
};

export const COUNSELING_BENEFITS: readonly CounselingBenefit[] = [
  {
    id: "doubt",
    title: "Clear every doubt",
    body: "Ask anything, from a tricky chapter to a tough decision.",
    icon: "doubt",
    iconClassName: "bg-[#f4d4e2] text-[#9b3d6a]",
  },
  {
    id: "paths",
    title: "Map your career paths",
    body: "MBBS, BDS, Veterinary and beyond, in plain words.",
    icon: "paths",
    iconClassName: "bg-[#f7e7b8] text-[#8a6a12]",
  },
  {
    id: "colleges",
    title: "Colleges for your marks",
    body: "See where your expected score could take you.",
    icon: "colleges",
    iconClassName: "bg-[#e4dcf4] text-[#5c4a8a]",
  },
  {
    id: "plan",
    title: "A plan made for you",
    body: "Next steps built around your strengths and gaps.",
    icon: "plan",
    iconClassName: "bg-[#d8eadc] text-[#2f6b45]",
  },
] as const;

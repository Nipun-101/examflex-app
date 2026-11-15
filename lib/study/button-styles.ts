export const STUDY_CONTROL_VARIANTS = [
  "surface",
  "outline",
  "soft",
  "solid",
  "ink",
  "rail",
  "railActive",
] as const;

export type StudyControlVariant = (typeof STUDY_CONTROL_VARIANTS)[number];

const STUDY_CONTROL_BASE =
  "cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const STUDY_CONTROL_VARIANT_CLASS: Record<StudyControlVariant, string> = {
  surface: `${STUDY_CONTROL_BASE} border border-study-divider bg-white text-study-ink hover:bg-study-mint`,
  outline: `${STUDY_CONTROL_BASE} border border-study-divider bg-white text-study-green hover:bg-study-mint`,
  soft: `${STUDY_CONTROL_BASE} bg-white text-study-muted-soft hover:bg-study-mint hover:text-study-ink`,
  solid: `${STUDY_CONTROL_BASE} bg-study-green text-white hover:brightness-110`,
  ink: `${STUDY_CONTROL_BASE} bg-study-ink text-white`,
  rail: `${STUDY_CONTROL_BASE} text-study-muted-soft hover:bg-study-mint hover:text-study-ink`,
  railActive: `${STUDY_CONTROL_BASE} bg-study-mint text-study-ink`,
};

export function studyControlClass(
  variant: StudyControlVariant,
  className = ""
): string {
  return `${STUDY_CONTROL_VARIANT_CLASS[variant]} ${className}`.trim();
}

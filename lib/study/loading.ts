export const STUDY_LOADING_DEFAULT_LABEL = "Leveling up your prep...";

export const STUDY_LOADING_HELPER =
  "Every attempt takes you one step further";

export function resolveStudyLoadingLabel(label?: string): string {
  const trimmed = label?.trim();
  return trimmed && trimmed.length > 0
    ? trimmed
    : STUDY_LOADING_DEFAULT_LABEL;
}

export const STUDY_LOADING_DEFAULT_LABEL = "Leveling up your prep...";

/** Soft Nav + initial route boots — keep stable so copy does not swap mid-wait. */
export const STUDY_ROUTE_LOADING_LABEL = "Loading your study space...";

export const STUDY_LOADING_HELPER =
  "Every attempt takes you one step further";

export function resolveStudyLoadingLabel(label?: string): string {
  const trimmed = label?.trim();
  return trimmed && trimmed.length > 0
    ? trimmed
    : STUDY_LOADING_DEFAULT_LABEL;
}

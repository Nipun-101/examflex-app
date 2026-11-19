/** Hold keys for the shared study overlay — one portal, many claimants. */
export const STUDY_LOADING_HOLD = {
  softNav: "soft-nav",
  route: "route",
  manual: "manual",
  submit: "submit",
} as const;

export type StudyLoadingHoldKey =
  (typeof STUDY_LOADING_HOLD)[keyof typeof STUDY_LOADING_HOLD];

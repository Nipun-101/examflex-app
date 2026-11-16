import type { ApiResult } from "@/lib/api/parse-envelope";

export const ENTITLEMENT_REQUIRED = "ENTITLEMENT_REQUIRED";

export const ENTITLEMENT_REQUIRED_MESSAGE =
  "This test needs an active plan. View plans to unlock it.";

export type LaunchError = {
  message: string;
  code?: string;
  /** Set only for ENTITLEMENT_REQUIRED so the banner can open View plans. */
  testId?: string;
};

export type ApiFailure = Extract<ApiResult<never>, { ok: false }>;

export function toLaunchError(
  failure: ApiFailure,
  testId: string
): LaunchError {
  if (failure.code === ENTITLEMENT_REQUIRED) {
    return {
      message: ENTITLEMENT_REQUIRED_MESSAGE,
      code: ENTITLEMENT_REQUIRED,
      testId,
    };
  }
  return {
    message: failure.message,
    ...(failure.code ? { code: failure.code } : {}),
  };
}

export function launchErrorPlansTestId(error: LaunchError | null): string | null {
  return error?.code === ENTITLEMENT_REQUIRED && error.testId
    ? error.testId
    : null;
}
